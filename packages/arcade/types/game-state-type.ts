export type Enemy = {
  xPos: number;
  yPos: number;
  size: number;
};

export type Player = {
  size: number;
  yPos: number;
  xPos: number;
};

export type CanvasSize = {
  width: number;
  height: number;
};

export type GameState = {
  input: string[];
  canvas: CanvasSize;
  player: Player;
  enemies: Enemy[];
  playerMoved: boolean;
};
