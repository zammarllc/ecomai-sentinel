import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../utils/auth.js';

const MODULES = [
  {
    title: 'Query Resolver',
    description:
      'Unified inbox with AI summaries, suggested replies, and smart escalations to keep every customer delighted.',
    status: 'Coming soon',
    detail: 'GPT-4o-mini trained on your macros and brand tone.'
  },
  {
    title: 'Inventory Forecasting',
    description:
      'Channel-level demand predictions, replenishment dates, and automated vendor alerts to stay ahead of stockouts.',
    status: 'Coming soon',
    detail: 'Live Shopify, Amazon, and ERP signals merged into a single forecast.'
  },
  {
    title: 'Stock Alert Data Loop',
    description:
      'Real-time alerting around safety stock thresholds with automated reorder approvals and vendor routing.',
    status: 'Coming soon',
    detail: 'Syncs to Slack, Email, and your operations dashboards.'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const today = useMemo(() => new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' }), []);

  const handleLogout = () => {
    clearToken();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.45em] text-indigo-500">EcomAI Sentinel</span>
            <h1 className="text-2xl font-semibold text-slate-900">Command Center</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-14">
        <section className="rounded-3xl border border-indigo-100 bg-white/90 p-10 shadow-xl shadow-indigo-200/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">EcomAI Sentinel Dashboard</h2>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                Query Resolver and Inventory Forecasting modules coming soon. Your workspace will unlock an AI-first inbox,
                replenishment intelligence, and proactive stock loops tailored for your catalog.
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-600">
              {today}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-md">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-indigo-500">Customer Signals</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">Preparing insights</p>
              <p className="mt-3 text-sm text-slate-600">
                AI triage rules will prioritize urgent tickets, sentiment shifts, and revenue-impacting conversations.
              </p>
            </div>
            <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-md">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-indigo-500">Inventory Health</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">Launching soon</p>
              <p className="mt-3 text-sm text-slate-600">
                Real-time coverage maps across marketplaces with automated safety stock and reorder projections.
              </p>
            </div>
            <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-md">
              <p className="text-sm font-medium uppercase tracking-[0.35em] text-indigo-500">Automation Recipes</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">Finalizing</p>
              <p className="mt-3 text-sm text-slate-600">
                Best-practice workflows for refunds, returns, and loyalty offers are being preloaded for your launch.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
            <h3 className="text-xl font-semibold text-slate-900">Roadmap</h3>
            <p className="mt-3 text-sm text-slate-600">
              Track the modules rolling out tonight and the capabilities that will unlock for your team.
            </p>
            <div className="mt-6 space-y-4">
              {MODULES.map((module) => (
                <div
                  key={module.title}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-indigo-50/60"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-slate-900">{module.title}</h4>
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
                      {module.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{module.description}</p>
                  <p className="text-xs font-medium uppercase tracking-[0.35em] text-indigo-500">{module.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-slate-100 p-8 shadow-lg shadow-indigo-200/40">
              <h3 className="text-lg font-semibold text-slate-900">Launch checklist</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span>Connect Shopify, Amazon, and helpdesk integrations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span>Upload macros and FAQ to fine-tune response tone.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span>Confirm safety stock thresholds per warehouse.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
              <h3 className="text-lg font-semibold text-slate-900">Need help?</h3>
              <p className="mt-3 text-sm text-slate-600">
                Our launch engineers are on standby for tonight&apos;s go-live. Reply to this card to trigger a priority support session.
              </p>
              <button
                type="button"
                className="mt-6 inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-700"
              >
                Contact launch support
              </button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
