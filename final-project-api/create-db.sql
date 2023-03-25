CREATE DATABASE "erc20bridge"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

CREATE TABLE public.events (
  ID SERIAL PRIMARY KEY,
  address_from VARCHAR(50),
  address_to VARCHAR(50),
	amount INTEGER,
	nonce INTEGER,
  signed_message VARCHAR(200),
	event_type INTEGER
);

CREATE TABLE public.processed_block (
  ID SERIAL PRIMARY KEY,
	last_processed_block INTEGER
);

create table public.bridged_tokens (
   ID SERIAL PRIMARY KEY,
  address_from VARCHAR(50),
  address_to VARCHAR(50),
	amount_locked INTEGER,
	amount_claimed INTEGER,
	amount_burned INTEGER,
	amount_released INTEGER
)

