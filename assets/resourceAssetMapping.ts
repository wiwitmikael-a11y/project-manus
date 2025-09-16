// assets/resourceAssetMapping.ts
import { ResourceNodeType } from '../types';

interface ResourceSpriteData {
    sx: number; // Source X in the atlas
    sy: number; // Source Y in the atlas
}

export interface ResourceMapping {
  url: string;
  tileSize: number;
  nodes: Record<ResourceNodeType, ResourceSpriteData>;
}

// All assets are currently sourced from the main terrain atlas.
const RESOURCE_ATLAS_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/project-manus-assets/main/png/Terrain_Atlas_01.png';
const TILE_SIZE = 128;

export const resourceMapping: ResourceMapping = {
  url: RESOURCE_ATLAS_URL,
  tileSize: TILE_SIZE,
  nodes: {
    // R7C3 -> Tanah coklat kering + tumpukan kayu kecil (Tile ID 50)
    // This tile visually represents a fallen tree or wood debris well.
    'fallen_tree': {
        sx: (50 % 8) * TILE_SIZE, // Column 2
        sy: Math.floor(50 / 8) * TILE_SIZE, // Row 6
    },
    // R2C8 -> Tanah coklat + bongkahan batu putih (Tile ID 15)
    // This tile with a rock pile represents a scrap pile effectively.
    'scrap_pile': {
        sx: (15 % 8) * TILE_SIZE, // Column 7
        sy: Math.floor(15 / 8) * TILE_SIZE, // Row 1
    },
  },
};