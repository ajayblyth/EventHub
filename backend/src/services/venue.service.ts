import Venue from "../models/Venue.js";

export async function searchVenues(search: string) {
  const query = search.trim();

  if (!query) {
    return [];
  }

  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw new Error("GEOAPIFY_API_KEY is not defined");
  }

  const url =
    `https://api.geoapify.com/v1/geocode/autocomplete` +
    `?text=${encodeURIComponent(query)}` +
    `&limit=5` +
    `&filter=countrycode:in` +
    `&format=json` +
    `&apiKey=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Geoapify location search failed");
  }

  const data = await response.json();

  return data.results.map((place: any) => ({
    name: place.name || place.address_line1 || "",
    address: place.address_line2 || place.formatted || "",
    city: place.city || "",
    state: place.state || "",
    country: place.country || "India",
    postalCode: place.postcode || "",
    latitude: place.lat,
    longitude: place.lon,
    placeId: place.place_id,
  }));
}


export async function saveVenue(data: {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  placeId: string;
}) {
  const existingVenue = await Venue.findOne({
    placeId: data.placeId,
  });

  if (existingVenue) {
    return existingVenue;
  }

  const venue = await Venue.create(data);

  return venue;
}