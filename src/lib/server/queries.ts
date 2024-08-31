import db from './db';
import { eq, lt, gte, ne, inArray, and, or, sql } from 'drizzle-orm';
import { userTable } from './schema';

import type { user } from './schema';

export async function insertUser(newUser: user) {
	
	const response = await db.insert(userTable).values(newUser);

}
export async function getUser(userId: string) {
	return await db.query.userTable.findMany({
		where: eq(userTable.userId, userId),
	});
}