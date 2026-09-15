import { makeRequest, type LatLng, type PlaceDetailsResult, type PlacesSearchResult } from "./_core/map";

export type NearbyCategory = "doctor" | "hospital" | "clinic";
export type NearbyPlace = {
  id: string;
  name: string;
  category: NearbyCategory;
  specialty: string;
  address: string;
  distanceMeters: number;
  distanceText: string;
  rating: number | null;
  ratingCount: number;
  phone: string | null;
  location: LatLng;
  directionsUrl: string;
  openNow: boolean | null;
};

const categorySearches: Array<{ category: NearbyCategory; type: string; keyword: string }> = [
  { category: "doctor", type: "doctor", keyword: "doctor specialist" },
  { category: "hospital", type: "hospital", keyword: "hospital" },
  { category: "clinic", type: "doctor", keyword: "clinic medical centre" },
];

export function haversineMeters(a: LatLng, b: LatLng) {
  const earthRadius = 6371000;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const deltaLat = ((b.lat - a.lat) * Math.PI) / 180;
  const deltaLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export function classifySpecialty(place: PlacesSearchResult["results"][number], category: NearbyCategory) {
  if (category !== "doctor") return category === "hospital" ? "Hospital" : "Clinic";
  const text = `${place.name} ${place.types.join(" ")}`.toLowerCase();
  if (text.includes("cardio")) return "Cardiologist";
  if (text.includes("dental") || text.includes("dentist")) return "Dentist";
  if (text.includes("ortho")) return "Orthopedic specialist";
  if (text.includes("neuro")) return "Neurologist";
  if (text.includes("eye") || text.includes("ophthal")) return "Ophthalmologist";
  return "Doctor";
}

async function getDetails(placeId: string): Promise<PlaceDetailsResult["result"] | null> {
  try {
    const response = await makeRequest<PlaceDetailsResult>("/maps/api/place/details/json", {
      place_id: placeId,
      fields: "name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,geometry,opening_hours",
    });
    return response.status === "OK" ? response.result : null;
  } catch {
    return null;
  }
}

export async function searchNearbyPlaces(origin: LatLng, radiusMeters: number, category?: NearbyCategory) {
  const searches = category ? categorySearches.filter(item => item.category === category) : categorySearches;
  const responses = await Promise.all(searches.map(async search => {
    const response = await makeRequest<PlacesSearchResult>("/maps/api/place/nearbysearch/json", {
      location: `${origin.lat},${origin.lng}`,
      radius: Math.min(Math.max(radiusMeters, 500), 50000),
      type: search.type,
      keyword: search.keyword,
    });
    return { ...search, response };
  }));

  const seen = new Set<string>();
  const rawResults = responses.flatMap(item => item.response.status === "OK" ? item.response.results.map(place => ({ ...place, category: item.category })) : []);
  const unique = rawResults.filter(place => {
    if (seen.has(place.place_id)) return false;
    seen.add(place.place_id);
    return true;
  }).filter(place => place.geometry?.location);

  const details = await Promise.all(unique.slice(0, 24).map(place => getDetails(place.place_id)));
  return unique.slice(0, 24).map((place, index) => {
    const detail = details[index];
    const location = detail?.geometry?.location ?? place.geometry.location;
    const distanceMeters = haversineMeters(origin, location);
    const address = detail?.formatted_address ?? place.formatted_address ?? "Address unavailable";
    const phone = detail?.international_phone_number ?? detail?.formatted_phone_number ?? null;
    return {
      id: place.place_id,
      name: detail?.name ?? place.name,
      category: place.category,
      specialty: classifySpecialty(place, place.category),
      address,
      distanceMeters: Math.round(distanceMeters),
      distanceText: formatDistance(distanceMeters),
      rating: detail?.rating ?? place.rating ?? null,
      ratingCount: detail?.user_ratings_total ?? place.user_ratings_total ?? 0,
      phone,
      location,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`,
      openNow: detail?.opening_hours?.open_now ?? null,
    } satisfies NearbyPlace;
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);
}
