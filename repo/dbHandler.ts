"use server";

import MongoClient from '@/libs/mongodb';
import { Movie } from "@/../repo/models/movie";

export async function GetAllMovies(): Promise<Movie[]> {
    try {
        await MongoClient.connect();
        const database = MongoClient.db('webflix');
        const collection = database.collection('movies');
        const rawMovies = await collection.find({}).toArray();

        // Properly serialize the MongoDB objects
        const movies = JSON.parse(JSON.stringify(rawMovies)) as Movie[];

        return movies.sort((a, b) => {
            // Get release dates, using fallbacks if undefined
            const dateA = a.release_date;
            const dateB = b.release_date;

            // Default dates if undefined
            const timeA = dateA ? new Date(dateA).getTime() : 0;
            const timeB = dateB ? new Date(dateB).getTime() : 0;

            return timeB - timeA; // Sort descending (newest first)
        });
    } catch (error) {
        console.error("Failed to fetch movies:", error);
        return [];
    } finally {
        await MongoClient.close();
    }
}

export async function GetWatchMovie(id: number): Promise<Movie> {
    try {
        await MongoClient.connect();
        const database = MongoClient.db('webflix');
        const collection = database.collection('movies');
        const rawMovies = await collection.findOne({ 'id': id });

        // Properly serialize the MongoDB objects
        const movie = JSON.parse(JSON.stringify(rawMovies)) as Movie;
        return movie;
    } catch (error) {
        console.error("Failed to fetch movies:", error);
        return {} as Movie;
    } finally {
        await MongoClient.close();
    }
}