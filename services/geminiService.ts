// This file is now a mock service that uses a local Markov Chain AI
// to generate game data, completely bypassing the need for external API calls
// and working around the sandbox security restrictions.

import { GenesisData, GameEventType, GameEvent, SimulationState, ColonyResources, Agent, Biome, Structure, Creature } from '../types';
import { MarkovChain } from './markovService';

// --- CORPUS: The source of knowledge for our local AI ---
// This has been significantly expanded to give the Markov Chain more data to learn from,
// resulting in more varied and coherent generated text.
const corpus = `
The colony vessel 'Odyssey' is a ghost, a shattered memory against the bruised purple sky of Kepler-186f. We, the survivors, are the dream's final, ragged breath. Our cryo-pods were scattered like seeds across a valley filled with colossal, glowing fungi, their ethereal luminescence a constant, haunting watchlight in our new world. The very air thrums with a strange energy, a palpable resonance that tickles the back of the neck and whispers of untold power and immense danger. We must build a new society from the scrap of our fallen starship. We must survive the unknown threats of this alien biome. We must become a new kind of human.

Near the crash site stands a monolith of obsidian-like material, its surface impossibly smooth and absorbing all light. It radiates a low-frequency hum that vibrates in our bones. Anya, our lead xenobotanist, believes it's a marker, a piece of a larger puzzle. Kenji, the pragmatist and chief engineer, suspects it's a dormant power source, one that could solve all our energy problems or vaporize us instantly. Our limited tools can't even scratch its surface. We are children poking at a sleeping god.

Resources are a constant worry. Food is scarce, though the forests are teeming with life. The native Hexa-Loom Weavers spin edible, protein-rich silk, and the hardy Puna Beetles offer a crunchy, if unappetizing, source of nutrition. We have named our fledgling settlement 'Haven', a simple word that carries the weight of all our hopes. It is a promise we make to ourselves with every new wall we raise.

The nights are the hardest. They are never truly dark, filled with the soft glow of the moss and the clicking, chittering sounds of unseen creatures moving in the undergrowth. Several colonists have reported vivid, disturbing dreams: visions of sprawling, geometric cities deep beneath the planet's crust and whispers in a language that feels both ancient and familiar. Is it the pressure of survival, or is the planet itself trying to communicate? The ship's AI, MANUS, remains silent. Its core logic matrix, our guide and protector, was shattered in the crash. We are adrift in a sea of stars, truly on our own.

The forest floor is a living carpet of bioluminescent moss that pulses with a soft, cyan light. It provides enough illumination to work during the perpetual twilight that blankets this world, a world lit by a distant, ancient star. We managed to salvage a multi-purpose fabricator from the wreckage of the Odyssey's engineering bay. It's our best hope for creating advanced tools, but it requires a stable, high-yield power connection we cannot yet provide. Every day is a battle for survival, yet every sunrise over the jagged, twin peaks of Mount Vigil feels like a hard-won victory.

Anya's team has catalogued several new species of flora. The 'Sun-Petal', a flower that tracks the weak sun and stores solar energy in its sap. The 'Whisper-Reed', a tall grass that produces harmonic tones when the wind blows through it, creating an eerie, planetary music. There is beauty here, but it's a dangerous beauty. The 'Grasper-Vine' is carnivorous, and several resource drones have been lost to its clutches. We must learn the rules of this place, or we will be consumed by it.

Kenji has been working tirelessly to restore a short-range comms relay. He believes that other cryo-pod clusters may have survived the atmospheric entry. Are there other survivors out there? The thought brings both hope and a new kind of fear. What if they are in trouble? What if they see us as rivals for the limited resources? The social dynamics of our small group are already fraying at the edges. The collectivism we once preached on the Odyssey is being tested by the grim pragmatism of survival. Some hoard resources, others argue for a stronger, more authoritarian leadership. Our nascent culture is being forged in this crucible, and we do not know what shape it will take. The spirituality of some is growing, finding meaning in the monolith and the planet's strange whispers. We are at a crossroads. We are Project MANUS.

--- Personal Log: Dr. Anya Sharma, Xenobotanist ---
Day 12: The monolith continues to baffle. Scans show nothing. It's a void in our data, a perfect black body. Yet, the native flora seems to react to it. The Sun-Petals near its base orient towards it, not the sun. It's as if they're drinking its darkness, not the light. This defies all known biological principles. I must collect more samples, despite Kenji's warnings about proximity radiation. He sees a machine, I see a nexus.

Day 15: Breakthrough! The Whisper-Reeds aren't just creating random harmonics. We've recorded the patterns. They're complex, mathematical. Almost like a language. When we played a recording back, the entire field of reeds fell silent for three full minutes. A reaction. A sign of intelligence. Are we standing in the middle of a planetary brain? The implications are staggering.

Day 21: A new discovery in the Western grove. A parasitic fungus, we're calling it 'Mind-Spore'. It attaches to the nervous systems of the Puna Beetles, controlling their movements to spread its spores. The patterns are eerily efficient. Liam from the survey team got too close and complained of a severe migraine and auditory hallucinations. He's been quarantined. This ecosystem is more dangerous, more interconnected than we ever imagined.

--- Chief Engineer's Report: Kenji Tanaka ---
Day 18: The fabricator is running at 68% efficiency. The salvaged power converters are unstable, prone to cascading failures. We lost another bank of capacitors today. That's a week's worth of refined silicates gone. We're cannibalizing the Odyssey's non-essential systems, but it's a losing battle. We need a stable power source, and all my readings point back to that damned monolith. It's putting out a terrifying amount of subspace energy, but tapping it would be like drinking from a firehose connected to a star.

Day 24: The perimeter fence is a joke. It's a string of sonic emitters powered by repurposed batteries. Last night, a pack of creatures we're calling 'Stalkers' - six-legged predators with chitinous plates - simply burrowed underneath it. They took three of our supply caches before Roric's team could drive them off. We need hard-light barriers, we need automated turrets. I have the schematics, but the fabricator can't handle the load. I'm stuck building better mousetraps when we need dragon-slaying artillery.

Day 29: Zara came to me with a proposal. She believes she can create a biofuel from the Sun-Petal sap. It's high-risk. The sap is volatile, but her simulations show a potential energy output five times greater than our current battery storage. It could be the breakthrough we need to get the fabricator fully operational. I've given her a fire-suppressed section of the lab and all the shielding I can spare. If this works, we might just have a future. If it fails, we'll lose another brilliant mind and our best hope.

--- Security Log: Roric Corbin ---
Day 16: Another dispute over ration distribution. Javier thinks his survey team deserves more because they take more risks. Nia from hydroponics argues her team is the only reason we're not all eating beetle paste. I had to separate them. This 'collectivism' is a fine idea for a starship, but down here, hunger has a louder voice than philosophy. Morale is low. We need a win, something to unite us.

Day 23: The 'whispers' are getting worse. People are becoming paranoid. Elara swears she heard her dead husband calling to her from the forest. I found Liam from the survey team trying to carve ship schematics into the monolith with a rock. He didn't remember doing it. I'm increasing night-watch rotations, but how do you guard against something that gets inside people's heads? This isn't a security problem; it's something else.

Day 30: We have a faction. A small group, led by Elara, has started calling themselves the 'Children of the Monolith'. They believe it's a spiritual guide, that the dreams are messages. They spend hours just sitting near it, meditating. It seems harmless, but it's a division. Kenji sees them as a security risk. Anya sees them as a research opportunity. I see them as another headache. Unity is our most valuable resource, and it's cracking.

--- World Data Fragments ---
The Ashen Plains are a vast expanse of grey, metallic dust, the result of a meteor impact eons ago. The dust is rich in heavy metals, essential for advanced fabrication, but it's also highly corrosive. 'Dust Storms' can strip equipment down to its frame in hours. The only life here are the 'Glass-Wyrms', crystalline creatures that burrow through the dust, consuming the metals and leaving behind intricate tunnels of fused glass.

The Whispering Canyons are a maze of wind-carved rock formations that amplify the planet's natural harmonic resonance. Navigating them is treacherous; the constant, shifting tones can disorient and induce powerful vertigo. The source of the resonance is believed to be a massive, underground crystal lattice, a theory supported by the glowing veins of quartz that pulse in time with the planet's hum.

Weather phenomena include 'Spore Tides', where the giant fungi release clouds of bioluminescent spores that can disrupt electronics and cause respiratory distress. 'Glass Storms' on the plains are terrifying events where high winds whip the metallic dust into a sandblasting vortex.

The Stalker's life cycle is a terrifying example of alien evolution. They hunt in packs, using coordinated flanking maneuvers. Their most fearsome trait is the 'Scream-Lure', a vocalization that mimics the cry of a human in distress, luring rescue parties into ambushes. We learned this the hard way.

Our culture is diverging. The Pragmatist Survivalists, led by Kenji and Roric, believe in a strict, hierarchical society focused on engineering and defense. The Collective, Anya's and Nia's faction, advocate for communal living, exploration, and attempting to understand and coexist with the new world. The Children of the Monolith are the wild card, a growing spiritual movement that could bring enlightenment or catastrophe. The future of humanity on Kepler-186f will be decided by which of these philosophies prevails. We are the architects of our own destiny or our own destruction.
`;

