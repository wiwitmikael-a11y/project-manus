import React, { useRef, useEffect } from 'react';
import Phaser from 'phaser';
import { SimulationState, Agent } from '../types';
import Box2DPhysics from 'phaser3-box2d-plugin';

// --- ASET ISOMETRIK BARU ---
// Spritesheet 8 arah untuk colonist (32x48 per frame). Urutan: S, SW, W, NW, N, NE, E, SE
const AGENT_ISO_SPRITESHEET_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAwACAIAAAA73Z+FAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKYSURBVDhP7ZhNTsJAFIb3E7kC5QaMFyB6gRwgjhAVaukKuUFc4AoUulAVKkG9ANjgCjgrEKsYj2A24AvMmk0skv1Pjp2ZkU3S/PZl2l7zZubN+7MSiE9wVb0wSjiO80mJz5hVfYtQZyj2wz/B7D/gEKq8gWmH5g9wCBVjYFph+YM8BM+xWCy+WAwWN4z7G1f3j1BvYPVj+8VgsZg8+c/w+y/AKVTwgWmH5g9wCBVWwLTD8gcY/vQ+p2+dD8b3gD5T84fxS+eD8b1nfJ7DwF/wfC4/wWmH5g9wCBVjYFph+QMc/vQ+pz8/PDT5wF+wO+fnbwv2v/8nPYf8A/b/gH/A7v9D/gH7fxD/gN3/h/wD9v8g/gH733/g3vfP/g/Y+44/Y+/79/9d+z/+/gH7/+k/wO5v84/Y/W2f/v/b//b/9r/9v/1v/+v/9v/6v/2//q/+b//v/6//W/8b/63/G/8b/xv/W/83/jf+t/5v/G/8b/1v/d/43/jf+d/6v/W/9X/rf+v/1v/W/87/1v/O/87/zv/W/87/zv/U/9X/qf+r/1P/V/6n/q/9T/3f+p/7v/U/9X/qf+7/2P/R/7H/s/+z/2P/Z/7P/c/9n/uf+z/3P/Z/7n/s/9z/3f+5/7P/c/+f8z/3f+7/3P/Z/7n/s/9z/3f+5/7v/d/7v/d/7v/c/93/u/+7/3P/d/7v/c//H/sf+j/0f+z/6P/Z/9H/s/+z/2P/5//n/uf+z/2f+5/7P/c/9X/qf+r/1P/V/6n/q/9T/1f+p/7v/d/7n/u/9z/1f+5/7v/U/9X/nf+t/53/rf+d/63/nf+d/63/nf+N/43/jf+N/43/jf+N/43/rf+t/63/rf+t/63/rf+t/63/rf+9/43/rf+9/43/rf+N/43/jf+t/63/rf+t/43/j/+v/9v/6v/2//q/+b/9v/6v/2//a/+b/9v/2//6/wG7v00/Yve3ffr/b//b//b/9r/9v/1v/+v/9v/6v/2//q/+b//v/6//W/+t/+v/9v/0H/B733/g3vfP/g/Y+44/Y+/79/9d+z/+/gH7/+k/wO5v84/Y/W1/gH/A7v9D/gH7fxD/gN3/h/wD9v8g/gH7+c8L9r//Jz2H/AP2/wH+Afv5z9fB+N6zvk/gN0vnh/G97/P7nwz/B6z+cKqGwbTD8gfYhBVjYNph+QMcQoX/AaYfmj/AIVRYAtMOzR/gEKq8gWmH5g9wCBVfYFph+QMcQoWbwbTD8gcY/hQ/wJPD/p2t2k/g+gE6m2yYh9u9AAAAAElFTkSuQmCC';
// Tileset isometrik (64x32 per tile). Urutan: Air, Pasir, Rumput
const ISO_TILESET_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAABACAYAAAD/31nWAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIQSURBVHhe7dJBCsNADADBi+j/V8+ENJtB0N2Vws18WJ33DQB+/bYaAMAJBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAIHtW5sAECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQOAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACB7VubAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIEDgIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQIECAAAECBAgQ2L61CRAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEDgIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAgW0P2mYDBLhtU/AAAAAASUVORK5CYII=';
// Dekorasi isometrik (pohon dan batu)
const ISO_DECOR_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJMSURBVHhe7Zg/SBxBGMf9jSgxiYgWQbCysbEQFCxSQWunCIoPBFlE2CgWloKdiohYKAo2goiNhUVCsbGxsLKyhX+ExJtN3nCP2727O9zP5N6c3Z3N7vE+/NnZm70v9yGAcMIJ530BwHh83r+u65y/rquu+2g0ev8vBwD+D/A/gC4GIAARCEAAIhCAAARhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgABEIQAACEIAABGEIABCEAAIhCAAEQhAACIQgAAEIQAACEIAABGEIAAAQhAAHHCif8BF13uB4oCb/wAAAAASUVORK5CYII=';


