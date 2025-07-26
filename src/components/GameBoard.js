// import React from 'react';
// import PlayerZone from './PlayerZone';
// import Card from './Card'; // Use card UI for discard pile
// import { getCardName } from '../utils/deckUtils';
// import { calculateHandSum } from '../utils/gameHelpers';

// const suitEmojiMap = {
//   Hearts: "♥️",
//   Diamonds: "♦️",
//   Clubs: "♣️",
//   Spades: "♠️",
// };

// const GameBoard = ({
//   currentGame,
//   userId,
//   isMyTurn,
//   startGame,
//   playCards,
//   callShow,
//   resetRound,
//   leaveGame,
//   selectedCards,
//   toggleCardSelection
// }) => {
//   const currentPlayer = currentGame?.players.find(p => p.id === userId);
//   const otherPlayers = currentGame?.players.filter(p => p.id !== userId);
//   const topCard = currentGame?.discardPile?.[currentGame.discardPile.length - 1];

//   return (
//     <div className="space-y-8">
//       {/* Game Info */}
//       <div className="bg-gray-700 p-6 rounded-lg shadow-inner border border-gray-600">
//         <h2 className="text-2xl font-bold mb-4 text-center text-indigo-300">
//           Game ID: <span className="font-mono text-indigo-200">{currentGame.gameId}</span>
//         </h2>
//         <p className="text-center text-gray-300 mb-4">Status: <span className="font-semibold capitalize">{currentGame.status.replace('_', ' ')}</span></p>
//         <p className="text-center text-gray-400 text-sm mb-4">Last Action: {currentGame.lastAction}</p>
//         <p className="text-center text-gray-400 text-sm mb-4">Current Round: {currentGame.roundNumber}</p>

//         {currentGame.status === 'playing' && (
//           <p className="text-center text-xl font-bold text-yellow-300 mb-4">
//             {isMyTurn ? "It's your turn!" : `It's ${currentGame.players.find(p => p.id === currentGame.currentTurnPlayerId)?.name}'s turn.`}
//           </p>
//         )}
//       </div>

//       {/* Other Players */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {otherPlayers.map((player) => (
//           <PlayerZone
//             key={player.id}
//             player={player}
//             isSelf={false}
//             isCurrentTurn={player.id === currentGame.currentTurnPlayerId}
//           />
//         ))}
//       </div>

//       {/* Discard Pile */}
//       <div className="bg-gray-700 p-4 rounded-lg shadow-inner border border-gray-600 text-center">
//         <h3 className="text-xl font-semibold mb-2 text-indigo-300">Discard Pile</h3>
//         {topCard ? (
//           <div className="flex justify-center items-center gap-4">
//             <span className="text-lg font-bold text-white">Top Card:</span>
//             <Card
//               value={topCard.rank}
//               suit={topCard.suit}
//               disabled={true}
//             />
//           </div>
//         ) : (
//           <p className="text-gray-400">Discard pile is empty.</p>
//         )}
//       </div>

//       {/* Your Hand */}
//       {currentPlayer && currentPlayer.hand.length > 0 && (
//         <PlayerZone
//           player={currentPlayer}
//           isSelf={true}
//           isCurrentTurn={isMyTurn}
//           onCardClick={(card) =>
//             isMyTurn && currentGame.status === 'playing' && toggleCardSelection(card)
//           }
//           selectedCards={selectedCards}
//         />
//       )}

//       {/* Action Buttons */}
//       <div className="flex flex-wrap justify-center gap-4">
//         {currentGame.hostId === userId && currentGame.status === 'waiting' && (
//           <button
//             onClick={startGame}
//             className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
//           >
//             Start Game
//           </button>
//         )}

//         {isMyTurn && currentGame.status === 'playing' && (
//           <>
//             <button
//               onClick={playCards}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
//             >
//               Play Selected Card(s) / Draw
//             </button>

//             <button
//               onClick={callShow}
//               className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
//             >
//               Call "Show"
//             </button>
//           </>
//         )}

//         {currentGame.hostId === userId && currentGame.status === 'show_called' && (
//           <button
//             onClick={resetRound}
//             className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
//           >
//             Start New Round
//           </button>
//         )}

//         <button
//           onClick={leaveGame}
//           className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
//         >
//           Leave Game
//         </button>
//       </div>
//     </div>
//   );
// };

// export default GameBoard;
// import React from 'react';
// import PlayerZone from './PlayerZone';
// import Card from './Card';
// import { getCardName } from '../utils/deckUtils';
// import { calculateHandSum } from '../utils/gameHelpers';

