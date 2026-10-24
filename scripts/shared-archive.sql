-- Public viewing; anonymous authenticated visitors may create their own specimens.
create table if not exists public.creatures (
 id uuid primary key,
 owner_id uuid not null default auth.uid() references auth.users(id),
 published_at timestamptz not null default now(),
 record jsonb not null,
 constraint valid_specimen check ((
  octet_length(record::text) < 2000000 and
  record->>'version' = '1' and record->>'id' = id::text and
  length(record->>'name') between 1 and 48 and
  record->>'code' ~ '^[0-4][01]{4}$' and
  jsonb_typeof(record->'scene'->'shapes') = 'array' and
  jsonb_array_length(record->'scene'->'shapes') between 1 and 1500 and
  jsonb_typeof(record->'story'->'text') = 'string' and
  length(record->'story'->>'text') < 12000
 ) is true)
);
alter table public.creatures enable row level security;
revoke all on public.creatures from anon, authenticated;
grant select (id,published_at,record) on public.creatures to anon,authenticated;
grant insert (id,record), update (record) on public.creatures to authenticated;
create policy "Public specimen collection" on public.creatures for select to anon,authenticated using (true);
create policy "Create own specimens" on public.creatures for insert to authenticated with check ((select auth.uid())=owner_id);
create policy "Update own description" on public.creatures for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create index creatures_published_at on public.creatures(published_at desc,id);
create index creatures_owner_id on public.creatures(owner_id);
create or replace function public.protect_specimen() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  if (new.record - 'story') is distinct from (old.record - 'story') then
   raise exception 'A specimen anatomy and identity cannot be replaced';
  end if;
 else
  perform pg_advisory_xact_lock(hashtext(new.owner_id::text));
  if (select count(*) from public.creatures where owner_id=new.owner_id and published_at>now()-interval '1 day')>=25 then
   raise exception 'Daily specimen limit reached';
  end if;
 end if;
 return new;
end $$;
revoke execute on function public.protect_specimen() from public,anon,authenticated;
create trigger protect_specimen before insert or update on public.creatures for each row execute function public.protect_specimen();
