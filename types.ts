export interface Choice {
  text: string;
  prompt: string;
}

export interface Inventory {
  [key: string]: number;
}

export interface Base {
  location: string;
  fortification: number;
}

export interface GameState {
  story: string;
  choices: Choice[];
  inventory: Inventory;
  base: Base;
  isGameOver: boolean;
  gameOverText: string;
}

// The AI will return this object, which contains deltas to be applied to the main GameState
export interface SceneResult {
  story: string;
  choices: Choice[];
  inventoryChanges?: Inventory;
  baseChanges?: Partial<Base>;
  isGameOver: boolean;
  gameOverText: string;
}
