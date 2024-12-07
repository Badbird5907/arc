CREATE TYPE "public"."delivery_when" AS ENUM('purchase', 'expire', 'renew', 'chargeback', 'refund');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deliveries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"scope" text NOT NULL,
	"when" "delivery_when" DEFAULT 'purchase' NOT NULL,
	"require_online" boolean DEFAULT false NOT NULL,
	"delay" text DEFAULT '0' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "giftcards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"initial_amount" double precision NOT NULL,
	"balance" double precision NOT NULL,
	"last_used" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "giftcards_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_to_giftcard" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"giftcard_id" uuid NOT NULL,
	"amount_used" double precision NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_to_delivery" (
	"product_id" uuid,
	"delivery_id" uuid
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "deliveries" uuid[] DEFAULT '{}';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_to_giftcard" ADD CONSTRAINT "order_to_giftcard_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_to_giftcard" ADD CONSTRAINT "order_to_giftcard_giftcard_id_giftcards_id_fk" FOREIGN KEY ("giftcard_id") REFERENCES "public"."giftcards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_to_delivery" ADD CONSTRAINT "product_to_delivery_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_to_delivery" ADD CONSTRAINT "product_to_delivery_delivery_id_deliveries_id_fk" FOREIGN KEY ("delivery_id") REFERENCES "public"."deliveries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN IF EXISTS "delivery";