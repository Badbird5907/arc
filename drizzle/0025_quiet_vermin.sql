ALTER TABLE "deliveries" DROP CONSTRAINT "deliveries_scope_servers_id_fk";
--> statement-breakpoint
ALTER TABLE "deliveries" ADD COLUMN "stack" boolean DEFAULT true NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_scope_servers_id_fk" FOREIGN KEY ("scope") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
