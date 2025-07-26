// utils/layoutUtils.js
export const getPlayerPositions = (count) => {
  switch (count) {
    case 1: return ['bottom'];
    case 2: return ['top', 'bottom'];
    case 3: return ['top', 'left', 'bottom'];
    case 4: return ['top', 'right', 'left', 'bottom'];
    default:
      // Arrange in a circular layout using angle positioning
      return Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 360;
        return {
          angle,
          style: {
            transform: `rotate(${angle}deg) translate(250px) rotate(-${angle}deg)`,
            transformOrigin: 'center',
            position: 'absolute',
            top: '50%',
            left: '50%',
          },
        };
      });
  }
};
