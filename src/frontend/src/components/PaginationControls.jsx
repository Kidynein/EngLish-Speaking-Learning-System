import React from 'react';
import { Pagination } from 'react-bootstrap';

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
        <Pagination className="justify-content-center">
            <Pagination.First
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
            />
            <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
            />
            {pageNumbers.map(page => (
                <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                >
                    {page}
                </Pagination.Item>
            ))}
            <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
            />
            <Pagination.Last
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
            />
        </Pagination>
    );
};

export default PaginationControls;