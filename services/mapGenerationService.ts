// services/mapGenerationService.ts
// Fix: Added .ts extension to resolve module import error.
import { ResourceNode, ResourceNodeType, LootContainer, LootContainerType } from '../types.ts';

// Perlin noise generator
class PRNG {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  public next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

function createNoise(seed: number) {
  const prng = new PRNG(seed);
  const perm: number[] = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(prng.next() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const p = [...perm, ...perm];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];

    return lerp(v,
      lerp(u, grad(p[aa], x, y), grad(p[ba], x - 1, y)),
      lerp(u, grad(p[ab], x, y - 1), grad(p[bb], x - 1, y - 1))
    );
  };
}

// Tile IDs based on the 8x8 user-provided atlas description.
// Row 1: Tanah gelap (Dark Soil/Wasteland)
const DARK_WASTELAND_TILES = [0, 1, 2, 3, 4, 5, 6, 7];
// Row 2: Tanah coklat (Brown/Clay Soil)
const CLAY_SOIL_TILES = [8, 9, 10, 11, 12, 13, 14, 15];
// Row 3: Rumput tipis (Sparse Grass)
const SPARSE_GRASS_TILES = [16, 17, 18, 19, 20, 21, 22, 23];
// Row 4 & 5: Rumput hijau (Lush Grass)
const LUSH_GRASS_TILES = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39];
// Row 6: Tanah coklat kering (Dry Dirt Mix)
const MIXED_DRY_DIRT_TILES = [40, 41, 42, 43, 44, 45, 46, 47];
// Row 7: Tanah dengan fitur (Ground with Features/Debris)
const DEBRIS_TILES = [49, 50, 51, 52, 53, 55]; // Ranting, kayu, akar, semak mati, kertas
const GLOWING_MOSS_TILE = 48; // R7C1
// Row 8: Tanah Radiasi (Radiation)
const HAZARD_RADIATION_TILE = 56; // R8C1

const getRandomTile = (tiles: number[]) => tiles[Math.floor(Math.random() * tiles.length)];

export function generateMap(width: number, height: number): number[][] {
  const primaryNoise = createNoise(Date.now());
  const featureNoise = createNoise(Date.now() + 1);
  const map: number[][] = [];
  
  const primaryScale = 25; // Controls the size of the main biomes. Larger = bigger biomes.
  const featureScale = 10;  // Controls frequency of special features. Smaller = more frequent.

  for (let y = 0; y < height; y++) {
    map[y] = [];
    for (let x = 0; x < width; x++) {
      const pVal = (primaryNoise(x / primaryScale, y / primaryScale) + 1) / 2; // Normalize to 0-1
      const fVal = (featureNoise(x / featureScale, y / featureScale) + 1) / 2; // Normalize to 0-1

      // 1. Determine base biome using primary noise for large, seamless areas
      if (pVal < 0.25) { // 25% of map is Dark Wasteland
        map[y][x] = getRandomTile(DARK_WASTELAND_TILES);
      } else if (pVal < 0.50) { // 25% is Clay/Dry Soil
        map[y][x] = Math.random() > 0.5 ? getRandomTile(CLAY_SOIL_TILES) : getRandomTile(MIXED_DRY_DIRT_TILES);
      } else if (pVal < 0.75) { // 25% is Sparse Grass
        map[y][x] = getRandomTile(SPARSE_GRASS_TILES);
      } else { // 25% is Lush Grass
        map[y][x] = getRandomTile(LUSH_GRASS_TILES);
      }
      
      // 2. Add features/details using secondary noise
      if (fVal > 0.85) { // 15% chance for a special feature tile
          if (pVal < 0.5 && Math.random() > 0.4) { // Add debris to wasteland and clay areas
              map[y][x] = getRandomTile(DEBRIS_TILES);
          } else if (pVal >= 0.75 && Math.random() > 0.7) { // Add wildflowers to lush grass
               map[y][x] = 25; // R4C2 -> Grass with wildflowers
          }
      }
      
      // 3. Add very rare, unique tiles
      if (fVal > 0.96) { // 4% chance for a rare tile
          if (Math.random() > 0.5) {
             map[y][x] = HAZARD_RADIATION_TILE;
          } else {
             map[y][x] = GLOWING_MOSS_TILE;
          }
      }
    }
  }
  return map;
}

/**
 * Menempatkan node sumber daya secara prosedural di peta.
 * @param tileMap Peta tile yang sudah ada.
 * @param count Jumlah node yang ingin dibuat.
 * @returns Array berisi ResourceNode.
 */
