# UNITREE

Unitree is a crowdfunding platform designed to connect individuals in need with generous donors. It facilitates a seamless and supportive community where users can share their stories and receive aid. With features like easy sign-up and blogging, Unitree aims to make a significant impact by streamlining the process of giving and receiving support.

**Backend:** https://s49-daniel-supreeth-capstone-unitree.onrender.com/api

## Features

- **Sign up and log in**: secure accounts with hashed passwords and JWT sessions that last 7 days.
- **Campaigns**: start, edit, close or complete a fundraising campaign with a story, goal, end date and cover photo. You can search, filter by category and sort campaigns.
- **Donations**: donate to any active campaign, with preset amounts, a message, an anonymous option and a receipt reference. Campaign totals update right away.
- **Item donations**: list physical items with photos. Other users can claim them, and contact details are shared only between the donor and the person who claimed the item. The donor then marks the item as handed over.
- **Blog**: write stories or campaign updates with tags and a cover image. Other users can like and comment.
- **Dashboard**: your campaigns, donations made and received, items listed and claimed, posts, and profile and password settings.
- **Public profiles**: each user's campaigns, posts, shared items and total donated.
- **Admin panel**: platform totals, every registered user with their activity (campaigns, donations, items, posts, last login, login count), all donations, CSV export, and controls to block users or change their role.

> Payments are simulated (demo mode). Every donation is recorded in the database, but no real money is charged. To accept real payments, connect a gateway such as Razorpay or Stripe in `POST /api/campaigns/:id/donate`.

## Tech stack

| Part     | Tech                                                        |
| -------- | ----------------------------------------------------------- |
| Frontend | React 18, React Router, Tailwind CSS v4, Axios, Vite        |
| Backend  | Node.js, Express, Mongoose, JWT, bcryptjs, Helmet, rate limiting |
| Database | MongoDB (Atlas)                                             |

## Project structure

```
backend/
  index.js            server entry (connects DB, starts app)
  app.js              express app, middleware, routes
  config/db.js        MongoDB connection
  middleware/         auth (protect / admin) and error handling
  models/             User, Campaign, Donation, Post, Item
  routes/             auth, users, campaigns, donations, posts, items, stats, admin
  seed.js             demo data
frontend/client/
  src/context/        AuthContext (login state)
  src/lib/            api client, formatting, image compression
  src/components/     Navbar, Footer, cards, image picker, UI helpers
  src/pages/          all pages
render.yaml           one-click Render deployment
```

## Run locally

You need Node.js 18 or later and a MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works).

**1. Backend**

```bash
cd backend
cp .env.example .env     # then fill in MONGO_URI, JWT_SECRET, ADMIN_EMAILS
npm install
npm run seed             # optional: adds demo users, campaigns, posts and items
npm run dev              # http://localhost:3001
```

**2. Frontend** (in a second terminal)

```bash
cd frontend/client
cp .env.example .env     # VITE_API_URL=http://localhost:3001/api
npm install
npm run dev              # http://localhost:5173
```

**Demo accounts** (after `npm run seed`, password `password123`): `asha@unitree.demo`, `rahul@unitree.demo`, `priya@unitree.demo`, `donor@unitree.demo`. The seed only creates and replaces `@unitree.demo` accounts, so it's safe to run on a database with real users.

**Admin access:** put your email in `ADMIN_EMAILS` in `backend/.env`. That account becomes an admin the next time it signs up or logs in, and "Admin panel" appears in the user menu.

## Environment variables

**backend/.env**

| Name             | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `MONGO_URI`      | MongoDB connection string                                     |
| `JWT_SECRET`     | long random string used to sign login tokens                  |
| `JWT_EXPIRES_IN` | token lifetime (default `7d`)                                 |
| `PORT`           | API port (default `3001`)                                     |
| `CLIENT_URL`     | allowed frontend origin(s), comma separated; empty allows all |
| `ADMIN_EMAILS`   | emails that get the admin role, comma separated               |

**frontend/client/.env**

