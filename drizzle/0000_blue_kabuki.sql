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
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" numeric(2) NOT NULL,
	"description" text NOT NULL,
	"min_quantity" integer DEFAULT 1 NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"expiry_period" "expiry_period" DEFAULT 'month' NOT NULL,
	"expiry_length" integer DEFAULT 1 NOT NULL,
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
