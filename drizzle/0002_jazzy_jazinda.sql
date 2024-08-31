CREATE TABLE IF NOT EXISTS "dummy_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" text NOT NULL,
	CONSTRAINT "dummy_table_id_unique" UNIQUE("id")
);
