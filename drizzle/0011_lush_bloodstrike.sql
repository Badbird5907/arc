CREATE TABLE IF NOT EXISTS "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"last_modified" timestamp (3) DEFAULT now() NOT NULL
);
