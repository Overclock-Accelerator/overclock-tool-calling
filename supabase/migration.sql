-- ============================================================
-- MedLine Surgical Solutions CRM — Full Schema
-- ============================================================

-- Accounts
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry_segment text,
  region text,
  annual_contract_value numeric,
  status text default 'prospect',
  primary_contact_name text,
  primary_contact_email text,
  last_activity_date timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contacts
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  email text,
  phone text,
  account_id uuid references accounts(id) on delete cascade,
  notes text,
  created_at timestamptz default now()
);

-- Opportunities
create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_id uuid references accounts(id) on delete cascade,
  stage text default 'prospecting',
  value numeric,
  expected_close date,
  owner text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activities
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  account_id uuid references accounts(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  date timestamptz default now(),
  summary text,
  next_steps text,
  created_at timestamptz default now()
);

-- Enable RLS but allow service role full access
alter table accounts enable row level security;
alter table contacts enable row level security;
alter table opportunities enable row level security;
alter table activities enable row level security;

-- Policies for service role (our API routes use service role key)
create policy "Service role full access" on accounts for all using (true) with check (true);
create policy "Service role full access" on contacts for all using (true) with check (true);
create policy "Service role full access" on opportunities for all using (true) with check (true);
create policy "Service role full access" on activities for all using (true) with check (true);
