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
   * Memuat gambar dengan mengambil datanya terlebih dahulu sebagai blob, lalu membuat
   * URL objek lokal. Cara ini secara kuat melewati batasan keamanan lintas-asal
   * yang dapat "mencemari" kanvas. Memuat gambar dari URL blob yang berasal dari domain yang sama
   * memastikan bahwa operasi seperti `drawImage` tidak memicu SecurityError.
   * Ini adalah perbaikan mendasar untuk masalah CORS yang persisten dalam aplikasi kanvas.
   */
  private loadImage(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(url, { mode: 'cors' }) // Secara eksplisit meminta mode CORS
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          const objectURL = URL.createObjectURL(blob);
          const img = new Image();
          
          img.onload = () => {
            this.images.set(key, img);
            resolve();
          };
          
          img.onerror = () => {
            URL.revokeObjectURL(objectURL);
            const errorMsg = `Gagal memuat gambar dari URL blob untuk aset '${key}'.`;
            console.error(errorMsg);
            reject(new Error(errorMsg));
          };
          
          img.src = objectURL;
        })
        .catch(error => {
          const errorMsg = `Gagal mengambil aset gambar '${key}' dari ${url}. Error: ${error}`;
          console.error(errorMsg);
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