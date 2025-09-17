// assets/resourceAssetMapping.ts
import { ResourceNodeType, LootContainerType } from '../types.ts';

interface AtlasCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

type ResourceNodeMapping = { [key in ResourceNodeType]: AtlasCoords };
type LootContainerMapping = { [key in LootContainerType]: AtlasCoords };

/**
 * Maps resource and loot container types to their coordinates
 * within the resource_atlas.png spritesheet.
 * All coordinates are in pixels.
 */
export const resourceMapping: {
  nodes: ResourceNodeMapping;
  containers: LootContainerMapping;
} = {
  nodes: {
    fallen_tree:      { x: 0,   y: 0, w: 64, h: 64 },
    scrap_pile:       { x: 64,  y: 0, w: 64, h: 64 },
    berry_bush:       { x: 128, y: 0, w: 64, h: 64 },
    electronics_scrap:{ x: 192, y: 0, w: 64, h: 64 },
  },
  containers: {
    ruined_car:       { x: 0,   y: 64, w: 64, h: 64 },
    debris_pile:      { x: 64,  y: 64, w: 64, h: 64 },
    military_crate:   { x: 128, y: 64, w: 64, h: 64 },
  },
};
