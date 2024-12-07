ALTER TABLE "deliveries" ALTER COLUMN "scope" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "deliveries" ALTER COLUMN "scope" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_scope_servers_id_fk" FOREIGN KEY ("scope") REFERENCES "public"."servers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
