// IllusionEngine.ts

import { SimulationState, Agent } from './types.ts';
import { TILE_RENDER_SIZE } from './gameConstants.ts';

// --- Constants ---
const TILE_WIDTH = TILE_RENDER_SIZE;
const TILE_HEIGHT = TILE_RENDER_SIZE / 2;
const TILE_DEPTH = TILE_HEIGHT * 0.75; // Visual height of a 1-unit z-level cube

const DAY_DURATION_TICKS = 4800;
const DEFAULT_TILE_COLOR = '#5a5a5a';

const TILE_COLOR_MAP: { [key: number]: string } = {
    // Row 1: Dark Soil/Wasteland
    0: '#4a4137', 1: '#5c5044', 2: '#51463c', 3: '#4a4137', 4: '#5c5044', 5: '#51463c', 6: '#4a4137', 7: '#5c5044',
    // Row 2: Clay Soil
    8: '#8a6a4f', 9: '#9b7a5e', 10: '#7e5e45', 11: '#8a6a4f', 12: '#9b7a5e', 13: '#7e5e45', 14: '#8a6a4f', 15: '#9b7a5e',
    // Row 3: Sparse Grass
    16: '#6b7a4f', 17: '#7c8b5e', 18: '#606e45', 19: '#6b7a4f', 20: '#7c8b5e', 21: '#606e45', 22: '#6b7a4f', 23: '#7c8b5e',
    // Row 4 & 5: Lush Grass
    24: '#6b8a4f', 25: '#7ca25e', 26: '#609a45', 27: '#6b8a4f', 28: '#7ca25e', 29: '#609a45', 30: '#6b8a4f', 31: '#7ca25e', 32: '#6b8a4f', 33: '#7ca25e', 34: '#609a45', 35: '#6b8a4f', 36: '#7ca25e', 37: '#609a45', 38: '#6b8a4f', 39: '#7ca25e',
    // Row 6: Dry Dirt Mix
    40: '#a18a6f', 41: '#b39b7e', 42: '#907a5e', 43: '#a18a6f', 44: '#b39b7e', 45: '#907a5e', 46: '#a18a6f', 47: '#b39b7e',
    // Row 7: Special/Debris
    48: '#5ca29e', // Glowing Moss
    49: '#635a51', 50: '#635a51', 51: '#635a51', 52: '#635a51', 53: '#635a51', 55: '#635a51',
    // Row 8: Hazard
    56: '#9a4f8a', // Radiation
};

interface Renderable {
    id: string;
    x: number;
    y: number;
    z: number;
    renderY: number;
    type: 'agent' | 'resourceNode' | 'lootContainer' | 'placedStructure';
    subType: string; // e.g., 'fallen_tree', 'shelter_1'
    data: any; // Additional data like agent details
}

// --- PUSTAKA TEKSTUR PROSEDURAL ---
class TextureLibrary {
    private ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    drawWood(w: number, h: number) {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 0, w, h);
        this.ctx.strokeStyle = 'rgba(66, 28, 0, 0.3)';
        this.ctx.lineWidth = 1.5;
        for (let i = 0; i < h; i += 5) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.quadraticCurveTo(w / 2, i + (Math.random() - 0.5) * 4, w, i);
            this.ctx.stroke();
        }
    }

    drawRustyMetal(w: number, h: number) {
        const grad = this.ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#a1a1a1');
        grad.addColorStop(1, '#676767');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, w, h);

        for (let i = 0; i < 30; i++) {
            const x = Math.random() * w, y = Math.random() * h;
            if (i % 2 === 0) {
                this.ctx.fillStyle = `rgba(139, 69, 19, ${Math.random() * 0.5})`;
                this.ctx.beginPath(); this.ctx.arc(x, y, Math.random() * 8, 0, Math.PI * 2); this.ctx.fill();
            } else {
                this.ctx.strokeStyle = `rgba(50, 50, 50, 0.4)`; this.ctx.lineWidth = Math.random();
                this.ctx.beginPath(); this.ctx.moveTo(x, y); this.ctx.lineTo(x + Math.random() * 10 - 5, y + Math.random() * 10 - 5); this.ctx.stroke();
            }
        }
    }

    drawFoliage(w: number, h: number) {
        this.ctx.fillStyle = '#32CD32'; // LimeGreen
        this.ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * w, y = Math.random() * h;
            const size = Math.random() * 5;
            this.ctx.fillStyle = `rgba(0, 100, 0, ${0.2 + Math.random() * 0.3})`; // DarkGreen shades
            this.ctx.beginPath(); this.ctx.arc(x, y, size, 0, Math.PI * 2); this.ctx.fill();
        }
    }

    drawTarp(w: number, h: number) {
        this.ctx.fillStyle = '#A0522D'; // Sienna
        this.ctx.fillRect(0, 0, w, h);
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < w; i += 10) { this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, h); this.ctx.stroke(); }
        for (let i = 0; i < h; i += 10) { this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(w, i); this.ctx.stroke(); }
    }
    
    drawSolidColor(color: string) {
        return (w: number, h: number) => {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, 0, w, h);
        };
    }
}

