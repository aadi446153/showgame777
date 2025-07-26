import React, { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, onSnapshot, deleteDoc, getDoc } from 'firebase/firestore';
import RulesModal from './components/RulesModel';
import './App.css'
// Import Firebase config and instances
import { db, APP_ID } from './firebase/config';

// Import Hooks
import useFirebaseAuth from './hooks/useFirebaseAuth';

// Import Utils
import { createDeck,reshuffleDeck } from './utils/deckUtils';
import { advanceTurn, performDrawCard, calculateHandSum } from './utils/gameHelpers';

// Import Components
import Modal from './components/Modal';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';

const App = () => {
  const [gameId, setGameId] = useState('');
  const [currentGame, setCurrentGame] = useState(null);
  const [joinGameIdInput, setJoinGameIdInput] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [selectedCards, setSelectedCards] = useState([]);
  const [showRules, setShowRules] = useState(false);

  // Use the custom Firebase auth hook
  const { userId, isAuthReady } = useFirebaseAuth(setMessage);

  // Handle modal display
  const showCustomModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  const hideCustomModal = () => {
    setShowModal(false);
    setModalContent('');
  };

  // Listen for game state changes
  useEffect(() => {
    if (!db || !userId || !gameId || !isAuthReady) return;

    const gameDocRef = doc(db, `artifacts/${APP_ID}/public/data/games`, gameId);
    const unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentGame(docSnap.data());
      } else {
        setCurrentGame(null);
        setMessage("Game not found or ended.");
        setGameId('');
      }
    }, (error) => {
      console.error("Error listening to game updates (onSnapshot):", error);
      setMessage(`Error updating game state: ${error.message || 'Unknown error'}. Check console for details.`);
    });

    return () => unsubscribe();
  }, [db, userId, gameId, isAuthReady]);

  // Create a new game
  const createGame = async () => {
    console.log("Attempting to create game...");
    console.log("db:", db);
    console.log("userId:", userId);

    if (!db || !userId) {
      showCustomModal("Firebase not initialized or user not authenticated. Check console for details.");
      return;
    }

    const newGameId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const gameRef = doc(db, `artifacts/${APP_ID}/public/data/games`, newGameId);

    try {
      await setDoc(gameRef, {
        gameId: newGameId,
        players: [{ id: userId, name: `Player ${userId.substring(0, 4)}`, hand: [], score: 0 }],
        deck: [],
        discardPile: [],
        currentTurnPlayerId: null,
        status: 'waiting',
        hostId: userId,
        roundNumber: 0,
        turnsTakenInRound: {},
        lastAction: `Game created by Player ${userId.substring(0, 4)}`,
      });
      setGameId(newGameId);
      setMessage(`Game ${newGameId} created! Share this ID with friends.`);
    } catch (e) {
      console.error("Error creating game:", e);
      showCustomModal("Failed to create game. Please try again. Check console for Firebase permissions or config issues.");
    }
  };

  // Join an existing game
  const joinGame = async () => {
    if (!db || !userId) {
      showCustomModal("Firebase not initialized or user not authenticated.");
      return;
    }
    if (!joinGameIdInput) {
      showCustomModal("Please enter a Game ID to join.");
      return;
    }

    const gameRef = doc(db, `artifacts/${APP_ID}/public/data/games`, joinGameIdInput);

    try {
      const docSnap = await getDoc(gameRef);
      if (docSnap.exists()) {
        const gameData = docSnap.data();
        if (gameData.players.some(p => p.id === userId)) {
          setGameId(joinGameIdInput);
          setMessage(`Rejoined game ${joinGameIdInput}.`);
          return;
        }

        if (gameData.status === 'waiting') {
          const updatedPlayers = [...gameData.players, { id: userId, name: `Player ${userId.substring(0, 4)}`, hand: [], score: 0 }];
          await updateDoc(gameRef, {
            players: updatedPlayers,
            lastAction: `Player ${userId.substring(0, 4)} joined the game.`,
          });
          setGameId(joinGameIdInput);
          setMessage(`Joined game ${joinGameIdInput}!`);
        } else {
          showCustomModal("This game has already started, is full, or is no longer accepting new players.");
        }
      } else {
        showCustomModal("Game not found. Please check the ID.");
      }
    } catch (e) {
      console.error("Error joining game:", e);
      showCustomModal("Failed to join game. Please try again.");
    }
  };

  // Start the game (only host can do this)
  const startGame = async () => {
    if (!db || !currentGame || !userId || currentGame.hostId !== userId) {
      showCustomModal("You are not the host or game is not ready.");
      return;
    }
    if (currentGame.players.length < 2) {
      showCustomModal("Need at least 2 players to start the game.");
      return;
    }
    if (currentGame.status !== 'waiting') {
      showCustomModal("Game has already started.");
      return;
    }

    const gameRef = doc(db, `artifacts/${APP_ID}/public/data/games`, currentGame.gameId);
    const numPlayers = currentGame.players.length;
    const numDecks = Math.round(Math.sqrt(numPlayers));
    const newDeck = createDeck(numDecks);

    let updatedPlayers = currentGame.players.map(player => ({ ...player, hand: [], score: 0 }));
    let currentDeck = [...newDeck];

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < updatedPlayers.length; j++) {
        if (currentDeck.length > 0) {
          updatedPlayers[j].hand.push(currentDeck.shift());
        } else {
          showCustomModal("Not enough cards in the deck to deal 7 cards to all players.");
          return;
        }
      }
    }

    let initialDiscardPile = [];
    if (currentDeck.length > 0) {
      initialDiscardPile.push(currentDeck.shift());
    } else {
      showCustomModal("Deck is empty, cannot start discard pile.");
      return;
    }

    try {
      await updateDoc(gameRef, {
        deck: currentDeck,
        discardPile: initialDiscardPile,
        status: 'playing',
        players: updatedPlayers,
        currentTurnPlayerId: currentGame.players[0].id,
        roundNumber: 1,
        turnsTakenInRound: {},
        lastAction: `Game started by host. Dealing cards...`,
      });
      setMessage(`Game started! It's ${currentGame.players[0].name}'s turn.`);
    } catch (e) {
      console.error("Error starting game:", e);
      showCustomModal("Failed to start game.");
    }
  };

  // Toggle card selection
  const toggleCardSelection = (card) => {
    const isSelected = selectedCards.some(sc => sc.rank === card.rank && sc.suit === card.suit);
    if (isSelected) {
      setSelectedCards(selectedCards.filter(sc => sc.rank !== card.rank || sc.suit !== card.suit));
    } else {
      if (selectedCards.length > 0 && selectedCards[0].rank !== card.rank) {
        setSelectedCards([card]);
      } else {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };
  //Draw a card
  const drawCardAfterPlay = async () => {
    try {
      const gameRef = doc(db, `artifacts/${APP_ID}/public/data/games`, currentGame.gameId);
      const docSnap = await getDoc(gameRef);
      const freshGame = docSnap.data();

      await performDrawCard(
        db,
        APP_ID,
        freshGame,
        userId,
        `Player drew a card after mismatch.`,
        showCustomModal
      );
    } catch (error) {
      console.error("Error during drawCardAfterPlay:", error);
      showCustomModal("Failed to draw a card.");
    }
  };

  // Play selected cards
  const playCards = async () => {
    if (!db || !currentGame || currentGame.status !== 'playing' || currentGame.currentTurnPlayerId !== userId) {
      showCustomModal("It's not your turn or game is not in playing state.");
      return;
    }
    const gameRef = doc(db, `artifacts/${APP_ID}/public/data/games`, currentGame.gameId);
    const playerIndex = currentGame.players.findIndex(p => p.id === userId);
    const currentPlayer = currentGame.players[playerIndex];
    const filteredLength = currentPlayer.hand.filter(card => card).length; // Filter out falsy values (null, undefined, etc.)
    console.log(`${currentPlayer.name}'s hand length (without null): ${filteredLength}`);
    if (filteredLength === 0) {
      await drawCardAfterPlay();
    }
    const topDiscardCard = currentGame.discardPile.length > 0
      ? currentGame.discardPile[currentGame.discardPile.length - 1]
      : null;

    if (selectedCards.length === 0) {
      showCustomModal("No cards selected.");
      return;
    }

    const allSelectedMatchRank = selectedCards.every(card => card.rank === selectedCards[0].rank);
    if (!allSelectedMatchRank) {
      showCustomModal("You can only play cards of the same rank.");
      return;
    }
    const matchesTopCard = topDiscardCard && selectedCards[0].rank === topDiscardCard.rank;
    console.log("Does played card match top discard card?", matchesTopCard);
    // const filteredLength = currentPlayer.hand.filter(card => card).length; // Filter out falsy values (null, undefined, etc.)
    // console.log(`${currentPlayer.name}'s hand length (without null): ${filteredLength}`);
    // if (filteredLength === 0) {
    //   await drawCardAfterPlay();
    // }
    const updatedHand = currentPlayer.hand.filter(
      handCard =>
        !selectedCards.some(
          selectedCard =>
            selectedCard.rank === handCard.rank &&
            selectedCard.suit === handCard.suit
        )
    );

    const newDiscardPile = [...currentGame.discardPile, ...selectedCards];
    const updatedPlayers = [...currentGame.players];
    updatedPlayers[playerIndex] = { ...currentPlayer, hand: updatedHand };

    // const matchesTopCard = topDiscardCard && selectedCards[0].rank === topDiscardCard.rank;

    try {
      // ✅ Always update discard + remove played cards
      await updateDoc(gameRef, {
        players: updatedPlayers,
        discardPile: newDiscardPile,
        lastAction: `${currentPlayer.name} played ${selectedCards.length} card(s).`,
      });

      setSelectedCards([]);
      await advanceTurn(db, APP_ID, currentGame);
      //     if (!matchesTopCard) {
      //   // ✅ Draw card separately
      //   await drawCardAfterPlay();
      // }
      // const postPlayLength = updatedHand.filter(card => card).length;
      // console.log(`${currentPlayer.name}'s hand length after play: ${postPlayLength}`);
      // if (postPlayLength === 0) {
      //   await drawCardAfterPlay();
      // }
      const postPlayLength = updatedHand.filter(card => card).length;
      console.log(`${currentPlayer.name}'s hand length after play: ${postPlayLength}`);

      if (!matchesTopCard || postPlayLength === 0) {
        console.log(
          `Drawing card because: ${!matchesTopCard ? 'card didn’t match top' : 'hand became empty'}`
        );
        await drawCardAfterPlay();
      }



    } catch (e) {
      console.error("Error in playCards:", e);
      showCustomModal("Failed to play cards.");
    }
  };


  // Call a "Show"
  const callShow = async () => {
    if (!db || !currentGame || currentGame.status !== 'playing' || currentGame.currentTurnPlayerId !== userId) {
      showCustomModal("It's not your turn or game is not in playing state.");
      return;
    }

    // Rule: You must complete at least 2 full rounds before calling a 'Show'.
    // If roundNumber is 1, 0 rounds completed.
    // If roundNumber is 2, 1 round completed.
    // If roundNumber is 3, 2 rounds completed.
    // So, allow show if roundNumber is 3 or greater.
    if (currentGame.roundNumber < 3) {
      showCustomModal(`You must complete at least 2 full rounds before calling a 'Show'. You are currently in round ${currentGame.roundNumber}.`);
      return;
    }

    const gameRef = doc(db, `artifacts/${APP_ID}/public/data/games`, currentGame.gameId);

    const playersWithRevealedHands = currentGame.players.map(player => ({
      ...player,
      revealedHand: player.hand,
      currentHandSum: calculateHandSum(player.hand),
    }));

    let lowestSum = Infinity;
    let lowestSumPlayers = [];

    playersWithRevealedHands.forEach(player => {
      if (player.currentHandSum < lowestSum) {
        lowestSum = player.currentHandSum;
        lowestSumPlayers = [player];
      } else if (player.currentHandSum === lowestSum) {
        lowestSumPlayers.push(player);
      }
    });

    let newPlayersState = [...currentGame.players];
    let showMessage = "";

    const callingPlayer = playersWithRevealedHands.find(p => p.id === userId);

    // if (lowestSumPlayers.length === 1 && lowestSumPlayers[0].id === userId) {
    //   showMessage = `${callingPlayer.name} called 'Show' and has the lowest sum (${lowestSum})! They get 0 points.`;
    //   newPlayersState = newPlayersState.map(p => {
    //     const revealedPlayer = playersWithRevealedHands.find(rp => rp.id === p.id);
    //     if (p.id === userId) {
    //       return { ...p, score: p.score + 0 };
    //     } else {
    //       return { ...p, score: p.score + revealedPlayer.currentHandSum };
    //     }
    //   });
    // } else {
    //   showMessage = `${callingPlayer.name} called 'Show' but did not have the lowest sum (${callingPlayer.currentHandSum}). `;
    //   if (lowestSumPlayers.length === 1) {
    //     showMessage += `${lowestSumPlayers[0].name} had the lowest sum (${lowestSum}).`;
    //   } else {
    //     showMessage += `It was a tie for the lowest sum (${lowestSum}) between: ${lowestSumPlayers.map(p => p.name).join(', ')}.`;
    //   }

    //   newPlayersState = newPlayersState.map(p => {
    //     const revealedPlayer = playersWithRevealedHands.find(rp => rp.id === p.id);
    //     if (p.id === userId) {
    //       return { ...p, score: p.score + 50 };
    //     } else if (lowestSumPlayers.some(lsp => lsp.id === p.id)) {
    //       return { ...p, score: p.score + 0 };
    //     } else {
    //       return { ...p, score: p.score + revealedPlayer.currentHandSum };
    //     }
    //   });
    // }
    if (lowestSumPlayers.some(p => p.id === userId)) {
  showMessage = `${callingPlayer.name} called 'Show' and has the lowest sum (${lowestSum})! They get 0 points.`;

  newPlayersState = newPlayersState.map(p => {
    const revealedPlayer = playersWithRevealedHands.find(rp => rp.id === p.id);
    if (p.id === userId) {
      return { ...p, score: p.score + 0 };
    } else {
      return { ...p, score: p.score + revealedPlayer.currentHandSum };
    }
  });
} else {
  showMessage = `${callingPlayer.name} called 'Show' but did not have the lowest sum (${callingPlayer.currentHandSum}). `;
  if (lowestSumPlayers.length === 1) {
    showMessage += `${lowestSumPlayers[0].name} had the lowest sum (${lowestSum}).`;
  } else {
    showMessage += `It was a tie for the lowest sum (${lowestSum}) between: ${lowestSumPlayers.map(p => p.name).join(', ')}.`;
  }

  newPlayersState = newPlayersState.map(p => {
    const revealedPlayer = playersWithRevealedHands.find(rp => rp.id === p.id);
    if (p.id === userId) {
      return { ...p, score: p.score + 50 };
    } else if (lowestSumPlayers.some(lsp => lsp.id === p.id)) {
      return { ...p, score: p.score + 0 };
    } else {
      return { ...p, score: p.score + revealedPlayer.currentHandSum };
    }
  });
}


    try {
      await updateDoc(gameRef, {
        players: newPlayersState,
        status: 'show_called',
        lastAction: showMessage,
        revealedHands: playersWithRevealedHands.map(p => ({ id: p.id, hand: p.revealedHand, sum: p.currentHandSum })),
      });
    } catch (e) {
      console.error("Error calling show:", e);
      showCustomModal("Failed to call Show.");
    }
  };

  // Reset round for a new game
  const resetRound = async () => {
    if (!db || !currentGame || currentGame.hostId !== userId) {
      showCustomModal("You are not the host or game is not ready.");
      return;
    }
    const gameRef = doc(db, `artifacts/${APP_ID}/public/data/games`, currentGame.gameId);
    const numPlayers = currentGame.players.length;
    const numDecks = Math.round(Math.sqrt(numPlayers));
    const newDeck = createDeck(numDecks);

    let updatedPlayers = currentGame.players.map(player => ({ ...player, hand: [] }));
    let currentDeck = [...newDeck];

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < updatedPlayers.length; j++) {
        if (currentDeck.length > 0) {
          updatedPlayers[j].hand.push(currentDeck.shift());
        } else {
          showCustomModal("Not enough cards in the deck to deal 7 cards to all players for the new round.");
          return;
        }
      }
    }
    
    let initialDiscardPile = [];
    if (currentDeck.length > 0) {
      initialDiscardPile.push(currentDeck.shift());
    } else {
      showCustomModal("Deck is empty, cannot start discard pile for new round.");
      return;
    }
    
    try {
      await updateDoc(gameRef, {
        deck: currentDeck,
        discardPile: initialDiscardPile,
        status: 'playing',
        players: updatedPlayers,
        currentTurnPlayerId: currentGame.players[0].id,
        //roundNumber: currentGame.roundNumber + 1,
        roundNumber: 1,
        turnsTakenInRound: {},
        lastAction: `New round started by host. Dealing cards...`,
        revealedHands: null,
      });
      setMessage(`It's ${currentGame.players[0].name}'s turn.`);
    } catch (e) {
      console.error("Error resetting round:", e);
      showCustomModal("Failed to reset round.");
    }
  };

  // Leave the current game
  const leaveGame = async () => {
    if (!db || !userId || !gameId) {
      showCustomModal("Not in a game to leave.");
      return;
    }

    const gameRef = doc(db, `artifacts/${APP_ID}/public/data/games`, gameId);

    try {
      const docSnap = await getDoc(gameRef);
      if (docSnap.exists()) {
        const gameData = docSnap.data();
        const updatedPlayers = gameData.players.filter(p => p.id !== userId);

        if (updatedPlayers.length === 0) {
          await deleteDoc(gameRef);
          setMessage("Game deleted as all players left.");
        } else {
          await updateDoc(gameRef, {
            players: updatedPlayers,
            hostId: gameData.hostId === userId ? updatedPlayers[0]?.id || null : gameData.hostId,
            currentTurnPlayerId: gameData.currentTurnPlayerId === userId ? updatedPlayers[0]?.id || null : gameData.currentTurnPlayerId,
            lastAction: `Player ${userId.substring(0, 4)} left the game.`,
          });
          setMessage("You have left the game.");
        }
      }
      setGameId('');
      setCurrentGame(null);
    } catch (e) {
      console.error("Error leaving game:", e);
      showCustomModal("Failed to leave game.");
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-xl animate-pulse">Loading Firebase...</div>
      </div>
    );
  }

  //JSX code 
  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white font-inter p-4 flex flex-col items-center justify-center relative">
    {/* 📜 Rules Button */}
    <button
      className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-md text-sm"
      onClick={() => setShowRules(!showRules)}
    >
      {showRules ? '❌ Close' : '📜 Rules'}
    </button>

    {/* 🧾 Rules Modal */}
    {showRules ? (
      <RulesModal />
    ) : (
      <div className="max-w-4xl w-full bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-indigo-400">SHOW</h1>
        <p className="text-center text-gray-300 mb-6">
          Your User ID:{" "}
          <span className="font-mono bg-gray-700 px-2 py-1 rounded text-sm">
            {userId || "N/A"}
          </span>
        </p>

        {message && (
          <div className="bg-blue-500 text-white p-3 rounded-md mb-4 text-center">
            {message}
          </div>
        )}

        {showModal && (
          <Modal content={modalContent} onClose={hideCustomModal} />
        )}

        {!currentGame ? (
          <Lobby
            createGame={createGame}
            joinGame={joinGame}
            joinGameIdInput={joinGameIdInput}
            setJoinGameIdInput={setJoinGameIdInput}
          />
        ) : (
          <GameBoard
            currentGame={currentGame}
            userId={userId}
            isMyTurn={currentGame.currentTurnPlayerId === userId}
            startGame={startGame}
            playCards={playCards}
            callShow={callShow}
            resetRound={resetRound}
            leaveGame={leaveGame}
            selectedCards={selectedCards}
            toggleCardSelection={toggleCardSelection}
          />
        )}
      </div>
    )}
  </div>
);
};

