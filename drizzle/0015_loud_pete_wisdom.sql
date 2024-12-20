CREATE TYPE "public"."coupon_type" AS ENUM('coupon', 'giftcard');--> statement-breakpoint
DROP TABLE "giftcards" CASCADE;--> statement-breakpoint
DROP TABLE "order_to_giftcard" CASCADE;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "type" "coupon_type" DEFAULT 'coupon' NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "max_global_total_discount" double precision DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "available_global_total_discount" double precision DEFAULT 0 NOT NULL;