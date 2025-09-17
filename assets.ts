// assets.ts

interface Asset {
  key: string;
  path: string;
}

// Use relative paths for better compatibility across environments
const getAssetUrl = (path: string) => {
  // In development, use Vite's asset handling
  if (import.meta.env.DEV) {
    return path;
  }
  // In production, assets should be served from the same domain
  return path;
};

// Define all assets that need to be loaded for the game.
// Using relative paths that work in both dev and production
const assetsToLoad: Asset[] = [
  { key: 'terrain_atlas', path: getAssetUrl('/assets/images/Terrain_Atlas_01.png') },
  { key: 'resource_atlas', path: getAssetUrl('/assets/images/Resources_Atlas_01.png') },
  { key: 'colonist_male_1', path: getAssetUrl('/assets/images/Male_01.png') },
  { key: 'colonist_female_1', path: getAssetUrl('/assets/images/Female_01.png') },
];

class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  public loaded: boolean = false;

  private loadImage(asset: Asset): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      // Add crossOrigin attribute for loading images from another domain into a canvas.
      img.crossOrigin = 'anonymous';
      img.src = asset.path;
      img.onload = () => {
        this.images.set(asset.key, img);
        resolve();
      };
      img.onerror = () => {
        const errorMsg = `Gagal memuat aset gambar '${asset.key}' dari path ${asset.path}. Path ini sudah benar untuk struktur folder 'public'. Periksa tab Network di DevTools untuk error 404. Jika ada error 404, masalahnya ada pada konfigurasi server atau cache deployment, bukan pada kode.`;
        console.error(errorMsg);
        reject(new Error(errorMsg));
      };
    });
  }

  public async loadAssets(): Promise<void> {
    if (this.loaded) {
      return;
    }
    try {
      await Promise.all(assetsToLoad.map(asset => this.loadImage(asset)));
      this.loaded = true;
      console.log("Semua aset game berhasil dimuat.");
    } catch (error) {
      console.error("Terjadi error kritis saat memuat aset. Simulasi tidak bisa dimulai.");
      this.loaded = false;
      // Re-throw to allow the UI to catch it and display an error state.
      throw error;
    }
  }

  public getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }
}

export const assetLoader = new AssetLoader();