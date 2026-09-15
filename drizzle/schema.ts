import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const doctors = mysqlTable("doctors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  specialty: varchar("specialty", { length: 120 }).notNull(),
  qualifications: varchar("qualifications", { length: 240 }).notNull(),
  experienceYears: int("experienceYears").notNull(),
  fee: int("fee").notNull(),
  clinic: varchar("clinic", { length: 180 }).notNull(),
  address: varchar("address", { length: 240 }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull(),
  ratingCount: int("ratingCount").notNull(),
  about: text("about").notNull(),
  accent: varchar("accent", { length: 20 }).notNull(),
  available: boolean("available").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const appointments = mysqlTable("appointments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  doctorId: int("doctorId").notNull(),
  patientName: varchar("patientName", { length: 160 }).notNull(),
  patientEmail: varchar("patientEmail", { length: 320 }),
  date: varchar("date", { length: 20 }).notNull(),
  time: varchar("time", { length: 20 }).notNull(),
  status: varchar("status", { length: 40 }).default("pending_payment").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const emergencyEvents = mysqlTable("emergencyEvents", {
  id: varchar("id", { length: 64 }).primaryKey(),
  patientName: varchar("patientName", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  location: varchar("location", { length: 320 }),
  notes: text("notes"),
  hospitalPhone: varchar("hospitalPhone", { length: 40 }).notNull(),
  status: varchar("status", { length: 40 }).default("alert_created").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const hospitalAppointments = mysqlTable("hospitalAppointments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  placeId: varchar("placeId", { length: 160 }).notNull(),
  hospitalName: varchar("hospitalName", { length: 240 }).notNull(),
  hospitalAddress: varchar("hospitalAddress", { length: 320 }).notNull(),
  patientName: varchar("patientName", { length: 160 }).notNull(),
  patientEmail: varchar("patientEmail", { length: 320 }),
  patientPhone: varchar("patientPhone", { length: 40 }),
  preferredDate: varchar("preferredDate", { length: 20 }).notNull(),
  preferredTime: varchar("preferredTime", { length: 20 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 40 }).default("pending_hospital_confirmation").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type EmergencyEvent = typeof emergencyEvents.$inferSelect;
export type HospitalAppointment = typeof hospitalAppointments.$inferSelect;
