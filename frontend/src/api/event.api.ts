import api from "./axios";


const API_URL = "http://localhost:5000/api/events";

export const getEvents = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

// export const getMyEvents = async () => {
//   const response = await axios.get(
//     `${API_URL}/my-events`,
//     {
//       withCredentials: true,
//     }
//   );

//   return response.data;
// };

export const getMyEvents = async () => {
  console.log("Calling getMyEvents with Axios");

  const response = await api.get(
    `${API_URL}/my-events`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};



export const getEventById = async (id: string) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};



export const getMyEventById = async (id: string) => {
  const response = await api.get(
    `${API_URL}/manage/${id}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};



export const createEvent = async (data: any) => {
  const response = await api.post(API_URL, data, {
    withCredentials: true,
  });

  return response.data;
};

export const updateEvent = async (id: string, data: any) => {
  const response = await api.patch(`${API_URL}/${id}`, data, {
    withCredentials: true,
  });

  return response.data;
};

export const deleteEvent = async (id: string) => {
  const response = await api.delete(`${API_URL}/${id}`, {
    withCredentials: true,
  });

  return response.data;
};

export const publishEvent = async (id: string) => {
  const response = await api.post(
    `${API_URL}/${id}/publish`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};