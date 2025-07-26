import React from 'react';

const PlayerCard = ({ card, isSelected, onClick, isPlayable }) => {
  // Defensive check: If 'card' prop is undefined or null, don't try to render its properties.
  // This prevents the "Cannot read properties of undefined (reading 'rank')" error.
  if (!card) {
    console.warn("PlayerCard received an invalid or undefined card prop. Skipping render.");
    return null; // Render nothing if the card data is missing
  }

  return (
    <div
      className={`
        bg-white text-gray-900 p-3 rounded-md shadow-md cursor-pointer
        ${isSelected ? 'border-4 border-yellow-500' : 'border border-gray-300'}
        ${!isPlayable ? 'opacity-70 cursor-not-allowed' : ''}
      `}
      onClick={onClick}
    >
      <p className="font-bold text-lg">{card.rank}</p>
      <p className="text-sm">{card.suit}</p>
      <p className="text-xs text-gray-600">({card.value})</p>
    </div>
  );
};

export default PlayerCard;
