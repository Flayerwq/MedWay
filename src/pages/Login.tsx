import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AuthShell from '@/components/auth/AuthShell';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Sign in to MedWay"
      description="Access reports, appointments, and your AI assistant from one clean healthcare workspace."
      sideTitle="A calm, focused place to manage your care."
      sideDescription="MedWay keeps medical tasks organized without visual noise, so your next step is always easy to find."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-foreground transition-colors hover:text-primary">
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-border bg-secondary p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
          <p className="text-sm leading-6 text-muted-foreground">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 pl-11"
              required
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
            <button
              type="button"
              onClick={() => setError('Password reset is not configured yet. Please contact support.')}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-11 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Checkbox checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
            Remember me
          </label>
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">Secure sign-in</span>
        </div>

        <Button
          type="submit"
          className="h-12 w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
