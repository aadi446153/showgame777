import React from "react";
import "./RulesModal.css";


const RulesModal = () => {
  return (
    <div className="max-w-3xl bg-gray-800 text-white p-6 rounded-lg shadow-xl overflow-y-auto h-[90vh]">
      <h2 className="text-3xl font-bold mb-4 text-indigo-400">🃏 Game Rules: <span className="text-white">Lowest Sum</span></h2>

      <h3 className="text-xl font-semibold mt-4 text-indigo-300">🎯 Objective</h3>
      <p className="mb-4">Finish the game with the <strong>lowest total score</strong> after a fixed number of rounds or before someone crosses a score threshold.</p>

      <h3 className="text-xl font-semibold mt-4 text-indigo-300">🔧 Setup</h3>
      <ul className="list-disc list-inside mb-4">
        <li>Each player gets 7 cards.</li>
        <li>Deck size depends on number of players (1 deck for 2-4, 2 decks for 5-6, etc).</li>
        <li>The remaining cards go to the draw pile, and one starts the discard pile.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4 text-indigo-300">🔁 Gameplay</h3>
      <ul className="list-disc list-inside mb-4">
        <li>Players take turns clockwise.</li>
        <li>On your turn, either:
          <ul className="list-disc ml-6">
            <li><strong>Play:</strong> One or more cards of same rank that match the top of the discard pile.</li>
            <li><strong>Draw:</strong> If no match, draw one and end your turn.</li>
          </ul>
        <li>Decide on fixed rounds (e.g. 5) or score limit (e.g. 200).</li>
        </li>
      </ul>

      <h3 className="text-xl font-semibold mt-4 text-indigo-300">🧠 Calling "Show"</h3>
      <ul className="list-disc list-inside mb-4">
        <li>Can only be called after 2 full rounds (each player plays 2 turns).</li>
        <li>Player thinks they have the lowest hand total and calls "Show".</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4 text-indigo-300">💯 Scoring</h3>
      <ul className="list-disc list-inside mb-4">
        <li>2–10 → face value</li>
        <li>J, Q, K, A → 10 points</li>
        <li>If caller has lowest sum → 0 points; others get their hand’s sum.</li>
        <li>If caller is wrong → +50 points; actual lowest gets 0.</li>
      </ul>

      {/* <h3 className="text-xl font-semibold mt-4 text-indigo-300">🎨 Optional Rules</h3>
      <ul className="list-disc list-inside mb-4">
        <li>Start with fewer cards for quicker rounds.</li>
        <li>Add wild or action cards like Jokers, Skip, or Reverse.</li>
        <li>Decide on fixed rounds (e.g. 5) or score limit (e.g. 200).</li>
      </ul> */}
    </div>
  );
};

export default RulesModal;
