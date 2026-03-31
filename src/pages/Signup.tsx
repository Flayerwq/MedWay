import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AuthShell from '@/components/auth/AuthShell';
import { Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        eyebrow="Account Created"
        title="Check your email"
        description={`We&apos;ve sent a confirmation link to ${email}. Open that email to activate your MedWay account.`}
        sideTitle="You&apos;re one step away from a cleaner healthcare workspace."
        sideDescription="Once your email is confirmed, you&apos;ll have a simpler home for reports, appointments, and AI guidance."
        footer={null}
      >
        <div className="text-center">
          <div className="mb-5 inline-flex rounded-3xl border border-border bg-secondary p-4 text-primary">
            <CheckCircle className="h-11 w-11" />
          </div>
          <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
            If you don&apos;t see the email soon, check spam or return to login and try again later.
          </p>
          <Button
            variant="outline"
            className="mt-8 h-11 px-6"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Create Account"
      title="Start with a simpler care workflow"
      description="Create your account to organize medical reports, appointments, and AI guidance in one place."
      sideTitle="A healthcare product that feels clear from the first screen."
      sideDescription="MedWay is designed to keep important information readable, structured, and easy to return to."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-foreground transition-colors hover:text-primary">
            Sign in
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
          <Label htmlFor="name" className="text-sm font-medium text-foreground">Full name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 pl-11"
              required
            />
          </div>
        </div>

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
            <span className="text-xs text-muted-foreground">Minimum 6 characters</span>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-11 pr-12"
              required
              minLength={6}
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
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">Fast onboarding</span>
        </div>

        <Button
          type="submit"
          className="h-12 w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
