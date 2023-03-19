CREATE TABLE [Erc20bridge].public.events (
  ID SERIAL PRIMARY KEY,
  address_from VARCHAR(50),
  address_to VARCHAR(50),
	amount INTEGER,
	event_type VARCHAR(10),
    is_active BOOLEAN
);

CREATE TABLE [Erc20bridge].public.processed_block (
  ID SERIAL PRIMARY KEY,
	last_processed_block INTEGER
);