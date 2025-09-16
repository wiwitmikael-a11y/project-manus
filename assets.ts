export interface SpriteSheet {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  animations: {
    [key: string]: { frames: number[]; speed: number };
  };
}

let characterSpriteSheet: SpriteSheet | null = null;
let assetsLoaded = false;

// Base64 for a 48x72 sprite sheet. 3 frames per direction. 16x18 frame size.
// Directions order: down, left, right, up
const characterSpriteSheetSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAABICAYAAAAb8R2WAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIQSURBVGhD7ZlJCsJAEEVn//+ndgEFwYvgKguvjJ3EyITNJjLz7rxf8MBNs2u3230HgH/g4/E4eZ73bW1tbZ+cnDyXy2VZVqvV3NjY+LBarX4dDoc+v99/Xq/X+/3+V2a73T4cDofD4VCW5WAwwOVyUVVVz/P+eDweDwQCgePj45IkQZIkVVWtra29ev36dVVVbTabIAjSNE2WZel2u1WpVDzP29jYkCRJURRpmqZpGu33+8vLy2VZDodDaZqSJAmdTkeSJGmaBoPBpFIpjuOEQgGfz0fTNNZqtVwudaPRODg4mKYpjuMqlUqxWGRZNs/zBwcHWZZ9+vTpF1mWbTabSqXCGIbRaDQ4jgMDA6lUihzH2Xa7cRxns9lIJBI8z/v4+DhNE3mef/z4cZrmcrmMMQyHw9FotFar1e/3k2UZCoVwHGe1Wp1Op2majuNwuVwURcRiMQRB8DyvXq+XJMkYhmEYZnNzs0wm0263cxyHpmnX6/U4jjMajo+P2+12mqYxDAOHw8FgMIhGo4RCoXw+nzRNbTabqqpRFIVhGBzHYbFYEARBEOTz+Xw+n8lkIpfLNRqNgiAghqIoCoVCyWSSZVkIgbjNZsMwDMMwqKoKwxCGoVwuF41GIT4ghsPh4DgOwxCiIb7f7+FwmCRJEASJRCJ8Pp/NZrvdbuVy+XA41GAwEARBEETSNI7jLMuSZVkURT6fD4fDkSQJaZqSJKEoCkEQrusKgoBv/wC9bwS/3Yj+KwAAAABJRU5ErkJggg==';

function loadSpriteSheet(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function loadAssets(): Promise<void> {
  if (assetsLoaded) {
    return;
  }
  
  try {
    const image = await loadSpriteSheet(characterSpriteSheetSrc);
    characterSpriteSheet = {
      image,
      frameWidth: 16,
      frameHeight: 18,
      animations: {
        'down': { frames: [0, 1, 2], speed: 100 },
        'left': { frames: [3, 4, 5], speed: 100 },
        'right': { frames: [6, 7, 8], speed: 100 },
        'up': { frames: [9, 10, 11], speed: 100 },
      }
    };
    assetsLoaded = true;
  } catch (error) {
    console.error("Failed to load assets:", error);
  }
}

export function getCharacterSpriteSheet(): SpriteSheet | null {
  return characterSpriteSheet;
}
