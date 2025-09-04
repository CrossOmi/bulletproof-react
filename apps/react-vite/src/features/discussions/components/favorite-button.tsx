import { clsx } from 'clsx';
import React from 'react';

// Star icon component (inline SVG)
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Define the props interface based on the test
interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: () => void;
}

/**
 * FavoriteButton Component
 * Renders a star icon button that changes style based on the isFavorite prop.
 * Calls the onClick handler when clicked.
 */
export const FavoriteButton = ({
  isFavorite,
  onClick,
}: FavoriteButtonProps) => {
  return (
    <button
      onClick={onClick}
      // This aria-label satisfies the test query: screen.getByRole('button', { name: /favorite/i })
      aria-label="Toggle Favorite"
      // Conditionally apply classes based on the isFavorite prop to pass the visual tests
      className={clsx(
        'transition-colors duration-200', // Add a smooth transition effect
        isFavorite ? 'text-yellow-500' : 'text-gray-400',
      )}
    >
      <StarIcon
        className={clsx(
          'h-5 w-5',
          // Also apply a fill color when favorited for better visual feedback
          isFavorite ? 'fill-yellow-400' : 'fill-none',
        )}
      />
    </button>
  );
};
