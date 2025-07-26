// // src/components/PlayerZone.js
// import React from "react";
// import Card from "./Card";

// const PlayerZone = ({
//   player,
//   isSelf,
//   isCurrentTurn,
//   onCardClick = () => {},
//   selectedCards = [],
// }) => {
//   return (
//     <div
//       className={`p-4 rounded-lg border ${
//         isCurrentTurn ? "border-yellow-400" : "border-gray-600"
//       } mb-4`}
//     >
//       <h2 className="text-lg font-semibold text-white mb-2">
//         {isSelf ? "You" : player.name}
//         {isCurrentTurn && (
//           <span className="ml-2 text-yellow-300 text-sm">🟢 Your Turn</span>
//         )}
//       </h2>

//       <div className="flex flex-wrap gap-2">
//         {isSelf
//           ? player.hand.map((card, index) => (
//               <Card
//                 key={index}
//                 value={card.rank}
//                 suit={card.suit}
//                 onClick={() => onCardClick(card)}
//                 isSelected={selectedCards.some(
//                   (sel) => sel.rank === card.rank && sel.suit === card.suit
//                 )}
//               />
//             ))
//           : player.hand.map((_, index) => (
//               <div
//                 key={index}
//                 className="w-[80px] h-[120px] bg-gray-700 rounded-md shadow-inner"
//               />
//             ))}
//       </div>
//     </div>
//   );
// };

// export default PlayerZone;
// src/components/PlayerZone.js
import React from "react";
import Card from "./Card";

const PlayerZone = ({
  player,
  isSelf,
  isCurrentTurn,
  onCardClick = () => {},
  selectedCards = [],
  revealedHand = null,
}) => {
  return (
    <div className={`p-4 rounded-lg border ${isCurrentTurn ? "border-yellow-400" : "border-gray-600"} bg-gray-800`}>
      <h2 className="text-lg font-semibold text-white mb-1">
        {isSelf ? "You" : player.name}
        {isCurrentTurn && <span className="ml-2 text-yellow-300 text-sm">🟢 Your Turn</span>}
      </h2>
      <p className="text-sm text-gray-400">Score: {player.score}</p>

      <div className="flex flex-wrap gap-2 mt-2">
        {isSelf
          ? player.hand.map((card, index) => (
              <Card
                key={index}
                value={card.rank}
                suit={card.suit}
                onClick={() => onCardClick(card)}
                isSelected={selectedCards.some(sel => sel.rank === card.rank && sel.suit === card.suit)}
              />
            ))
          : player.hand.map((_, index) => (
              <div key={index} className="w-[80px] h-[120px] bg-gray-700 rounded-md shadow-inner" />
            ))}
      </div>

      {/* Show revealed hand if present */}
      {revealedHand && (
        <div className="mt-2">
          <p className="text-sm text-yellow-300 font-semibold">Revealed Hand:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {revealedHand.hand.map((card, idx) => (
              <span key={idx} className="bg-gray-900 text-white text-xs px-2 py-1 rounded-sm">
                {card.rank} {card.suit}
              </span>
            ))}
          </div>
          <p className="text-sm font-bold mt-1 text-yellow-200">Sum: {revealedHand.sum}</p>
        </div>
      )}
    </div>
  );
};

export default PlayerZone;
