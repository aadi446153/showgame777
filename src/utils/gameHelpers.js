import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getCardName,reshuffleDeck } from './deckUtils'; // Assuming deckUtils is in the same parent directory

// Advances the turn to the next player in the game
export const advanceTurn = async (db, appId, gameData) => {
  if (!db || !gameData) return;

  const gameRef = doc(db, `artifacts/${appId}/public/data/games`, gameData.gameId);
  const currentPlayerIndex = gameData.players.findIndex(p => p.id === gameData.currentTurnPlayerId);
  const nextPlayerIndex = (currentPlayerIndex + 1) % gameData.players.length;
  const nextPlayerId = gameData.players[nextPlayerIndex].id;

  // Update turns taken in round
  const updatedTurnsTaken = { ...gameData.turnsTakenInRound };
  updatedTurnsTaken[gameData.currentTurnPlayerId] = (updatedTurnsTaken[gameData.currentTurnPlayerId] || 0) + 1;

  let newRoundNumber = gameData.roundNumber;
  // Check if a full round has passed (all players have taken a turn in the current round)
  const allPlayersTookTurn = gameData.players.every(p => updatedTurnsTaken[p.id] >= newRoundNumber);
  if (allPlayersTookTurn && nextPlayerIndex === 0) { // If it's the first player's turn again and everyone has taken a turn
    newRoundNumber++;
  }

  try {
    await updateDoc(gameRef, {
      currentTurnPlayerId: nextPlayerId,
      roundNumber: newRoundNumber,
      turnsTakenInRound: updatedTurnsTaken,
      lastAction: `It's ${gameData.players[nextPlayerIndex].name}'s turn.`,
    });
  } catch (e) {
    console.error("Error advancing turn:", e);
    // You might want to pass a setMessage function here to update UI
  }
};

// Draws a card from the deck for a specified player
// export const performDrawCard = async (db, appId, gameData, playerToDrawId, actionMessage, showCustomModal) => {
//   const gameRef = doc(db, `artifacts/${appId}/public/data/games`, gameData.gameId);
//   let currentDeck = [...gameData.deck];
//   const playerIndex = gameData.players.findIndex(p => p.id === playerToDrawId);
//   const player = gameData.players[playerIndex];

//   if (currentDeck.length === 0) {
//     showCustomModal("Deck is empty! Cannot draw a card.");
//     return false; // Indicate draw failed
//   }

//   const drawnCard = currentDeck.shift();
//   const updatedHand = [...player.hand, drawnCard];
//   const updatedPlayers = [...gameData.players];
//   updatedPlayers[playerIndex] = { ...player, hand: updatedHand };

//   try {
//     await updateDoc(gameRef, {
//       deck: currentDeck,
//       players: updatedPlayers,
//       lastAction: actionMessage,
//     });
//     return true; // Indicate draw successful
//   } catch (e) {
//     console.error("Error drawing card:", e);
//     showCustomModal("Failed to draw card.");
//     return false; // Indicate draw failed
//   }
// };


export const performDrawCard = async (db, appId, gameData, playerToDrawId, actionMessage, showCustomModal) => {
  const gameRef = doc(db, `artifacts/${appId}/public/data/games`, gameData.gameId);
  let currentDeck = [...gameData.deck];
  const playerIndex = gameData.players.findIndex(p => p.id === playerToDrawId);
  const player = gameData.players[playerIndex];

  if (currentDeck.length === 0) {
    console.log("Deck empty — reshuffling discard pile...");
    showCustomModal("Deck empty — reshuffling discard pile...")
    const reshuffled = reshuffleDeck(gameData.discardPile, gameData.players);
    if (reshuffled.length === 0) {
      showCustomModal("No cards left to reshuffle. Cannot draw a card.");
      return false;
    }
    currentDeck = [...reshuffled];
  }

  const drawnCard = currentDeck.shift();
  const updatedHand = [...player.hand, drawnCard];
  const updatedPlayers = [...gameData.players];
  updatedPlayers[playerIndex] = { ...player, hand: updatedHand };

  try {
    await updateDoc(gameRef, {
      deck: currentDeck,
      players: updatedPlayers,
      lastAction: actionMessage,
    });
    return true; // Indicate draw successful
  } catch (e) {
    console.error("Error drawing card:", e);
    showCustomModal("Failed to draw card.");
    return false;
  }
};


// Calculate hand sum for a player
export const calculateHandSum = (hand) => {
  return hand.reduce((sum, card) => sum + card.value, 0);
};
