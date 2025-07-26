import React from 'react';
import PlayerCard from './PlayerCard'; // Import the PlayerCard component
import { getCardName} from '../utils/deckUtils'; // Assuming these are in utils
import {calculateHandSum} from '../utils/gameHelpers'
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

  return (
    <div className="space-y-8">
      <div className="bg-gray-700 p-6 rounded-lg shadow-inner border border-gray-600">
        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-300">Game ID: <span className="font-mono text-indigo-200">{currentGame.gameId}</span></h2>
        <p className="text-center text-gray-300 mb-4">Status: <span className="font-semibold capitalize">{currentGame.status.replace('_', ' ')}</span></p>
        <p className="text-center text-gray-400 text-sm mb-4">Last Action: {currentGame.lastAction}</p>
        <p className="text-center text-gray-400 text-sm mb-4">Current Round: {currentGame.roundNumber}</p>

        {currentGame.status === 'playing' && (
          <p className="text-center text-xl font-bold text-yellow-300 mb-4">
            {isMyTurn ? "It's your turn!" : `It's ${currentGame.players.find(p => p.id === currentGame.currentTurnPlayerId)?.name}'s turn.`}
          </p>
        )}

        <h3 className="text-xl font-semibold mb-3 text-indigo-300">Players:</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentGame.players.map((player) => (
            <li key={player.id} className={`p-4 rounded-md shadow-md ${player.id === userId ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-600 border-gray-500'} border`}>
              <p className="font-bold text-lg">{player.name} {player.id === userId && "(You)"} {player.id === currentGame.hostId && "(Host)"}</p>
              <p className="text-sm text-gray-200">Score: {player.score}</p>
              <p className="text-sm text-gray-200">Cards in Hand: {player.hand.length}</p>
              {currentGame.status === 'show_called' && currentGame.revealedHands && (
                  <div className="mt-2">
                      <p className="font-semibold text-yellow-300">Revealed Hand:</p>
                      <div className="flex flex-wrap gap-1">
                          {currentGame.revealedHands.find(rh => rh.id === player.id)?.hand.map((card, idx) => (
                              <span key={idx} className="bg-gray-800 text-white text-xs px-2 py-1 rounded-sm">
                                  {card ? getCardName(card) : 'Invalid Card'} ({card ? card.value : 'N/A'})
                              </span>
                          ))}
                      </div>
                      <p className="font-bold text-lg mt-1">Sum: {currentGame.revealedHands.find(rh => rh.id === player.id)?.sum}</p>
                  </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Discard Pile */}
      <div className="bg-gray-700 p-4 rounded-lg shadow-inner border border-gray-600 text-center">
          <h3 className="text-xl font-semibold mb-2 text-indigo-300">Discard Pile</h3>
          {currentGame.discardPile.length > 0 ? (
              <div className="flex justify-center items-center gap-2">
                  <span className="text-lg font-bold text-white">Top Card:</span>
                  <div className="bg-white text-gray-900 p-2 rounded-md shadow-md">
                      {getCardName(currentGame.discardPile[currentGame.discardPile.length - 1])}
                  </div>
              </div>
          ) : (
              <p className="text-gray-400">Discard pile is empty.</p>
          )}
      </div>

      {/* Your Hand */}
      {currentPlayer && currentPlayer.hand.length > 0 && (
          <div className="bg-gray-700 p-6 rounded-lg shadow-inner border border-gray-600">
              <h3 className="text-xl font-semibold mb-3 text-indigo-300">Your Hand ({calculateHandSum(currentPlayer.hand)} points)</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                  {currentPlayer.hand.map((card, index) => (
                      <PlayerCard
                          key={index}
                          card={card}
                          isSelected={selectedCards.some(sc => sc.rank === card.rank && sc.suit === card.suit)}
                          onClick={() => isMyTurn && currentGame.status === 'playing' && toggleCardSelection(card)}
                          isPlayable={isMyTurn && currentGame.status === 'playing'}
                      />
                  ))}
              </div>
          </div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {currentGame.hostId === userId && currentGame.status === 'waiting' && (
          <button
            onClick={startGame}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            Start Game
          </button>
        )}

        {isMyTurn && currentGame.status === 'playing' && (
          <>
            <button
              onClick={playCards}
              className={`
                bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              `}
            >
              Play Selected Card(s) / Draw
            </button>
          </>
        )}

        {isMyTurn && currentGame.status === 'playing' && (
          <button
            onClick={callShow}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
          >
            Call "Show"
          </button>
        )}

        {currentGame.hostId === userId && currentGame.status === 'show_called' && (
          <button
            onClick={resetRound}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Start New Round
          </button>
        )}

        <button
          onClick={leaveGame}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Leave Game
        </button>
      </div>
    </div>
  );
};

export default GameBoard;
