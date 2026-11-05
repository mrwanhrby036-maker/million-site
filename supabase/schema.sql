-- ============================================================
--  من سيربح المليون؟ — مخطط قاعدة البيانات على Supabase
--  ------------------------------------------------------------
--  كل الجداول + الصلاحيات (RLS) + الدوال اللي الموقع بينادي عليها.
--  السكربت آمن للتشغيل أكتر من مرة (idempotent).
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- ١) البروفايلات
-- ============================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null default 'لاعب' check (char_length(name) between 1 and 40),
  email      text not null default '' check (char_length(email) <= 254),
  avatar_url text not null default '' check (char_length(avatar_url) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ٢) الإحصائيات
-- ============================================================
create table if not exists public.stats (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  plays      integer not null default 0 check (plays >= 0),
  wins       integer not null default 0 check (wins >= 0),
  best       integer not null default 0 check (best between 0 and 1000000),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ٣) لوحة المتصدرين (بتتحدّث أوتوماتيك من stats و profiles)
-- ============================================================
create table if not exists public.leaderboard (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name    text not null default 'لاعب' check (char_length(name) between 1 and 40),
  best    integer not null default 0 check (best between 0 and 1000000),
  wins    integer not null default 0 check (wins >= 0),
  plays   integer not null default 0 check (plays >= 0),
  at      timestamptz not null default now()
);

-- ============================================================
-- ٤) أسئلة الزوار
-- ============================================================
create table if not exists public.questions (
  id  text primary key default encode(gen_random_bytes(8), 'hex')
      check (id ~ '^[A-Za-z0-9_-]{1,40}$'),
  q   text not null check (char_length(q) between 8 and 160),
  o0  text not null check (char_length(o0) between 1 and 60),
  o1  text not null check (char_length(o1) between 1 and 60),
  o2  text check (o2 is null or char_length(o2) <= 60),
  o3  text check (o3 is null or char_length(o3) <= 60),
  c   text not null default 'weird' check (c ~ '^[a-z]{2,20}$'),
  uid uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null default 'لاعب' check (char_length(name) <= 40),
  at  timestamptz not null default now()
);
create index if not exists questions_at_idx on public.questions (at desc);

-- ============================================================
-- ٥) الأصوات — صوت واحد لكل حساب لكل سؤال
-- ============================================================
create table if not exists public.votes (
  question_id text not null check (question_id ~ '^[A-Za-z0-9_-]{1,40}$'),
  user_id     uuid not null references auth.users (id) on delete cascade,
  choice      smallint not null check (choice between 0 and 3),
  created_at  timestamptz not null default now(),
  primary key (question_id, user_id)
);
create index if not exists votes_user_idx on public.votes (user_id);

-- ============================================================
-- ٦) غرف تحدي الشلة
-- ============================================================
create table if not exists public.rooms (
  code       text primary key check (code ~ '^[A-Z0-9]{4,8}$'),
  host       uuid not null references auth.users (id) on delete cascade,
  state      text not null default 'wait' check (state in ('wait', 'play', 'done')),
  size       smallint not null default 4 check (size between 1 and 4),
  questions  smallint not null default 40 check (questions between 1 and 40),
  secs       smallint not null default 30 check (secs between 10 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_players (
  room_code text not null references public.rooms (code) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  name      text not null default 'لاعب' check (char_length(name) <= 20),
  team      text not null default 'a' check (team in ('a', 'b')),
  ready     boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (room_code, user_id)
);
create index if not exists room_players_room_idx on public.room_players (room_code);

create table if not exists public.room_progress (
  room_code text not null references public.rooms (code) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  q         smallint not null default 0 check (q between 0 and 100),
  ok        smallint not null default 0 check (ok >= 0),
  amount    integer not null default 0 check (amount >= 0),
  done      boolean not null default false,
  t         timestamptz not null default now(),
  primary key (room_code, user_id)
);

-- ============================================================
-- ٧) الحضور / النشاط (بديل onDisconnect في Firebase)
-- ============================================================
create table if not exists public.user_activity (
  user_id   uuid not null references auth.users (id) on delete cascade,
  session   text not null check (char_length(session) between 4 and 64),
  last_seen timestamptz not null default now(),
  primary key (user_id, session)
);

create table if not exists public.room_activity (
  room_code text not null references public.rooms (code) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  session   text not null check (char_length(session) between 4 and 64),
  last_seen timestamptz not null default now(),
  primary key (room_code, user_id, session)
);
create index if not exists room_activity_seen_idx on public.room_activity (last_seen desc);

-- ============================================================
-- ٨) المشرفون
-- ============================================================
create table if not exists public.admins (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);

