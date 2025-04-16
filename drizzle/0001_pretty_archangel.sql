DO $$ BEGIN
    ALTER TABLE "queued_commands" ADD COLUMN "executed" boolean DEFAULT false NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;