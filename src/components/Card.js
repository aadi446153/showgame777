import React from "react";
import "./Card.css";

const suitEmojiMap = {
  Hearts: "♥️",
  Diamonds: "♦️",
  Clubs: "♣️",
  Spades: "♠️",
};

const Card = ({ value, suit, onClick, isSelected, disabled }) => {
  const emoji = suitEmojiMap[suit] || "🃏";
  const isRed = suit === "Hearts" || suit === "Diamonds";
  const colorClass = isRed ? "card-red" : "card-black";

  return (
    <div
      className={`card-container ${isSelected ? "selected-card" : ""} ${disabled ? "disabled" : ""}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div className={`card-front ${colorClass}`}>
        <div className="card-corner top-left">
          {value}
          <div>{emoji}</div>
        </div>
        <div className="card-center">{emoji}</div>
        <div className="card-corner bottom-right">
          {value}
          <div>{emoji}</div>
        </div>
      </div>
    </div>
  );
};

export default Card;
