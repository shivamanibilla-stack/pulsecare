import { describe, expect, it } from "vitest";
import { classifySpecialty, formatDistance, haversineMeters } from "./maps";

describe("nearby Places helpers", () => {
  it("formats metric distances for nearby cards", () => {
    expect(formatDistance(420)).toBe("420 m");
    expect(formatDistance(1250)).toBe("1.3 km");
  });

  it("calculates geographic distance without static location assumptions", () => {
    const meters = haversineMeters({ lat: 12.9716, lng: 77.5946 }, { lat: 12.975, lng: 77.6 });
    expect(meters).toBeGreaterThan(600);
    expect(meters).toBeLessThan(800);
  });

  it("labels live doctor results from their Places metadata", () => {
    expect(classifySpecialty({ name: "City Dental Care", types: ["dentist"], place_id: "x", formatted_address: "", geometry: { location: { lat: 0, lng: 0 } } }, "doctor")).toBe("Dentist");
    expect(classifySpecialty({ name: "Central Hospital", types: ["hospital"], place_id: "y", formatted_address: "", geometry: { location: { lat: 0, lng: 0 } } }, "hospital")).toBe("Hospital");
  });
});
