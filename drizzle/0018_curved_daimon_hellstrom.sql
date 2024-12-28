ALTER TABLE "order_to_coupon" ADD COLUMN "coupon_code" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_to_coupon" ADD CONSTRAINT "order_to_coupon_coupon_code_coupons_code_fk" FOREIGN KEY ("coupon_code") REFERENCES "public"."coupons"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
