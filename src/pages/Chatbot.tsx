import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase, supabaseAnonKey, supabaseUrl } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const getErrorMessage = async (resp: Response) => {
  const contentType = resp.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('application/json')) {
      const payload = await resp.json();
      if (typeof payload?.error === 'string' && payload.error.trim()) return payload.error.trim();
    } else {
      const text = (await resp.text()).trim();
      if (text) return text;
    }
  } catch {
    // Fall back to the HTTP status when the body cannot be parsed.
  }

  return `Request failed with status ${resp.status}`;
};

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const CHAT_URL = `${supabaseUrl}/functions/v1/medical-chat`;

export default function Chatbot() {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setConversations(data);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!user || !activeConversationId) {
      setMessages([]);
      return;
    }
    let cancelled = false;

    supabase
      .from('chats')
      .select('role, content')
      .eq('user_id', user.id)
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!cancelled && data) setMessages(data as Message[]);
      });

    return () => {
      cancelled = true;
    };
  }, [user, activeConversationId]);

  const createConversation = async (title: string = 'New Chat'): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title })
      .select('id')
      .single();
    if (error || !data) return null;
    await loadConversations();
    return data.id;
  };

  const handleNewChat = async () => {
    setActiveConversationId(null);
    setMessages([]);
    setInput('');
  };

  const handleSelectConversation = (id: string) => {
    if (isLoading) return;
    setActiveConversationId(id);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    await supabase.from('conversations').delete().eq('id', id);
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
    await loadConversations();
  };

  const saveMessage = async (conversationId: string, role: string, content: string) => {
    if (!user) return;
    await supabase.from('chats').insert({ user_id: user.id, role, content, conversation_id: conversationId });
  };

  const send = async () => {
    if (!input.trim() || isLoading || !session?.access_token) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setInput('');
    const messageHistory = [...messages, userMsg];
    setMessages(messageHistory);
    setIsLoading(true);

    let convId = activeConversationId;
    if (!convId) {
      const title = userMsg.content.slice(0, 60) + (userMsg.content.length > 60 ? '...' : '');
      convId = await createConversation(title);
      if (!convId) {
        setIsLoading(false);
        return;
      }
      setActiveConversationId(convId);
    }

    await saveMessage(convId, 'user', userMsg.content);

    let assistantContent = '';
    const upsert = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: messageHistory }),
      });

      if (!resp.ok) {
        throw new Error(await getErrorMessage(resp));
      }

      if (!resp.body) {
        throw new Error('Streaming response body was empty.');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {}
        }
      }

      await saveMessage(convId, 'assistant', assistantContent);
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);
      await loadConversations();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sorry, something went wrong. Please try again.';
      upsert(`\n\n*${message}*`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Chat History Sidebar */}
      <div
        className={cn(
          'flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-out',
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
        )}
      >
        <div className="flex items-center gap-2 border-b border-sidebar-border p-3">
          <Button
            onClick={handleNewChat}
            variant="default"
            className="h-11 flex-1 justify-start gap-2 text-[13px]"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {conversations.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">No conversations yet</p>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  'group flex w-full items-center gap-2.5 rounded-2xl px-3 py-3 text-left text-[13px] transition-colors duration-150',
                  activeConversationId === conv.id
                    ? 'border border-[#1f5d4f] bg-primary/12 text-foreground'
                    : 'text-sidebar-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <MessageSquare className={cn('h-3.5 w-3.5 shrink-0', activeConversationId === conv.id ? 'text-primary' : 'text-muted-foreground')} />
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="rounded-lg p-1 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-secondary hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 border-b border-border bg-background px-6 py-5">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setSidebarOpen(true)}>
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <div className="rounded-xl border border-[#1f5d4f] bg-primary/10 p-2">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              AI Medical Assistant
            </h1>
            <p className="ml-10 mt-0.5 text-xs text-muted-foreground">Describe your symptoms and get AI-powered insights</p>
          </div>
        </div>

        <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-6 overflow-auto bg-background px-4 py-6 sm:px-6">
          {messages.length === 0 && (
            <div className="page-fade flex h-full flex-col items-center justify-center text-center">
              <div className="mb-5 rounded-3xl border border-[#1f5d4f] bg-primary/10 p-5">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-foreground">How can I help you today?</h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Describe your symptoms and I'll provide possible medical causes and suggestions.
                <span className="mt-2.5 block text-xs text-muted-foreground/60">Note: This is not a substitute for professional medical advice.</span>
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : '')}>
              {msg.role === 'assistant' && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#1f5d4f] bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={cn(
                'max-w-[75%] rounded-3xl border px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'rounded-br-lg border-[#1f5d4f] bg-primary text-primary-foreground'
                  : 'rounded-bl-lg border-border bg-card text-foreground'
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary">
                  <User className="h-4 w-4 text-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#1f5d4f] bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-3xl rounded-bl-lg border border-border bg-card px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-background px-4 py-4">
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mx-auto flex max-w-3xl gap-2.5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1 rounded-2xl border border-input bg-input px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors duration-150 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
              disabled={isLoading}
            />
            <Button type="submit" variant="default" size="icon" className="h-12 w-12 shrink-0" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
