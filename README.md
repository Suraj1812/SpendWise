# SpendWise

Track smart. Spend wiser.

SpendWise is a full-stack mobile expense tracker built with Expo React Native on the frontend and Node.js + Express on the backend.

## What this build now includes

- Animated splash, login, signup, and guest access
- Dashboard with budget progress, alerts, top categories, recent activity, and smart insights
- Add/edit expense flow with category, payment method, recurring flag, note, and date
- Expense history with search, filters, sorting, swipe delete, and edit
- Insights screen with donut chart, monthly trend, and reusable interview-ready summary text
- Profile/settings with budget editing, dark mode, CSV export, and safer runtime fallback UX
- Backend hardening with helmet, compression, morgan logging, rate limiting, validation, and seeded demo data

## Project structure

```text
SpendWise/
  mobile/   Expo React Native app
  server/   Express API
```

## Demo account

- Email: `demo@spendwise.app`
- Password: `demo123`

## Install

```bash
cd /Users/surajsingh/Downloads/SpendWise
npm --prefix server install
npm --prefix mobile install
```

## Run commands

Backend:

```bash
cd /Users/surajsingh/Downloads/SpendWise
npm run server
```

Mobile app:

```bash
cd /Users/surajsingh/Downloads/SpendWise
npm run mobile
```

Direct mobile launch shortcuts:

```bash
cd /Users/surajsingh/Downloads/SpendWise
npm run android
npm run ios
```

## Verification commands

Run all checks:

```bash
cd /Users/surajsingh/Downloads/SpendWise
npm run check
```

Backend only:

```bash
cd /Users/surajsingh/Downloads/SpendWise
npm run check:server
```

Mobile typecheck only:

```bash
cd /Users/surajsingh/Downloads/SpendWise
npm run check:mobile
```

Android production bundle export:

```bash
cd /Users/surajsingh/Downloads/SpendWise
npm run export:android
```

## Local API URL behavior

The mobile app automatically uses:

- `http://127.0.0.1:4000/api` on iOS and similar local runs
- `http://10.0.2.2:4000/api` on Android emulator

For a physical phone, set your LAN IP:

```bash
cd /Users/surajsingh/Downloads/SpendWise/mobile
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000 npm start
```

## Verification completed here

- `npm --prefix server run check`: passed
- `npm --prefix mobile run typecheck`: passed
- `npm --prefix mobile run export:android`: passed

One limitation of this sandbox remains: local loopback HTTP requests are blocked, so true emulator/device runtime testing still needs to be done on your machine after starting the backend and app.