// --- KONFIGURASI VISUAL ---
const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const TILE_WIDTH_HALF = TILE_WIDTH / 2;
const TILE_HEIGHT_HALF = TILE_HEIGHT / 2;

const AGENT_FRAME_WIDTH = 32;
const AGENT_FRAME_HEIGHT = 48;
const AGENT_Y_OFFSET = -24; // Agar sprite berdiri di tengah tile

const SELECTION_TINT = 0x00ffff; // Cyan tint
const HOVER_TINT = 0xffff00; // Yellow tint

class GameScene extends Phaser.Scene {
    private agentSprites: Map<string, Phaser.GameObjects.Sprite>;
    private renderables: Phaser.GameObjects.Sprite[];
    private decorations: Phaser.GameObjects.Sprite[];
    private props: GameCanvasProps;
    private lastPointerPos: Phaser.Math.Vector2;
    private hoveredAgentId: string | null = null;
    
    // Fix: Explicitly declare Phaser scene properties for TypeScript.
    // These are initialized by the Phaser framework and are available in scene methods.
    public anims!: Phaser.Animations.AnimationManager;
    public cameras!: Phaser.Cameras.Scene2D.CameraManager;
    public children!: Phaser.GameObjects.DisplayList;
    public load!: Phaser.Loader.LoaderPlugin;
    public input!: Phaser.Input.InputPlugin;
    public add!: Phaser.GameObjects.GameObjectFactory;
    public box2d!: Box2DPhysics;


    constructor() {
        super({ key: 'GameScene' });
        this.agentSprites = new Map();
        this.renderables = [];
        this.decorations = [];
        this.props = { state: null, onAgentClick: () => {}, selectedAgentId: null };
        this.lastPointerPos = new Phaser.Math.Vector2();
    }

    preload() {
        this.load.spritesheet('iso_tiles', ISO_TILESET_URL, { frameWidth: TILE_WIDTH, frameHeight: TILE_HEIGHT });
        this.load.spritesheet('iso_decor', ISO_DECOR_URL, { frameWidth: 32, frameHeight: 64 });
        this.load.spritesheet('colonist_iso', AGENT_ISO_SPRITESHEET_URL, { frameWidth: AGENT_FRAME_WIDTH, frameHeight: AGENT_FRAME_HEIGHT });
    }

