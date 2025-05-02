# Development Guide

This document outlines the setup process and development workflow for The Tide Guide project.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- Google Maps API key
- Chrome browser (for development tools)

## Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/paulclaytonsmith/the-tide-guide.git
   cd the-tide-guide
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your API keys
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. **Google Maps API Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable required APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API
   - Create API key with restrictions:
     - Website restrictions:
       - `localhost:*` (for development)
       - `https://the-tide-f87c8.web.app/*` (for production)

## Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`

2. **Start Browser Tools**
   ```bash
   # Terminal 1: Start browser tools server (handles Chrome extension communication)
   npx @agentdeskai/browser-tools-server@1.2.0  # Runs on port 3025

   # Terminal 2: Start MCP server (handles Cursor communication)
   npx @agentdeskai/browser-tools-mcp@1.2.0
   ```

3. **Chrome Extension Setup**
   - Install the AgentDesk Browser Tools extension
   - Connect to localhost:3025
   - Enable developer mode if needed

## Branch Structure

- `main` - Primary development branch
- `deploy` - Production deployment branch
- Feature branches: `feature/feature-name`
- Hotfix branches: `hotfix/fix-name`

## Building and Testing

1. **Create Production Build**
   ```bash
   npm run build
   ```

2. **Preview Production Build**
   ```bash
   npm run preview
   ```

3. **Run Linting**
   ```bash
   npm run lint
   ```

## Deployment

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

## Common Development Tasks

### Adding New Components

1. Create component in `src/components/`
2. Follow TypeScript strict typing
3. Add styles using Tailwind CSS
4. Import and use in parent component

### Working with Maps API

1. All map-related code is in `src/components/Location/`
2. Use the `loadGoogleMaps()` function for initialization
3. API key is automatically loaded from environment variables

### Updating Tide Data

1. NOAA API integration is in `src/lib/noaa.ts`
2. No API key required for NOAA
3. Rate limited to 1 request per 3 seconds

## Debugging Tools

### Browser Console Commands
```javascript
// Clear all logs
console.clear()

// Monitor network requests
console.table(performance.getEntriesByType('resource'))

// Check Google Maps loading
window.google?.maps ? 'Maps loaded' : 'Maps not loaded'
```

### MCP Browser Tools

Available commands:
- `getConsoleLogs()` - View console logs
- `getConsoleErrors()` - View console errors
- `getNetworkLogs()` - View network requests
- `getNetworkErrors()` - View network errors
- `takeScreenshot()` - Capture current view
- `runAccessibilityAudit()` - Check accessibility
- `runPerformanceAudit()` - Check performance
- `runSEOAudit()` - Check SEO
- `runBestPracticesAudit()` - Check best practices

## Common Issues and Solutions

### Google Maps Not Loading
1. Check API key in `.env`
2. Verify API restrictions in Google Cloud Console
3. Check browser console for specific errors
4. Ensure all required APIs are enabled

### NOAA API Rate Limiting
1. Implement request throttling
2. Cache responses when possible
3. Use initial tide data during loading

### Type Errors
1. Run `tsc` to check all types
2. Ensure strict mode is enabled
3. Check for recent dependency updates

## Additional Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [NOAA CO-OPS API Documentation](https://tidesandcurrents.noaa.gov/api/)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Vite Documentation](https://vitejs.dev/) 