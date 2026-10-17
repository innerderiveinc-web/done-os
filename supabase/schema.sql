-- DONE — Request-to-Completion OS
-- PostgreSQL Schema & Row Level Security (RLS) for Supabase
-- Production Database DDL & Secure Public RPC Functions

create extension if not exists "pgcrypto";

-- 1. Organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'free' check (plan in ('free', 'starter', 'growth', 'business', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Profiles (links to Supabase auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Organization Memberships (RBAC)
create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- 4. Recipients (Client / contact directory)
create table if not exists recipients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Requests
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  recipient_id uuid references recipients(id) on delete set null,
  reference_no text not null default ('REQ-' || floor(1000 + random() * 9000)::text),
  title text not null,
  description text,
  request_type text not null check (request_type in ('Document', 'Payment', 'Approval', 'Confirmation', 'Multi-Action')),
  status text not null default 'Draft' check (status in (
    'Draft', 'Sent', 'Opened', 'In Progress', 'Submitted', 
    'Needs Correction', 'Approved', 'Paid', 'Completed', 'Closed', 'Overdue'
  )),
  due_at date,
  public_token text unique not null default encode(gen_random_bytes(24), 'hex'),
  public_token_hash text not null default '',
  public_token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- 6. Request Actions (Multi-action items inside a single request)
create table if not exists request_actions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  type text not null check (type in ('Document', 'Payment', 'Approval', 'Confirmation')),
  title text not null,
  description text,
  is_required boolean not null default true,
  position integer not null default 1,
  status text not null default 'Pending' check (status in ('Pending', 'Uploaded', 'Paid', 'Approved', 'Rejected', 'Confirmed', 'Rescheduled', 'Completed', 'Needs Correction')),
  amount numeric(14,2) default 0,
  currency text not null default 'INR',
  result jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- 7. Attachments (Uploaded documents with storage references)
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  action_id uuid references request_actions(id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  file_size integer not null,
  uploaded_by text default 'recipient',
  created_at timestamptz not null default now()
);

-- 8. Payments (Transaction records)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  action_id uuid references request_actions(id) on delete cascade,
  amount numeric(14,2) not null,
  currency text not null default 'INR',
  status text not null default 'Pending' check (status in ('Pending', 'Processing', 'Paid', 'Failed')),
  provider text not null default 'mock' check (provider in ('mock', 'razorpay', 'cashfree', 'manual')),
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. Approvals (Sign-off / rejection records)
create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  action_id uuid references request_actions(id) on delete cascade,
  decision text not null check (decision in ('Approved', 'Rejected', 'Requested Changes')),
  comment text,
  decided_by text default 'recipient',
  created_at timestamptz not null default now()
);

-- 10. Confirmations
create table if not exists confirmations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  action_id uuid references request_actions(id) on delete cascade,
  response text not null check (response in ('Confirmed', 'Declined', 'Reschedule Requested')),
  comment text,
  created_at timestamptz not null default now()
);

-- 11. Reminders
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'sms', 'email')),
  scheduled_for timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'cancelled', 'failed')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- 12. Templates
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  request_type text not null,
  template_data jsonb not null default '{}'::jsonb,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 13. Audit Logs (Immutable audit trail of state changes)
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  user_id uuid references profiles(id) on delete set null,
  request_id uuid references requests(id) on delete cascade,
  action text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 14. Referrals (Viral growth loop: Recipient-to-Sender conversion tracking)
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  source_request_id uuid references requests(id) on delete set null,
  source_recipient_id uuid references recipients(id) on delete set null,
  new_user_id uuid references profiles(id) on delete set null,
  source_type text not null default 'recipient_to_sender',
  converted_to_sender boolean not null default false,
  created_at timestamptz not null default now()
);

-- 15. Subscriptions
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  period_start timestamptz not null default now(),
  period_end timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 16. Webhook Events (Idempotency & delivery audit)
