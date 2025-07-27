// Card definitions for a standard 52-card deck
export const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
export const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Function to get card value based on "Lowest Sum" rules
export const getCardValue = (rank) => {
  if (['J', 'Q', 'K', 'A'].includes(rank)) return 10; // Face cards and Ace are 10 points
  return parseInt(rank);
};

// Function to create a deck (or multiple decks)
export const createDeck = (numDecks = 1) => {
  let deck = [];
  for (let d = 0; d < numDecks; d++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ rank, suit, value: getCardValue(rank) });
      }
    }
  }
  // Shuffle the combined deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const getCardName = (card) => `${card.rank} of ${card.suit}`;

// Reshuffle discard pile, excluding cards currently in player hands
export const reshuffleDeck = (discardPile, players) => {
  const playerCards = new Set();
  for (const player of players) {
    for (const card of player.hand) {
      playerCards.add(`${card.rank}-${card.suit}`);
    }
  }

  const reshufflable = discardPile.filter(card => {
    const key = `${card.rank}-${card.suit}`;
    return !playerCards.has(key);
  });

  for (let i = reshufflable.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [reshufflable[i], reshufflable[j]] = [reshufflable[j], reshufflable[i]];
  }

  return reshufflable;
};