| Name            | Description                                           |
| --------------- | ----------------------------------------------------- |
| `VITE_API_URL`  | backend URL including `/api`                          |
| `VITE_CURRENCY` | currency code for displayed amounts (default `USD`)   |

## Deploy

### Option A: Render (backend and frontend together)

1. Push this repo to GitHub.
2. In Render, choose **New + → Blueprint** and select the repo. Render reads `render.yaml`.
3. Fill in the values it asks for:
   - `MONGO_URI`: your Atlas connection string. In Atlas → Network Access, allow `0.0.0.0/0`.
   - `CLIENT_URL`: the frontend URL, e.g. `https://unitree-web.onrender.com`
   - `ADMIN_EMAILS`: your email
   - `VITE_API_URL`: the API URL plus `/api`, e.g. `https://unitree-api.onrender.com/api`

### Option B: existing Render backend + Vercel or Netlify frontend

- **Backend (Render web service):** root directory `backend`, build command `npm install`, start command `npm start`. Add the backend environment variables above.
- **Frontend (Vercel or Netlify):** root directory `frontend/client`, build command `npm run build`, output directory `dist`. Set `VITE_API_URL=https://s49-daniel-supreeth-capstone-unitree.onrender.com/api`. Page refreshes on routes like `/campaigns/123` already work: `vercel.json` handles this on Vercel and `public/_redirects` on Netlify.

After the frontend is live, set `CLIENT_URL` on the backend to the frontend URL and redeploy the backend.

## API reference

All routes start with `/api`. 🔒 means the route needs an `Authorization: Bearer <token>` header.

| Method | Route | Description |
| ------ | ----- | ----------- |
| POST | `/auth/register` | create account → `{ token, user }` |
| POST | `/auth/login` | log in → `{ token, user }` |
| GET 🔒 | `/auth/me` | current user |
| GET | `/users` | public member list |
| GET | `/users/:id` | public profile with campaigns, posts, items |
| PUT 🔒 | `/users/me` | update profile |
| PUT 🔒 | `/users/me/password` | change password |
| GET | `/campaigns` | list (`search`, `category`, `status`, `sort`, `creator`, `page`, `limit`) |
| GET | `/campaigns/categories` | category list |
| GET | `/campaigns/:id` | campaign with recent donations and updates |
| POST 🔒 | `/campaigns` | create |
| PUT 🔒 | `/campaigns/:id` | edit (owner or admin) |
| DELETE 🔒 | `/campaigns/:id` | delete (owner if it has no donations, or admin) |
| POST 🔒 | `/campaigns/:id/donate` | donate `{ amount, message, anonymous, paymentMethod }` |
| GET 🔒 | `/donations/mine` | donations I made |
| GET 🔒 | `/donations/received` | donations to my campaigns |
| GET | `/posts` | list (`search`, `tag`, `author`, `campaign`, `page`) |
| GET | `/posts/:id` | post with comments |
| POST / PUT / DELETE 🔒 | `/posts`, `/posts/:id` | write, edit or delete a post |
| POST 🔒 | `/posts/:id/like` | like or unlike |
| POST 🔒 | `/posts/:id/comments` | add a comment |
| DELETE 🔒 | `/posts/:id/comments/:commentId` | delete a comment |
| GET | `/items` | list (`search`, `category`, `status`, `donor`, `page`) |
| GET | `/items/:id` | item details |
| POST / PUT / DELETE 🔒 | `/items`, `/items/:id` | list, edit or remove an item |
| POST 🔒 | `/items/:id/claim` | claim an item |
| POST 🔒 | `/items/:id/release` | cancel a claim |
| POST 🔒 | `/items/:id/complete` | donor marks the item as handed over |
| GET 🔒 | `/items/claimed/me` | items I claimed |
| GET | `/stats` | platform totals |
| GET 🔒 | `/admin/overview`, `/admin/users`, `/admin/donations` | admin data |
| PATCH 🔒 | `/admin/users/:id` | set `role` or `isBlocked` |

Sample requests for [Bruno](https://www.usebruno.com/) are in `backend/Unitree/`.
