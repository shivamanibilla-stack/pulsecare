import { describe, expect, it } from "vitest";
import { buildEmergencyCallUri, buildUpiLink } from "./routers";

describe("PulseCare integration helpers", () => {
  it("builds a UPI deep link with the consultation amount and doctor context", () => {
    const uri = buildUpiLink(1200, "Dr. Aditi Sharma");
    expect(uri).toMatch(/^upi:\/\/pay\?/);
    expect(uri).toContain("am=1200.00");
    expect(uri).toContain("cu=INR");
    expect(uri).toContain("Dr.+Aditi+Sharma");
  });

  it("builds a phone URI for the emergency dispatch workflow", () => {
    expect(buildEmergencyCallUri("+91112")).toBe("tel:+91112");
  });
});
