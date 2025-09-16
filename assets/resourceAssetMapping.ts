// assets/resourceAssetMapping.ts

export interface AtlasMapping {
    url: string;
    nodes: {
        [key: string]: { x: number, y: number, w: number, h: number }
    },
    containers: {
        [key: string]: { x: number, y: number, w: number, h: number }
    }
}

// All coordinates are in pixels on the source image, an 8x8 grid on a 1024x1024 atlas.
// Each cell is 128x128px.
const RESOURCE_ATLAS_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/project-manus-assets/main/Resources_Atlas_01.png';

export const resourceMapping: AtlasMapping = {
    url: RESOURCE_ATLAS_URL,
    nodes: {
        // R1C2: Batang pohon tumbang besar (Large fallen tree trunk)
        'fallen_tree': { x: 128, y: 0, w: 128, h: 128 },
        // R1C6: Tumpukan besi tua dan puing-puing mesin (Pile of scrap metal)
        'scrap_pile': { x: 640, y: 0, w: 128, h: 128 },
        // R3C1: Semak beri liar (Wild berry bush)
        'berry_bush': { x: 0, y: 256, w: 128, h: 128 },
        // R4C2: Tumpukan besi tua elektronik (Electronics scrap pile)
        'electronics_scrap': { x: 128, y: 384, w: 128, h: 128 },
    },
    containers: {
        // R1C1: Mobil rongsok berkarat (Rusty junk car)
        'ruined_car': { x: 0, y: 0, w: 128, h: 128 },
        // R7C4: Tumpukan puing kecil (Small rubble pile)
        'debris_pile': { x: 384, y: 768, w: 128, h: 128 },
        // R5C6: Peti militer (Military supply crate)
        'military_crate': { x: 640, y: 512, w: 128, h: 128 },
    }
};