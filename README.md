# Seattle Hotel Discovery Map

A web application for exploring hotels in Seattle with an interactive map interface.

## Features

- Interactive Mapbox map with hotel markers
- Hotel clustering for better visualization
- Search and filter functionality
- Responsive design with UI components
- Real-time hotel data display

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- Tailwind CSS
- Mapbox GL JS

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone git@github.com:owenvellegas/hotel_discovery_map.git

# Step 2: Navigate to the project directory
cd hotel_discovery_map

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm run dev
```

### Setup

1. Get a Mapbox access token from [Mapbox](https://www.mapbox.com/)
2. Create a `.env` file in the project root and add your token:
   ```
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   ```
   
3. Start the development server

## Project Structure

```
src/
├── components/     # React components
├── data/          # Hotel data (JSON)
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
└── pages/         # Page components
```

