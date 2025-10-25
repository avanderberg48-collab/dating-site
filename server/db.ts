import { eq, and, or, not, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, profiles, InsertProfile, matches, messages, InsertMessage } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Profile queries
 */
export async function getOrCreateProfile(userId: number): Promise<typeof profiles.$inferSelect | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  // Create default profile
  await db.insert(profiles).values({ userId });
  const created = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return created[0] || null;
}

export async function updateProfile(userId: number, data: Partial<InsertProfile>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(profiles).set(data).where(eq(profiles.userId, userId));
}

export async function getProfilesByGender(userId: number, lookingFor: string, limit: number = 20): Promise<typeof profiles.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];

  const userProfile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (userProfile.length === 0) return [];

  // Get profiles that match the criteria
  const results = await db.select().from(profiles)
    .where(
      and(
        not(eq(profiles.userId, userId)),
        or(
          eq(profiles.gender, lookingFor as any),
          eq(profiles.gender, "other")
        )
      )
    )
    .limit(limit);

  return results;
}

/**
 * Match queries
 */
export async function createMatch(userId1: number, userId2: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Normalize order to avoid duplicates
  const [u1, u2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  // Check if match already exists
  const existing = await db.select().from(matches)
    .where(
      or(
        and(eq(matches.userId1, u1), eq(matches.userId2, u2)),
        and(eq(matches.userId1, u2), eq(matches.userId2, u1))
      )
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(matches).values({ userId1: u1, userId2: u2, status: "liked" });
  }
}

export async function getMatches(userId: number): Promise<typeof matches.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(matches)
    .where(
      or(
        eq(matches.userId1, userId),
        eq(matches.userId2, userId)
      )
    );
}

export async function updateMatchStatus(matchId: number, status: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(matches).set({ status: status as any }).where(eq(matches.id, matchId));
}

/**
 * Message queries
 */
export async function sendMessage(matchId: number, senderId: number, receiverId: number, content: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(messages).values({ matchId, senderId, receiverId, content });
}

export async function getMessages(matchId: number, limit: number = 50): Promise<typeof messages.$inferSelect[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(messages)
    .where(eq(messages.matchId, matchId))
    .limit(limit);
}

export async function markMessagesAsRead(matchId: number, receiverId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(messages)
    .set({ read: 1 })
    .where(and(eq(messages.matchId, matchId), eq(messages.receiverId, receiverId)));
}
