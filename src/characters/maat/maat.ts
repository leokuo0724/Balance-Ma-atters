import { COLOR_KEY, SIZE } from "~/constants";
import { TCardMetadata } from "~/type";
import { BloodBar, ShieldGroup } from "~/ui";
import { hexToDecimal } from "~/utils";

import { IBlood, IShield, ITarget } from "../interfaces";
import { MaatSprite } from "./maat-sprite";

export class Maat
  extends Phaser.GameObjects.Container
  implements IBlood, IShield, ITarget
{
  public bloodBar: BloodBar;
  public totalBlood: number = 0;
  public currentBlood: number = 0;

  public shieldGroup: ShieldGroup;
  public currentShield: number = 0;

  public belong: "self" | "opponent" = "self";

  private _maatSprite: MaatSprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this._maatSprite = new MaatSprite(scene, 0, 0);
    this.bloodBar = new BloodBar(scene, 0, 14);
    this.shieldGroup = new ShieldGroup(scene, 84, 14);
    this.add([this._maatSprite, this.bloodBar, this.shieldGroup]);
    this.setSize(...SIZE.TARGET_RECT);
  }

  public updateBloodBar(from: number, to: number, total: number): void {
    this.bloodBar.updateBlood(from, to, total);
    this.totalBlood = total;
    this.currentBlood = to;
  }

  public updateShield(value: number): void {
    this.shieldGroup.updateValue(value);
    this.currentShield = value;
  }

  public markAsCovered(isCovered: boolean) {
    this._maatSprite.setTint(
      isCovered ? hexToDecimal(COLOR_KEY.YELLOW_6) : 0xffffff,
    );
  }

  public applyCardEffect(card: TCardMetadata) {
    // should only apply shield
    if (card.shield > 0) {
      this.shieldGroup.updateValue(card.shield);
      this.currentShield += card.shield;
    }
  }

  public applyDamage(damage: number) {
    // TODO: damage animation
    if (this.currentShield > 0) {
      this.currentShield -= damage;
      this.shieldGroup.updateValue(this.currentShield);
      if (this.currentShield < 0) {
        this.currentBlood += this.currentShield; // currentBlood will be negative
        this.shieldGroup.updateValue(0);
        this.currentShield = 0;
      }
    } else {
      this.currentBlood -= damage;
      this.bloodBar.updateBlood(
        this.currentBlood + damage,
        this.currentBlood,
        this.totalBlood,
      );
      // TODO: check death
    }
  }
}
