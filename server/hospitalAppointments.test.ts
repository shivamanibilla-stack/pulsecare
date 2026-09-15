import { describe, expect, it } from "vitest";
import { hospitalAppointmentRequestSchema } from "./routers";

describe("hospital appointment requests", () => {
  it("accepts a valid live Places hospital request", () => {
    const result = hospitalAppointmentRequestSchema.safeParse({ placeId: "ChIJlive", hospitalName: "Real City Hospital", hospitalAddress: "1 Main Street", patientName: "Asha Patient", patientEmail: "asha@example.com", patientPhone: "+919999999999", preferredDate: "2026-10-01", preferredTime: "10:30", reason: "General consultation" });
    expect(result.success).toBe(true);
  });

  it("rejects a request without a callback phone or reason", () => {
    const result = hospitalAppointmentRequestSchema.safeParse({ placeId: "ChIJlive", hospitalName: "Real City Hospital", hospitalAddress: "1 Main Street", patientName: "Asha Patient", preferredDate: "2026-10-01", preferredTime: "10:30" });
    expect(result.success).toBe(false);
  });
});