-- ============================================================
-- ٩) دالة مساعدة: هل المستخدم مشرف؟
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

create or replace function public.in_room(p_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.room_players p
    where p.room_code = upper(coalesce(p_code, '')) and p.user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.in_room(text) to authenticated;

-- ============================================================
-- ١٠) تحديث updated_at أوتوماتيك
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists stats_touch on public.stats;
create trigger stats_touch before update on public.stats
for each row execute function public.touch_updated_at();

drop trigger if exists rooms_touch on public.rooms;
create trigger rooms_touch before update on public.rooms
for each row execute function public.touch_updated_at();

-- ============================================================
-- ١١) إنشاء بروفايل + إحصائيات لأي حساب جديد
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text;
begin
  v_name := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'name', '')), '');
  if v_name is null then
    v_name := coalesce(nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'لاعب');
  end if;

  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    left(v_name, 40),
    left(coalesce(new.email, ''), 254),
    left(coalesce(new.raw_user_meta_data ->> 'avatar_url', ''), 500)
  )
  on conflict (id) do nothing;

  insert into public.stats (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- ١٢) مزامنة لوحة المتصدرين
-- ============================================================
create or replace function public.sync_leaderboard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.leaderboard (user_id, name, best, wins, plays, at)
  values (
    new.user_id,
    coalesce((select p.name from public.profiles p where p.id = new.user_id), 'لاعب'),
    new.best, new.wins, new.plays, now()
  )
  on conflict (user_id) do update
    set name = excluded.name,
        best = excluded.best,
        wins = excluded.wins,
        plays = excluded.plays,
        at = now();
  return new;
end $$;

drop trigger if exists stats_board_sync on public.stats;
create trigger stats_board_sync after insert or update on public.stats
for each row execute function public.sync_leaderboard();

create or replace function public.sync_profile_name()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.leaderboard set name = new.name, at = now() where user_id = new.id;
  return new;
end $$;

drop trigger if exists profiles_board_sync on public.profiles;
create trigger profiles_board_sync after update of name on public.profiles
for each row execute function public.sync_profile_name();

-- ============================================================
-- ١٣) تسجيل نتيجة جولة (زيادة الإحصائيات بشكل ذرّي)
-- ============================================================
create or replace function public.record_result(
  p_play boolean default false,
  p_win  boolean default false,
  p_best integer default 0
) returns public.stats
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_best integer := least(greatest(coalesce(p_best, 0), 0), 1000000);
  v_play integer := case when coalesce(p_play, false) or coalesce(p_win, false) then 1 else 0 end;
  v_win  integer := case when coalesce(p_win, false) then 1 else 0 end;
  v_row  public.stats;
begin
  if v_uid is null then raise exception 'auth required'; end if;

  insert into public.stats (user_id, plays, wins, best)
  values (v_uid, v_play, v_win, v_best)
  on conflict (user_id) do update
    set plays = public.stats.plays + v_play,
        wins  = public.stats.wins + v_win,
        best  = greatest(public.stats.best, v_best)
  returning * into v_row;

  return v_row;
end $$;

grant execute on function public.record_result(boolean, boolean, integer) to authenticated;

