'use client'

import { useState } from 'react'
import Header from '@/app/components/header'
import Footer from '@/app/components/footer'
import Image from 'next/image'

export default function FavoritesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    // Handle search input changes
    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <Header onSearch={handleSearch} />

            <main className="container mx-auto px-4 py-8">
                {/* Page Title */}
                <h1 className="text-3xl font-bold mb-6 text-center">
                    My Favorites
                </h1>


                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-8xl mb-8 text-blue-400">🚧</div>

                    <h2 className="text-2xl font-bold mb-4 text-blue-400">Coming Soon!</h2>

                    <div className="max-w-lg text-center">
                        <p className="text-xl text-gray-300 mb-6">
                            We&apos;re building this feature to help you keep track of all your favorite movies and shows.
                        </p>
                        <p className="text-gray-400">
                            Soon you&apos;ll be able to create and manage your personal watchlist. Stay tuned!
                        </p>
                    </div>

                    <div className="mt-10 flex gap-3">
                        <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></div>
                        <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse delay-150"></div>
                        <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse delay-300"></div>
                    </div>
                </div>
            </main>


            <Footer />
        </div>
    )
}