# Aam Wala - Mango Business Manager

A web app for managing mango farm business operations.

## Running the Project

Install dependencies:
```bash
npm install
```

Start dev server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Tauri Desktop App

This project has been migrated from Electron to Tauri for better performance and smaller bundle sizes.

### Development
```bash
npm run tauri:dev
```

### Building for Desktop
```bash
npm run tauri:build
```

## Capacitor Mobile Integration

The project is configured for future mobile builds using Capacitor.

### Adding Platforms
```bash
npx cap add android
npx cap add ios
```

### Building for Mobile
```bash
npm run build
npx cap sync
npx cap open android
npx cap open ios
```

## Features
- Farm and agent management
- Billing system for mango sales
- Ledger tracking
- Reports dashboard

## Tech Used
- React + TypeScript
- Vite for fast builds
- Tailwind CSS
- Supabase backend
- shadcn/ui components
- Tauri (Desktop)
- Capacitor (Mobile)

Live URL: https://aam-wala.netlify.app/