// const GameBoard = ({
//   currentGame,
//   userId,
//   isMyTurn,
//   startGame,
//   playCards,
//   callShow,
//   resetRound,
//   leaveGame,
//   selectedCards,
//   toggleCardSelection
// }) => {
//   const currentPlayer = currentGame?.players.find(p => p.id === userId);
//   const otherPlayers = currentGame?.players.filter(p => p.id !== userId);
//   const topCard = currentGame?.discardPile?.[currentGame.discardPile.length - 1];

//   // Layout grid classes based on number of players
//   const getPlayerLayout = () => {
//     const n = otherPlayers.length;
//     if (n === 1) return "grid grid-cols-1 justify-items-center";
//     if (n === 2) return "grid grid-cols-2 gap-4 justify-items-center";
//     if (n === 3) return "grid grid-cols-2 md:grid-cols-3 gap-4 justify-items-center";
//     if (n === 4) return "grid grid-cols-2 md:grid-cols-2 gap-4 justify-items-center";
//     return "flex flex-wrap justify-center gap-4";
//   };

//   return (
//     <div className="space-y-8 px-4 pb-10">
//       {/* Game Info */}
//       <div className="bg-gray-700 p-6 rounded-lg shadow-inner border border-gray-600">
//         <h2 className="text-2xl font-bold mb-4 text-center text-indigo-300">
//           Game ID: <span className="font-mono text-indigo-200">{currentGame.gameId}</span>
//         </h2>
//         <p className="text-center text-gray-300 mb-2">
//           Status: <span className="font-semibold capitalize">{currentGame.status.replace('_', ' ')}</span>
//         </p>
//         <p className="text-center text-gray-400 text-sm mb-1">Last Action: {currentGame.lastAction}</p>
//         <p className="text-center text-gray-400 text-sm mb-2">Current Round: {currentGame.roundNumber}</p>
//         {currentGame.status === 'playing' && (
//           <p className="text-center text-xl font-bold text-yellow-300 mb-2">
//             {isMyTurn ? "It's your turn!" : `It's ${currentGame.players.find(p => p.id === currentGame.currentTurnPlayerId)?.name}'s turn.`}
//           </p>
//         )}
//       </div>

//       {/* Other Players */}
//       <div className={getPlayerLayout()}>
//         {otherPlayers.map((player) => (
//           <PlayerZone
//             key={player.id}
//             player={player}
//             isSelf={false}
//             isCurrentTurn={player.id === currentGame.currentTurnPlayerId}
//           />
//         ))}
//       </div>

//       {/* Discard Pile */}
//       <div className="bg-gray-700 p-4 rounded-lg shadow-inner border border-gray-600 text-center max-w-md mx-auto">
//         <h3 className="text-xl font-semibold mb-2 text-indigo-300">Discard Pile</h3>
//         {topCard ? (
//           <div className="flex justify-center items-center gap-3">
//             <span className="text-lg font-bold text-white">Top Card:</span>
//             <Card value={topCard.rank} suit={topCard.suit} disabled />
//           </div>
//         ) : (
//           <p className="text-gray-400">Discard pile is empty.</p>
//         )}
//       </div>

//       {/* Current Player Hand */}
//       {currentPlayer && currentPlayer.hand.length > 0 && (
//         <div className="bg-gray-700 p-4 rounded-lg shadow-inner border border-gray-600">
//           <PlayerZone
//             player={currentPlayer}
//             isSelf={true}
//             isCurrentTurn={isMyTurn}
//             onCardClick={(card) =>
//               isMyTurn && currentGame.status === 'playing' && toggleCardSelection(card)
//             }
//             selectedCards={selectedCards}
//           />
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="flex flex-wrap justify-center gap-4">
//         {currentGame.hostId === userId && currentGame.status === 'waiting' && (
//           <button
//             onClick={startGame}
//             className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
//           >
//             Start Game
//           </button>
//         )}

//         {isMyTurn && currentGame.status === 'playing' && (
//           <>
//             <button
//               onClick={playCards}
//               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
//             >
//               Play Selected Card(s) / Draw
//             </button>

//             <button
//               onClick={callShow}
//               className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
//             >
//               Call "Show"
//             </button>
//           </>
//         )}

//         {currentGame.hostId === userId && currentGame.status === 'show_called' && (
//           <button
//             onClick={resetRound}
//             className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
//           >
//             Start New Round
//           </button>
//         )}