const firstNames = ["Anya", "Kenji", "Liam", "Zara", "Javier", "Nia", "Roric", "Elara"];
const lastNames = ["Volkov", "Tanaka", "Singh", "Al-Jamil", "Ortega", "Corbin", "Li", "Falke"];

// --- AI Models ---
// We train different models on different parts of our knowledge base for varied results.
const nameGenerator = new MarkovChain();
nameGenerator.train(firstNames.join(' '));
nameGenerator.train(lastNames.join(' '));

const narrativeGenerator = new MarkovChain();
narrativeGenerator.train(corpus);

// --- Helper Functions ---
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const generateUniqueName = (): string => {
    const first = capitalize(nameGenerator.generate(1).replace('.', ''));
    const last = capitalize(nameGenerator.generate(1).replace('.', ''));
    return `${first} ${last}`;
};

const generateAgent = (id: number): Omit<Agent, 'x' | 'y' | 'targetX' | 'targetY' | 'isMoving' | 'direction' | 'relationships'> => ({
    id: `agent-${id}`,
    name: generateUniqueName(),
    task: getRandomInt(0, 1) === 0 ? 'Foraging' : 'Idle',
    mood: getRandomInt(60, 90),
    hunger: getRandomInt(5, 20),
    personality: {
        creativity: getRandomInt(1, 10),
        pragmatism: getRandomInt(1, 10),
        social: getRandomInt(1, 10),
    },
    skills: {
        foraging: getRandomInt(1, 5),
        woodcutting: getRandomInt(1, 5),
        crafting: getRandomInt(1, 5),
    },
});

