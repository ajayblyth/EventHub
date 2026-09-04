import api from "./axios";

export async function getEventBookings(
  eventId: string
) {
  const response = await api.get(
    `/bookings/event/${eventId}`
  );

  return response.data.bookings;
}