import { BloodBar } from "~/ui";

import { IBlood } from "../interfaces";
import { MaatSprite } from "./maat-sprite";

export class Maat extends Phaser.GameObjects.Container implements IBlood {
  public bloodBar: BloodBar;
  public totalBlood: number = 0;
  public currentBlood: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const maatSprite = new MaatSprite(scene, 0, 0);
    this.bloodBar = new BloodBar(scene, 0, 14);
    this.add([maatSprite, this.bloodBar]);
  }

  public updateBloodBar(from: number, to: number, total: number): void {
    this.bloodBar.updateBlood(from, to, total);
    this.totalBlood = total;
    this.currentBlood = to;
  }
}