//         <button
//           onClick={leaveGame}
//           className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
//         >
//           Leave Game
//         </button>
//       </div>
//     </div>
//   );
// };

// export default GameBoard;
import React from 'react';
import PlayerZone from './PlayerZone';
import Card from './Card';
import { getCardName } from '../utils/deckUtils';
import { calculateHandSum } from '../utils/gameHelpers';

const GameBoard = ({
  currentGame,
  userId,
  isMyTurn,
  startGame,
  playCards,
  callShow,
  resetRound,
  leaveGame,
  selectedCards,
  toggleCardSelection
}) => {
  const currentPlayer = currentGame?.players.find(p => p.id === userId);
  const otherPlayers = currentGame?.players.filter(p => p.id !== userId);
  const topCard = currentGame?.discardPile?.[currentGame.discardPile.length - 1];

  return (
    <div className="relative p-4">

      {/* Top Right Floating Scores */}
      <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg shadow-lg border border-gray-600 z-50 w-64">
        <h3 className="text-indigo-400 font-bold mb-2 text-center">🏆 Scores</h3>
        <ul className="space-y-1">
          {currentGame.players.map((player) => (
            <li key={player.id} className="flex justify-between items-center text-white text-sm">
              <span className="font-semibold">
                {player.id === userId ? "You" : player.name}
                {player.id === currentGame.currentTurnPlayerId && " 🟢"}
              </span>
              <span className="text-yellow-300 font-bold">{player.score}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Game Info */}
      <div className="bg-gray-700 p-6 rounded-lg shadow-inner border border-gray-600 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-300">
          Game ID: <span className="font-mono text-indigo-200">{currentGame.gameId}</span>
        </h2>
        <p className="text-center text-gray-300 mb-4">Status: <span className="font-semibold capitalize">{currentGame.status.replace('_', ' ')}</span></p>
        <p className="text-center text-gray-400 text-sm mb-2">Last Action: {currentGame.lastAction}</p>
        <p className="text-center text-gray-400 text-sm mb-2">Current Round: {currentGame.roundNumber}</p>

        {currentGame.status === 'playing' && (
          <p className="text-center text-xl font-bold text-yellow-300 mb-2">
            {isMyTurn ? "It's your turn!" : `It's ${currentGame.players.find(p => p.id === currentGame.currentTurnPlayerId)?.name}'s turn.`}
          </p>
        )}
      </div>

      {/* Other Players */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {otherPlayers.map((player) => (
          <PlayerZone
            key={player.id}
            player={player}
            isSelf={false}
            isCurrentTurn={player.id === currentGame.currentTurnPlayerId}
          />
        ))}
      </div>

      {/* Discard Pile */}
      <div className="bg-gray-700 p-4 rounded-lg shadow-inner border border-gray-600 text-center mb-4">
        <h3 className="text-xl font-semibold mb-2 text-indigo-300">Discard Pile</h3>
        {topCard ? (
          <div className="flex justify-center items-center gap-4">
            <span className="text-lg font-bold text-white">Top Card:</span>
            <Card
              value={topCard.rank}
              suit={topCard.suit}
              disabled={true}
            />
          </div>
        ) : (
          <p className="text-gray-400">Discard pile is empty.</p>
        )}
      </div>

      {/* Current Player Hand */}
      {currentPlayer && currentPlayer.hand.length > 0 && (
        <div>
          <PlayerZone
            player={currentPlayer}
            isSelf={true}
            isCurrentTurn={isMyTurn}
            onCardClick={(card) =>
              isMyTurn && currentGame.status === 'playing' && toggleCardSelection(card)
            }
            selectedCards={selectedCards}
          />
          <div className="text-right mr-4 mt-2 text-indigo-300 font-semibold text-sm">
            Current Hand Sum: {calculateHandSum(currentPlayer.hand)}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {currentGame.hostId === userId && currentGame.status === 'waiting' && (
          <button
            onClick={startGame}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
          >
            Start Game
          </button>
        )}

        {isMyTurn && currentGame.status === 'playing' && (
          <>
            <button
              onClick={playCards}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
            >
              Play Selected Card(s) / Draw
            </button>

            <button
              onClick={callShow}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
            >
              Call "Show"
            </button>
          </>
        )}

        {currentGame.hostId === userId && currentGame.status === 'show_called' && (
          <button
            onClick={resetRound}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
          >
            Start New Round
          </button>
        )}

        <button
          onClick={leaveGame}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
        >
          Leave Game
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