export default App;
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white font-inter p-4 flex flex-col items-center justify-center">
//       <div className="max-w-4xl w-full bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
//         <h1 className="text-4xl font-extrabold text-center mb-6 text-indigo-400">SHOW</h1>
//         <p className="text-center text-gray-300 mb-6">Your User ID: <span className="font-mono bg-gray-700 px-2 py-1 rounded text-sm">{userId || 'N/A'}</span></p>

//         {message && (
//           <div className="bg-blue-500 text-white p-3 rounded-md mb-4 text-center">
//             {message}
//           </div>
//         )}

//         {showModal && (
//           <Modal content={modalContent} onClose={hideCustomModal} />
//         )}

//         {!currentGame ? (
//           <Lobby
//             createGame={createGame}
//             joinGame={joinGame}
//             joinGameIdInput={joinGameIdInput}
//             setJoinGameIdInput={setJoinGameIdInput}
//           />
//         ) : (
//           <GameBoard
//             currentGame={currentGame}
//             userId={userId}
//             isMyTurn={currentGame.currentTurnPlayerId === userId}
//             startGame={startGame}
//             playCards={playCards}
//             callShow={callShow}
//             resetRound={resetRound}
//             leaveGame={leaveGame}
//             selectedCards={selectedCards}
//             toggleCardSelection={toggleCardSelection}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default App;