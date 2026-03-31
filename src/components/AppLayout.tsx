import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AppSidebar from '@/components/AppSidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu, PanelLeftClose, PanelLeftOpen, Bell, LogOut } from 'lucide-react';

export default function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const pageTitles: Record<string, { title: string; description: string }> = {
    '/dashboard': { title: 'Dashboard', description: 'A clear view of your healthcare activity and next steps.' },
    '/chatbot': { title: 'AI Chatbot', description: 'Talk to your assistant and review recent conversation context.' },
    '/reports': { title: 'Reports', description: 'Browse and manage your uploaded medical reports.' },
    '/appointments': { title: 'Appointments', description: 'Track bookings and upcoming visits at a glance.' },
    '/profile': { title: 'Profile', description: 'Review account details and preferences.' },
  };

  const pageMeta = pageTitles[pathname] ?? { title: 'MedWay', description: 'Your healthcare workspace.' };

  return (
    <div className="app-shell">
      <div className="flex min-h-screen">
        {!isMobile && (
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          />
        )}

        {isMobile && (
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent side="left" className="w-[290px] border-r border-border bg-sidebar p-0">
              <AppSidebar onNavigate={() => setMobileNavOpen(false)} />
            </SheetContent>
          </Sheet>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                {isMobile ? (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-2xl"
                    onClick={() => setMobileNavOpen(true)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-2xl"
                    onClick={() => setSidebarCollapsed((prev) => !prev)}
                  >
                    {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                  </Button>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{pageMeta.title}</p>
                  <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{pageMeta.description}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden h-11 w-11 rounded-2xl sm:inline-flex"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Link to="/profile" className="hidden items-center gap-3 rounded-2xl border border-border bg-secondary px-3 py-2 sm:flex">
                  <Avatar className="h-9 w-9 rounded-2xl">
                    <AvatarFallback className="rounded-2xl bg-card text-xs font-semibold text-foreground">
                      {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </Link>
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
