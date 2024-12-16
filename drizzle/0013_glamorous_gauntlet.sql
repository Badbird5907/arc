CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'amount');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupon_to_category" (
	"coupon_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "coupon_to_category_coupon_id_category_id_pk" PRIMARY KEY("coupon_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupon_to_product" (
	"coupon_id" uuid NOT NULL,
	"product_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupons" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"discount_type" "discount_type" DEFAULT 'amount' NOT NULL,
	"discount_value" double precision NOT NULL,
	"min_order_amount" double precision DEFAULT 0 NOT NULL,
	"max_discount_amount" double precision DEFAULT -1 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"uses" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp (3),
	"starts_at" timestamp (3) DEFAULT now(),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_to_coupon" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"coupon_id" uuid NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coupon_to_category" ADD CONSTRAINT "coupon_to_category_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coupon_to_category" ADD CONSTRAINT "coupon_to_category_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coupon_to_product" ADD CONSTRAINT "coupon_to_product_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "coupon_to_product" ADD CONSTRAINT "coupon_to_product_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_to_coupon" ADD CONSTRAINT "order_to_coupon_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_to_coupon" ADD CONSTRAINT "order_to_coupon_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
