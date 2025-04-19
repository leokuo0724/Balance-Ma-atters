import { COLOR_KEY } from "~/constants";
import { BloodBar } from "~/ui";
import { hexToDecimal } from "~/utils";

import { IBelong, IBlood } from "../interfaces";
import { MaatSprite } from "./maat-sprite";

export class Maat
  extends Phaser.GameObjects.Container
  implements IBlood, IBelong
{
  public bloodBar: BloodBar;
  public totalBlood: number = 0;
  public currentBlood: number = 0;
  public belong: "self" | "opponent" = "self";

  private _maatSprite: MaatSprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this._maatSprite = new MaatSprite(scene, 0, 0);
    this.bloodBar = new BloodBar(scene, 0, 14);
    this.add([this._maatSprite, this.bloodBar]);
    this.setSize(148, 194); // TODO: modify size
  }

  public updateBloodBar(from: number, to: number, total: number): void {
    this.bloodBar.updateBlood(from, to, total);
    this.totalBlood = total;
    this.currentBlood = to;
  }

  public markAsCovered(isCovered: boolean) {
    this._maatSprite.setTint(
      isCovered ? hexToDecimal(COLOR_KEY.RED_6) : 0xffffff,
    );
  }
}
