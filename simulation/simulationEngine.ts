import { SimulationState, Agent, GameEvent, GameEventType, AgentDirection } from '../types';
import { spritesheetMapping } from '../assets/assetMapping';

// Konfigurasi Simulasi
const DAY_LENGTH_TICKS = 60;
const AI_EVENT_INTERVAL_DAYS = 3;

// Counter untuk memastikan ID event unik
let eventIdCounter = 1;

/**
 * Fungsi utilitas untuk memastikan nilai berada dalam rentang min/max.
 */
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

/**
 * Menentukan arah mata angin (N, NE, E, dll.) berdasarkan vektor pergerakan agen.
 */
const getDirection = (agent: Agent): AgentDirection => {
    if (!agent.isMoving) return agent.direction;

    const dx = agent.targetX - agent.x;
    const dy = agent.targetY - agent.y;

    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return agent.direction; // Pertahankan arah terakhir jika sangat dekat
    
    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // Konversi radian ke derajat
    const calcIndex = Math.round((angle + 360) / 45) % 8;

    // Peta dari indeks kalkulasi (0=Timur) ke arah mata angin
    const directionMap: AgentDirection[] = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
    return directionMap[calcIndex];
};


/**
 * Menjalankan satu tick dari simulasi.
 * Ini adalah FUNGSI MURNI: Ia mengambil state, menghitung state berikutnya, dan mengembalikannya.
 * TIDAK ADA MUTASI STATE atau efek samping di sini.
 * @param currentState State simulasi saat ini.
 * @returns State simulasi yang baru dan telah diperbarui.
 */
export function runSimulationTick(currentState: SimulationState): SimulationState {
    // Buat salinan mendalam untuk memastikan state asli tidak diubah.
    const nextState: SimulationState = JSON.parse(JSON.stringify(currentState));

    // --- Pembaruan Waktu ---
    nextState.tick++;
    if (nextState.tick >= DAY_LENGTH_TICKS) {
        nextState.tick = 0;
        nextState.day++;
        
        // --- Pembaruan Harian ---
        const dailyFoodConsumption = nextState.agents.length * 0.5;
        nextState.resources.food = Math.max(0, nextState.resources.food - dailyFoodConsumption);

        nextState.agents.forEach(agent => {
            agent.hunger = clamp(agent.hunger + 5, 0, 100);
            if (agent.hunger > 80 || nextState.resources.food === 0) {
                agent.mood = clamp(agent.mood - 5, 0, 100);
            }
        });

        // Picu event AI baru secara berkala
        if (nextState.day % AI_EVENT_INTERVAL_DAYS === 0) {
             const newEvent: Omit<GameEvent, 'id'|'timestamp'|'isAiGenerated'> = {
                type: GameEventType.NARRATIVE,
                title: `Peristiwa Hari ke-${nextState.day}`,
                description: "Sesuatu yang baru terjadi di koloni."
            };
            nextState.events.push({
                ...newEvent,
                id: `event-${eventIdCounter++}`,
                timestamp: Date.now(),
            });
        }
    }

    // --- Pembaruan per-Tick untuk Agen ---
    nextState.agents.forEach(agent => {
        // Update kebutuhan dasar
        agent.hunger = clamp(agent.hunger + 0.1, 0, 100);
        agent.mood = clamp(agent.mood - 0.05, 0, 100);

        // Update tugas & perilaku
        if (agent.task === 'Foraging') {
            nextState.resources.food += 0.02;
            if (Math.random() < 0.02) {
                 agent.isMoving = true;
                 agent.targetX = clamp(agent.x + (Math.random() - 0.5) * 10, 0, nextState.world.width);
                 agent.targetY = clamp(agent.y + (Math.random() - 0.5) * 10, 0, nextState.world.height);
            }
        }

        // Logika pergerakan
        if (agent.isMoving) {
            const dx = agent.targetX - agent.x;
            const dy = agent.targetY - agent.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            agent.direction = getDirection(agent);

            if (dist < 1) {
                agent.isMoving = false;
            } else {
                agent.x += (dx / dist) * 0.5;
                agent.y += (dy / dist) * 0.5;
            }
        } else if (agent.task === 'Idle') {
            if (Math.random() < 0.01) {
                agent.isMoving = true;
                agent.targetX = clamp(Math.random() * nextState.world.width, 0, nextState.world.width);
                agent.targetY = clamp(Math.random() * nextState.world.height, 0, nextState.world.height);
            }
        }

        // --- Pembaruan Animasi ---
        const nextAnimationState = agent.isMoving ? 'walk' : 'idle';
        if (agent.animationState !== nextAnimationState) {
            agent.animationState = nextAnimationState;
            agent.animationFrame = 0;
            agent.animationTick = 0;
        } else {
            agent.animationTick++;
        }

        const sheetData = spritesheetMapping[agent.appearance.spritesheet];
        if (sheetData) {
            const animKey = agent.animationState as keyof typeof sheetData.animations;
            const animData = sheetData.animations[animKey];
            if (animData && agent.animationTick >= animData.speed) {
                agent.animationTick = 0;
                agent.animationFrame = (agent.animationFrame + 1) % animData.frames;
            }
        }
    });

    return nextState;
}
