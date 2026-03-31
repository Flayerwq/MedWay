import type { ReactNode } from 'react';
import { Heart, Activity, ShieldCheck, Stethoscope } from 'lucide-react';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
  sideTitle: string;
  sideDescription: string;
}

const highlights = [
  {
    icon: Activity,
    title: 'AI-first guidance',
    description: 'Structured symptom support with a calm, readable experience.',
  },
  {
    icon: ShieldCheck,
    title: 'Private workspace',
    description: 'Reports, appointments, and account details in one organized place.',
  },
  {
    icon: Stethoscope,
    title: 'Designed for routine use',
    description: 'A lightweight product surface for managing ongoing healthcare tasks.',
  },
];

export default function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
  sideTitle,
  sideDescription,
}: AuthShellProps) {
  return (
    <div className="app-shell">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-border bg-secondary lg:grid-cols-[1.02fr_0.98fr]">
          <section className="hidden border-r border-border bg-[#121212] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-muted-foreground">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-card text-foreground">
                  <Heart className="h-4 w-4" />
                </span>
                MedWay Care Workspace
              </div>

              <div className="mt-16 max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">{eyebrow}</p>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
                  {sideTitle}
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground xl:text-lg">
                  {sideDescription}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {highlights.map(({ icon: Icon, title: itemTitle, description: itemDescription }) => (
                <div key={itemTitle} className="rounded-3xl border border-border bg-secondary p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{itemTitle}</h2>
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{itemDescription}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-foreground">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">MedWay</p>
                  <p className="text-sm text-muted-foreground">A simpler healthcare workspace.</p>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">{eyebrow}</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 sm:p-7">
                {children}
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
