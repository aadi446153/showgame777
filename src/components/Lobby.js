import React from 'react';

const Lobby = ({ createGame, joinGame, joinGameIdInput, setJoinGameIdInput }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={createGame}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Create New Game
        </button>
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter Game ID"
            value={joinGameIdInput}
            onChange={(e) => setJoinGameIdInput(e.target.value.toUpperCase())}
            className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={joinGame}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
