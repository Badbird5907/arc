ALTER TABLE "players" ALTER COLUMN "banned" SET DATA TYPE timestamp (3);--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "banned" DROP DEFAULT;