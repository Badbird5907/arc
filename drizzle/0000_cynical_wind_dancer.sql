DO $$ BEGIN
 CREATE TYPE "public"."expiry_period" AS ENUM('day', 'month', 'year');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."product_type" AS ENUM('single', 'subscription');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."roles" AS ENUM('user', 'admin', 'super_admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parent_category_id" uuid,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"modified_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"description" text,
	"min_quantity" integer DEFAULT 1 NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"type" "product_type" DEFAULT 'single' NOT NULL,
	"sub_allow_single_purchase" boolean DEFAULT true NOT NULL,
	"expiry_period" "expiry_period" DEFAULT 'month' NOT NULL,
	"expiry_length" integer DEFAULT 1 NOT NULL,
	"category_id" uuid,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"modified_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"role" "roles" DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_categories_id_fk" FOREIGN KEY ("parent_category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_search_index" ON "categories" USING gin ((
        setweight(to_tsvector('english', "name"), 'A')
      ));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_search_index" ON "products" USING gin ((
        setweight(to_tsvector('english', "name"), 'A') ||
        setweight(to_tsvector('english', "description"), 'B')
      ));