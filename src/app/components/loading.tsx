interface LoadingProps {
    text?: string; // Optional prop
}

export default function Loading({ text }: LoadingProps) {
    return (
        <div className="flex items-center justify-center w-full py-20">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-lg text-gray-300">{text || "Loading movies..."}</p>
            </div>
        </div>
    );
}