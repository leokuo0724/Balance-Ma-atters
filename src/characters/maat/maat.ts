import { COLOR_KEY, SIZE } from "~/constants";
import { GameManager } from "~/manager";
import { TCardMetadata } from "~/type";
import { BloodBar, GameOver, ShieldGroup } from "~/ui";
import {
  delayedCallAsync,
  getCanvasCenter,
  hexToDecimal,
  tweensAsync,
} from "~/utils";

import { Damaged, FloatingHint } from "../effects";
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

  public addShield(added: number): void {
    this.currentShield += added;
    this.shieldGroup.updateValue(this.currentShield);
  }

  public markAsCovered(isCovered: boolean) {
    this._maatSprite.setTint(
      isCovered ? hexToDecimal(COLOR_KEY.YELLOW_6) : 0xffffff,
    );
  }

  public async applyCardEffect(card: TCardMetadata) {
    // should only apply shield
    if (card.shield > 0) {
      const gm = GameManager.getInstance();
      const multiple = await gm.checkLibraSetBalanced();
      this.addShield(card.shield * multiple);
      await delayedCallAsync(this.scene, 500);
      gm.setApplyingEffect(false);
    }
  }

  public async applyDamage(damage: number) {
    // TODO: damage animation
    await this._damageAnim(damage);
    if (this.currentShield > 0) {
      this.currentShield -= damage;
      this.shieldGroup.updateValue(this.currentShield);
      if (this.currentShield < 0) {
        this.currentBlood += this.currentShield; // currentBlood will be negative
        await this.bloodBar.updateBlood(
          this.currentBlood - this.currentShield,
          this.currentBlood,
          this.totalBlood,
        );
        this.currentShield = 0;
      }
    } else {
      this.currentBlood -= damage;
      await this.bloodBar.updateBlood(
        this.currentBlood + damage,
        this.currentBlood,
        this.totalBlood,
      );
      this._checkDeath();
    }
  }

  private _checkDeath() {
    if (this.currentBlood > 0) return;
    new GameOver(this.scene, "You lost the fight. Turns out punches hurt.");
    this.destroy(true);
  }

  private async _damageAnim(damage: number) {
    // delay for opponent movement
    await delayedCallAsync(this.scene, 250);

    const { x, y } = this._maatSprite.getWorldPoint();
    new Damaged(this.scene, x, y - 80).playAndFadeOut();
    await delayedCallAsync(this.scene, 200);
    new FloatingHint(this.scene, x, y - 160, `-${damage}`).playAndFadeOut();
    await tweensAsync(this.scene, {
      targets: this,
      x: "-=12",
      yoyo: true,
      ease: Phaser.Math.Easing.Cubic.InOut,
      duration: 300,
    });
  }

  public async fixingLibraHint() {
    const { x, y } = this.getWorldPoint();
    new FloatingHint(
      this.scene,
      x,
      y - 60,
      "PASS\nFIXING LIBRA...",
    ).playAndFadeOut(undefined, 1500);
  }

  public async applyVenom(value: number) {}
}
