import {
	pgTable,
	serial,
	text,
	boolean,
	integer,
	json,
	timestamp,
	primaryKey,
	uuid,
	date
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export type user = typeof userTable.$inferInsert;

export const userTable = pgTable('user_table', {
	userId: uuid('user_id').primaryKey().notNull().unique().default(sql`gen_random_uuid()`),
	userName: text('user_name').notNull(),
	dateOfBirth: date('date_of_birth'),  
	profilePictureUrl: text('profile_picture_url').default('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSLU5_eUUGBfxfxRd4IquPiEwLbt4E_6RYMw&s'),
	email: text('email').notNull().unique(),
	educationalInstitute: text('educational_institute').default('Not Provided'),
	currentAcademicYear: text('current_academic_year').default('Not Provided'),
	userBio: text('user_bio').default('bio is empty'),
	academicSubject: text('academic_subject').default('Not Provided'),
});
