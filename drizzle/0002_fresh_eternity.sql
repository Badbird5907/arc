DROP INDEX IF EXISTS "name_search_index";--> statement-breakpoint
DROP INDEX IF EXISTS "description_search_index";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_index" ON "products" USING gin ((
        setweight(to_tsvector('english', "name"), 'A') ||
        setweight(to_tsvector('english', "description"), 'B')
      ));