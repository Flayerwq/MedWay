import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Calendar } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="app-page page-fade max-w-4xl">
      <section className="app-card-muted p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">Your account information in the same product surface as the rest of the app.</p>
      </section>

      <div className="app-card mt-8 p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#1f5d4f] bg-primary/10">
            <span className="text-2xl font-bold text-primary">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{user?.user_metadata?.full_name || 'User'}</h2>
            <p className="text-sm text-muted-foreground">Patient</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="app-panel flex items-center gap-3 p-4">
            <Mail className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm text-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="app-panel flex items-center gap-3 p-4">
            <User className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="text-sm text-foreground">{user?.user_metadata?.full_name || 'Not set'}</p>
            </div>
          </div>
          <div className="app-panel flex items-center gap-3 p-4">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm text-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
