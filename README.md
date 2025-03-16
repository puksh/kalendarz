# Calendar in Vue

[![GitHub Pages](https://github.com/puksh/vueCalendar/actions/workflows/buildWebsite.yml/badge.svg)](https://github.com/puksh/vueCalendar/actions/workflows/buildWebsite.yml)

![image](https://github.com/user-attachments/assets/48a6fdfa-c5b4-431f-8b49-332e7926dae6)


## Overview

This project is a calendar application built with Vue.js. It allows users to view and manage a harmonogram (schedule) for a team. The application supports both viewing and editing modes, with editing mode requiring a secure password for authorization.

## Features

- **View Harmonogram**: Users can view the harmonogram for the current month, including shifts for different team members.
- **Edit Harmonogram**: Authorized users can edit the harmonogram by dragging and dropping team members into shift slots.
- **Secure Authorization**: Editing the harmonogram requires entering a secure password.
- **Responsive Design**: The application is designed to be responsive and works well on both desktop and mobile devices.
- **Service Worker**: The application includes a service worker for offline support.
- **Notifications**: Users receive notifications for actions such as successful updates or errors.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Usage

1. **Viewing the Harmonogram**:
   - Open the application in your browser.
   - The default view shows the harmonogram for the current month.
   - Use the navigation buttons to switch between months.

2. **Editing the Harmonogram**:
   - Click on the "Ustawienia" (Settings) button in the sidebar.
   - Enable "Tryb edytowania" (Editing Mode) by toggling the switch.
   - Navigate back to the harmonogram.
   - Drag and drop team members into the desired shift slots.
   - Click the "Zapisz" (Save) button to save changes.
   - Enter the secure password when prompted to authorize the changes.

3. **Syncing Data**:
   - The application automatically syncs data with the server.
   - Click the refresh button to manually sync data.

## Environment Variables

The application uses the following environment variables for secure operations:

- `VITE_AUTH_PASSWORD`: The secure password for authorizing changes.
- `VITE_API_URL`: The URL of the API for fetching and updating harmonogram data.

## Used Technologies

- **Vue.js**: The progressive JavaScript framework used for building the user interface.
- **Vite**: Next generation frontend tooling for faster builds and hot module replacement.
- **ESLint**: Tool for identifying and fixing linting issues in the codebase.
- **Prettier**: Code formatter to ensure consistent code style.
- **Service Workers**: For enabling offline support and caching.
- **GitHub Actions**: For continuous integration and deployment workflows.
