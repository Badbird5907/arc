DROP TABLE "bans" CASCADE;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "banned" boolean DEFAULT false;