export class IllusionEngine {
    private ctx: CanvasRenderingContext2D;
    private textures: TextureLibrary;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.textures = new TextureLibrary(ctx);
    }

    public worldToScreen(worldX: number, worldY: number): { screenX: number; screenY: number } {
        const screenX = (worldX - worldY) * TILE_WIDTH / 2;
        const screenY = (worldX + worldY) * TILE_HEIGHT / 2;
        return { screenX, screenY };
    }

    private adjustColor(hex: string, amount: number): string {
        if (!hex) return '#FFFFFF';
        let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        r = Math.max(0, Math.min(255, r + amount)); g = Math.max(0, Math.min(255, g + amount)); b = Math.max(0, Math.min(255, b + amount));
        return `#${(r).toString(16).padStart(2, '0')}${(g).toString(16).padStart(2, '0')}${(b).toString(16).padStart(2, '0')}`;
    }

    private drawProjectedShadow(worldX: number, worldY: number, size: number, lightAngle: number) {
        const { screenX, screenY } = this.worldToScreen(worldX, worldY);
        const shadowOffsetX = Math.cos(lightAngle) * 20 * size;
        const shadowOffsetY = Math.sin(lightAngle) * 10 * size;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(screenX + shadowOffsetX, screenY + (TILE_HEIGHT / 4), TILE_WIDTH / 2.5 * size, TILE_HEIGHT / 2.5 * size, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    private drawIsometricCube(worldX: number, worldY: number, z: number, size: number, textures: { top: Function, left: Function, right: Function }, lightAngle: number) {
        const { screenX, screenY } = this.worldToScreen(worldX, worldY);
        const finalY = screenY - (z * TILE_DEPTH);
        const w = (TILE_WIDTH / 2) * size, h = (TILE_HEIGHT / 2) * size;

        const applyTextureToFace = (pathPoints: {x:number, y:number}[], textureFunc: Function, faceType: 'top' | 'left' | 'right') => {
            this.ctx.save();
            this.ctx.beginPath();
            pathPoints.forEach((p, i) => i === 0 ? this.ctx.moveTo(p.x, p.y) : this.ctx.lineTo(p.x, p.y));
            this.ctx.closePath();
            this.ctx.clip();
            textureFunc(TILE_WIDTH * size, TILE_DEPTH * size * 2);
            
            const lightX = Math.cos(lightAngle);
            let overlayOpacity = 0;
            if (faceType === 'top') { overlayOpacity = -0.2; }
            else if (faceType === 'left') { if (lightX > 0) overlayOpacity = 0.3; }
            else if (faceType === 'right') { if (lightX < 0) overlayOpacity = 0.3; }

            this.ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
            this.ctx.fill();
            this.ctx.restore();
        };

        const topFace = [{x: screenX, y: finalY - TILE_DEPTH*size}, {x: screenX + w, y: finalY - TILE_DEPTH*size + h}, {x: screenX, y: finalY - TILE_DEPTH*size + h*2}, {x: screenX - w, y: finalY - TILE_DEPTH*size + h}];
        const leftFace = [{x: screenX - w, y: finalY - TILE_DEPTH*size + h}, {x: screenX, y: finalY - TILE_DEPTH*size + h*2}, {x: screenX, y: finalY + h*2}, {x: screenX - w, y: finalY + h}];
        const rightFace = [{x: screenX + w, y: finalY - TILE_DEPTH*size + h}, {x: screenX, y: finalY - TILE_DEPTH*size + h*2}, {x: screenX, y: finalY + h*2}, {x: screenX + w, y: finalY + h}];
        
        applyTextureToFace(leftFace, textures.left, 'left');
        applyTextureToFace(rightFace, textures.right, 'right');
        applyTextureToFace(topFace, textures.top, 'top');
    }
    
    private drawIsometricTile(worldX: number, worldY: number, color: string) {
        const { screenX, screenY } = this.worldToScreen(worldX, worldY);
        this.ctx.fillStyle = this.adjustColor(color, -10);
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, screenY);
        this.ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
        this.ctx.lineTo(screenX, screenY + TILE_HEIGHT);
        this.ctx.lineTo(screenX - TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2);
        this.ctx.closePath();
        this.ctx.fill();
    }

    // --- PUSTAKA ASET PROSEDURAL (dengan Tekstur) ---

    private drawSurvivor(x: number, y: number, z: number, lightAngle: number, agent: Agent) {
        const clothColor = agent.gender === 'male' ? '#4682B4' : '#B44682';
        const skinColor = '#FBE5D5';
        const solidCloth = this.textures.drawSolidColor(clothColor);
        const solidSkin = this.textures.drawSolidColor(skinColor);
        this.drawIsometricCube(x, y, z, 0.4, { top: solidCloth, left: solidCloth, right: solidCloth }, lightAngle); // Badan
        this.drawIsometricCube(x, y, z + 0.6, 0.3, { top: solidSkin, left: solidSkin, right: solidSkin }, lightAngle); // Kepala
    }

    private drawMutatedTree(x: number, y: number, z: number, lightAngle: number) {
        const bark = this.textures.drawWood.bind(this.textures);
        const foliage = this.textures.drawFoliage.bind(this.textures);
        this.drawIsometricCube(x, y, z, 0.4, { top: bark, left: bark, right: bark }, lightAngle);
        this.drawIsometricCube(x, y, z + 1, 0.3, { top: bark, left: bark, right: bark }, lightAngle);
        this.drawIsometricCube(x, y, z + 1.5, 1, { top: foliage, left: foliage, right: foliage }, lightAngle);
    }
    
    private drawRubblePile(x: number, y: number, z: number, lightAngle: number) {
        const metal = this.textures.drawRustyMetal.bind(this.textures);
        this.drawIsometricCube(x, y, z, 0.5, { top: metal, left: metal, right: metal }, lightAngle);
        this.drawIsometricCube(x + 0.2, y - 0.1, z, 0.4, { top: metal, left: metal, right: metal }, lightAngle);
    }
    
    private drawBerryBush(x: number, y: number, z: number, lightAngle: number) {
        const foliage = this.textures.drawFoliage.bind(this.textures);
        const berry = this.textures.drawSolidColor('#DC143C');
        this.drawIsometricCube(x, y, z, 0.5, { top: foliage, left: foliage, right: foliage }, lightAngle);
        this.drawIsometricCube(x, y, z + 0.3, 0.3, { top: berry, left: berry, right: berry }, lightAngle);
    }
    
    private drawElectronicsScrap(x: number, y: number, z: number, lightAngle: number) {
        const metal = this.textures.drawRustyMetal.bind(this.textures);
        this.drawIsometricCube(x, y, z, 0.4, { top: metal, left: metal, right: metal }, lightAngle);
    }
    
    private drawRuinedCar(x: number, y: number, z: number, lightAngle: number) {
        const metal = this.textures.drawRustyMetal.bind(this.textures);
        this.drawIsometricCube(x, y, z, 0.9, { top: metal, left: metal, right: metal }, lightAngle);
    }
    
    private drawMilitaryCrate(x: number, y: number, z: number, lightAngle: number) {
        const wood = this.textures.drawWood.bind(this.textures);
        this.drawIsometricCube(x, y, z, 0.6, { top: wood, left: wood, right: wood }, lightAngle);
    }

    private drawMakeshiftTent(x: number, y: number, z: number, lightAngle: number) {
        const tarp = this.textures.drawTarp.bind(this.textures);
        this.drawIsometricCube(x - 0.3, y, z, 0.8, { top: tarp, left: tarp, right: tarp }, lightAngle);
        this.drawIsometricCube(x + 0.3, y, z, 0.8, { top: tarp, left: tarp, right: tarp }, lightAngle);
    }
    
    private drawStorageCrate(x: number, y: number, z: number, lightAngle: number) {
        const wood = this.textures.drawWood.bind(this.textures);
        this.drawIsometricCube(x, y, z, 0.7, { top: wood, left: wood, right: wood }, lightAngle);
    }
    
    private drawResearchBench(x: number, y: number, z: number, lightAngle: number) {
        const wood = this.textures.drawWood.bind(this.textures);
        const metal = this.textures.drawRustyMetal.bind(this.textures);
        this.drawIsometricCube(x, y, z, 1.0, { top: wood, left: wood, right: wood }, lightAngle);
        this.drawIsometricCube(x - 0.2, y + 0.1, z + 0.5, 0.3, { top: metal, left: metal, right: metal }, lightAngle);
    }

    // --- RENDER UTAMA ---
    
    public render(state: SimulationState, camera: { x: number, y: number, zoom: number }, selectedAgentId: string | null) {
        if (!this.ctx) return;

        const timeOfDay = (state.tick % DAY_DURATION_TICKS) / DAY_DURATION_TICKS;
        const lightAngle = timeOfDay * Math.PI * 2 - Math.PI / 2;
        
        const { tileMap, width, height } = state.world;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                 const tileId = tileMap[y]?.[x] ?? 0;
                 const color = TILE_COLOR_MAP[tileId] || DEFAULT_TILE_COLOR;
                 this.drawIsometricTile(x, y, color);
            }
        }
        
        const renderables: Renderable[] = [];
        state.agents.forEach(agent => renderables.push({ id: agent.id, x: agent.x, y: agent.y, z: 0.1, renderY: (agent.x + agent.y) * TILE_HEIGHT / 2, type: 'agent', subType: 'survivor', data: agent }));
        state.world.resourceNodes.forEach(node => renderables.push({ id: node.id, x: node.x, y: node.y, z: 0, renderY: (node.x + node.y) * TILE_HEIGHT / 2, type: 'resourceNode', subType: node.type, data: node }));
        state.world.lootContainers.forEach(loot => { if (!loot.isEmpty) renderables.push({ id: loot.id, x: loot.x, y: loot.y, z: 0, renderY: (loot.x + loot.y) * TILE_HEIGHT / 2, type: 'lootContainer', subType: loot.type, data: loot }); });
        state.world.placedStructures.forEach(struct => renderables.push({ id: struct.id, x: struct.x, y: struct.y, z: 0, renderY: (struct.x + struct.y) * TILE_HEIGHT / 2, type: 'placedStructure', subType: struct.blueprintId, data: struct }));
        
        renderables.sort((a, b) => a.renderY - b.renderY);

        renderables.forEach(obj => {
            const size = obj.type === 'agent' ? 0.4 : 1.0;
            this.drawProjectedShadow(obj.x, obj.y, size, lightAngle)
        });

        renderables.forEach(obj => {
             switch (obj.type) {
                case 'agent':
                    this.drawSurvivor(obj.x, obj.y, obj.z, lightAngle, obj.data);
                    break;
                case 'resourceNode':
                    switch(obj.subType) {
                        case 'fallen_tree': this.drawMutatedTree(obj.x, obj.y, obj.z, lightAngle); break;
                        case 'scrap_pile': this.drawRubblePile(obj.x, obj.y, obj.z, lightAngle); break;
                        case 'berry_bush': this.drawBerryBush(obj.x, obj.y, obj.z, lightAngle); break;
                        case 'electronics_scrap': this.drawElectronicsScrap(obj.x, obj.y, obj.z, lightAngle); break;
                    }
                    break;
                case 'lootContainer':
                     switch(obj.subType) {
                        case 'ruined_car': this.drawRuinedCar(obj.x, obj.y, obj.z, lightAngle); break;
                        case 'debris_pile': this.drawRubblePile(obj.x, obj.y, obj.z, lightAngle); break;
                        case 'military_crate': this.drawMilitaryCrate(obj.x, obj.y, obj.z, lightAngle); break;
                     }
                    break;
                case 'placedStructure':
                    switch(obj.subType) {
                        case 'shelter_1': this.drawMakeshiftTent(obj.x, obj.y, obj.z, lightAngle); break;
                        case 'storage_1': this.drawStorageCrate(obj.x, obj.y, obj.z, lightAngle); break;
                        case 'research_bench_1': this.drawResearchBench(obj.x, obj.y, obj.z, lightAngle); break;
                    }
                    break;
             }

             if (obj.id === selectedAgentId) {
                const { screenX, screenY } = this.worldToScreen(obj.x, obj.y);
                this.ctx.strokeStyle = `rgba(251, 191, 36, 0.9)`;
                this.ctx.lineWidth = 3 / camera.zoom;
                this.ctx.beginPath();
                this.ctx.ellipse(screenX, screenY + (TILE_HEIGHT / 4), TILE_WIDTH / 2.5 * 0.4, TILE_HEIGHT / 2.5 * 0.4, 0, 0, Math.PI * 2);
                this.ctx.stroke();
             }
        });
    }

    public getAtmosphereColor(tick: number): string {
        const timeOfDay = (tick % DAY_DURATION_TICKS) / DAY_DURATION_TICKS;
        const nightColor = { r: 11, g: 17, b: 34 }, dayColor = { r: 135, g: 206, b: 235 }, duskColor = { r: 255, g: 140, b: 0 };
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        let c = nightColor;
        if (timeOfDay >= 0.2 && timeOfDay < 0.3) { const t = (timeOfDay - 0.2) / 0.1; c = { r: lerp(nightColor.r, duskColor.r, t), g: lerp(nightColor.g, duskColor.g, t), b: lerp(nightColor.b, duskColor.b, t) };
        } else if (timeOfDay >= 0.3 && timeOfDay < 0.4) { const t = (timeOfDay - 0.3) / 0.1; c = { r: lerp(duskColor.r, dayColor.r, t), g: lerp(duskColor.g, dayColor.g, t), b: lerp(duskColor.b, dayColor.b, t) };
        } else if (timeOfDay >= 0.4 && timeOfDay < 0.7) { c = dayColor;
        } else if (timeOfDay >= 0.7 && timeOfDay < 0.8) { const t = (timeOfDay - 0.7) / 0.1; c = { r: lerp(dayColor.r, duskColor.r, t), g: lerp(dayColor.g, duskColor.g, t), b: lerp(dayColor.b, duskColor.b, t) };
        } else if (timeOfDay >= 0.8) { const t = (timeOfDay - 0.8) / 0.2; c = { r: lerp(duskColor.r, nightColor.r, t), g: lerp(duskColor.g, nightColor.g, t), b: lerp(duskColor.b, nightColor.b, t) }; }
        return `rgb(${Math.floor(c.r)}, ${Math.floor(c.g)}, ${Math.floor(c.b)})`;
    }
}