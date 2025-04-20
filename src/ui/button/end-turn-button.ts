import { Button } from "./button";

export class EndTurnButton extends Button {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    super(scene, x, y, text);
  }

  onClick(): void {}
}
