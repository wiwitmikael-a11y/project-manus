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
   * The definitive fix for cross-origin security errors, combining the standard
   * `crossOrigin` attribute with a cache-busting parameter.
   */
  private loadImage(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      // Step 1: Set the crossOrigin attribute BEFORE setting the src.
      // This is the standard way to request an image with the necessary CORS headers.
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        this.images.set(key, img);
        resolve();
      };

      img.onerror = (err) => {
        console.error(`Failed to load image asset '${key}' from ${url}`, err);
        reject(new Error(`Image loading failed for key: ${key}`));
      };
      
      // Step 2: Set the image source with a cache-busting query parameter.
      // This forces the browser to discard any cached, potentially "tainted"
      // version of the image and perform a fresh request.
      img.src = `${url}?t=${Date.now()}`;
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
