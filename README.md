# Tide Prediction App

A modern web application for checking tide predictions at any coastal location. Built with React, TypeScript, and Vite.

## Features

- 🌊 Real-time tide predictions from NOAA
- 📍 Location-based search with Google Maps integration
- 📊 Interactive tide chart visualization
- 🎨 Modern, responsive design with custom animations
- ⚡ Fast performance with Vite build system

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Maps API
- NOAA Tides API
- Firebase Hosting

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Google Maps API key
- NOAA API key (optional)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd tide
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Deployment

The app is configured for Firebase Hosting. To deploy:

1. Install Firebase CLI (if not already installed):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Deploy:
```bash
firebase deploy
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Submit a pull request to `main`
4. After review and merge to `main`, changes will be merged to `deploy` for deployment

## License

[Add your chosen license here]

## Acknowledgments

- NOAA for tide prediction data
- Google Maps for location services
