import { useEffect } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "./store/store";
import { fetchCurrentUser } from "./store/slices/authSlice";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;

/*

1. BrowserRouter → enables routing
<BrowserRouter>
  ...
</BrowserRouter>

It tells React:

"This application uses browser-based URLs and routing."

It keeps track of the current URL.

2. Routes → holds all your routes
<Routes>
  ...
</Routes>

Think of it as a container for your route definitions.

3. Route → defines one URL → one component
<Route path="/login" element={<Login />} />

Means:

If the URL is /login, show the Login component.
*/