CREATE TABLE IF NOT EXISTS "bans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_uuid" uuid NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coupons" ALTER COLUMN "max_global_total_discount" SET DEFAULT -1;--> statement-breakpoint
ALTER TABLE "coupons" ALTER COLUMN "available_global_total_discount" SET DEFAULT -1;--> statement-breakpoint
ALTER TABLE "coupons" DROP COLUMN IF EXISTS "uses";