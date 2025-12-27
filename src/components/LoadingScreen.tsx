import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#020204] text-white">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
    );
}
