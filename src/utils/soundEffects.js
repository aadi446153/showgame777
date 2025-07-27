// soundEffects.js
export const playSound = (type) => {
  let soundPath = "";

  switch (type) {
    case "card_play":
      soundPath = "/sounds/card-sounds.mp3";
      break;
    case "draw_card":
      soundPath = "/sounds/card-sounds.mp3";
      break;
    case "show_called":
      soundPath = "/sounds/flipcard.mp3";
      break;
    case "reshuffle":
      soundPath = "/sounds/card-shuffle.mp3";
      break;
    default:
      return;
  }

  const audio = new Audio(soundPath);
  audio.play().catch((err) => {
    console.error("Error playing sound:", err);
  });
};
