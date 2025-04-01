"use server";

import TorrentSearchApi from 'torrent-search-api';

// Initialize providers manually instead of letting the library scan directories
const initTorrentApi = () => {
    const api = TorrentSearchApi;

    // Add providers manually
    /*
    api.enableProvider('1337x');
    api.enableProvider('ThePirateBay');
    api.enableProvider('TorrentGalaxy');
    api.enableProvider('Nyaa');
    api.enableProvider('YTS');
    api.enableProvider('Torrent9');
    */
    TorrentSearchApi.enablePublicProviders();


    return api;
};

// Create and export a singleton instance
export const torrentApi = initTorrentApi();

// Helper functions
export async function searchTorrents(query: string, category = 'All', limit = 20) {
    try {
        return await torrentApi.search(query, category, limit);
    } catch (error) {
        console.error("Torrent search failed:", error);
        return [];
    }
}

export async function getMagnet(torrent: any) {
    try {
        return await torrentApi.getMagnet(torrent);
    } catch (error) {
        console.error("Failed to get magnet link:", error);
        return null;
    }
}