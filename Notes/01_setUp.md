Yes. Let's start from zero and do it properly for the EventHub team project.

Since your brief requires GitHub branches and pull requests, our workflow should be:

GitHub Repository
       │
       ▼
     main
       │
       ├── feature/auth
       ├── feature/events
       ├── feature/bookings
       ├── feature/organizer
       └── feature/payment
              │
              ▼
        Test everything
              │
              ▼
        Pull Request
              │
              ▼
            main

GitHub recommends creating the repository first and then committing/pushing your project; README and .gitignore are useful repository files.

Step 1 — Create the GitHub repository

Go to:

GitHub → New Repository

Fill it like this:

Repository name:

EventHub

Description:

Event Booking & Ticketing Platform - Full Stack OJT Project

Visibility:
For a team OJT project, I recommend Private unless your tutor specifically wants it public.

Important: Don't add these yet

On the GitHub repository creation page:

❌ Don't add a README
❌ Don't add .gitignore
❌ Don't add a license

We'll create the project locally and set everything up properly.

GitHub specifically notes that when you're importing/pushing an existing local repository, pre-populating files can introduce merge conflicts.

Click:

Create repository

Step 2 — Don't start coding yet

After creating the repo, stop there.

You should now have an empty GitHub repository:

EventHub
   │
   └── empty repository

Next we'll create the local project structure in VS Code:

EventHub/
│
├── frontend/
│   └── React + TypeScript + Redux Toolkit
│
├── backend/
│   └── Node + Express + TypeScript
│
├── .gitignore
└── README.md

Then we'll:

Initialize Git
Connect local project to GitHub
Create main
Create our first feature branch
Make the initial commit
Push it to GitHub
Establish the branch/PR workflow

Do Step 1 first. Once you've created the empty EventHub repository, tell me "created", and we'll do the local setup step-by-step.

lets go to step 2 in detail, what to do

Yes. Now we do Step 2: create the local EventHub project in VS Code.

We'll create the structure first, then Git.

2.1 Create the main folder

Choose a location on your computer where you keep projects.

For example:

Documents/
└── EventHub/

You can create it manually:

Open File Explorer
Go to your preferred location
Right-click → New → Folder
Name it:
EventHub
2.2 Open EventHub in VS Code

Open VS Code.

Go to:

File → Open Folder

Select:

EventHub

Your VS Code should currently look roughly like:

EVENTHUB
└── (empty)
2.3 Open VS Code Terminal

In VS Code:

Terminal → New Terminal

You should see something like:

PS C:\...\EventHub>

Make sure you are inside the EventHub folder.

You can verify with:

pwd

or on Windows:

cd
2.4 Create the React frontend

We're using React + TypeScript + Vite.

Run:

npm create vite@latest frontend

Vite will ask questions.

Choose:

Project name: frontend


Select a framework: React


Select a variant: TypeScript

Or you can create it directly with:

npm create vite@latest frontend -- --template react-ts

I recommend the second command because it avoids mistakes.

Run:

npm create vite@latest frontend -- --template react-ts

You'll get:

EventHub/
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
2.5 Install frontend dependencies

Move into frontend:

cd frontend

Install the existing dependencies:

npm install

Now install the libraries we'll need initially:

npm install react-router-dom @reduxjs/toolkit react-redux axios

So our frontend will use:

React
TypeScript
Vite
React Router
Redux Toolkit
React Redux
Axios

We're deliberately using Redux Toolkit, not Context API, according to your project instructions.

2.6 Go back to EventHub

Run:

cd ..

Now:

PS ...\EventHub>
2.7 Create the backend folder

Create the backend folder:

mkdir backend

Then:

cd backend

Initialize Node:

npm init -y

You'll get:

backend/
└── package.json
2.8 Install backend packages

We'll use:

npm install express mongoose cors dotenv bcryptjs jsonwebtoken

These are for:

Package	Purpose
express	Backend/API server
mongoose	MongoDB connection + models
cors	Allow frontend ↔ backend requests
dotenv	Environment variables
bcryptjs	Hash passwords
jsonwebtoken	JWT authentication

For development, install TypeScript tools:

npm install -D typescript ts-node-dev @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken
2.9 Initialize TypeScript

Still inside:

EventHub/backend

run:

npx tsc --init

This creates:

backend/
├── package.json
└── tsconfig.json
2.10 Our backend structure

Don't create every file yet. Just understand the structure we'll build:

backend/
│
├── src/
│   ├── config/
│   │   └── db.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Event.ts
│   │   ├── Booking.ts
│   │   └── PromoCode.ts
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── eventController.ts
│   │   ├── bookingController.ts
│   │   └── promoCodeController.ts
│   │
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── eventRoutes.ts
│   │   ├── bookingRoutes.ts
│   │   └── promoCodeRoutes.ts
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   └── errorMiddleware.ts
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── eventService.ts
│   │   └── bookingService.ts
│   │
│   └── server.ts
│
├── .env
├── .env.example
├── package.json
└── tsconfig.json

Don't create all of these manually right now. We'll build them feature by feature.

2.11 Go back to EventHub
cd ..

Your overall structure should now be:

