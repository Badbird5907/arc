DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('pending', 'completed', 'canceled');
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
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"provider_order_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"subtotal" double precision NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