-- ============================================================
-- ١٤) دوال الغرف
-- ============================================================
create or replace function public.create_room(
  p_code      text,
  p_size      integer default 4,
  p_questions integer default 40,
  p_secs      integer default 30
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_name text;
begin
  if v_uid is null then raise exception 'auth required'; end if;
  if v_code !~ '^[A-Z0-9]{4,8}$' then raise exception 'bad code'; end if;

  insert into public.rooms (code, host, state, size, questions, secs)
  values (v_code, v_uid, 'wait',
          greatest(1, least(4, coalesce(p_size, 4))),
          greatest(1, least(40, coalesce(p_questions, 40))),
          greatest(10, least(120, coalesce(p_secs, 30))));

  select name into v_name from public.profiles where id = v_uid;
  insert into public.room_players (room_code, user_id, name, team)
  values (v_code, v_uid, left(coalesce(v_name, 'لاعب'), 20), 'a')
  on conflict (room_code, user_id) do nothing;

  return v_code;
exception
  when unique_violation then return null;
end $$;

create or replace function public.join_room(
  p_code text,
  p_name text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_room public.rooms;
  v_a    integer;
  v_b    integer;
  v_team text;
  v_name text;
  v_cur  text;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;

  select * into v_room from public.rooms where code = v_code for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;

  select team into v_cur from public.room_players
   where room_code = v_code and user_id = v_uid;
  if found then
    return jsonb_build_object('ok', true, 'team', v_cur, 'state', v_room.state);
  end if;

  if v_room.state <> 'wait' then
    return jsonb_build_object('ok', false, 'error', 'started');
  end if;

  select
    count(*) filter (where team = 'a'),
    count(*) filter (where team = 'b')
    into v_a, v_b
    from public.room_players where room_code = v_code;

  if v_a >= v_room.size and v_b >= v_room.size then
    return jsonb_build_object('ok', false, 'error', 'full');
  end if;

  v_team := case when v_a < v_room.size and (v_a <= v_b or v_b >= v_room.size) then 'a' else 'b' end;

  v_name := left(nullif(btrim(coalesce(p_name, '')), ''), 20);
  if v_name is null then
    select name into v_name from public.profiles where id = v_uid;
  end if;

  insert into public.room_players (room_code, user_id, name, team)
  values (v_code, v_uid, coalesce(v_name, 'لاعب'), v_team)
  on conflict (room_code, user_id) do nothing;

  return jsonb_build_object('ok', true, 'team', v_team, 'state', v_room.state);
end $$;

create or replace function public.leave_room(p_code text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_code text := upper(btrim(coalesce(p_code, '')));
begin
  if v_uid is null then return; end if;

  delete from public.room_progress where room_code = v_code and user_id = v_uid;
  delete from public.room_activity where room_code = v_code and user_id = v_uid;
  delete from public.room_players  where room_code = v_code and user_id = v_uid;

  -- آخر واحد بيقفل الغرفة
  delete from public.rooms r
   where r.code = v_code
     and not exists (select 1 from public.room_players p where p.room_code = v_code);
end $$;

create or replace function public.set_team(p_code text, p_team text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_room public.rooms;
  v_n    integer;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if p_team not in ('a', 'b') then return jsonb_build_object('ok', false, 'error', 'team'); end if;

  select * into v_room from public.rooms where code = v_code for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if v_room.state <> 'wait' then return jsonb_build_object('ok', false, 'error', 'started'); end if;

  select count(*) into v_n from public.room_players
   where room_code = v_code and team = p_team and user_id <> v_uid;
  if v_n >= v_room.size then return jsonb_build_object('ok', false, 'error', 'full'); end if;

  update public.room_players set team = p_team
   where room_code = v_code and user_id = v_uid;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_in_room'); end if;

  return jsonb_build_object('ok', true, 'team', p_team);
end $$;

create or replace function public.update_room_settings(
  p_code text,
  p_size integer default null,
  p_secs integer default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_room public.rooms;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;

  select * into v_room from public.rooms where code = v_code for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if v_room.host <> v_uid then return jsonb_build_object('ok', false, 'error', 'host'); end if;
  if v_room.state <> 'wait' then return jsonb_build_object('ok', false, 'error', 'started'); end if;

  update public.rooms
     set size = greatest(1, least(4, coalesce(p_size, size))),
         secs = greatest(10, least(120, coalesce(p_secs, secs)))
   where code = v_code;

  return jsonb_build_object('ok', true);
end $$;

create or replace function public.start_room(p_code text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_room public.rooms;
  v_a    integer;
  v_b    integer;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;

  select * into v_room from public.rooms where code = v_code for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if v_room.host <> v_uid then return jsonb_build_object('ok', false, 'error', 'host'); end if;
  if v_room.state <> 'wait' then return jsonb_build_object('ok', false, 'error', 'started'); end if;

  select count(*) filter (where team = 'a'), count(*) filter (where team = 'b')
    into v_a, v_b
    from public.room_players where room_code = v_code;

  if v_a = 0 or v_b = 0 then return jsonb_build_object('ok', false, 'error', 'teams'); end if;
  if v_a > v_room.size or v_b > v_room.size then
    return jsonb_build_object('ok', false, 'error', 'size');
  end if;

  update public.rooms set state = 'play' where code = v_code;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.finish_room(p_code text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_room public.rooms;
  v_a    integer;
  v_b    integer;
  v_ad   integer;
  v_bd   integer;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'auth'); end if;

  select * into v_room from public.rooms where code = v_code;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if v_room.state = 'done' then return jsonb_build_object('ok', true); end if;

  select
    count(*) filter (where p.team = 'a'),
    count(*) filter (where p.team = 'b'),
    count(*) filter (where p.team = 'a' and pr.done),
    count(*) filter (where p.team = 'b' and pr.done)
    into v_a, v_b, v_ad, v_bd
    from public.room_players p
    left join public.room_progress pr
      on pr.room_code = p.room_code and pr.user_id = p.user_id
   where p.room_code = v_code;

  if v_a = 0 or v_b = 0 then return jsonb_build_object('ok', false, 'error', 'teams'); end if;
  if v_ad < v_a or v_bd < v_b then return jsonb_build_object('ok', false, 'error', 'playing'); end if;

  update public.rooms set state = 'done' where code = v_code;
  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.create_room(text, integer, integer, integer) to authenticated;
grant execute on function public.join_room(text, text) to authenticated;
grant execute on function public.leave_room(text) to authenticated;
grant execute on function public.set_team(text, text) to authenticated;
grant execute on function public.update_room_settings(text, integer, integer) to authenticated;
grant execute on function public.start_room(text) to authenticated;
grant execute on function public.finish_room(text) to authenticated;

-- ============================================================
-- ١٥) الأصوات المجمّعة (view يحترم RLS)
-- ============================================================
create or replace view public.vote_counts
with (security_invoker = true) as
  select question_id, choice, count(*)::int as n
  from public.votes
  group by question_id, choice;

grant select on public.vote_counts to authenticated;

-- ============================================================
-- ١٦) تشغيل RLS + الصلاحيات
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.stats         enable row level security;
alter table public.leaderboard   enable row level security;
alter table public.questions     enable row level security;
alter table public.votes         enable row level security;
alter table public.rooms         enable row level security;
alter table public.room_players  enable row level security;
alter table public.room_progress enable row level security;
alter table public.user_activity enable row level security;
alter table public.room_activity enable row level security;
alter table public.admins        enable row level security;

revoke all on public.profiles, public.stats, public.leaderboard, public.questions,
              public.votes, public.rooms, public.room_players, public.room_progress,
              public.user_activity, public.room_activity, public.admins from anon;
grant select, insert, update, delete on public.profiles, public.stats, public.leaderboard,
              public.questions, public.votes, public.rooms, public.room_players,
              public.room_progress, public.user_activity, public.room_activity
  to authenticated;
grant select on public.admins to authenticated;

-- ---------- profiles ----------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------- stats ----------
drop policy if exists stats_select on public.stats;
create policy stats_select on public.stats for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists stats_insert on public.stats;
create policy stats_insert on public.stats for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists stats_update on public.stats;
create policy stats_update on public.stats for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ---------- leaderboard (قراءة للكل، الكتابة بالtrigger بس) ----------
drop policy if exists leaderboard_select on public.leaderboard;
create policy leaderboard_select on public.leaderboard for select to authenticated
  using (true);

-- ---------- questions ----------
drop policy if exists questions_select on public.questions;
create policy questions_select on public.questions for select to authenticated
  using (true);

drop policy if exists questions_insert on public.questions;
create policy questions_insert on public.questions for insert to authenticated
  with check (uid = auth.uid());

drop policy if exists questions_update on public.questions;
create policy questions_update on public.questions for update to authenticated
  using (uid = auth.uid() or public.is_admin())
  with check (uid = auth.uid() or public.is_admin());

drop policy if exists questions_delete on public.questions;
create policy questions_delete on public.questions for delete to authenticated
  using (uid = auth.uid() or public.is_admin());

-- ---------- votes ----------
drop policy if exists votes_select on public.votes;
create policy votes_select on public.votes for select to authenticated
  using (true);

drop policy if exists votes_insert on public.votes;
create policy votes_insert on public.votes for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists votes_update on public.votes;
create policy votes_update on public.votes for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists votes_delete on public.votes;
create policy votes_delete on public.votes for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------- rooms ----------
drop policy if exists rooms_select on public.rooms;
create policy rooms_select on public.rooms for select to authenticated
  using (host = auth.uid() or public.in_room(code) or public.is_admin());

drop policy if exists rooms_delete on public.rooms;
create policy rooms_delete on public.rooms for delete to authenticated
  using (host = auth.uid() or public.is_admin());

-- ---------- room_players ----------
drop policy if exists room_players_select on public.room_players;
create policy room_players_select on public.room_players for select to authenticated
  using (user_id = auth.uid() or public.in_room(room_code) or public.is_admin());

drop policy if exists room_players_insert on public.room_players;
create policy room_players_insert on public.room_players for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists room_players_update on public.room_players;
create policy room_players_update on public.room_players for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists room_players_delete on public.room_players;
create policy room_players_delete on public.room_players for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------- room_progress ----------
drop policy if exists room_progress_select on public.room_progress;
create policy room_progress_select on public.room_progress for select to authenticated
  using (public.in_room(room_code) or public.is_admin());

drop policy if exists room_progress_insert on public.room_progress;
create policy room_progress_insert on public.room_progress for insert to authenticated
  with check (user_id = auth.uid() and public.in_room(room_code));

drop policy if exists room_progress_update on public.room_progress;
create policy room_progress_update on public.room_progress for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- user_activity ----------
drop policy if exists user_activity_select on public.user_activity;
create policy user_activity_select on public.user_activity for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists user_activity_insert on public.user_activity;
create policy user_activity_insert on public.user_activity for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists user_activity_update on public.user_activity;
create policy user_activity_update on public.user_activity for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists user_activity_delete on public.user_activity;
create policy user_activity_delete on public.user_activity for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------- room_activity ----------
drop policy if exists room_activity_select on public.room_activity;
create policy room_activity_select on public.room_activity for select to authenticated
  using (public.in_room(room_code) or public.is_admin());

drop policy if exists room_activity_insert on public.room_activity;
create policy room_activity_insert on public.room_activity for insert to authenticated
  with check (user_id = auth.uid() and public.in_room(room_code));

drop policy if exists room_activity_update on public.room_activity;
create policy room_activity_update on public.room_activity for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists room_activity_delete on public.room_activity;
create policy room_activity_delete on public.room_activity for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------- admins ----------
drop policy if exists admins_select on public.admins;
create policy admins_select on public.admins for select to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- ١٧) Realtime — الجداول اللي الموقع بيسمع عليها
-- ============================================================
alter table public.profiles      replica identity full;
alter table public.user_activity replica identity full;
alter table public.room_activity replica identity full;
alter table public.votes         replica identity full;
alter table public.questions     replica identity full;
alter table public.stats         replica identity full;
alter table public.leaderboard   replica identity full;
alter table public.rooms         replica identity full;
alter table public.room_players  replica identity full;
alter table public.room_progress replica identity full;

do $$
declare
  t text;
begin
  foreach t in array array[
    'votes', 'questions', 'stats', 'leaderboard', 'rooms', 'room_players', 'room_progress',
    'profiles', 'user_activity', 'room_activity'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception
      when duplicate_object then null;
      when undefined_object then null;
    end;
  end loop;
end $$;

-- ============================================================
-- ١٨) تنظيم دوري: إغلاق الغرف المهجورة وحذف النشاط القديم
--     شغّلها من pg_cron أو يدويًا من لوحة Supabase
-- ============================================================
create or replace function public.cleanup_stale_rooms()
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_deleted integer;
begin
  with gone as (
    delete from public.rooms
     where updated_at < now() - interval '12 hours'
       and state in ('wait', 'play')
    returning 1
  )
  select count(*) into v_deleted from gone;

  delete from public.user_activity where last_seen < now() - interval '1 day';
  delete from public.room_activity where last_seen < now() - interval '12 hours';

  return v_deleted;
end $$;