export function spawnResourceNodes(tileMap: number[][], count: number): ResourceNode[] {
    const nodes: ResourceNode[] = [];
    const height = tileMap.length;
    if (height === 0) return [];
    const width = tileMap[0].length;
    let nodeId = 0;

    // Define tiles where each resource type can spawn
    const spawnRules: { type: ResourceNodeType, tiles: number[] }[] = [
        { type: 'fallen_tree', tiles: [...SPARSE_GRASS_TILES, ...LUSH_GRASS_TILES, 17, 22, 23, 29, 30, 37] },
        { type: 'scrap_pile', tiles: [...DARK_WASTELAND_TILES, ...CLAY_SOIL_TILES, ...DEBRIS_TILES, ...MIXED_DRY_DIRT_TILES, 15, 47] },
        { type: 'berry_bush', tiles: [...LUSH_GRASS_TILES, 25] }, // Berries grow in lush areas, especially with wildflowers
        { type: 'electronics_scrap', tiles: [...DEBRIS_TILES, 54] }, // Electronics found near debris and maybe traffic cones (cars)
    ];

    const allSpawnableLocations: {x: number, y: number}[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const tile = tileMap[y][x];
            if (spawnRules.some(rule => rule.tiles.includes(tile))) {
                allSpawnableLocations.push({x, y});
            }
        }
    }
    
    // Shuffle locations to randomize placement
    for (let i = allSpawnableLocations.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allSpawnableLocations[i], allSpawnableLocations[j]] = [allSpawnableLocations[j], allSpawnableLocations[i]];
    }

    const existingLocations = new Set<string>();

    for (let i = 0; i < count && i < allSpawnableLocations.length; i++) {
        const { x, y } = allSpawnableLocations[i];
        const locationKey = `${x},${y}`;
        if (existingLocations.has(locationKey)) continue;

        const tile = tileMap[y][x];

        // Find which resource types can spawn here
        const possibleTypes = spawnRules.filter(rule => rule.tiles.includes(tile)).map(rule => rule.type);

        if (possibleTypes.length > 0) {
            // Pick one randomly from the possible types for this tile
            const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
            
            nodes.push({
                id: `node-${nodeId++}`,
                type,
                x, y,
                amount: Math.random() * 50 + 50,
            });
            existingLocations.add(locationKey);
        }
    }
    return nodes;
}

/**
 * Menempatkan kontainer jarahan (loot) secara prosedural di peta.
 * @param tileMap Peta tile yang sudah ada.
 * @param count Jumlah kontainer yang ingin dibuat.
 * @returns Array berisi LootContainer.
 */
export function spawnLootContainers(tileMap: number[][], count: number): LootContainer[] {
    const containers: LootContainer[] = [];
    const height = tileMap.length;
    if (height === 0) return [];
    const width = tileMap[0].length;
    let containerId = 0;

    const carSpawnTiles = [54]; // R7C7 -> Dirt with traffic cone (placeholder for a car)
    const debrisSpawnTiles = [...DARK_WASTELAND_TILES, ...DEBRIS_TILES, 15, 47];
    const militarySpawnTiles = [...DARK_WASTELAND_TILES, 55]; // Rare spawn in wastelands or near dead bushes

    const allSpawnableLocations: {x: number, y: number}[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
             const tile = tileMap[y][x];
             if (carSpawnTiles.includes(tile) || debrisSpawnTiles.includes(tile) || militarySpawnTiles.includes(tile)) {
                 allSpawnableLocations.push({x, y});
             }
        }
    }

    // Shuffle locations to randomize placement
    for (let i = allSpawnableLocations.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allSpawnableLocations[i], allSpawnableLocations[j]] = [allSpawnableLocations[j], allSpawnableLocations[i]];
    }
    
    const existingLocations = new Set<string>();

    for(let i = 0; i < count && i < allSpawnableLocations.length; i++) {
        const { x, y } = allSpawnableLocations[i];
        const locationKey = `${x},${y}`;
        if(existingLocations.has(locationKey)) continue;

        const tile = tileMap[y][x];
        let type: LootContainerType | null = null;

        // Determine type with priority and randomness
        if (militarySpawnTiles.includes(tile) && Math.random() > 0.85) { // 15% chance for a military crate on valid tiles
            type = 'military_crate';
        } else if (carSpawnTiles.includes(tile) && Math.random() > 0.3) {
            type = 'ruined_car';
        } else if (debrisSpawnTiles.includes(tile)) {
            // Make debris piles the most common fallback
            type = 'debris_pile';
        }

        if (type) {
            containers.push({
                id: `loot-${containerId++}`,
                type,
                x, y,
                isEmpty: false,
            });
            existingLocations.add(locationKey);
        }
    }
    return containers;
}