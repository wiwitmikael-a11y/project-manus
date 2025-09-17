// assets/terrainAssetMapping.ts

export interface TerrainMapping {
    url: string;
    tileSize: number;
    atlasWidthInTiles: number;
    atlasHeightInTiles: number;
}

const TILE_SIZE = 128; // The source image tile size in pixels
const ATLAS_WIDTH_IN_TILES = 8;
const ATLAS_HEIGHT_IN_TILES = 8;

export const terrainMapping: TerrainMapping = {
    url: 'assets/images/Terrain_Atlas_01.png',
    tileSize: TILE_SIZE,
    atlasWidthInTiles: ATLAS_WIDTH_IN_TILES,
    atlasHeightInTiles: ATLAS_HEIGHT_IN_TILES,
};