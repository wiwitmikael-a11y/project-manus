export interface TerrainMapping {
  url: string;
  tileSize: number;
}

// TODO: Ganti URL placeholder ini dengan URL ke file atlas terrain 10x10 Anda di GitHub.
const TERRAIN_ATLAS_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/project-manus-assets/main/png/Terrain_Atlas_01.png';

export const terrainMapping: TerrainMapping = {
  url: TERRAIN_ATLAS_URL,
  tileSize: 128, // Ukuran setiap tile dalam file atlas (misal: 128x128px)
};
