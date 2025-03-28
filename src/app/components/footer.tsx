export default function Footer() {
    return (
        <footer className="text-center py-6 text-gray-500 text-sm mt-12 border-t border-gray-800">
            <p>© {new Date().getFullYear()} WebFlix Streamer. All rights reserved.</p>
        </footer>
    );
}