CREATE TABLE IF NOT EXISTS "categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"modified_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX IF EXISTS "search_index";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sub_allow_single_purchase" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_search_index" ON "categories" USING gin ((
        setweight(to_tsvector('english', "name"), 'A')
      ));--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_search_index" ON "products" USING gin ((
        setweight(to_tsvector('english', "name"), 'A') ||
        setweight(to_tsvector('english', "description"), 'B')
      ));