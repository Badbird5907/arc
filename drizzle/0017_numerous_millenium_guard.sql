DO $$ BEGIN
 CREATE TYPE "public"."dispute_state" AS ENUM('open', 'won', 'lost', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "dispute_state" "dispute_state";