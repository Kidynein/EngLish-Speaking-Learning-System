import React from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange, windowSize = 10 }) => {
    if (totalPages <= 1) return null;

    const startPage = Math.floor((currentPage - 1) / windowSize) * windowSize + 1;
    const endPage = Math.min(startPage + windowSize - 1, totalPages);

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    return (
        <div className="flex justify-center items-center space-x-2 mt-6">
            <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                First
            </button>
            <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            {pageNumbers.map(page => (
                <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                            ? 'text-white bg-blue-600 border border-blue-600'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {page}
                </button>
            ))}
            <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
            <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Last
            </button>
        </div>
    );
};

export default PaginationControls;