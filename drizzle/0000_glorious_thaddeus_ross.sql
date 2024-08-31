CREATE TABLE IF NOT EXISTS "company_table" (
	"company_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"company_email" text NOT NULL,
	CONSTRAINT "company_table_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_history_table" (
	"chat_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"query" text NOT NULL,
	"response" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"query_from" text,
	"vector_ids" json DEFAULT '[]',
	"feedback_point" text,
	"feedback_text" text,
	CONSTRAINT "chat_history_table_chat_id_unique" UNIQUE("chat_id")
);
