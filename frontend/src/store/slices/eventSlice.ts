import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getEvents, getMyEvents } from "../../api/event.api";


interface EventImage {
  url: string;
  alt?: string;
  isMain: boolean;
  order: number;
}


interface Event {
  _id: string;
  title: string;
  summary?: string;
  description: string;
  startAt: string;
  status: "DRAFT" | "PUBLISHED";
  isOnline: boolean;
categoryIds: {
  _id: string;
  name: string;
  slug: string;
}[];
  images?: EventImage[];
  ticketTiers: {
  _id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
  minPerOrder: number;
  maxPerOrder: number;
  salesStartAt?: string;
  salesEndAt?: string;
}[];
}

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}



const initialState: EventState = {
  events: [],
  isLoading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getEvents();

      return response.events;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch events"
      );
    }
  }
);


export const fetchMyEvents = createAsyncThunk(
  "events/fetchMyEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyEvents();
      return response.events;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch my events"
      );
    }
  }
);


const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
extraReducers: (builder) => {
  builder
    // Public events
    .addCase(fetchEvents.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchEvents.fulfilled, (state, action) => {
      state.isLoading = false;
      state.events = action.payload;
    })
    .addCase(fetchEvents.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    })

    // My events
    .addCase(fetchMyEvents.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchMyEvents.fulfilled, (state, action) => {
      state.isLoading = false;
      state.events = action.payload;
    })
    .addCase(fetchMyEvents.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
},
});

export default eventSlice.reducer;