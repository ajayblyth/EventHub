
import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./store/store";
import { fetchCurrentUser } from "./store/slices/authSlice";

function App() {

   const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);
  
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<h1>Home works</h1>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />      </Route>
    </Routes>
  );
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