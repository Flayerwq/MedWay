import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Heart, LayoutDashboard, MessageSquare, FileText, CalendarDays, User, LogOut, ChevronRight, ChevronsLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chatbot', icon: MessageSquare, label: 'AI Chatbot' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/appointments', icon: CalendarDays, label: 'Appointments' },
  { to: '/profile', icon: User, label: 'Profile' },
];

interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export default function AppSidebar({ collapsed = false, onToggleCollapse, onNavigate }: AppSidebarProps) {
  const { pathname } = useLocation();
  const { signOut, user } = useAuth();

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200',
        collapsed ? 'w-[88px]' : 'w-72'
      )}
    >
      <div className="flex items-center justify-between px-4 pb-6 pt-5">
        <Link to="/dashboard" className={cn('group flex items-center gap-3', collapsed && 'justify-center')} onClick={onNavigate}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sidebar-border bg-card text-foreground">
            <Heart className="h-5 w-5" />
          </div>
          {!collapsed && <span className="text-lg font-semibold tracking-tight text-foreground">MedWay</span>}
        </Link>
        {onToggleCollapse && !collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-xl border border-sidebar-border bg-secondary p-2 text-sidebar-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={cn('px-4 pb-4', collapsed && 'px-3')}>
        <div className={cn('rounded-3xl border border-sidebar-border bg-secondary p-4', collapsed && 'p-2')}>
          <p className={cn('text-xs font-semibold uppercase tracking-[0.24em] text-sidebar-foreground', collapsed && 'sr-only')}>Workspace</p>
          {!collapsed && (
            <p className="mt-2 text-sm leading-6 text-sidebar-foreground">
              A lightweight navigation layer for reports, appointments, profile, and assistant access.
            </p>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-medium transition-colors',
                collapsed && 'justify-center px-2',
                active ? 'border border-[#1f5d4f] bg-primary/12 text-foreground' : 'text-sidebar-foreground hover:bg-secondary hover:text-foreground'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className={cn('h-[18px] w-[18px]', active ? 'text-primary' : 'text-sidebar-foreground group-hover:text-foreground')} />
              {!collapsed && <span className="flex-1">{label}</span>}
              {!collapsed && active && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className={cn('mb-2 flex items-center gap-3 rounded-2xl px-3 py-3', collapsed && 'justify-center px-2')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sidebar-border bg-card text-xs font-bold text-foreground">
            {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight text-foreground">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-sidebar-foreground">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-sidebar-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
