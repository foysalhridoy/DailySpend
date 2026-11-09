-- ==============================================================================
-- DAILYSPEND PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  currency_symbol text default '৳',
  currency_code text default 'BDT',
  date_format text default 'yyyy-MM-dd',
  time_format text default '12h',
  theme text default 'dark',
  is_onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. USER SETTINGS TABLE
create table if not exists public.user_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  preferences jsonb default '{}'::jsonb,
  notifications_enabled boolean default true,
  default_wallet_id uuid,
  low_balance_threshold numeric(12, 2) default 500.00,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TRACKING PERIODS TABLE
create table if not exists public.tracking_periods (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  start_date date not null,
  end_date date,
  spending_target numeric(12, 2),
  is_active boolean default true,
  status text default 'active' check (status in ('active', 'closed')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. WALLETS TABLE
create table if not exists public.wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null default 'cash' check (type in ('cash', 'bkash', 'nagad', 'rocket', 'bank', 'other')),
  opening_balance numeric(12, 2) not null default 0.00,
  current_balance numeric(12, 2) not null default 0.00,
  color text default '#10b981',
  icon text default 'wallet',
  is_default boolean default false,
  is_archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('expense', 'income')),
  parent_category text,
  icon text default 'tag',
  color text default '#6b7280',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- 6. BUDGETS TABLE
create table if not exists public.budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  amount numeric(12, 2) not null check (amount > 0),
  period_type text not null default 'monthly' check (period_type in ('daily', 'weekly', 'monthly', 'period', 'category')),
  category_id uuid references public.categories on delete set null,
  tracking_period_id uuid references public.tracking_periods on delete set null,
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. TRANSACTIONS TABLE
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('expense', 'income', 'transfer')),
  amount numeric(12, 2) not null check (amount > 0),
  category_id uuid references public.categories on delete set null,
  wallet_id uuid references public.wallets on delete cascade not null,
  to_wallet_id uuid references public.wallets on delete set null,
  tracking_period_id uuid references public.tracking_periods on delete set null,
  date date not null default current_date,
  time text not null default to_char(now(), 'HH24:MI'),
  description text not null,
  notes text,
  payment_method text default 'cash',
  is_reviewed boolean default false,
  receipt_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. RECEIPTS TABLE
create table if not exists public.receipts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  receipt_number text not null,
  type text not null default 'individual' check (type in ('individual', 'daily', 'period', 'summary')),
  transaction_id uuid references public.transactions on delete set null,
  format text not null default '58mm' check (format in ('58mm', '80mm', 'a4')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 9. DAILY CLOSINGS TABLE
create table if not exists public.daily_closings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  total_income numeric(12, 2) not null default 0.00,
  total_expense numeric(12, 2) not null default 0.00,
  closing_balance numeric(12, 2) not null default 0.00,
  is_reviewed boolean default true,
  notes text,
  created_at timestamptz default now(),
  unique (user_id, date)
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ==============================================================================
create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
create index if not exists idx_transactions_wallet on public.transactions(wallet_id);
create index if not exists idx_transactions_period on public.transactions(tracking_period_id);
create index if not exists idx_wallets_user on public.wallets(user_id);
create index if not exists idx_periods_user on public.tracking_periods(user_id, is_active);
create index if not exists idx_budgets_user on public.budgets(user_id);
create index if not exists idx_daily_closings_user on public.daily_closings(user_id, date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.tracking_periods enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.budgets enable row level security;
alter table public.transactions enable row level security;
alter table public.receipts enable row level security;
alter table public.daily_closings enable row level security;

-- Profiles: Users can view and update only their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- User Settings
create policy "Users can view own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can update own settings" on public.user_settings for update using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.user_settings for insert with check (auth.uid() = user_id);

-- Tracking Periods
create policy "Users can view own periods" on public.tracking_periods for select using (auth.uid() = user_id);
create policy "Users can insert own periods" on public.tracking_periods for insert with check (auth.uid() = user_id);
create policy "Users can update own periods" on public.tracking_periods for update using (auth.uid() = user_id);
create policy "Users can delete own periods" on public.tracking_periods for delete using (auth.uid() = user_id);

-- Wallets
create policy "Users can view own wallets" on public.wallets for select using (auth.uid() = user_id);
create policy "Users can insert own wallets" on public.wallets for insert with check (auth.uid() = user_id);
create policy "Users can update own wallets" on public.wallets for update using (auth.uid() = user_id);
create policy "Users can delete own wallets" on public.wallets for delete using (auth.uid() = user_id);

-- Categories
create policy "Users can view own categories" on public.categories for select using (auth.uid() = user_id);
create policy "Users can insert own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on public.categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on public.categories for delete using (auth.uid() = user_id);

-- Budgets
create policy "Users can view own budgets" on public.budgets for select using (auth.uid() = user_id);
create policy "Users can insert own budgets" on public.budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on public.budgets for update using (auth.uid() = user_id);
create policy "Users can delete own budgets" on public.budgets for delete using (auth.uid() = user_id);

-- Transactions
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);

-- Receipts
create policy "Users can view own receipts" on public.receipts for select using (auth.uid() = user_id);
create policy "Users can insert own receipts" on public.receipts for insert with check (auth.uid() = user_id);
create policy "Users can delete own receipts" on public.receipts for delete using (auth.uid() = user_id);

-- Daily Closings
create policy "Users can view own closings" on public.daily_closings for select using (auth.uid() = user_id);
create policy "Users can insert own closings" on public.daily_closings for insert with check (auth.uid() = user_id);
create policy "Users can update own closings" on public.daily_closings for update using (auth.uid() = user_id);

-- ==============================================================================
-- DATABASE TRIGGER: AUTO PROFILE CREATION ON SIGNUP
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, currency_symbol, currency_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    '৳',
    'BDT'
  );

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

