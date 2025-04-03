import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header({ onSearch }: { onSearch: (query: string) => void }) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <header className="bg-gradient-to-b from-black to-gray-900/95 shadow-lg sticky top-0 z-10 backdrop-blur-sm">
            <div className="container mx-auto py-4">
                <div className="flex flex-col md:flex-row items-center justify-between h-full px-4 md:px-6">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-white flex items-center">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="mr-2"
                            />
                            <span className="text-blue-500 mr-1">Web</span>Flix
                        </Link>
                    </div>

                    <nav className="block py-3">
                        <ul className="flex space-x-6">
                            <li>
                                <Link
                                    href="/"
                                    className={`text-white hover:text-blue-400 transition-colors relative ${isActive('/') ? 'font-medium' : ''
                                        }`}
                                >
                                    Home
                                    {isActive('/') && (
                                        <span className="absolute bottom-[-6px] left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
                                    )}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/movies"
                                    className={`text-white hover:text-blue-400 transition-colors relative ${isActive('/movies') ? 'font-medium' : ''
                                        }`}
                                >
                                    Movies
                                    {isActive('/movies') && (
                                        <span className="absolute bottom-[-6px] left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
                                    )}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/tv"
                                    className={`text-white hover:text-blue-400 transition-colors relative ${isActive('/tv') ? 'font-medium' : ''
                                        }`}
                                >
                                    TV Shows
                                    {isActive('/tv') && (
                                        <span className="absolute bottom-[-6px] left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
                                    )}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/favorites"
                                    className={`text-white hover:text-blue-400 transition-colors relative ${isActive('/favorites') ? 'font-medium' : ''
                                        }`}
                                >
                                    Favorites
                                    {isActive('/favorites') && (
                                        <span className="absolute bottom-[-6px] left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
                                    )}
                                </Link>
                            </li>
                        </ul>
                    </nav>


                    <div className="flex items-center">
                        <div className="relative md:block">
                            <input
                                type="search"
                                placeholder={`${isActive('/movies') ? "Search movies..." : isActive('/tv') ? "Search TV shows..." : "Search favorites..."}`}
                                className={`bg-gray-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-gray-700 ${isActive('/watch') || isActive('/') ? "opacity-0" : ""}`}
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}