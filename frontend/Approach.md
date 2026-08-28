React + TypeScript
        ↓
Tailwind CSS
        ↓
Proper Layout first
        ↓
Design system / theme
        ↓
Reusable components
        ↓
React Router
        ↓
Redux Toolkit
        ↓
API service layer
        ↓
Zod validation
        ↓
Pages

-----------
1. Zod dependency ✅
        ↓
2. Tailwind CSS setup
        ↓
3. Design system
   ├── colors
   ├── fonts
   ├── text sizes
   └── CSS variables/theme
        ↓
4. Application Layout
   ├── Navbar
   ├── Main content
   └── Footer
        ↓
5. React Router
        ↓
6. Reusable UI components
        ↓
7. Redux Toolkit setup
        ↓
8. API service structure
        ↓
9. Frontend Zod schemas
        ↓
10. Login/Register pages

======
npm install tailwindcss @tailwindcss/vite

-----
So your complete index.css becomes:

@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

@import "tailwindcss";
@import "./styles/theme.css";

html {
  font-family: "Inter", sans-serif;
}

body {
  margin: 0;
  background-color: var(--color-brand-50);
  color: var(--color-text-primary);
}
Why put this in index.css?

index.css is our global stylesheet.

Things that should apply to the entire application belong here.

For example:

index.css
   │
   ├── Global font
   ├── Global background
   ├── Global text color
   └── Global base styles

Whereas:

theme.css
   │
   └── Design tokens / colors


# layout
┌─────────────────────────────────────────────────────────────────────┐
│ EventHub │ Search events │ Location │ + Create Event │ Updates │ ... │ Tickets    [ Profile ▼ ]
└─────────────────────────────────────────────────────────────────────┘
App
 │
 └── Layout
      │
      ├── Navbar
      │
      ├── Main Content
      │
      └── Footer

      The important idea is that Navbar and Footer should not be recreated on every page.

      Home
  ↓
┌────────────────────────────┐
│ Navbar                     │
├────────────────────────────┤
│ Home content               │
├────────────────────────────┤
│ Footer                     │
└────────────────────────────┘

Login
  ↓
┌────────────────────────────┐
│ Navbar                     │
├────────────────────────────┤
│ Login content              │
├────────────────────────────┤
│ Footer                     │
└────────────────────────────┘

React Router will eventually handle the changing middle section.

-------
after modify Navbar.tsx

We're  following the palette:

Logo
→ text-brand-800

Navigation
→ text-text-secondary

Navigation hover
→ text-brand-500

CTA
→ bg-brand-300
→ text-brand-900

CTA hover
→ bg-brand-400

No:

#0F8F78
#075E54
#71D8C5

inside the component.

That's exactly the variable-coloring rule your tutor requested.

# flow till now
 main.tsx
   ↓
BrowserRouter
   ↓
App.tsx
   ↓
Routes
   ↓
MainLayout
   ├── Navbar
   ├── Outlet
   │    └── Current Page
   └── Footer

# 
   What we added

We now have two separate schemas:

loginSchema
     ↓
LoginFormData

and

signupSchema
     ↓
SignupFormData

# create a small Axios API layer instead of putting Axios calls directly inside LoginPage/SignupPage.

Step 1 — Create the API folder

Inside frontend/src, create:

src/
├── api/
│   └── auth.api.ts
├── components/
├── layouts/
├── pages/
│   └── auth/
│       ├── LoginPage.tsx
│       └── SignupPage.tsx
└── validators/
    └── auth.validator.ts

Create:

src/api/auth.api.ts

# Register/Login
   ↓
API call
   ↓
Redux state

fetchCurrentUser
   ↓
createAsyncThunk
   ↓
pending / fulfilled / rejected
   ↓
extraReducers
   ↓
isLoading + user + isAuthenticated