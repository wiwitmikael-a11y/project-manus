// assets/assetMapping.ts

interface AnimationData {
    frames: number;
    speed: number; // Animation speed, used as a divisor for time
    rows: { [direction: string]: number }; // Maps direction to row index on spritesheet
}

interface SpritesheetData {
    frameSize: number;
    animations: {
        [animName: string]: AnimationData;
    };
}

export const spritesheetMapping: { [key: string]: SpritesheetData } = {
    'colonist_male_1': {
        frameSize: 64, // The size of one frame in pixels (e.g., 64x64)
        animations: {
            idle: {
                frames: 4,
                speed: 30, // slow animation
                rows: { 'S': 0, 'W': 1, 'E': 2, 'N': 3 }
            },
            walk: {
                frames: 8,
                speed: 10, // faster animation
                rows: { 'S': 4, 'W': 5, 'E': 6, 'N': 7 }
            }
        }
    },
    'colonist_female_1': {
        frameSize: 64,
        animations: {
            idle: {
                frames: 4,
                speed: 30,
                rows: { 'S': 0, 'W': 1, 'E': 2, 'N': 3 }
            },
            walk: {
                frames: 8,
                speed: 10,
                rows: { 'S': 4, 'W': 5, 'E': 6, 'N': 7 }
            }
        }
    },
};
