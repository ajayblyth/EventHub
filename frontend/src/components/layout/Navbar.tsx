import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthButtons from "./AuthButtons";
import { getCategories } from "../../api/category.api";

function Navbar() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

useEffect(() => {
  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  loadCategories();
}, []);

  const handleSearch = () => {
    const query = search.trim();

    if (!query) {
      navigate("/");
      return;
    }

    navigate(`/?search=${encodeURIComponent(query)}`);
  };


  return (
    <header className="bg-white border-b border-brand-100">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">

        {/* Logo */}
        <div className="shrink-0">
          <Link
            to="/"
            className="text-2xl font-bold text-brand-800
                       transition-colors hover:text-brand-600"
          >
            EventHub
          </Link>
        </div>

        {/* Search */}
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Search events"
            className="w-full rounded-lg border border-brand-100 px-4 py-2
                       text-brand-900 outline-none
                       focus:border-brand-500"
          />

          <button
            type="button"
            onClick={handleSearch}
            className="rounded-lg bg-brand-500 px-4 py-2 font-semibold
                       text-white transition-colors hover:bg-brand-600"
          >
            Search
          </button>
        </div>

        {/* Location */}
        <button
          type="button"
          className="whitespace-nowrap rounded-lg px-3 py-2
                     text-brand-900 transition-colors
                     hover:bg-brand-50 hover:text-brand-700"
        >
          📍 Bangalore
        </button>

        {/* Create Event */}
        <button
          type="button"
          onClick={() => navigate("/events/create")}
          className="whitespace-nowrap rounded-lg bg-brand-300 px-4 py-2
                     font-semibold text-brand-900
                     transition-colors hover:bg-brand-400"
        >
          + Create Event
        </button>

 {/* Categories */}
<div className="relative">
  <button
    type="button"
    onClick={() =>
      setIsCategoriesOpen((previous) => !previous)
    }
    className="whitespace-nowrap rounded-lg px-3 py-2
               text-brand-900 transition-colors
               hover:bg-brand-50 hover:text-brand-700"
  >
    Categories ▾
  </button>

  {isCategoriesOpen && (
    <div
      className="absolute right-0 z-20 mt-2 w-48
                 rounded-lg border border-brand-100
                 bg-white py-2 shadow-lg"
    >
      {categories.map((category) => (
        <button
          key={category._id}
          type="button"
          onClick={() => {
            setIsCategoriesOpen(false);
            navigate(`/?category=${category.slug}`);
          }}
          className="w-full px-4 py-2 text-left
                     text-brand-900 transition-colors
                     hover:bg-brand-50 hover:text-brand-700"
        >
          {category.name}
        </button>
      ))}
    </div>
  )}
</div>

        {/* Tickets */}
        <button
          type="button"
          onClick={() => navigate("/my-bookings")}
          className="whitespace-nowrap rounded-lg px-3 py-2
                     text-brand-900 transition-colors
                     hover:bg-brand-50 hover:text-brand-700"
        >
          Tickets
        </button>

        {/* Authentication */}
        <AuthButtons />

      </nav>
    </header>
  );
}

export default Navbar;


/*
We're not hardcoding colors like:

bg-[#0F8F78]

We're using:

bg-brand-500
text-brand-900
border-brand-100

because we already created our EventHub theme variables.
*/