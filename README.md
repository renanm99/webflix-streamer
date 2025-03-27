# WebFlix Streamer

A web-based streaming application built with Next.js that allows users to browse and stream movies and TV shows using WebTorrent technology.

## Features

- 🎬 Stream movies and TV shows directly in your browser
- 📺 Support for TV series with multiple seasons and episodes
- 🔍 Search functionality to easily find content
- 🎯 Responsive design that works on desktop and mobile devices
- 🖼️ Beautiful UI with movie posters and backdrop images
- 🔄 Real-time streaming with adaptive quality
- 📱 Mobile-friendly interface

## Tech Stack

- **Framework**: Next.js 15
- **UI**: React 19
- **Styling**: Tailwind CSS
- **Streaming**: WebTorrent
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

- ### Install Node.js (v22.14) and npm (v10.9.2)

1. Clone the repository:
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

3. Create an `.env` file in the root directory with the following variables: (I'm using The Movie Database to retrive movie posters)
   ```
   NEXT_PUBLIC_URL_PATH=https://image.tmdb.org/t/p/w500
   ```

4. Start the development server:
   ```bash
   npm dev
   ```

5. Open [http://localhost:PORT](http://localhost:PORT) with your browser to see the application.

## Project Structure

```
webflix-streamer/
├── src/
│   ├── app/             # Next.js app directory
│   │   ├── components/  # React components
│   │   ├── watch/       # Watch page for streaming content
│   │   └── page.tsx     # Home page
│   ├── api/             # API routes
│   └── styles/          # CSS styles
├── repo/                # Content repository (not included in git)
├── public/              # Static assets
├── .env                 # Environment variables
└── package.json         # Project dependencies
```

## Important Notes

- The `repo` directory is not included in the repository. it can be customized with your own private media database.
- This project uses WebTorrent for streaming, which means it streams from torrent sources.
- Please ensure you comply with copyright laws in your jurisdiction when using this application.

## Development

- Run development server: `pnpm dev`
- Build for production: `pnpm build`
- Start production server: `pnpm start`
- Lint code: `pnpm lint`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
