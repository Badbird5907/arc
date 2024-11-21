DO $$ BEGIN
 CREATE TYPE "public"."dispute_state" AS ENUM('open', 'won', 'lost', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."expiry_period" AS ENUM('day', 'month', 'year');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('pending', 'completed', 'canceled', 'refunded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_provider" AS ENUM('tebex');
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
DO $$ BEGIN
 CREATE TYPE "public"."server_type" AS ENUM('minecraft', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parent_category_id" uuid,
	"hidden" boolean DEFAULT false NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"slug" text NOT NULL,
	"sort_priority" integer DEFAULT 0 NOT NULL,
	"banner_image" text,
	"card_image" text,
	"description" text DEFAULT '',
	"show_category_cards" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"modified_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"player_uuid" text NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"provider_order_id" text,
	"ip_address" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"subtotal" double precision NOT NULL,
	"disputed" boolean DEFAULT false NOT NULL,
	"dispute_state" "dispute_state",
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" double precision NOT NULL,
	"description" text,
	"min_quantity" integer DEFAULT 1 NOT NULL,
	"max_quantity" integer DEFAULT 0 NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"type" "product_type" DEFAULT 'single' NOT NULL,
	"sub_allow_single_purchase" boolean DEFAULT true NOT NULL,
	"expiry_period" "expiry_period" DEFAULT 'month' NOT NULL,
	"expiry_length" integer DEFAULT 1 NOT NULL,
	"category_id" uuid,
	"sort_priority" integer DEFAULT 0 NOT NULL,
	"delivery" jsonb,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"modified_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "queued_commands" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"minecraft_uuid" uuid NOT NULL,
	"require_online" boolean DEFAULT false NOT NULL,
	"delay" integer DEFAULT 0 NOT NULL,
	"payload" text NOT NULL,
	"server" uuid NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "servers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"secret_key" text NOT NULL,
	"type" "server_type" DEFAULT 'minecraft' NOT NULL,
	"notes" text DEFAULT '',
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"last_modified" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "servers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"last_modified" timestamp (3) DEFAULT now() NOT NULL
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
DO $$ BEGIN
 ALTER TABLE "queued_commands" ADD CONSTRAINT "queued_commands_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
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
      ));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "queued_command_order_index" ON "queued_commands" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "queued_command_player_uuid_index" ON "queued_commands" USING btree ("minecraft_uuid");