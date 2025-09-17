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
   * Loads an image while correctly handling Cross-Origin Resource Sharing (CORS).
   * This is the standard and most reliable method to prevent the canvas from being
   * tainted, which would otherwise cause a "SecurityError". By setting `crossOrigin`
   * to 'Anonymous', we instruct the browser to request the image with the proper
   * headers, allowing it to be used securely in the canvas.
   */
  private loadImage(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // IMPORTANT: Set crossOrigin *before* setting the src attribute.
      // This tells the browser to request the image with CORS headers.
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        this.images.set(key, img);
        resolve();
      };

      img.onerror = () => {
        const errorMsg = `Failed to load image asset '${key}' from ${url}. This is likely a CORS issue or a broken URL.`;
        console.error(errorMsg);
        reject(new Error(errorMsg));
      };

      // Setting the src after the event handlers are in place triggers the image load.
      img.src = url;
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