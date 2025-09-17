// assets.ts - Simplified asset loading
interface Asset {
  key: string;
  path: string;
}

// Placeholder images for faster loading
const createPlaceholderCanvas = (width: number, height: number, color: string): HTMLImageElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
};

class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  public loaded: boolean = false;

  public async loadAssets(): Promise<void> {
    if (this.loaded) return;
    
    // Create placeholder images for immediate use
    this.images.set('terrain_atlas', createPlaceholderCanvas(256, 256, '#4a5568'));
    this.images.set('resource_atlas', createPlaceholderCanvas(256, 128, '#2d3748'));
    this.images.set('colonist_male_1', createPlaceholderCanvas(512, 512, '#e53e3e'));
    this.images.set('colonist_female_1', createPlaceholderCanvas(512, 512, '#d69e2e'));
    
    this.loaded = true;
    console.log("Placeholder assets loaded for fast startup.");
  }

  public getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }
}

export const assetLoader = new AssetLoader();