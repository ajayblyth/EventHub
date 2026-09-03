import api from "./axios";
const API_URL = "http://localhost:5000/api/venues";

export async function searchVenues(search: string) {
  const response = await api.get(`${API_URL}/search`, {
    params: {
      q: search,
    },
  });

  return response.data.venues;
}

export async function saveVenue(venue: {
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
  const response = await api.post(API_URL, venue);

  return response.data.venue;
}