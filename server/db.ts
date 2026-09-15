import { and, asc, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { appointments, doctors, emergencyEvents, hospitalAppointments, users, type Doctor } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}

export async function upsertUser(user: typeof users.$inferInsert): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values = { ...user, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  if (user.name !== undefined) updateSet.name = user.name;
  if (user.email !== undefined) updateSet.email = user.email;
  if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod;
  if (user.role !== undefined) updateSet.role = user.role;
  else if (user.openId === ENV.ownerOpenId) updateSet.role = "admin";
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listDoctors(search?: string, specialty?: string): Promise<Doctor[]> {
  const db = await getDb();
  if (!db) return [];
  const filters = [];
  if (search) filters.push(or(like(doctors.name, `%${search}%`), like(doctors.specialty, `%${search}%`))!);
  if (specialty && specialty !== "All specialties") filters.push(eq(doctors.specialty, specialty));
  const query = db.select().from(doctors).orderBy(desc(doctors.rating), desc(doctors.ratingCount));
  return filters.length ? query.where(and(...filters)) : query;
}

export async function getDoctor(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
  return rows[0];
}

export async function createAppointment(input: typeof appointments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(appointments).values(input);
  const rows = await db.select().from(appointments).where(eq(appointments.id, input.id)).limit(1);
  return rows[0];
}

export async function createEmergency(input: typeof emergencyEvents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(emergencyEvents).values(input);
  const rows = await db.select().from(emergencyEvents).where(eq(emergencyEvents.id, input.id)).limit(1);
  return rows[0];
}

export async function createHospitalAppointment(input: typeof hospitalAppointments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  await db.insert(hospitalAppointments).values(input);
  const rows = await db.select().from(hospitalAppointments).where(eq(hospitalAppointments.id, input.id)).limit(1);
  return rows[0];
}
