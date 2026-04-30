'use client';

import { useState, useEffect, useRef } from 'react';

interface Account {
  id: string;
  name: string;
  industry_segment: string;
  region: string;
  annual_contract_value: number;
  status: string;
  primary_contact_name: string;
  primary_contact_email: string;
  last_activity_date: string;
  notes: string;
}

interface PipelineData {
  total_pipeline_value: number;
  total_deals: number;
  average_deal_size: number;
  deals_by_stage: Record<string, { count: number; value: number }>;
}

function ContactCard({
  account,
  onClose,
}: {
  account: Account;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-[#333] bg-[#151515] p-4 shadow-xl shadow-black/50"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-100">
            {account.primary_contact_name || 'No Contact'}
          </p>
          <p className="text-xs text-zinc-500">{account.name}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-zinc-500 hover:bg-[#222] hover:text-zinc-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>

      {/* Contact Details */}
      <div className="space-y-2.5">
        {account.primary_contact_email && (
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-[#17ffdc]">
              <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
              <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
            </svg>
            <a
              href={`mailto:${account.primary_contact_email}`}
              className="text-sm text-[#17ffdc] hover:underline truncate"
            >
              {account.primary_contact_email}
            </a>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-zinc-500">
            <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.6-4.03.93-6.17.93s-4.219-.33-6.17-.93C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75ZM8.75 2.5c-.69 0-1.25.56-1.25 1.25v.1c.5-.02 1.004-.034 1.51-.04L10 3.8l.99.01c.507.006 1.01.02 1.51.04v-.1c0-.69-.56-1.25-1.25-1.25h-2.5ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z" clipRule="evenodd" />
            <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686A41.454 41.454 0 0 1 10 18c-1.6 0-3.169-.117-4.637-.259C3.985 17.585 3 16.402 3 15.055Z" />
          </svg>
          <span className="text-sm text-zinc-400">
            {account.industry_segment || '—'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-zinc-500">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
          </svg>
          <span className="text-sm capitalize text-zinc-400">
            {account.region || '—'}
          </span>
        </div>

        {account.last_activity_date && (
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-zinc-500">
              <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-zinc-400">
              Last activity: {new Date(account.last_activity_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {account.notes && (
        <div className="mt-3 border-t border-[#222] pt-3">
          <p className="text-xs text-zinc-500 leading-relaxed">{account.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function CRMPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [openContact, setOpenContact] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [accountsRes, pipelineRes] = await Promise.all([
          fetch('/api/crm/dashboard?type=accounts'),
          fetch('/api/crm/dashboard?type=pipeline'),
        ]);

        if (accountsRes.ok) {
          const data = await accountsRes.json();
          setAccounts(data.accounts || data);
        }
        if (pipelineRes.ok) {
          setPipeline(await pipelineRes.json());
        }
      } catch (err) {
        console.error('Failed to fetch CRM data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredAccounts = filter === 'all'
    ? accounts
    : accounts.filter((a) => a.status === filter);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const stageOrder = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const stageLabels: Record<string, string> = {
    prospecting: 'Prospecting',
    qualification: 'Qualification',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost',
  };
  const stageColors: Record<string, string> = {
    prospecting: 'bg-blue-500/20 text-blue-400',
    qualification: 'bg-yellow-500/20 text-yellow-400',
    proposal: 'bg-purple-500/20 text-purple-400',
    negotiation: 'bg-orange-500/20 text-orange-400',
    closed_won: 'bg-green-500/20 text-green-400',
    closed_lost: 'bg-red-500/20 text-red-400',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    prospect: 'bg-blue-500/20 text-blue-400',
    churned: 'bg-red-500/20 text-red-400',
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-zinc-500">Loading CRM data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0a0a0a] px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-100">MedLine Surgical Solutions</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Demo 3 — B2B Surgical Supplies CRM with credentialized API
          </p>
        </div>

        {/* Pipeline Summary Cards */}
        {pipeline && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-[#222] bg-[#111] p-4">
              <div className="text-xs uppercase tracking-widest text-zinc-500">Pipeline Value</div>
              <div className="mt-1 text-2xl font-semibold text-[#17ffdc]">
                {formatCurrency(pipeline.total_pipeline_value)}
              </div>
            </div>
            <div className="rounded-lg border border-[#222] bg-[#111] p-4">
              <div className="text-xs uppercase tracking-widest text-zinc-500">Total Deals</div>
              <div className="mt-1 text-2xl font-semibold text-zinc-100">{pipeline.total_deals}</div>
            </div>
            <div className="rounded-lg border border-[#222] bg-[#111] p-4">
              <div className="text-xs uppercase tracking-widest text-zinc-500">Avg Deal Size</div>
              <div className="mt-1 text-2xl font-semibold text-zinc-100">
                {formatCurrency(pipeline.average_deal_size)}
              </div>
            </div>
            <div className="rounded-lg border border-[#222] bg-[#111] p-4">
              <div className="text-xs uppercase tracking-widest text-zinc-500">Active Accounts</div>
              <div className="mt-1 text-2xl font-semibold text-zinc-100">
                {accounts.filter((a) => a.status === 'active').length}
              </div>
            </div>
          </div>
        )}

        {/* Pipeline Stages */}
        {pipeline && pipeline.deals_by_stage && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-zinc-500">Pipeline by Stage</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {stageOrder.map((stage) => {
                const data = pipeline.deals_by_stage[stage];
                if (!data) return null;
                return (
                  <div key={stage} className="rounded-lg border border-[#222] bg-[#111] p-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${stageColors[stage]}`}>
                      {stageLabels[stage]}
                    </span>
                    <div className="mt-2 text-lg font-semibold text-zinc-100">{data.count} deals</div>
                    <div className="text-xs text-zinc-500">{formatCurrency(data.value)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Accounts Table */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">Accounts</h2>
            <div className="flex gap-2">
              {['all', 'active', 'prospect', 'churned'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-[#17ffdc]/20 text-[#17ffdc]'
                      : 'bg-[#111] text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#222]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#222] bg-[#111]">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500">Segment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500">ACV</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500">Primary Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="border-b border-[#222] last:border-0 hover:bg-[#111]/50">
                    <td className="px-4 py-3 font-medium text-zinc-100">{account.name}</td>
                    <td className="px-4 py-3 text-zinc-400">{account.industry_segment || '—'}</td>
                    <td className="px-4 py-3 capitalize text-zinc-400">{account.region || '—'}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {account.annual_contract_value ? formatCurrency(account.annual_contract_value) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[account.status] || 'bg-zinc-500/20 text-zinc-400'}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenContact(openContact === account.id ? null : account.id)
                          }
                          className="group flex items-center gap-1.5 text-zinc-300 hover:text-[#17ffdc] transition-colors"
                        >
                          <span className="underline decoration-zinc-600 underline-offset-2 group-hover:decoration-[#17ffdc]/50">
                            {account.primary_contact_name || '—'}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#17ffdc]">
                            <path d="M8 2a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V2.75A.75.75 0 0 1 8 2Z" />
                          </svg>
                        </button>
                        {openContact === account.id && (
                          <ContactCard
                            account={account}
                            onClose={() => setOpenContact(null)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
