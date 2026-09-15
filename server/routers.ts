import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getDoctor, listDoctors, createAppointment, createEmergency, createHospitalAppointment } from "./db";
import { searchNearbyPlaces } from "./maps";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const doctorInput = z.object({ search: z.string().optional(), specialty: z.string().optional() });
const hospitalPhone = process.env.EMERGENCY_HOSPITAL_PHONE ?? "+91112";
export const hospitalAppointmentRequestSchema = z.object({ placeId: z.string().min(1).max(160), hospitalName: z.string().min(1).max(240), hospitalAddress: z.string().min(1).max(320), patientName: z.string().min(2).max(160), patientEmail: z.string().email().optional(), patientPhone: z.string().min(5).max(40), preferredDate: z.string().min(1), preferredTime: z.string().min(1), reason: z.string().min(3).max(2000) });

export function buildUpiLink(amount: number, doctorName: string) {
  const vpa = process.env.UPI_MERCHANT_VPA ?? "learningproject@upi";
  const merchant = process.env.UPI_MERCHANT_NAME ?? "PulseCare";
  const query = new URLSearchParams({ pa: vpa, pn: merchant, am: amount.toFixed(2), cu: "INR", tn: `PulseCare appointment with ${doctorName}` });
  return `upi://pay?${query.toString()}`;
}

export function buildEmergencyCallUri(phone = hospitalPhone) {
  return `tel:${phone}`;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  doctors: router({
    list: publicProcedure.input(doctorInput).query(({ input }) => listDoctors(input.search, input.specialty)),
    get: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getDoctor(input.id)),
  }),
  nearby: router({
    places: publicProcedure.input(z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), radiusMeters: z.number().int().min(500).max(50000).default(10000), category: z.enum(["doctor", "hospital", "clinic"]).optional() })).query(async ({ input }) => {
      try {
        return { places: await searchNearbyPlaces({ lat: input.lat, lng: input.lng }, input.radiusMeters, input.category) };
      } catch (error) {
        console.error("[Nearby Places] Search failed", error);
        throw new Error("Nearby places are temporarily unavailable. Please try again shortly.");
      }
    }),
  }),
  appointments: router({
    create: publicProcedure.input(z.object({ doctorId: z.number().int().positive(), patientName: z.string().min(2).max(160), patientEmail: z.string().email().optional(), date: z.string().min(1), time: z.string().min(1) })).mutation(async ({ input }) => {
      const doctor = await getDoctor(input.doctorId);
      if (!doctor) throw new Error("Doctor not found");
      return createAppointment({ id: randomUUID(), ...input, status: "pending_payment" });
    }),
    paymentLink: publicProcedure.input(z.object({ appointmentId: z.string(), amount: z.number().positive(), doctorName: z.string() })).mutation(({ input }) => {
      return { mode: "upi_demo", uri: buildUpiLink(input.amount, input.doctorName), message: "UPI handoff created. Connect a verified payment gateway before accepting real funds." };
    }),
  }),
  hospitalAppointments: router({
    request: publicProcedure.input(hospitalAppointmentRequestSchema).mutation(({ input }) => createHospitalAppointment({ id: randomUUID(), ...input, status: "pending_hospital_confirmation" })),
  }),
  emergency: router({
    create: publicProcedure.input(z.object({ patientName: z.string().max(160).optional(), phone: z.string().max(40).optional(), location: z.string().max(320).optional(), notes: z.string().max(2000).optional() })).mutation(async ({ input }) => {
      const event = await createEmergency({ id: randomUUID(), patientName: input.patientName, phone: input.phone, location: input.location, notes: input.notes, hospitalPhone, status: "alert_created" });
      return { ...event, callUri: buildEmergencyCallUri(), message: "Alert logged. Call the configured hospital dispatch line and request an ambulance." };
    }),
  }),
});

export type AppRouter = typeof appRouter;
