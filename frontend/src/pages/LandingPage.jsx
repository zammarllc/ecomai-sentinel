import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    title: 'AI Customer Query Resolution',
    description:
      'Hand off repetitive support tickets to GPT-4o-mini agents that respond with brand-trained tone, escalate intelligently, and learn from every interaction.'
  },
  {
    title: 'Real-time Inventory Forecasting',
    description:
      'Predict stock-outs weeks ahead with live marketplace, Shopify, and ERP signals synchronized into a single forecasting engine.'
  },
  {
    title: 'Stock Alert Data Loop',
    description:
      'Trigger proactive notifications when fast-moving SKUs dip below your safety threshold and let automation reorder from preferred vendors.'
  }
];

export default function LandingPage({ onLoginClick, isAuthenticated }) {
  const navigate = useNavigate();
  const primaryCtaLabel = useMemo(
    () => (isAuthenticated ? 'Go to Dashboard' : 'Launch Dashboard'),
    [isAuthenticated]
  );

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      onLoginClick?.();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-indigo-500/35 blur-[200px]" />
        <div className="absolute bottom-[-20%] left-1/4 h-[30rem] w-[30rem] rounded-full bg-sky-500/25 blur-[200px]" />
        <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-indigo-400/20 blur-[180px]" />
      </div>

      <header className="border-b border-white/5">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold text-white shadow-inner shadow-indigo-500/20">
              ES
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-white">EcomAI Sentinel</p>
              <p className="text-xs font-medium uppercase tracking-[0.45em] text-indigo-200/80">
                AI for e-commerce teams
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/20"
              >
                Dashboard
              </button>
            )}
            <button
              type="button"
              onClick={() => onLoginClick?.()}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-md shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto grid w-full max-w-6xl flex-1 gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1.2fr)_1fr] lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
              Launch Tonight
            </span>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
              EcomAI Sentinel
            </h1>
            <p className="mt-4 text-xl font-medium text-indigo-100/95 sm:text-2xl">
              AI-Powered Customer Support & Inventory Forecasting for E-Commerce Sellers
            </p>
            <p className="mt-6 text-lg leading-relaxed text-indigo-100/90">
              EcomAI Sentinel unifies every customer conversation, order trend, and stock signal so your team can respond faster, sell smarter, and stay in stock without firefighting.
            </p>
            <p className="mt-4 text-base leading-relaxed text-indigo-100/80">
              Give your agents a co-pilot that resolves queries instantly while forecasting demand across every channel—no spreadsheets, no guesswork.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 px-7 py-3 text-base font-semibold text-white shadow-brand-lg transition hover:from-indigo-600 hover:via-indigo-700 hover:to-indigo-800"
              >
                {primaryCtaLabel}
                <span aria-hidden className="text-lg">→</span>
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-indigo-100 transition hover:border-white/40 hover:text-white"
              >
                Explore features
                <span aria-hidden className="text-lg">↘</span>
              </a>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner shadow-indigo-500/20 backdrop-blur">
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-indigo-200">Resolution rate</p>
                <p className="mt-3 text-3xl font-semibold text-white">84% of tickets automated</p>
                <p className="mt-3 text-sm text-indigo-100/70">Average across pilot stores using GPT-4o-mini response workflows.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner shadow-indigo-500/20 backdrop-blur">
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-indigo-200">Inventory accuracy</p>
                <p className="mt-3 text-3xl font-semibold text-white">+26% forecast precision</p>
                <p className="mt-3 text-sm text-indigo-100/70">AI-driven demand signals keep fast movers in stock ahead of spikes.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-indigo-500/20 backdrop-blur">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-200">Command center preview</p>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-indigo-300/20 bg-indigo-500/10 p-5">
                    <p className="text-sm font-semibold text-indigo-200">Unified Inbox</p>
                    <p className="mt-2 text-sm text-indigo-100/80">
                      Route marketplace, Shopify, Amazon, and email messages to the same AI-guided workspace.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-indigo-300/20 bg-indigo-500/10 p-5">
                    <p className="text-sm font-semibold text-indigo-200">Inventory Pulse</p>
                    <p className="mt-2 text-sm text-indigo-100/80">
                      Daily AI forecasts combine historical sales and live cart velocity to forecast precise reorder dates.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-indigo-300/20 bg-indigo-500/10 p-5">
                    <p className="text-sm font-semibold text-indigo-200">Automation Recipes</p>
                    <p className="mt-2 text-sm text-indigo-100/80">
                      Deploy best-practice playbooks for refunds, replacements, and loyalty offers with one click.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-300">Capabilities</p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              The AI co-pilot built for modern e-commerce operations
            </h2>
            <p className="mt-4 text-base text-indigo-100/80">
              Delegate repetitive tasks, forecast inventory with confidence, and keep your brand voice consistent across every channel.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-500/10 transition hover:border-indigo-300/40 hover:bg-white/10"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-indigo-100/80">{feature.description}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-200 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                  Optimized for scale
                  <span aria-hidden>→</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 pb-20">
          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/40 via-indigo-600/40 to-sky-500/30 p-10 shadow-brand-lg backdrop-blur lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-white">Ready for tonight&apos;s launch?</h3>
              <p className="mt-2 text-base text-indigo-100/80">
                Log in with the demo credentials to experience the Sentinel dashboard and automation flows.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {primaryCtaLabel}
              <span aria-hidden className="text-lg">→</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-indigo-200/70 sm:flex-row">
          <p>© {new Date().getFullYear()} EcomAI Sentinel. All rights reserved.</p>
          <p>Crafted for e-commerce innovators.</p>
        </div>
      </footer>
    </div>
  );
}
