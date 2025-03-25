import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ onSearch }: { onSearch: (query: string) => void }) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <header className="bg-black shadow-md sticky top-0 z-10">
            <div className="container mx-auto py-6">
                <div className="flex flex-col md:flex-row items-center justify-between h-full md:px-10">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-white">
                            Webflix
                        </Link>
                    </div>

                    <nav className="block py-4">
                        <ul className="flex space-x-4">
                            <li>
                                <Link
                                    href="/"
                                    className={`text-white hover:text-gray-300 transition-colors relative ${isActive('/') ? 'font-medium' : ''
                                        }`}
                                >
                                    Home
                                    {isActive('/') && (
                                        <span className="absolute bottom-[-10px] left-0 right-0 h-0.5 bg-white rounded-full"></span>
                                    )}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/movies"
                                    className={`text-white hover:text-gray-300 transition-colors relative ${isActive('/movies') ? 'font-medium' : ''
                                        }`}
                                >
                                    Movies
                                    {isActive('/movies') && (
                                        <span className="absolute bottom-[-10px] left-0 right-0 h-0.5 bg-white rounded-full"></span>
                                    )}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/movies"
                                    className={`text-white hover:text-gray-300 transition-colors relative ${isActive('/movies') ? 'font-medium' : ''
                                        }`}
                                >
                                    TV Shows
                                    {isActive('/movies') && (
                                        <span className="absolute bottom-[-10px] left-0 right-0 h-0.5 bg-white rounded-full"></span>
                                    )}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/favorites"
                                    className={`text-white hover:text-gray-300 transition-colors relative ${isActive('/favorites') ? 'font-medium' : ''
                                        }`}
                                >
                                    Favorites
                                    {isActive('/favorites') && (
                                        <span className="absolute bottom-[-10px] left-0 right-0 h-0.5 bg-white rounded-full"></span>
                                    )}
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    <div className="flex items-center">
                        <div className="relative md:block">
                            <input
                                type="search"
                                placeholder="Search movies..."
                                className="bg-gray-800 text-white px-4 py-1 rounded-full focus:outline-none focus:ring-1 focus:ring-white"
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}