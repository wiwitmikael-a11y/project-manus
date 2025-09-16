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
   * The definitive, most robust fix for cross-origin security errors.
   * This method manually fetches the image data, converts it to a local blob URL,
   * and then loads it. This guarantees the image is treated as same-origin by the browser.
   */
  private async loadImage(key: string, url: string): Promise<void> {
    try {
      // Step 1: Forcefully fetch the image data from the network, bypassing cache.
      const response = await fetch(url, { cache: 'reload' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Step 2: Convert the response data into a Blob.
      const imageBlob = await response.blob();

      // Step 3: Create a temporary, local URL for the blob.
      const localUrl = URL.createObjectURL(imageBlob);

      // Step 4: Load the image from the local URL.
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        // No crossOrigin attribute is needed because the URL is a local blob URL.
        
        img.onload = () => {
          this.images.set(key, img);
          // Step 5: Clean up the temporary URL to prevent memory leaks.
          URL.revokeObjectURL(localUrl);
          resolve();
        };

        img.onerror = (err) => {
          console.error(`Failed to load image from blob URL for '${key}'`, err);
          URL.revokeObjectURL(localUrl); // Also revoke on error
          reject(new Error(`Image loading from blob failed for key: ${key}`));
        };
        
        img.src = localUrl;
      });
    } catch (error) {
      console.error(`Failed to fetch image asset '${key}' from ${url}`, error);
      throw new Error(`Image fetching failed for key: ${key}`);
    }
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