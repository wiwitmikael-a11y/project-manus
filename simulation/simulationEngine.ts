import { SimulationState, Agent, GameEvent, GameEventType, AgentDirection, ResourceNode } from '../types';
import { spritesheetMapping } from '../assets/assetMapping';

// Konfigurasi Simulasi
const TICKS_PER_HOUR = 10;
const HOURS_PER_DAY = 24;
const DAY_START_HOUR = 6;
const NIGHT_START_HOUR = 19;
const MOVEMENT_SPEED = 0.3;

let eventIdCounter = 1;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const getDirection = (agent: Agent): AgentDirection => {
    if (!agent.isMoving) return agent.direction;
    const dx = agent.targetX - agent.x;
    const dy = agent.targetY - agent.y;
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return agent.direction;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const calcIndex = Math.round((angle + 360) / 45) % 8;
    const directionMap: AgentDirection[] = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
    return directionMap[calcIndex];
};

const findClosestNode = (agent: Agent, nodes: ResourceNode[]): ResourceNode | null => {
    let closestNode: ResourceNode | null = null;
    let minDistance = Infinity;
    nodes.forEach(node => {
        const dx = node.x - agent.x;
        const dy = node.y - agent.y;
        const distance = dx * dx + dy * dy;
        if (distance < minDistance) {
            minDistance = distance;
            closestNode = node;
        }
    });
    return closestNode;
};

export function runSimulationTick(currentState: SimulationState): SimulationState {
    const nextState: SimulationState = JSON.parse(JSON.stringify(currentState));

    // --- Pembaruan Waktu ---
    nextState.tick++;
    if (nextState.tick >= TICKS_PER_HOUR) {
        nextState.tick = 0;
        nextState.hour++;
        if (nextState.hour >= HOURS_PER_DAY) {
            nextState.hour = 0;
            nextState.day++;
            // --- Pembaruan Harian ---
            const dailyFoodConsumption = nextState.agents.length * 0.8;
            nextState.resources.food = Math.max(0, nextState.resources.food - dailyFoodConsumption);
        }
    }
    nextState.timeOfDay = (nextState.hour >= DAY_START_HOUR && nextState.hour < NIGHT_START_HOUR) ? 'day' : 'night';

    // --- Pembaruan Agen ---
    nextState.agents.forEach(agent => {
        // --- Logika Tugas & Perilaku ---
        if (agent.task === 'Idle') {
            const availableNodes = nextState.world.resourceNodes.filter(node => 
                !nextState.agents.some(a => a.targetNodeId === node.id)
            );
            if (availableNodes.length > 0) {
                const targetNode = findClosestNode(agent, availableNodes);
                if (targetNode) {
                    agent.task = 'Moving to Target';
                    agent.targetNodeId = targetNode.id;
                    agent.targetX = targetNode.x;
                    agent.targetY = targetNode.y;
                    agent.isMoving = true;
                }
            }
        }

        // --- Logika Pergerakan ---
        if (agent.isMoving) {
            const dx = agent.targetX - agent.x;
            const dy = agent.targetY - agent.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            agent.direction = getDirection(agent);

            if (dist < 1) {
                agent.isMoving = false;
                if (agent.task === 'Moving to Target') {
                    agent.task = 'Harvesting'; // Sampai di tujuan, mulai memanen
                }
            } else {
                const speed = nextState.timeOfDay === 'night' ? MOVEMENT_SPEED * 0.8 : MOVEMENT_SPEED;
                agent.x += (dx / dist) * speed;
                agent.y += (dy / dist) * speed;
            }
        }

        // --- Logika Memanen ---
        if (agent.task === 'Harvesting' && agent.targetNodeId) {
             const node = nextState.world.resourceNodes.find(n => n.id === agent.targetNodeId);
             if(node) {
                 if(node.type === 'fallen_tree') nextState.resources.wood += 0.05;
                 if(node.type === 'scrap_pile') nextState.resources.scrap += 0.05;
                 node.amount -= 0.1;
                 
                 if(node.amount <= 0) {
                     nextState.world.resourceNodes = nextState.world.resourceNodes.filter(n => n.id !== node.id);
                     agent.task = 'Idle';
                     agent.targetNodeId = undefined;
                 }
             } else {
                 agent.task = 'Idle'; // Node hilang atau sudah diambil
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