create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text unique not null,
  event_type text not null,
  provider text not null check (provider in ('razorpay', 'cashfree', 'qsura', 'meta_whatsapp')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'processed' check (status in ('processed', 'failed', 'ignored')),
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_requests_org on requests(organization_id);
create index if not exists idx_requests_status on requests(status);
create index if not exists idx_requests_due on requests(due_at);
create index if not exists idx_requests_token on requests(public_token);
create index if not exists idx_actions_request on request_actions(request_id);
create index if not exists idx_audit_request on audit_logs(request_id);

-- Enable Row Level Security (RLS) on all tables
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;
alter table recipients enable row level security;
alter table requests enable row level security;
alter table request_actions enable row level security;
alter table attachments enable row level security;
alter table payments enable row level security;
alter table approvals enable row level security;
alter table confirmations enable row level security;
alter table reminders enable row level security;
alter table templates enable row level security;
alter table audit_logs enable row level security;
alter table referrals enable row level security;
alter table subscriptions enable row level security;
alter table webhook_events enable row level security;

-- Helper security functions
create or replace function auth_org_ids()
returns setof uuid security definer language sql stable as $$
  select organization_id from organization_members where user_id = auth.uid();
$$;

-- RLS Policies: Authenticated workspace members have full org access
create policy org_members_read on requests for select using (organization_id in (select auth_org_ids()));
create policy org_members_insert on requests for insert with check (organization_id in (select auth_org_ids()));
create policy org_members_update on requests for update using (organization_id in (select auth_org_ids()));
create policy org_members_delete on requests for delete using (organization_id in (select auth_org_ids()));

create policy org_actions_read on request_actions for select using (
  request_id in (select id from requests where organization_id in (select auth_org_ids()))
);
create policy org_actions_write on request_actions for all using (
  request_id in (select id from requests where organization_id in (select auth_org_ids()))
);

create policy org_audit_read on audit_logs for select using (
  organization_id in (select auth_org_ids())
);

-- Secure Public Recipient Access via Database RPC (Token based, no direct table exposure)
create or replace function get_public_request_by_token(p_token text)
returns jsonb security definer language plpgsql as $$
declare
  v_req record;
  v_actions jsonb;
  v_org_name text;
begin
  select r.*, o.name as org_name
  into v_req
  from requests r
  join organizations o on o.id = r.organization_id
  where r.public_token = p_token;

  if not found then
    return null;
  end if;

  -- Mark opened on first recipient view if still Sent
  if v_req.status = 'Sent' then
    update requests set status = 'Opened', updated_at = now() where id = v_req.id;
    insert into audit_logs (organization_id, request_id, action, metadata)
    values (v_req.organization_id, v_req.id, 'REQUEST_OPENED', jsonb_build_object('by', 'recipient', 'at', now()));
  end if;

  select jsonb_agg(to_jsonb(a) order by a.position asc)
  into v_actions
  from request_actions a
  where a.request_id = v_req.id;

  return jsonb_build_object(
    'id', v_req.id,
    'reference_no', v_req.reference_no,
    'title', v_req.title,
    'description', v_req.description,
    'request_type', v_req.request_type,
    'status', v_req.status,
    'due_at', v_req.due_at,
    'org_name', v_req.org_name,
    'actions', coalesce(v_actions, '[]'::jsonb)
  );
end;
$$;

-- Secure Public Recipient Action Submission RPC
-- Allows anonymous recipient with a valid token to complete actions safely
create or replace function submit_public_action(
  p_token text,
  p_action_id text,
  p_status text,
  p_result jsonb default '{}'::jsonb
)
returns jsonb security definer language plpgsql as $$
declare
  v_req record;
  v_action record;
  v_pending_count integer;
  v_new_status text;
begin
  -- Validate public token
  select * into v_req from requests where public_token = p_token;
  if not found then
    raise exception 'Invalid or expired request token.';
  end if;

  -- Validate action belongs to this request
  select * into v_action from request_actions where id::text = p_action_id and request_id = v_req.id;
  if not found then
    raise exception 'Action item not found in this request.';
  end if;

  -- Update action
  update request_actions
  set status = p_status,
      result = p_result,
      completed_at = now(),
      updated_at = now()
  where id = v_action.id;

  -- Check if all required actions are completed
  select count(*) into v_pending_count
  from request_actions
  where request_id = v_req.id
    and is_required = true
    and status not in ('Completed', 'Uploaded', 'Paid', 'Approved', 'Confirmed');

  if v_pending_count = 0 then
    v_new_status := 'Completed';
    update requests
    set status = 'Completed',
        completed_at = now(),
        updated_at = now()
    where id = v_req.id;

    insert into audit_logs (organization_id, request_id, action, metadata)
    values (v_req.organization_id, v_req.id, 'REQUEST_COMPLETED', jsonb_build_object('by', 'recipient', 'at', now()));
  else
    v_new_status := 'In Progress';
    update requests
    set status = 'In Progress',
        updated_at = now()
    where id = v_req.id;
  end if;

  -- Record audit log entry
  insert into audit_logs (organization_id, request_id, action, metadata)
  values (
    v_req.organization_id,
    v_req.id,
    case
      when v_action.type = 'Document' then 'DOCUMENT_UPLOADED'
      when v_action.type = 'Payment' then 'PAYMENT_CONFIRMED'
      when v_action.type = 'Approval' and p_status = 'Approved' then 'APPROVAL_GRANTED'
      when v_action.type = 'Approval' and p_status = 'Rejected' then 'APPROVAL_REJECTED'
      else 'ACTION_SUBMITTED'
    end,
    jsonb_build_object('action_id', v_action.id, 'status', p_status, 'result', p_result)
  );

  return jsonb_build_object(
    'success', true,
    'request_status', v_new_status,
    'action_status', p_status
  );
end;
$$;
