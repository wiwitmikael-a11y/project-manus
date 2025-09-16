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

// Menggunakan atlas terrain yang sama untuk saat ini sebagai placeholder.
// Anda bisa membuat atlas terpisah untuk objek dunia.
// Misal: Pohon ada di (0, 3), Rongsokan ada di (1, 3) di atlas terrain 10x10.
const RESOURCE_ATLAS_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/project-manus-assets/main/png/Terrain_Atlas_01.png';
const TILE_SIZE = 128;

export const resourceMapping: ResourceMapping = {
  url: RESOURCE_ATLAS_URL,
  tileSize: TILE_SIZE,
  nodes: {
    'fallen_tree': {
        sx: 0 * TILE_SIZE,
        sy: 3 * TILE_SIZE,
    },
    'scrap_pile': {
        sx: 1 * TILE_SIZE,
        sy: 3 * TILE_SIZE,
    },
  },
};
