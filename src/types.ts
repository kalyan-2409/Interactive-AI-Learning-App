export type SubjectId = 'biology' | 'physics' | 'chemistry';

export interface ModuleInfo {
  id: SubjectId;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
}

export const MODULES: ModuleInfo[] = [
  {
    id: 'biology',
    title: 'Cellular Architecture',
    subtitle: 'The Machinery of Life',
    description: 'Explore the 2.5D eukaryotic cell, interact with vital organelles, and simulate passive-versus-active membrane transport systems overseen by AI.',
    difficulty: 'Beginner',
    duration: '15 mins',
  },
  {
    id: 'physics',
    title: 'Orbital Kinematics',
    subtitle: 'Gravity and Solar Mechanics',
    description: 'Construct custom solar systems in a fully animated gravity simulator. Alter stellar masses, test orbital velocities, and run planetary scenarios.',
    difficulty: 'Intermediate',
    duration: '20 mins',
  },
  {
    id: 'chemistry',
    title: 'Atomic Constructor',
    subtitle: 'Subatomic Building Blocks',
    description: 'Build chemical elements atom-by-atom (protons, neutrons, electrons) on quantum shells, and trigger dramatic chemical bond reactions.',
    difficulty: 'Advanced',
    duration: '25 mins',
  },
];

// Organelle types
export interface Organelle {
  name: string;
  symbol: string;
  shortDesc: string;
  color: string;
  // Coordinate relative to SVG container
  cx: string;
  cy: string;
  rx: string;
  ry: string;
}

// Particle for cell transport simulation
export interface CellParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'nutrient' | 'sodium';
}

// Atom Builder structures
export interface ChemicalElement {
  number: number;
  symbol: string;
  name: string;
  protons: number;
  neutrons: number;
  electrons: number;
  shells: number[];
  color: string;
  valency: number;
  group: string;
  fact: string;
}

export const PERIODIC_ELEMENTS: ChemicalElement[] = [
  { number: 1, symbol: 'H', name: 'Hydrogen', protons: 1, neutrons: 0, electrons: 1, shells: [1], color: '#38bdf8', valency: 1, group: 'Reactive Nonmetals', fact: 'Lighter than air, hydrogen constitutes about 75% of the elemental mass of the universe.' },
  { number: 2, symbol: 'He', name: 'Helium', protons: 2, neutrons: 2, electrons: 2, shells: [2], color: '#ec4899', valency: 0, group: 'Noble Gases', fact: 'Discovered in the sun\'s light before it was found on Earth; it never bonds.' },
  { number: 3, symbol: 'Li', name: 'Lithium', protons: 3, neutrons: 4, electrons: 3, shells: [2, 1], color: '#fbbf24', valency: 1, group: 'Alkali Metals', fact: 'The lightest metallic element; highly reactive with water, stored in oil.' },
  { number: 6, symbol: 'C', name: 'Carbon', protons: 6, neutrons: 6, electrons: 6, shells: [2, 4], color: '#94a3b8', valency: 4, group: 'Reactive Nonmetals', fact: 'The structural backbone of all organic molecules and life on Earth.' },
  { number: 8, symbol: 'O', name: 'Oxygen', protons: 8, neutrons: 8, electrons: 8, shells: [2, 6], color: '#ef4444', valency: 2, group: 'Reactive Nonmetals', fact: 'Crucial for cellular respiration, it makes up about 21% of the Earth\'s atmosphere.' },
  { number: 11, symbol: 'Na', name: 'Sodium', protons: 11, neutrons: 12, electrons: 11, shells: [2, 8, 1], color: '#a855f7', valency: 1, group: 'Alkali Metals', fact: 'Extremely soft metal that can be cut with a butter knife and reacts violently with water.' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', protons: 17, neutrons: 18, electrons: 17, shells: [2, 8, 7], color: '#22c55e', valency: 1, group: 'Reactive Nonmetals', fact: 'A highly toxic yellow-green halogen gas that forms table salt when combined with sodium.' },
];

export interface AtomicBondPreset {
  name: string;
  formula: string;
  reactants: string[];
  productType: 'Covalent' | 'Ionic';
  description: string;
}

export const BOND_PRESETS: AtomicBondPreset[] = [
  { name: 'Water Molecule', formula: 'H₂O', reactants: ['H', 'O'], productType: 'Covalent', description: 'Two Hydrogen atoms share their single valence electrons with one Oxygen atom, filling Oxygen\'s outer L-shell.' },
  { name: 'Table Salt', formula: 'NaCl', reactants: ['Na', 'Cl'], productType: 'Ionic', description: 'Sodium transfers its single outer valence electron completely to Chlorine, forming positively charged Na⁺ and negatively charged Cl⁻ ions with complete octets.' },
  { name: 'Carbon Dioxide', formula: 'CO₂', reactants: ['C', 'O'], productType: 'Covalent', description: 'One Carbon atom forms two double covalent bonds with two Oxygen atoms, sharing four pairs of electrons.' },
];

// Quiz structures
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizState {
  topic: string;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  selectedOption: number | null;
  showExplanation: boolean;
  isComplete: boolean;
  isLoading: boolean;
}

// Chat types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

// User Profile progress
export interface UserProgress {
  score: number;
  modulesCompleted: { [key in SubjectId]?: boolean };
  badges: string[];
  quizHistory: {
    topic: string;
    score: number;
    total: number;
    date: string;
  }[];
}
