import { Button } from "./button";

export class RestartButton extends Button {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "Restart");
  }
  onClick(): void {
    window.location.reload();
  }
}
