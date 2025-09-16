// Fix: Added .ts extension to resolve module import error.
import { spritesheetMapping } from './assets/assetMapping.ts';
// Fix: Added .ts extension to resolve module import error.
import { terrainMapping } from './assets/terrainAssetMapping.ts';
// Fix: Added .ts extension to resolve module import error.
import { resourceMapping } from './assets/resourceAssetMapping.ts';

class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  public loaded: boolean = false;

  private loadImage(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => {
        this.images.set(key, img);
        resolve();
      };
      img.onerror = (err) => {
        console.error(`Failed to load asset: ${key} from ${url}`);
        reject(err);
      };
    });
  }

  public async loadAssets(): Promise<void> {
    if (this.loaded) return;

    const promises: Promise<void>[] = [];

    // Load agent spritesheets
    for (const key in spritesheetMapping) {
      promises.push(this.loadImage(key, spritesheetMapping[key].url));
    }
    
    // Load terrain atlas
    promises.push(this.loadImage('terrain_atlas', terrainMapping.url));

    // Load resource atlas
    promises.push(this.loadImage('resource_atlas', resourceMapping.url));

    await Promise.all(promises);
    this.loaded = true;
    console.log("All game assets loaded successfully.");
  }

  public getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }
}

export const assetLoader = new AssetLoader();