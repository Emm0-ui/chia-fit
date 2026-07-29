# ChIA Fit 🥑

AI-powered nutrition app for Mexico. Built in ~2 months, currently in closed beta on Google Play with 20+ active testers.

## What it does

**4 AI-powered scanners:**
- 📷 Barcode scanner — nutritional analysis with health rating + tips
- 🏷️ Nutrition label scanner — good/bad rating with traffic light + tips (affiliate system planned)
- 🍎 Fruit & vegetable ripeness detector — traffic light + consumption tips
- 🍽️ Dish scanner — calories, nutrients & ingredients via AI (like Cal AI)

**Personalized AI health plan (8-step onboarding):**
- Inputs: weight, age, health conditions, waist, allergies, weekly budget, activity level, goal
- Outputs: meal plan + exercise routine + tips
- YouTube links for recipes and exercise tutorials

**Daily tracking:**
- 💧 Hydration tracking with configurable daily goal
- 🔥 My Day — daily caloric & hydration summary
- 📅 Calendar — weight, exercise & water history
- 📊 Progress tracking (weight + waist) with AI plan regeneration analysis
- 🏃 Workout streak tracking

**App features:**
- 🏆 Achievements system
- 🔔 Smart notifications
- 📤 Data export
- 📱 Scan history
- 🌙 Light/dark theme
- 👤 Profile with photo
- 🔐 Secure auth (Supabase)
- 🗑️ Account deletion

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo SDK 54 |
| Navigation | Expo Router |
| Backend | Node.js/Express on Railway |
| Database | Supabase (PostgreSQL + Auth) |
| AI | Claude Haiku 4.5 |
| Language | TypeScript |
| Build | Gradle (local) |

## Architecture

The client never calls the AI API directly. All Claude requests go through a Node.js/Express backend on Railway acting as a secure proxy, keeping API keys server-side.

## Status

🟡 Closed beta — 20+ testers on Google Play  
⏳ Production launch pending payment setup (August 2026)  
🔗 Backend: [chia-fit-backend](https://github.com/Emm0-ui/zesty-backend)

## Key Technical Challenges Solved

- Circular dependency resolution between theme context and color system
- Release build compatibility with dynamic requires in React Native
- Local Gradle build pipeline replacing EAS cloud builds
- Secure API proxy architecture for production AI integration
