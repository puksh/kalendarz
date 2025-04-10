# Vue Calendar - Team Scheduling App

[![GitHub Pages](https://github.com/puksh/vueCalendar/actions/workflows/buildWebsite.yml/badge.svg)](https://github.com/puksh/vueCalendar/actions/workflows/buildWebsite.yml)

A drag-and-drop team scheduling application built with Vue 3 for managing team member shifts with a clean, responsive interface.

### 📖 Usage Guide

1. View Mode: Navigate between months and review existing schedules
2. Edit Mode: In Calendar view - toggle edit mode, drag team members to shifts, click occupied slots to clear OR in table view - select certain shifts
3. Save Changes: Click the save button, authenticate with a password
4. Data Sync: Click the refresh button to manually synchronize with server

### ✨ Features

- interactive calendar & table Views - Visualize team schedules in multiple formats
- drag & drop Interface - Easily assign team members to shifts in editing mode
- responsive design - Works across desktop and tablet devices
- authentication - Password protection for schedule changes
- data synchronization - Automatically sync with remote data source

### 🚀 Project Setup

```sh
# Install dependencies
bun install

# Development server
bun run dev

# Build
bun run build
```

### 🔧 Configuration

Two environment variables control secure operations

- `VITE_AUTH_PASSWORD`: The secure password for authorizing changes.
- `VITE_API_URL`: The URL of the API for fetching and updating harmonogram data.

### 🛠️ Used Technologies

#### Frontend

- Vue 3.5 - Progressive JavaScript framework
- Vite 6 - Next generation frontend tooling

#### Backend Integration

- Fetch API - Data synchronization
- CryptoJS - Secure authentication
- LocalStorage/SessionStorage - Offline data persistence

#### Development & Deployment

- Bun - JavaScript runtime and package manager
- ESLint/Prettier - Code quality and formatting
- GitHub Actions - CI/CD pipeline
- GitHub Pages - hosting and deployment
