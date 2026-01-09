function TopicCardSkeleton() {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-full">
            <div className="animate-pulse space-y-4">
                {/* Header: Circle and Emoji placeholder */}
                <div className="flex items-center justify-between">
                    <div className="h-10 w-10 bg-slate-700 rounded-full"></div>
                    <div className="h-14 w-14 rounded-full bg-slate-700"></div>
                </div>

                {/* Title Placeholder */}
                <div className="h-6 bg-slate-700 rounded w-3/4"></div>

                {/* Progress Bar Placeholder */}
                <div className="space-y-2 pt-2">
                    <div className="w-full h-2 bg-slate-700 rounded-full"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                </div>

                {/* Button Placeholder */}
                <div className="h-10 w-full bg-slate-700 rounded-lg mt-4"></div>
            </div>
        </div>
    );
}

export default TopicCardSkeleton;
