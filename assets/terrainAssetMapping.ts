// assets/terrainAssetMapping.ts

export const terrainMapping = {
    /**
     * The size of a single tile within the terrain_atlas.png spritesheet.
     * Assumes square tiles. e.g. 32x32 pixels per tile in the atlas.
     */
    tileSize: 32,

    /**
     * The number of tiles horizontally in the terrain_atlas.png spritesheet.
     * If the atlas is 256px wide and tiles are 32px, this would be 8.
     */
    atlasWidthInTiles: 8,
};
