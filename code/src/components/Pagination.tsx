import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const renderPageButton = (page: number) => (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      className={`px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                transition-colors duration-200
                ${currentPage === page 
                  ? 'bg-primary-dark text-white dark:bg-primary-light' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
    >
      {page}
    </button>
  );

  const renderEllipsis = () => (
    <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
  );

  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at the start
      if (currentPage <= 2) {
        end = 4;
      }
      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 my-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                 hover:bg-primary-dark hover:text-white dark:hover:bg-primary-light
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-200"
      >
        Previous
      </button>
      
      {getVisiblePages().map((page, index) => 
        page === '...' ? renderEllipsis() : renderPageButton(page as number)
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                 hover:bg-primary-dark hover:text-white dark:hover:bg-primary-light
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-200"
      >
        Next
      </button>
    </div>
  );
}; 