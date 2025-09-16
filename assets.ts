// Fix: Implement asset loading for game sprites.
export const assets: {
    agentSpritesheet: HTMLImageElement | null;
} = {
    agentSpritesheet: null,
};

// A simple 64x64 spritesheet with 4 directions (down, up, left, right) as rows
// and 4 animation frames as columns. Each sprite is 16x16.
// This is a placeholder for actual game art.
const AGENT_SPRITESHEET_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKVSURBVHhe7ZfRbhw1EIYdlhVwAStcIM8k7yTfJH8kHyTfJHcSKpAgkKyAuUKgK1AVGgCuwBVYACsI4jAw42APwxy3s3v2u6dnmekf2e+TGWv27G0bhuE4I/A+gWcIvOfws4AfA3iEwHkCrwP8eA/g4wAeIvA0gU/g1/4LwGkCrwN8CPgwwKcDvA3gTwP8CeBTAB8BfA7gswB/BvAnAI8Q+DjA5wE+DvA0gY8BfAvgcwCfAvgYwAcCnxL4GMDnAD4A8AmAjwA+D/BtAH8B8CmAjwD8CeBTAB8H+AzgYwAfBfgh4GcAnwP4GMDHAD4C8BmATwD8C8CfAj5C4CPAuwA/A3wY4HMAHwP4FMBnAD4B8AGA/wL8CeBTAB8C/BTws4BPgU8B/BTAnwA+BPgwwKcBvA3gTwP8GMDHAb4M8GmATwM8D+AjAC8Q+GkAnwB4hMDbAH4I+DnAJwA+C/CtAXwI4FEA7wH8eBfABwHeIfA+gU8BPETgA/gGgHcIfBDgEwB/BvBxgP8E8AmAtwH8CPAngM8BfA7gwwA+AvgwwM8APg3waQAfAvgcgLcA/AvgEwDfAvgl4OcAnwD4IcCfAT4M8AGA/wL8CeAjAI8QeI/ADwDeIfAvgM8BfAvgrQF8COBvAF8A+GLAbwD+CPAggA8B/BTARwA+C/DbgL8F/CXgZwB/AvgwwM8APg3waQAfA7gL8LkAbwP4FMC3AfwI4CMAjwB4hMDHAb4M8AmAjwA+A/BxgHcAfArgUwAfAnhH4HcAnwL4A78A8CeBTwF8COAPAHwI4GMANwJ8CGAzAC8Q+CnAPwV8COA/AvgwwM8APg3waQAfA/gYwM8A3gJ4L8AfAvghwG8BvA3ghwA+BPAfgP8F/CngFwB/Cfgp8LeAbwL4A/gIwKcBvA3gTwP8GMDHAd/M3X/s51gAAAAASUVORK5CYII=';

export const loadAssets = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (assets.agentSpritesheet) {
            resolve();
            return;
        }
        
        const agentSprite = new Image();
        agentSprite.src = AGENT_SPRITESHEET_URL;
        agentSprite.onload = () => {
            assets.agentSpritesheet = agentSprite;
            resolve();
        };
        agentSprite.onerror = (err) => {
            console.error("Failed to load agent spritesheet", err);
            reject(new Error("Failed to load agent spritesheet"));
        };
    });
};
