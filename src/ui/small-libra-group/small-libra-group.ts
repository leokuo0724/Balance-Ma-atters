import { SIZE } from "~/constants";

import { SmallLibraSet } from "./small-libra-set";

export class SmallLibraGroup extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const [_, height] = SIZE.SMALL_LIBRA_SET;
    const PADDING_Y = 8;
    const phyMagLibraSet = new SmallLibraSet(scene, 0, 0);
    const atkDefLibraSet = new SmallLibraSet(scene, 0, height + PADDING_Y);
    this.add([phyMagLibraSet, atkDefLibraSet]);
  }
}
