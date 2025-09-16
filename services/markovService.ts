// services/markovService.ts

const maleNameSamples = [
  "Jaxon", "Kael", "Roric", "Zane", "Vance", "Corbin", "Silas", "Orion", "Gideon", "Malakai",
  "Jax", "Ryker", "Kade", "Cyrus", "Talon", "Ronan", "Lucian", "Darius", "Ezra", "Nikolai"
];

const femaleNameSamples = [
  "Lyra", "Seraphina", "Aria", "Elara", "Zoe", "Nova", "Iris", "Thalia", "Zara", "Rowan",
  "Anya", "Sloane", "Wren", "Veda", "Cassia", "Nia", "Reyna", "Leda", "Sariel", "Kyra"
];

const chains: { [key: string]: { [key: string]: number } } = {};
const startChars: { [key: string]: number } = {};

function train(samples: string[]) {
  for (const name of samples) {
    if(name.length === 0) continue;
    startChars[name[0]] = (startChars[name[0]] || 0) + 1;
    for (let i = 0; i < name.length - 1; i++) {
      const char = name[i];
      const nextChar = name[i + 1];
      if (!chains[char]) chains[char] = {};
      chains[char][nextChar] = (chains[char][nextChar] || 0) + 1;
    }
  }
}

function pickRandom(obj: { [key: string]: number }): string {
  const keys = Object.keys(obj);
  if (keys.length === 0) return '';
  const totalWeight = keys.reduce((sum, key) => sum + obj[key], 0);
  let random = Math.random() * totalWeight;
  for (const key of keys) {
    random -= obj[key];
    if (random <= 0) return key;
  }
  return keys[keys.length - 1];
}

let isTrained = false;
function ensureTrained() {
  if (isTrained) return;
  train(maleNameSamples.concat(femaleNameSamples).map(n => n.toLowerCase()));
  isTrained = true;
}

export function generateMarkovName(gender: 'male' | 'female' = 'male'): string {
  ensureTrained();
  
  let name = pickRandom(startChars);
  if (!name) return gender === 'male' ? 'John' : 'Jane';

  const minLength = 4;
  const maxLength = 8;
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  while (name.length < length) {
    const lastChar = name[name.length - 1];
    if (!chains[lastChar]) break;
    const nextChar = pickRandom(chains[lastChar]);
    if (!nextChar) break;
    name += nextChar;
  }
  
  return name.charAt(0).toUpperCase() + name.slice(1);
}