EventHub/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── backend/
    ├── package.json
    ├── tsconfig.json
    └── ...

This is our basic full-stack skeleton.

2.12 Create .gitignore

This is very important before Git.

Inside the main EventHub folder, create:

.gitignore

Put:

node_modules/
.env
dist/
build/
.vite/
coverage/

Why?

We never push:

node_modules/
.env

because .env will eventually contain things like:

MONGODB_URI=...
JWT_SECRET=...
STRIPE_SECRET_KEY=...

Those must remain private.

2.13 Create README

At the root:

EventHub/
├── frontend/
├── backend/
├── .gitignore
└── README.md

For now, just put:

# EventHub


Event Booking & Ticketing Platform


Full-stack OJT project built with React, TypeScript, Node.js, Express, MongoDB and Redux Toolkit.

We'll improve the README later.

2.14 Final structure at this stage

You should have:

EVENTHUB
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend
│   ├── src          ← we'll build this
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
One important thing

Don't start building authentication or MongoDB yet.

The next step should be Git initialization and connecting this local project to the GitHub repository, because your OJT specifically requires:

Feature branch
     ↓
Develop/test
     ↓
Commit
     ↓
Push branch
     ↓
Pull Request
     ↓
main

Once your folders look like the structure above, we can do Step 3: Git setup + first commit + push to GitHub.

Cancel
Send
STEP 3 — Git Setup + First Push to GitHub

We now connect your local EventHub project to the GitHub repository you created.

3.1 Make sure you're in the root folder

In VS Code terminal:

cd EventHub

Your terminal should be inside:

EventHub>

Check:

git --version

If you get something like:

git version 2.x.x

Git is installed.

3.2 Initialize Git

Run:

git init

This turns your local EventHub folder into a Git repository.

You'll see:

Initialized empty Git repository...
3.3 Check what Git sees

Run:

git status

You should see files such as:

.gitignore
README.md
frontend/...
backend/...

You should not see node_modules listed because our .gitignore prevents it from being tracked.

3.4 Create the main branch

Explicitly name our main branch main:

git branch -M main

Now:

main

is our primary branch.

Our rule will be:

❌ Don't directly develop features on main


✅ Create feature branch
       ↓
   develop
       ↓
    test
       ↓
    commit
       ↓
    push
       ↓
 Pull Request
       ↓
     main
3.5 Connect Git to GitHub

Go to the GitHub repository you created.

You'll see a URL similar to:

https://github.com/YOUR_USERNAME/EventHub.git

Copy the HTTPS URL.

Then in VS Code:

git remote add origin https://github.com/YOUR_USERNAME/EventHub.git

For example:

git remote add origin https://github.com/ajay/EventHub.git

Don't copy my example username. Use the URL GitHub gives you.

3.6 Verify the connection

Run:

git remote -v

You should see:

origin  https://github.com/YOUR_USERNAME/EventHub.git (fetch)
origin  https://github.com/YOUR_USERNAME/EventHub.git (push)

So:

Local EventHub
      │
      │ origin
      ▼
GitHub EventHub
3.7 Stage the files

Now tell Git to track our project files:

git add .

Check:

git status

You should see something like:

Changes to be committed:


    new file: .gitignore
    new file: README.md
    new file: backend/package.json
    new file: backend/tsconfig.json
    new file: frontend/package.json
    ...

Notice:

node_modules

should not be included.

3.8 Create our first commit

Run:

git commit -m "chore: initialize EventHub project"

This creates our first snapshot.

Think of a commit as:

"Save this exact version of my project."

3.9 Push to GitHub

Now push main:

git push -u origin main

The -u connects your local:

main

with:

origin/main

After this, refresh your GitHub repository.

You should see:

EventHub
│
├── backend
├── frontend
├── .gitignore
└── README.md

🎉 Your local project is now connected to GitHub.

3.10 VERY IMPORTANT — Our branch strategy

From now on, don't code directly on main.

For example, our first real feature will probably be authentication.

We create:

git checkout -b feature/auth

Now:

main
  │
  └── feature/auth   ← you work here

After authentication is complete:

git add .
git commit -m "feat: implement authentication"
git push -u origin feature/auth

Then GitHub:

feature/auth
      │
      ▼
 Pull Request
      │
      ▼
     main

This matches your OJT requirement of separate branches for features and merging working code into main.

Our planned branches

We don't need to create all of them now. We'll create them when we start each feature.

main
 │
 ├── feature/auth
 ├── feature/events
 ├── feature/bookings
 ├── feature/organizer
 └── feature/payment

Potentially later:

feature/search-filter
feature/ui-polish

But don't create unnecessary branches now.

⚠️ One thing before moving on

Because this is a team project, eventually each teammate should:

clone repository
      ↓
create their feature branch
      ↓
work
      ↓
push branch
      ↓
Pull Request
      ↓
review
      ↓
merge into main

Nobody should casually overwrite another person's work.

Your immediate commands

If you've completed Steps 1–2, run these in order:

git init
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git remote -v
git add .
git commit -m "chore: initialize EventHub project"
git push -u origin main

After git push succeeds, don't create feature/auth yet.

Next, we'll set up the team GitHub workflow and create our first feature branch, then start the actual backend foundation.