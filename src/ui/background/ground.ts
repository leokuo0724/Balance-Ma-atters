import { COLOR_KEY } from "~/constants";
import { getCanvasSize, hexToDecimal } from "~/utils";

export class Ground extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const [width, _] = getCanvasSize(scene);
    const rect = scene.add
      .rectangle(0, 0, width, 288, hexToDecimal(COLOR_KEY.BROWN_3))
      .setOrigin(0, 1);
    this.add([rect]);
  }
}
