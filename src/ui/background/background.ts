import { ATLAS_KEY, TEXTURE_KEY } from "~/constants";

export class Background extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const circle = scene.add.graphics();
    circle.fillStyle(0xf4efe9, 1);
    circle.fillCircle(-300, -240, 20);
    const fog = scene.add
      .image(0, 0, ATLAS_KEY.UI_COMPONENT, TEXTURE_KEY.FOG)
      .setOrigin(0.5, 1)
      .setAlpha(0.5);
    const pyramids = scene.add
      .image(210, 0, ATLAS_KEY.UI_COMPONENT, TEXTURE_KEY.PYRAMIDS)
      .setScale(1.4)
      .setOrigin(0.5, 1);
    this.add([circle, pyramids, fog]);
  }
}
