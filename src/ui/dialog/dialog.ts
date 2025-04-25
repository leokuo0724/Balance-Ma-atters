import { DEPTH, TEXTURE_KEY } from "~/constants";

import { Button } from "../button";

export abstract class Dialog extends Phaser.GameObjects.Container {
  abstract leftButton: Button;
  abstract rightButton: Button;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const bgOuter = scene.add
      .image(0, 0, TEXTURE_KEY.DIALOG_BG_OUTER)
      .setOrigin(0.5);
    const bgInner = scene.add
      .image(0, 0, TEXTURE_KEY.DIALOG_BG_INNER)
      .setOrigin(0.5);
    this.add([bgOuter, bgInner]).setDepth(DEPTH.OVERLAY);
  }
}
