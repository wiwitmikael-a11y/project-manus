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
   * Memuat gambar menggunakan metode standar `new Image()`.
   * Karena semua aset sekarang dimuat dari path lokal (domain yang sama),
   * metode ini sangat andal dan efisien, menghilangkan kebutuhan
   * untuk solusi CORS yang kompleks seperti fetch/blob.
   */
  private loadImage(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      // Atribut crossOrigin tidak lagi krusial untuk aset lokal, tetapi ini adalah
      // praktik yang baik untuk dipertahankan jika Anda memutuskan untuk menggunakan CDN
      // yang dikonfigurasi dengan benar di masa depan.
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        this.images.set(key, img);
        resolve();
      };
      
      img.onerror = () => {
        const errorMsg = `Gagal memuat aset gambar '${key}' dari path ${url}. Pastikan file ada dan path ini benar relatif terhadap file index.html Anda.`;
        console.error(errorMsg);
        reject(new Error(errorMsg));
      };
      
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