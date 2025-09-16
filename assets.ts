import * as PIXI from 'pixi.js';

// Using a public domain sprite sheet for demonstration purposes.
// A local copy should be placed in the /public/assets/ directory.
// Source: https://opengameart.org/content/base-character-spritesheet-16x16
const AGENT_SPRITE_SHEET_URL = '/assets/character_sheet.png';

let agentTextures: PIXI.Texture[] = [];

// This function loads the assets and prepares them for the game.
// It should be called once before the game starts.
export const loadAssets = async (): Promise<void> => {
  try {
    const baseTexture = await PIXI.Assets.load<PIXI.Texture>(AGENT_SPRITE_SHEET_URL);
    
    // Create textures for different directions from the sprite sheet
    // This assumes a specific layout for the sprite sheet.
    // Down, Up, Left, Right
    // Fix: Corrected PIXI.Texture creation from a spritesheet for modern PixiJS versions.
    // The `new PIXI.Texture(baseTexture, rectangle)` constructor is deprecated.
    // The correct method is to clone the loaded texture and set its frame for each sub-texture.
    agentTextures.push(new PIXI.Texture(baseTexture.source, new PIXI.Rectangle(0, 0, 16, 16)));
    agentTextures.push(new PIXI.Texture(baseTexture.source, new PIXI.Rectangle(16, 0, 16, 16)));
    agentTextures.push(new PIXI.Texture(baseTexture.source, new PIXI.Rectangle(32, 0, 16, 16)));
    agentTextures.push(new PIXI.Texture(baseTexture.source, new PIXI.Rectangle(48, 0, 16, 16)));

    // Fix: The '.valid' property on PIXI.Texture was removed in newer versions of PixiJS.
    // The success of the awaited `PIXI.Assets.load` call ensures the texture is ready.
    if (agentTextures.length === 0) {
      console.error('Failed to create textures from spritesheet.');
      throw new Error('Failed to create textures from spritesheet.');
    }

  } catch (error) {
    console.error('Error loading game assets:', error);
    // As a fallback, use a white texture so the game doesn't crash
    if (agentTextures.length === 0) {
        agentTextures = [PIXI.Texture.WHITE, PIXI.Texture.WHITE, PIXI.Texture.WHITE, PIXI.Texture.WHITE];
    }
  }
};

export const getAgentTexture = (direction: 'down' | 'up' | 'left' | 'right'): PIXI.Texture => {
    switch (direction) {
        case 'down':
            return agentTextures[0] || PIXI.Texture.WHITE;
        case 'up':
            return agentTextures[1] || PIXI.Texture.WHITE;
        case 'left':
            return agentTextures[2] || PIXI.Texture.WHITE;
        case 'right':
            return agentTextures[3] || PIXI.Texture.WHITE;
        default:
            return agentTextures[0] || PIXI.Texture.WHITE;
    }
};

// A simple grass texture for the background, generated programmatically.
// Fix: The PIXI.IRenderer interface is deprecated. The type is simplified to PIXI.Renderer.
export const createGrassTexture = (renderer: PIXI.Renderer): PIXI.Texture => {
    const gfx = new PIXI.Graphics();
    gfx.beginFill(0x1a472a); // Dark green
    gfx.drawRect(0, 0, 32, 32);
    gfx.beginFill(0x2a623d); // Lighter green
    gfx.drawRect(0, 0, 16, 16);
    gfx.drawRect(16, 16, 16, 16);
    gfx.endFill();
    const options = { scaleMode: PIXI.SCALE_MODES.NEAREST, resolution: 1 };
    return renderer.generateTexture(gfx, options);
};