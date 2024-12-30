CREATE TABLE IF NOT EXISTS "players" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"notes" text DEFAULT '',
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
