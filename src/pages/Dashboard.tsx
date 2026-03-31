import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { FileText, CalendarDays, MessageSquare, Clock, ArrowRight, History, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface Report {
  id: string;
  title: string;
  created_at: string;
}

interface Appointment {
  id: string;
  doctor_name: string;
  specialization: string;
  appointment_date: string;
  time_slot: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setReportsLoading(true);
    setAppointmentsLoading(true);

    supabase
      .from('reports')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => data && setReports(data))
      .finally(() => setReportsLoading(false));

    supabase
      .from('appointments')
      .select('id, doctor_name, specialization, appointment_date, time_slot')
      .eq('user_id', user.id)
      .order('appointment_date', { ascending: true })
      .limit(3)
      .then(({ data }) => data && setAppointments(data))
      .finally(() => setAppointmentsLoading(false));
  }, [user]);

  const featureCards = [
    {
      icon: Sparkles,
      title: 'AI Chatbot',
      description: 'Describe symptoms and get structured guidance in a single focused workspace.',
      to: '/chatbot',
      meta: 'Available now',
    },
    {
      icon: History,
      title: 'Chat History',
      description: 'Return to recent conversations from the same chatbot area without changing flow.',
      to: '/chatbot',
      meta: 'Recent activity',
    },
    {
      icon: FileText,
      title: 'Reports',
      description: 'Review uploaded reports and keep important files easy to locate.',
      to: '/reports',
      meta: `${reports.length} total`,
    },
    {
      icon: CalendarDays,
      title: 'Appointments',
      description: 'Track upcoming visits and stay oriented around the next step.',
      to: '/appointments',
      meta: `${appointments.length} upcoming`,
    },
  ];

  return (
    <div className="app-page page-fade">
      <section className="app-card-muted p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#A1A1AA]">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#ECECEC] sm:text-4xl">
          Welcome back, {user?.user_metadata?.full_name || 'User'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A1A1AA]">
          Your most important tools are grouped below so you can move between conversations, reports, and appointments quickly.
        </p>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featureCards.map(({ icon: Icon, title, description, to, meta }) => (
          <div
            key={title}
            className="rounded-[20px] border border-[#2A2A2A] bg-[#1E1E1E] p-5 transition-colors hover:bg-[#232323]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#2A2A2A] bg-[#171717] text-[#ECECEC]">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs text-[#A1A1AA]">{meta}</span>
            </div>
            <h2 className="mt-5 text-lg font-medium text-[#ECECEC]">{title}</h2>
            <p className="mt-2 min-h-[72px] text-sm leading-6 text-[#A1A1AA]">{description}</p>
            <Button
              asChild
              className="mt-6 h-10 rounded-xl bg-[#10A37F] px-4 text-sm font-medium text-white shadow-none hover:bg-[#0E8D6E]"
            >
              <Link to={to}>
                Open
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[24px] border border-[#2A2A2A] bg-[#171717] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-[#ECECEC]">Recent Reports</h2>
              <p className="mt-1 text-xs text-[#A1A1AA]">Latest uploaded files</p>
            </div>
            <Link to="/reports" className="flex items-center gap-1 text-xs text-[#A1A1AA] transition-colors hover:text-[#ECECEC]">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {reportsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#111111] p-3">
                  <Skeleton className="h-10 w-10 rounded-xl bg-[#1E1E1E]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36 bg-[#1E1E1E]" />
                    <Skeleton className="h-3 w-24 bg-[#1E1E1E]" />
                  </div>
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#A1A1AA]">No reports yet. Upload your first medical report.</p>
          ) : (
            <div className="space-y-2.5">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#111111] p-3 transition-colors hover:bg-[#161616]">
                  <div className="rounded-lg border border-[#2A2A2A] bg-[#1E1E1E] p-2">
                    <FileText className="h-4 w-4 text-[#ECECEC]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#ECECEC]">{r.title}</p>
                    <p className="mt-0.5 text-xs text-[#A1A1AA]">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-[#2A2A2A] bg-[#171717] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-[#ECECEC]">Upcoming Appointments</h2>
              <p className="mt-1 text-xs text-[#A1A1AA]">Next scheduled visits</p>
            </div>
            <Link to="/appointments" className="flex items-center gap-1 text-xs text-[#A1A1AA] transition-colors hover:text-[#ECECEC]">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {appointmentsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#111111] p-3">
                  <Skeleton className="h-10 w-10 rounded-xl bg-[#1E1E1E]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 bg-[#1E1E1E]" />
                    <Skeleton className="h-3 w-48 bg-[#1E1E1E]" />
                  </div>
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#A1A1AA]">No upcoming appointments. Book one now.</p>
          ) : (
            <div className="space-y-2.5">
              {appointments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#111111] p-3 transition-colors hover:bg-[#161616]">
                  <div className="rounded-lg border border-[#2A2A2A] bg-[#1E1E1E] p-2">
                    <Clock className="h-4 w-4 text-[#ECECEC]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#ECECEC]">Dr. {a.doctor_name}</p>
                    <p className="mt-0.5 text-xs text-[#A1A1AA]">{a.specialization} | {new Date(a.appointment_date).toLocaleDateString()} | {a.time_slot}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
