# Seattle Hotels

A modern web application for exploring hotels in Seattle with an interactive map interface.

## Features

- Interactive Mapbox map with hotel markers
- Hotel clustering for better visualization
- Search and filter functionality
- Responsive design with modern UI
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
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd seattle-hotel-explorer

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
   
   Note: Copy the format from `.env.example` if available.
3. Start the development server and explore Seattle hotels!

## Project Structure

```
src/
├── components/     # React components
├── data/          # Hotel data (JSON)
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
└── ui/            # shadcn-ui components
```

## Deployment

Build the project for production:

```sh
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.
