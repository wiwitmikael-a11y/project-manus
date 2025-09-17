// assets.ts
// Fix: Added .ts extension to resolve module import error.
import { spritesheetMapping } from './assets/assetMapping.ts';
// Fix: Added .ts extension to resolve module import error.
import { terrainMapping } from './assets/terrainAssetMapping.ts';
// Fix: Added .ts extension to resolve module import error.
import { resourceMapping } from './assets/resourceAssetMapping.ts';

class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  public loaded: boolean = false;

  /**
   * Loads an image using the fetch API and a Blob URL to bypass CORS-related
   * canvas tainting issues. This is a more robust method than relying on
   * the `crossOrigin` attribute, especially in sandboxed or complex environments,
   * and directly addresses the "SecurityError".
   */
  private loadImage(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Step 1: Fetch the image data with CORS enabled.
      fetch(url, { mode: 'cors' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status} fetching asset '${key}' from ${url}`);
          }
          // Step 2: Convert the response data to a Blob.
          return response.blob();
        })
        .then(blob => {
          // Step 3: Create a same-origin URL for the Blob.
          const objectUrl = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            this.images.set(key, img);
            URL.revokeObjectURL(objectUrl); // Clean up memory.
            resolve();
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            const errorMsg = `Failed to load image from blob for asset '${key}'.`;
            console.error(errorMsg);
            reject(new Error(errorMsg));
          };
          // Step 4: Load the image from the safe, same-origin URL.
          img.src = objectUrl;
        })
        .catch(error => {
          const errorMsg = `Failed to fetch image asset '${key}' from ${url}.`;
          console.error(errorMsg, error);
          reject(new Error(errorMsg));
        });
    });
  }
  
  public async loadAssets(): Promise<void> {
    if (this.loaded) return;

    const assetPromises: Promise<void>[] = [];

    // Load agent spritesheets
    for (const key in spritesheetMapping) {
      assetPromises.push(this.loadImage(key, spritesheetMapping[key].url));
    }
    
    // Load terrain atlas
    assetPromises.push(this.loadImage('terrain_atlas', terrainMapping.url));

    // Load resource atlas
    assetPromises.push(this.loadImage('resource_atlas', resourceMapping.url));

    try {
        await Promise.all(assetPromises);
        this.loaded = true;
        console.log("All game assets loaded successfully.");
    } catch (error) {
        console.error("A critical error occurred during asset loading. The simulation cannot start.", error);
        throw new Error("Failed to load critical game assets.");
    }
  }

  public getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }
}

export const assetLoader = new AssetLoader();
