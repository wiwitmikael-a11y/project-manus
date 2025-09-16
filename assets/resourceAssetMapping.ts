
// Fix: Implemented the resource asset mapping.
export interface AtlasMapping {
    url: string;
    nodes: {
        [key: string]: { x: number, y: number, w: number, h: number }
    },
    containers: {
        [key: string]: { x: number, y: number, w: number, h: number }
    }
}

// All coordinates are in pixels on the source image.
const RESOURCE_ATLAS_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/project-manus-assets/main/Resources_Atlas_01.png';

export const resourceMapping: AtlasMapping = {
    url: RESOURCE_ATLAS_URL,
    nodes: {
        // Defines the area on the atlas for a fallen tree.
        'fallen_tree': { x: 0, y: 0, w: 128, h: 128 },
        // Defines the area for a scrap pile.
        'scrap_pile': { x: 128, y: 0, w: 128, h: 128 },
    },
    containers: {
        // Defines the area for a ruined car.
        'ruined_car': { x: 256, y: 0, w: 128, h: 128 },
         // Defines the area for a pile of debris that can be looted.
        'debris_pile': { x: 384, y: 0, w: 128, h: 128 },
    }
};
