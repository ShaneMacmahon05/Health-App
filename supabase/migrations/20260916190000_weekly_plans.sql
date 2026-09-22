-- Weekly plan system: one row per generated plan (public.weekly_plans) plus
-- its 3-5 actions (public.plan_actions). Plans are written exclusively by
-- the generate-weekly-plan Edge Function via the create_weekly_plan() RPC
-- below - the client can only ever SELECT its own plans/actions, and may
-- later update an action's completion fields once that UI exists.
--
-- This project has no Supabase CLI / migration runner configured yet, so
-- this file is not applied automatically. Run it manually in the Supabase
-- Dashboard SQL Editor (Project -> SQL Editor -> New query), after
-- 0001_onboarding_responses.sql.

create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  plan_number integer not null check (plan_number > 0),
  personalization_line text not null,

  -- "active" is the only status this task produces. The column exists now
  -- so a future plan (e.g. once a new plan replaces this one) doesn't need
  -- a schema migration to introduce plan history.
  status text not null default 'active' check (status in ('active', 'completed', 'superseded')),

  model text not null,
  prompt_version text not null,
  input_tokens integer,
  output_tokens integer,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A user can never receive two copies of the same numbered plan.
  unique (user_id, plan_number)
);

create table if not exists public.plan_actions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.weekly_plans (id) on delete cascade,

  category text not null check (category in ('movement', 'nutrition', 'wellbeing')),
  title text not null,
  target text not null,
  instructions text not null,
  why text not null,
  fallback text not null,
  success_definition text not null,
  based_on text[] not null default '{}',

  sort_order integer not null,
  is_completed boolean not null default false,
  completed_at timestamptz,

  created_at timestamptz not null default now(),

  unique (plan_id, sort_order)
);

-- No separate index on plan_id: the unique (plan_id, sort_order) constraint
-- above already creates one with plan_id as its leading column.

alter table public.weekly_plans enable row level security;
alter table public.plan_actions enable row level security;

-- weekly_plans: authenticated users may only ever read their own plans.
-- There is deliberately no insert/update/delete policy here - the only way
-- to create a plan is the create_weekly_plan() SECURITY DEFINER RPC below.
create policy "Users can view their own weekly plans"
  on public.weekly_plans
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.weekly_plans from public;
revoke all on public.weekly_plans from anon;
grant select on public.weekly_plans to authenticated;

-- plan_actions: authenticated users may read their own actions (ownership
-- proven via the parent plan's user_id, since plan_actions has no user_id
-- column of its own). They may also update - but, via column-level grants
-- below, ONLY the completion fields of their own actions. Title,
-- instructions, why, fallback, etc. can never be modified by the client.
create policy "Users can view their own plan actions"
  on public.plan_actions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.weekly_plans wp
      where wp.id = plan_actions.plan_id
        and wp.user_id = (select auth.uid())
    )
  );

create policy "Users can update completion on their own plan actions"
  on public.plan_actions
  for update
  to authenticated
  using (
    exists (
      select 1 from public.weekly_plans wp
      where wp.id = plan_actions.plan_id
        and wp.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.weekly_plans wp
      where wp.id = plan_actions.plan_id
        and wp.user_id = (select auth.uid())
    )
  );

revoke all on public.plan_actions from public;
revoke all on public.plan_actions from anon;
grant select on public.plan_actions to authenticated;
-- Column-level grant: even though the update policy above allows updating a
-- row, Postgres will still reject an UPDATE that touches any column not
-- listed here (e.g. title, instructions) with a permission error.
grant update (is_completed, completed_at) on public.plan_actions to authenticated;

-- Atomically saves a generated plan and all of its actions, and is the only
-- way either table is ever written. SECURITY DEFINER so it can insert
-- despite the tables having no direct insert grants, but it never trusts a
-- caller-supplied user id - the owner is always auth.uid() from the
-- caller's own verified session JWT (the Edge Function calls this using a
-- client scoped to the signed-in user, not a service-role client).
--
-- Idempotent at the database level: if a plan with this plan_number already
-- exists for this user, its id is returned unchanged and no duplicate rows
-- are ever inserted - concurrent callers race safely via unique(user_id,
-- plan_number) plus the unique_violation handler below, so at most one
-- weekly_plans/plan_actions row set is ever saved per (user, plan_number).
--
-- This does NOT prevent two genuinely concurrent requests from both calling
-- OpenAI before either one saves - that race lives in the Edge Function,
-- one layer up, and this function has no way to see it. In that rare case
-- one generation's tokens are spent for nothing, but only one of the two
-- results is ever persisted here; there is no duplicate-saved-plan outcome
-- either way. A stricter guarantee would need an application-level lock
-- (e.g. a "generation in progress" marker with its own failure/TTL
-- handling) - deliberately not added for V1.
create or replace function public.create_weekly_plan(
  p_plan_number integer,
  p_personalization_line text,
  p_model text,
  p_prompt_version text,
  p_input_tokens integer,
  p_output_tokens integer,
  p_actions jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan_id uuid;
  v_existing_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select id into v_existing_id
  from public.weekly_plans
  where user_id = v_user_id and plan_number = p_plan_number;

  if v_existing_id is not null then
    return v_existing_id;
  end if;

  insert into public.weekly_plans (
    user_id, plan_number, personalization_line, status, model, prompt_version,
    input_tokens, output_tokens
  ) values (
    v_user_id, p_plan_number, p_personalization_line, 'active', p_model, p_prompt_version,
    p_input_tokens, p_output_tokens
  )
  returning id into v_plan_id;

  insert into public.plan_actions (
    plan_id, category, title, target, instructions, why, fallback,
    success_definition, based_on, sort_order
  )
  select
    v_plan_id,
    action_row.category,
    action_row.title,
    action_row.target,
    action_row.instructions,
    action_row.why,
    action_row.fallback,
    action_row.success_definition,
    coalesce(action_row.based_on, '{}'),
    action_row.sort_order
  from jsonb_to_recordset(p_actions) as action_row (
    category text,
    title text,
    target text,
    instructions text,
    why text,
    fallback text,
    success_definition text,
    based_on text[],
    sort_order integer
  );

  return v_plan_id;
exception
  when unique_violation then
    -- Two concurrent requests both passed the "doesn't exist yet" check
    -- above; whichever lost the race just returns the row the winner made.
    select id into v_existing_id
    from public.weekly_plans
    where user_id = v_user_id and plan_number = p_plan_number;

    return v_existing_id;
end;
$$;

revoke all on function public.create_weekly_plan(integer, text, text, text, integer, integer, jsonb) from public;
grant execute on function public.create_weekly_plan(integer, text, text, text, integer, integer, jsonb) to authenticated;
