# WebFlix Streamer

A web-based streaming application built with Next.js that allows users to browse and stream movies and TV shows using WebTorrent technology.

## Features

- 🎬 Stream movies and TV shows directly in your browser
- 📺 Support for TV series with multiple seasons and episodes
- 🔍 Search functionality to easily# WebFlix Streamer
- 🎯 Responsive design that works on desktop and mobile devices
- 🖼️ Beautiful UI with movie posters and backdrop images
- 🔄 Real-time streaming
- 📱 Mobile-friendly interface

A web-based streaming application built with Next.js that allows users to browse and stream movies and TV shows using WebTorrent technology.

## Screenshots

<p align="center">
  <img src="https://webflix.renanmachado.dev.br/screenshots/home.png" alt="WebFlix Home Page" width="800">
</p>

### Showcase

| Feature | Screenshot |
|---------|------------|
| Movie Browsing | <img src="https://webflix.renanmachado.dev.br/screenshots/browse.png" alt="Browse Movies" width="400"> |
| TV Show Episodes | <img src="https://webflix.renanmachado.dev.br/screenshots/episodes.png" alt="Episode Selection" width="400"> |
| Streaming Player | <img src="https://webflix.renanmachado.dev.br/screenshots/player.png" alt="Streaming Player" width="400"> |

### Responsive Design

<div align="center">
  <img src="https://webflix.renanmachado.dev.br/screenshots/mobile.png" alt="Mobile View" width="250">
  <img src="https://webflix.renanmachado.dev.br/screenshots/tablet.png" alt="Tablet View" width="400">
</div>

## Tech Stack

- **Framework**: Next.js 15
- **UI**: React 19
- **Styling**: Tailwind CSS
- **Streaming**: WebTorrent

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Getting Node.js (v22.14) and npm (v10.9.2)

Windows -> Install Node.js (v22.14) and npm (v10.9.2):
   ```bash
   # Download and install fnm:
   winget install Schniz.fnm
   # Download and install Node.js:
   fnm install 22
   # Verify the Node.js version:
   node -v # Should print "v22.14.0".
   # Verify npm version:
   npm -v # Should print "10.9.2".
   ```

Linux -> Install Node.js (v22.14) and npm (v10.9.2):
   ```bash
   # Download and install fnm:
   curl -o- https://fnm.vercel.app/install | bash
   # Download and install Node.js:
   fnm install 22
   # Verify the Node.js version:
   node -v # Should print "v22.14.0".
   # Verify npm version:
   npm -v # Should print "10.9.2".
   ```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/webflix-streamer.git
   cd webflix-streamer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. The key for The Movie Database API is not included on this repo, you'll need to grab your own on.
   See on [The Movie Database API](https://developer.themoviedb.org/reference/intro/getting-started)

4. Fill the `.env` file in the root directory with your api key and url environment.

5. Start the development server:
   ```bash
   npm dev
   ```

6. Open [http://localhost:PORT](http://localhost:PORT) with your browser to see the application.


## Project Structure

```
webflix-streamer/
├── src/
│   ├── app/             # Next.js app directory
│   │   ├── components/  # React components
│   │   ├── movie/       # Movies Page
│   │   ├── tv/          # Tv Shows Page
│   │   ├── watch/       # Watch page for streaming content
│   │   └── page.tsx     # Home page
│   └── pages/             
│       └── api/         # API Routes
├── repo/                # Content repository
│   ├── models/          
│   │    └── movie.ts    #Content models 
│   └── tmdbApi.ts       #The Movie Database API calls
├── public/              # Static assets
├── .env                 # Environment variables
└── package.json         # Project dependencies
```

## Important Notes

- This project uses WebTorrent for streaming, which means it streams from torrent sources.
- Please ensure you comply with copyright laws in your jurisdiction when using this application.


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.