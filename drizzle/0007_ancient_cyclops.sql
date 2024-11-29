CREATE INDEX IF NOT EXISTS "orders_search_index" ON "orders" USING gin ((
        setweight(to_tsvector('english'::regconfig, coalesce("ip_address", '')), 'A') ||
        setweight(to_tsvector('english'::regconfig, coalesce("first_name", '')), 'B') ||
        setweight(to_tsvector('english'::regconfig, coalesce("last_name", '')), 'C') ||
        setweight(to_tsvector('english'::regconfig, coalesce("email", '')), 'D')
      ));