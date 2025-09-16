// services/mapGenerationService.ts
import { ResourceNode, ResourceNodeType } from '../types';

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

// Tile IDs (sesuai dengan atlas 10x10)
const URBAN_TILES = [0, 1, 2];
const WASTELAND_TILES = [10, 11, 12];
const GRASS_TILES = [20, 21, 22];

export function generateMap(width: number, height: number): number[][] {
  const noise = createNoise(Date.now());
  const map: number[][] = [];
  const scale = 15;

  for (let y = 0; y < height; y++) {
    map[y] = [];
    for (let x = 0; x < width; x++) {
      const noiseValue = (noise(x / scale, y / scale) + 1) / 2;

      if (noiseValue < 0.35) {
        map[y][x] = URBAN_TILES[Math.floor(Math.random() * URBAN_TILES.length)];
      } else if (noiseValue < 0.65) {
        map[y][x] = WASTELAND_TILES[Math.floor(Math.random() * WASTELAND_TILES.length)];
      } else {
        map[y][x] = GRASS_TILES[Math.floor(Math.random() * GRASS_TILES.length)];
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
    const width = tileMap[0].length;
    let nodeId = 0;

    for(let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        const tile = tileMap[y][x];

        let type: ResourceNodeType | null = null;
        if (GRASS_TILES.includes(tile) && Math.random() > 0.4) {
            type = 'fallen_tree';
        } else if (URBAN_TILES.includes(tile) && Math.random() > 0.5) {
            type = 'scrap_pile';
        }
        
        if (type) {
            nodes.push({
                id: `node-${nodeId++}`,
                type,
                x, y,
                amount: Math.random() * 50 + 50, // Jumlah sumber daya antara 50-100
            });
        }
    }
    return nodes;
}
