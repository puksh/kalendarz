# Vue Calendar - Team Scheduling App

[![GitHub Pages](https://github.com/puksh/vueCalendar/actions/workflows/buildWebsite.yml/badge.svg)](https://github.com/puksh/vueCalendar/actions/workflows/buildWebsite.yml)

A team scheduling application built with Vue 3 for viewing team member shifts with a clean, responsive interface.

1. **View Mode**: Navigate between months and review existing schedules
2. **Calendar & Table Views**: Switch between visual calendar and tabular data formats
3. **Export Functionality**: Export schedules to PDF or Excel formats
> [!IMPORTANT]
> This is now a read-only version. For a server-syncing functionality please switch to server-sync branch.

### Features

- **Interactive Calendar & Table Views** - Visualize team schedules in multiple formats
- **Responsive Design** - Works across desktop, tablet and mobile devices
- **Export Functionality** - Generate PDF and Excel reports
- **Static Deployment** - No server required, works completely offline
- **Fast Loading** - Optimized bundle with data pre-loaded for instant access

### Setup

```sh
# Install dependencies
bun install

# Development server
bun run dev

# Build
bun run build
```

### Configuration

This is now a static application with no configuration required. All data is bundled during the build process.

> [!NOTE]
> **Previous Server Version**: A server-enabled version with editing capabilities is available on the `server-sync` branch.

### Used Technologies

#### Frontend

- Vue 3.5 - Progressive JavaScript framework
- Vite 6 - Next generation frontend tooling with optimized bundling

#### Data & Storage

- Static JSON Data - Pre-bundled shift schedules
- LocalStorage/SessionStorage - UI state persistence
- Export Libraries - PDF and Excel generation

#### Development & Deployment

- Bun - JavaScript runtime and package manager
- ESLint/Prettier - Code quality and formatting
- GitHub Actions - CI/CD pipeline
- GitHub Pages - Static hosting and deployment

> [!NOTE]
> **Server-sync branch** Ultimate Express - fastest fork of express, based on µWebSockets