    create() {
        this.createIsland();
        this.createAnimations();

        this.cameras.main.setZoom(1.5);
        this.cameras.main.centerOn(MAP_WIDTH * TILE_WIDTH_HALF, 0);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.button === 0) { // Left click
                this.lastPointerPos.set(pointer.x, pointer.y);
                 if (this.hoveredAgentId) {
                    this.props.onAgentClick(this.hoveredAgentId);
                }
            }
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown && pointer.button === 0) { // Left click drag
                const dx = pointer.x - this.lastPointerPos.x;
                const dy = pointer.y - this.lastPointerPos.y;
                this.cameras.main.scrollX -= dx / this.cameras.main.zoom;
                this.cameras.main.scrollY -= dy / this.cameras.main.zoom;
                this.lastPointerPos.set(pointer.x, pointer.y);
            }
        });
    }

    // Fungsi noise kustom untuk menggantikan Simplex
    private noise(nx: number, ny: number) {
        const val1 = Math.sin(nx * 2) * Math.cos(ny * 3);
        const val2 = Math.sin(ny * 0.5) * Math.cos(nx * 1.5);
        return (val1 + val2) / 2;
    }

    private createIsland() {
        const centerX = MAP_WIDTH / 2;
        const centerY = MAP_HEIGHT / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const screenPos = this.worldToIsometric(x, y);

                const dx = x - centerX;
                const dy = y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

                const noiseVal = (this.noise(x / 15, y / 15) + 1) / 2;
                
                // Buat pulau berbentuk lingkaran dan organik
                const heightVal = noiseVal - dist;

                let tileIndex = 0; // Water
                if (heightVal > 0.3) tileIndex = 1; // Sand
                if (heightVal > 0.4) tileIndex = 2; // Grass

                const tile = this.add.image(screenPos.x, screenPos.y, 'iso_tiles', tileIndex);
                tile.setDepth(screenPos.y - TILE_HEIGHT);

                // Tambah dekorasi dengan fisik
                if (tileIndex === 2 && Math.random() < 0.1) {
                    const decorType = Math.random() < 0.6 ? 0 : 1; // 0: tree, 1: rock
                    const decorYOffset = decorType === 0 ? 32 : 16;
                    const decor = this.add.sprite(screenPos.x, screenPos.y - decorYOffset, 'iso_decor', decorType);
                    this.box2d.add.existing(decor, { isStatic: true, shape: 'circle', radius: 10 });
                    this.decorations.push(decor);
                }
            }
        }
    }

    private createAnimations() {
        const anims = this.anims;
        const directions = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];
        directions.forEach((dir, index) => {
            anims.create({
                key: `walk_${dir}`,
                frames: [{ key: 'colonist_iso', frame: index }], // Gunakan 1 frame per arah untuk demo
                frameRate: 10,
                repeat: -1
            });
        });
    }
    
    // Konversi koordinat grid ke isometrik
    private worldToIsometric(x: number, y: number) {
        return new Phaser.Math.Vector2(
            (x - y) * TILE_WIDTH_HALF,
            (x + y) * TILE_HEIGHT_HALF
        );
    }
    
    public updateProps(newProps: GameCanvasProps) {
        this.props = newProps;
    }

    update() {
        if (!this.props.state) return;
        
        const existingAgentIds = new Set(this.props.state.agents.map(a => a.id));
        
        // Update agent yang ada dan tambah yang baru
        this.props.state.agents.forEach(agentData => {
            let sprite = this.agentSprites.get(agentData.id);

            if (!sprite) {
                const startPos = this.worldToIsometric(agentData.x, agentData.y);
                sprite = this.add.sprite(startPos.x, startPos.y + AGENT_Y_OFFSET, 'colonist_iso');
                sprite.setData('agentId', agentData.id);
                sprite.setInteractive();

                this.box2d.add.existing(sprite, { shape: 'circle', radius: 8 });
                (sprite.body as any).SetFixedRotation(true);

                this.agentSprites.set(agentData.id, sprite);
            }

            // --- Logika Pergerakan Berbasis Fisika ---
            const body = sprite.body as any;
            if (body) {
                const currentPos = new Phaser.Math.Vector2(body.GetPosition().x, body.GetPosition().y);
                const targetPos = this.worldToIsometric(agentData.targetX, agentData.targetY);
                targetPos.y += AGENT_Y_OFFSET;

                const distance = Phaser.Math.Distance.Between(currentPos.x, currentPos.y, targetPos.x, targetPos.y);

                if (distance > 4) {
                    const direction = targetPos.clone().subtract(currentPos).normalize();
                    const speed = 60;
                    body.SetLinearVelocity({ x: direction.x * speed, y: direction.y * speed });
                } else {
                    body.SetLinearVelocity({ x: 0, y: 0 });
                }

                // Tentukan arah animasi berdasarkan kecepatan
                const velocity = body.GetLinearVelocity();
                if (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1) {
                    const angle = Phaser.Math.RadToDeg(Math.atan2(velocity.y, velocity.x));
                    let direction = 'S';
                    if (angle >= -22.5 && angle < 22.5) direction = 'E';
                    else if (angle >= 22.5 && angle < 67.5) direction = 'SE';
                    else if (angle >= 67.5 && angle < 112.5) direction = 'S';
                    else if (angle >= 112.5 && angle < 157.5) direction = 'SW';
                    else if (angle >= 157.5 || angle < -157.5) direction = 'W';
                    else if (angle >= -157.5 && angle < -112.5) direction = 'NW';
                    else if (angle >= -112.5 && angle < -67.5) direction = 'N';
                    else if (angle >= -67.5 && angle < -22.5) direction = 'NE';
                    sprite.anims.play(`walk_${direction}`, true);
                } else {
                     sprite.anims.stop();
                     sprite.setFrame(0); // Kembali ke frame menghadap Selatan
                }
            }
        });

        // Hapus sprite dari agent yang sudah tidak ada dengan cara yang lebih aman
        const agentsToRemove: string[] = [];
        for (const id of this.agentSprites.keys()) {
            if (!existingAgentIds.has(id)) {
                agentsToRemove.push(id);
            }
        }
        agentsToRemove.forEach(id => {
            const sprite = this.agentSprites.get(id);
            if (sprite) {
                sprite.destroy();
                this.agentSprites.delete(id);
            }
        });


        // Handle hover dan selection tint
        this.hoveredAgentId = null;
        this.agentSprites.forEach((sprite, id) => {
            sprite.clearTint();
            if (id === this.props.selectedAgentId) {
                sprite.setTint(SELECTION_TINT);
            }
            if(sprite.getBounds().contains(this.input.activePointer.worldX, this.input.activePointer.worldY)){
                if(id !== this.props.selectedAgentId){
                   sprite.setTint(HOVER_TINT);
                }
                this.hoveredAgentId = id;
            }
        });

        // --- Depth Sorting Cerdas ---
        this.renderables = [...this.agentSprites.values(), ...this.decorations];
        this.renderables.sort((a, b) => a.y - b.y);
        this.renderables.forEach(sprite => this.children.bringToTop(sprite));
    }
}

