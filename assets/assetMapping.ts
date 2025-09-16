// assets/assetMapping.ts

/**
 * Mendefinisikan struktur dan metadata untuk setiap spritesheet animasi full-body.
 * Ini adalah pusat kendali untuk sistem rendering animasi.
 */

// --- SUMBER ASET ---
const MALE_COLONIST_ATLAS_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/project-manus-assets/main/Male_01.png';
const FEMALE_COLONIST_ATLAS_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/project-manus-assets/main/Female_01.png';


// Arah yang didukung langsung di spritesheet. Arah lain akan di-flip.
type AnimationDirection = 'S' | 'SE' | 'E' | 'NE' | 'N';

interface AnimationConfig {
  frames: number; // Jumlah total frame dalam loop animasi
  speed: number; // Jumlah tick per frame (nilai lebih tinggi = animasi lebih lambat)
  rows: Record<AnimationDirection, number>; // Memetakan arah ke indeks baris di spritesheet
}

export interface SpritesheetData {
  url: string;
  frameSize: number; // Ukuran setiap frame dalam piksel (misal: 128)
  animations: {
    idle: AnimationConfig;
    walk: AnimationConfig;
    // Animasi lain bisa ditambahkan di sini, misal: 'forage', 'build'
  };
}

export const spritesheetMapping: Record<string, SpritesheetData> = {
  /**
   * Metadata untuk spritesheet kolonis pria (10x10 grid).
   * - frameSize: Setiap frame berukuran 128x128 piksel.
   * - animations:
   *   - 'walk': Menggunakan 8 frame, ganti frame setiap 4 tick simulasi.
   *   - 'idle': Menggunakan 6 frame, ganti frame setiap 10 tick simulasi.
   * - rows: Memetakan arah ke baris yang sesuai di file gambar.
   *     Baris 0-4 untuk 'walk', Baris 5-9 untuk 'idle'.
   */
  'colonist_male_1': {
    url: MALE_COLONIST_ATLAS_URL,
    frameSize: 128,
    animations: {
      walk: {
        frames: 8,
        speed: 4,
        rows: { S: 0, SE: 1, E: 2, NE: 3, N: 4 },
      },
      idle: {
        frames: 6,
        speed: 10,
        rows: { S: 5, SE: 6, E: 7, NE: 8, N: 9 },
      },
    },
  },

  /**
   * Metadata untuk spritesheet kolonis wanita. Strukturnya sama.
   */
  'colonist_female_1': {
    url: FEMALE_COLONIST_ATLAS_URL,
    frameSize: 128,
    animations: {
      walk: {
        frames: 8,
        speed: 4,
        rows: { S: 0, SE: 1, E: 2, NE: 3, N: 4 },
      },
      idle: {
        frames: 6,
        speed: 10,
        rows: { S: 5, SE: 6, E: 7, NE: 8, N: 9 },
      },
    },
  },
};