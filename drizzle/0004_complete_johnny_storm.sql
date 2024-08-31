CREATE TABLE IF NOT EXISTS "user_table" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_name" text NOT NULL,
	"date_of_birth" date,
	"profile_picture_url" text DEFAULT 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSLU5_eUUGBfxfxRd4IquPiEwLbt4E_6RYMw&s',
	"email" text NOT NULL,
	CONSTRAINT "user_table_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_table_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "dummy_table";