const generateWorldElement = (type: 'biome' | 'structure' | 'creature'): Biome | Structure | Creature => {
    const name = capitalize(narrativeGenerator.generate(2).replace('.', ''));
    const description = narrativeGenerator.generate(getRandomInt(10, 20));

    if (type === 'creature') {
        const temperaments: Creature['temperament'][] = ['DOCILE', 'NEUTRAL', 'HOSTILE'];
        return { name, description, temperament: temperaments[getRandomInt(0, 2)] };
    }
    if (type === 'structure') {
        const types: Structure['type'][] = ['SHELTER', 'LANDMARK', 'STORAGE'];
        return { name, description, type: types[getRandomInt(0, 2)] };
    }
    return { name, description };
}

/**
 * Generates the initial state of the world using the local Markov Chain AI.
 */
export async function generateGenesis(): Promise<GenesisData> {
    const agentCount = getRandomInt(3, 5);
    const agents = Array.from({ length: agentCount }, (_, i) => generateAgent(i + 1));
    
    const startingEvent: Omit<GameEvent, 'id' | 'timestamp'> = {
        type: GameEventType.NARRATIVE,
        title: capitalize(narrativeGenerator.generate(getRandomInt(3, 5)).replace('.', '')),
        description: narrativeGenerator.generate(getRandomInt(15, 25)),
        isAiGenerated: true,
    };

    const genesisData: GenesisData = {
        agents,
        startingEvent,
        culturalValues: {
            collectivism: getRandomInt(40, 70),
            pragmatism: getRandomInt(40, 70),
            spirituality: getRandomInt(20, 50),
        },
        biomes: Array.from({ length: getRandomInt(2, 3) }, () => generateWorldElement('biome') as Biome),
        structures: Array.from({ length: getRandomInt(1, 2) }, () => generateWorldElement('structure') as Structure),
        creatures: Array.from({ length: getRandomInt(2, 3) }, () => generateWorldElement('creature') as Creature),
    };
    
    return Promise.resolve(genesisData);
}

type DynamicEventPayload = {
    day: number;
    resources: ColonyResources;
    events: GameEvent[];
};

/**
 * Generates a new dynamic event using the local Markov Chain AI.
 */
export async function generateDynamicEvent(payload: DynamicEventPayload): Promise<Omit<GameEvent, 'id' | 'timestamp' | 'isAiGenerated'>> {
    const eventTypes: GameEventType[] = [GameEventType.NARRATIVE, GameEventType.AGENT, GameEventType.SYSTEM];
    
    const event = {
        type: eventTypes[getRandomInt(0, 2)],
        title: capitalize(narrativeGenerator.generate(getRandomInt(4, 6)).replace('.', '')),
        description: narrativeGenerator.generate(getRandomInt(15, 25)),
    };

    return Promise.resolve(event);
}