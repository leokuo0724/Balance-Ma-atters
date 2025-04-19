import { TSimpleVector2 } from "~/type";

export const getCanvasCenter = (scene: Phaser.Scene): TSimpleVector2 => {
  return [scene.game.canvas.width / 2, scene.game.canvas.height / 2];
};

export const getCanvasSize = (scene: Phaser.Scene): TSimpleVector2 => {
  const { width, height } = scene.game.canvas;
  return [width, height];
};
