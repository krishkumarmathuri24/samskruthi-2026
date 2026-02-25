# 🌊 Samskruthi 2026 — Grand Cultural Fest Website

A full-stack, fully responsive **3D web application** for the **Samskruthi 2026** college cultural festival.

---

## ✨ Features

| Feature | Status |
|---|---|
| 3D Interactive Hero (Three.js + R3F) | ✅ |
| Animated particle background | ✅ |
| Google OAuth Login | ✅ |
| Phone OTP Login (Supabase) | ✅ |
| Real-time Ticket Booking | ✅ |
| Realtime Notifications (Supabase) | ✅ |
| User Activity Logging | ✅ |
| Admin Dashboard (Events CRUD) | ✅ |
| Admin Broadcast Notifications | ✅ |
| User Booking Monitor | ✅ |
| Home, Events, Sponsors, History, Contact Pages | ✅ |
| Fully Responsive | ✅ |
| Bluish Aquatic Theme | ✅ |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
cd samskruthi
npm install
```

### 2. Configure Supabase

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. In the **SQL Editor**, paste and run the contents of `supabase-schema.sql`
3. Go to **Authentication → Providers** → Enable **Google** and **Phone (SMS)**
4. Copy your **Project URL** and **Anon Key** from **Settings → API**
5. Update your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Configure Google OAuth (for Google Login)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add `https://your-project-id.supabase.co/auth/v1/callback` as a redirect URI
4. In Supabase Dashboard → Auth → Providers → Google → paste your Client ID & Secret

### 4. Configure Phone OTP (optional)

1. In Supabase Dashboard → Auth → Providers → Phone → enable Twilio or MessageBird
2. Add your SMS provider credentials

### 5. Make yourself Admin

After signing in to the app, run this in Supabase SQL Editor:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### 6. Run
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🗂️ Project Structure

```
samskruthi/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Responsive navbar with notifications & user menu
│   │   ├── Footer.jsx          # Footer with social links
│   │   ├── ParticleBackground.jsx  # Canvas particle animation
│   │   └── Scene3D.jsx         # Three.js 3D scene
│   ├── lib/
│   │   └── supabase.js         # Supabase client singleton
│   ├── pages/
│   │   ├── Home.jsx            # Hero + countdown + stats + highlights
│   │   ├── Events.jsx          # Event listing + ticket booking
│   │   ├── Sponsors.jsx        # Tiered sponsor display
│   │   ├── History.jsx         # Timeline of past editions
│   │   ├── Contact.jsx         # Contact form + FAQ
│   │   ├── Login.jsx           # Google OAuth + Phone OTP
│   │   ├── Dashboard.jsx       # User ticket dashboard
│   │   ├── AdminDashboard.jsx  # Admin panel
│   │   └── AuthCallback.jsx    # OAuth callback handler
│   ├── store/
│   │   └── store.js            # Zustand stores (auth, tickets, events, notif)
│   ├── App.jsx                 # Router + auth listener
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles (aquatic theme)
├── supabase-schema.sql         # Full DB schema — run in Supabase SQL Editor
├── .env                        # Your credentials (not committed)
├── .env.example                # Template
├── package.json
└── vite.config.js
```

---

## 🗄️ Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles (synced from auth.users) |
| `events` | Event details, capacity, bookings count |
| `tickets` | Individual ticket records with unique codes |
| `notifications` | Per-user notifications (realtime-enabled) |
| `user_activity_logs` | Tracks user actions (DASHBOARD_VISIT, TICKET_BOOKED, etc.) |
| `contact_messages` | Contact form submissions |

---

## 🎨 Theme

The app uses a **Bluish Aquatic Theme** with:
- Deep navy backgrounds (`#020b18`)
- Teal/cyan glow accents (`#00e5ff`, `#00bcd4`)
- Purple accent (`#7c4dff`)
- Glassmorphism UI cards
- Canvas particle animations
- Three.js 3D sphere with distort material

---

## 🛡️ Admin Access

The admin dashboard at `/admin` is protected. To access it:
1. Sign in with your account
2. Run the SQL command to set your `role = 'admin'`
3. Sign out and sign back in
4. You'll see the Admin Panel link in your user menu

---

## 📦 Tech Stack

- **Frontend**: React 18 + Vite 6
- **3D**: Three.js + React Three Fiber + Drei
- **State**: Zustand
- **Animations**: Framer Motion + Canvas API
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Auth**: Google OAuth + Phone OTP (via Supabase)
- **Routing**: React Router v6
- **Notifications**: react-hot-toast

---

*Made with ❤️ for Samskruthi 2026 — Bengaluru*
