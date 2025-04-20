import { SIZE } from "~/constants";
import { GameManager } from "~/manager";
import { EBalanceSetType } from "~/type";

import { SmallLibraSet } from "./small-libra-set";

export class SmallLibraGroup extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const gm = GameManager.getInstance();
    const [_, height] = SIZE.SMALL_LIBRA_SET;
    const PADDING_Y = 8;
    [
      EBalanceSetType.PHY_MAG,
      EBalanceSetType.DEF_ATK,
      EBalanceSetType.SHT_LNG,
      EBalanceSetType.DUT_FIR,
    ].forEach((type, index) => {
      const libraSet = new SmallLibraSet(
        scene,
        0,
        height * index + PADDING_Y * index,
        type,
        [EBalanceSetType.SHT_LNG, EBalanceSetType.DUT_FIR].includes(type),
      );
      this.add(libraSet);
      gm.setupBalanceSet(type, libraSet);
    });
  }
}
