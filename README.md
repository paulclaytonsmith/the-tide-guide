# 🌊 The Tide Guide

A web application for checking tide predictions at any location near a NOAA tide station. Built with React, TypeScript, and Vite, this app provides real-time tide data with an interactive visualization.

## ✨ Features

- 🌊 **Real-time Tide Predictions**
  - Accurate data from NOAA's tide prediction service
  - Support for locations worldwide
  - 24-hour tide forecasts

- 📍 **Smart Location Search**
  - Google Maps integration for precise location selection
  - Automatic nearest station detection

- 📊 **Interactive Visualization**
  - Beautiful, responsive tide charts
  - Animated tide level indicators
  - Time-based navigation
  - Custom tooltips with detailed information

- 🎨 **Modern Design**
  - Clean, minimalist interface
  - Custom animations and transitions
  - Responsive layout for all devices
  - Dark/light mode support

## 🛠 Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: 
  - Tailwind CSS
  - Custom animations with Framer Motion
- **APIs**: 
  - Google Maps JavaScript API
  - NOAA CO-OPS API
- **Hosting**: Firebase

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Maps API key
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/paulclaytonsmith/the-tide-guide
   cd tide
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Add your API keys
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   Visit `http://localhost:5173` to see the app.

## 📦 Building for Production

1. Create a production build:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

## 🚢 Deployment

The app is configured for Firebase Hosting deployment:

1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (first time only):
   ```bash
   firebase init hosting
   ```

4. Deploy:
   ```bash
   firebase deploy
   ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

### Branch Structure

- `main`: Primary development branch
- `deploy`: Production deployment branch
- Feature branches: `feature/feature-name`
- Hotfix branches: `hotfix/fix-name`

## 📝 Development Guidelines

- Use TypeScript strictly - no `any` types
- Follow ESLint configuration
- Write unit tests for new features
- Follow the existing code style
- Update documentation as needed

## 🔑 API Keys Setup

### Google Maps API
1. Visit Google Cloud Console
2. Create a new project
3. Enable Maps JavaScript API
4. Create credentials
5. Add to your `.env` file

### NOAA CO-OPS API
- No API key required
- Rate limited to 1 request per 3 seconds

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- [NOAA CO-OPS API](https://tidesandcurrents.noaa.gov/api/) for tide prediction data
- [Google Maps Platform](https://developers.google.com/maps) for location services
- [Founders Grotesk](https://klim.co.nz/retail-fonts/founders-grotesk/) font family by Klim Type Foundry

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Made with ❤️ by [Your Name]
