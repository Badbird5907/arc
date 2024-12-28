ALTER TABLE "coupons" ADD COLUMN "can_stack" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "conflicts_with" text[] DEFAULT '{}' NOT NULL;