interface GameCanvasProps {
  state: SimulationState | null;
  onAgentClick: (agentId: string) => void;
  selectedAgentId: string | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ state, onAgentClick, selectedAgentId }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameContainerRef.current && !gameRef.current) {
      // Fix: Define physics config separately to bypass TypeScript's excess property checking for plugin configs.
      const physicsConfig = {
        default: 'box2d',
        box2d: {
          gravity: { x: 0, y: 0 },
          debug: true, // Tampilkan body fisik untuk debugging
        },
      };

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameContainerRef.current,
        width: '100%',
        height: '100%',
        backgroundColor: '#0f172a', // slate-900
        scene: [GameScene],
        physics: physicsConfig,
        plugins: {
          scene: [
            {
              key: 'Box2DPhysics',
              plugin: Box2DPhysics,
              mapping: 'box2d'
            }
          ]
        },
        render: {
            pixelArt: true,
        }
      };
      gameRef.current = new Phaser.Game(config);
    }
    
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (gameRef.current && gameRef.current.scene.isActive('GameScene')) {
        const scene = gameRef.current.scene.getScene('GameScene') as GameScene;
        scene.updateProps({ state, onAgentClick, selectedAgentId });
    }
  }, [state, onAgentClick, selectedAgentId]);


  return <div ref={gameContainerRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default GameCanvas;
