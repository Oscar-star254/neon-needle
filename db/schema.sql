-- Neon Needle bookings. Safe to run more than once.
-- Run it in the Neon SQL Editor, or with:  pnpm db:migrate

create sequence if not exists booking_ref_seq start 10000;

create table if not exists bookings (
  id                       bigserial primary key,
  reference                text        not null unique,
  -- Unguessable token used in the confirmation URL so only the client can view it.
  public_token             text        not null unique,
  status                   text        not null default 'pending_deposit'
    check (status in (
      'pending_deposit', 'deposit_paid', 'consultation_requested',
      'confirmed', 'completed', 'cancelled'
    )),
  service                  text        not null,
  artist                   text        not null,
  placement                text        not null,
  size                     text        not null,
  idea                     text        not null,
  name                     text        not null,
  email                    text        not null,
  phone                    text,
  deposit_cents            integer     not null check (deposit_cents >= 0),
  currency                 text        not null default 'cad',
  stripe_session_id        text unique,
  stripe_payment_intent_id text,
  -- Everything else from the form (styles, budget, health notes, emergency contact...).
  details                  jsonb       not null default '{}'::jsonb,
  paid_at                  timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists bookings_status_idx  on bookings (status);
create index if not exists bookings_created_idx on bookings (created_at desc);
