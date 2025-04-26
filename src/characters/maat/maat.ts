import {
  ATLAS_KEY,
  AUDIO_KEY,
  COLOR_KEY,
  SCENE_KEY,
  SIZE,
  TEXTURE_KEY,
} from "~/constants";
import { GameManager } from "~/manager";
import { EStatusType, TCardMetadata } from "~/type";
import { BloodBar, GameOver, ShieldGroup } from "~/ui";
import {
  delayedCallAsync,
  getAudioScene,
  hexToDecimal,
  tweensAsync,
} from "~/utils";

import { Damaged, FloatingHint } from "../effects";
import { IBlood, IShield, IStatus, ITarget } from "../interfaces";
import { StatusBox } from "../status-box";
import { MaatSprite } from "./maat-sprite";

export class Maat
  extends Phaser.GameObjects.Container
  implements IBlood, IShield, ITarget, IStatus
{
  public bloodBar: BloodBar;
  public totalBlood: number = 0;
  public currentBlood: number = 0;

  public shieldGroup: ShieldGroup;
  public currentShield: number = 0;

  public belong: "self" | "opponent" = "self";
  public dragAreaRect: Phaser.GameObjects.Rectangle;
  private _spotlight: Phaser.GameObjects.Image;

  public statusBox: StatusBox;

  private _maatSprite: MaatSprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const [width, height] = SIZE.TARGET_RECT;

    this._maatSprite = new MaatSprite(scene, 0, -10);
    this.bloodBar = new BloodBar(scene, 0, 12);
    this.shieldGroup = new ShieldGroup(scene, 84, 14);
    this.statusBox = new StatusBox(scene, -60, 40);
    this.dragAreaRect = scene.add
      .rectangle(0, -12, width, height)
      .setOrigin(0.5, 1);
    this._spotlight = scene.add
      .image(0, 0, ATLAS_KEY.UI_COMPONENT, TEXTURE_KEY.SPOTLIGHT)
      .setOrigin(0.5, 1)
      .setVisible(false);
    this.add([
      this._maatSprite,
      this.bloodBar,
      this.shieldGroup,
      this.statusBox,
      this.dragAreaRect,
      this._spotlight,
    ]);
    this.setSize(width, height);
  }

  public getDragArea() {
    return this.dragAreaRect.getBounds();
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
    getAudioScene(this.scene).playSFX(AUDIO_KEY.EQUIP);
    this.currentShield += added;
    this.shieldGroup.updateValue(this.currentShield);
  }

  public markAsCovered(isCovered: boolean) {
    this._spotlight.setVisible(isCovered);
  }

  public async applyCardEffect(card: TCardMetadata) {
    const gm = GameManager.getInstance();
    const multiply = await gm.checkLibraSetBalanced();
    if (card.shield > 0) {
      this.addShield(card.shield * multiply);
      await delayedCallAsync(this.scene, 500);
      gm.setApplyingEffect(false);
    }
    await gm.checkLibraStrike(multiply);
    // TODO: check extra effects
  }

  public async applyDamage(damage: number, isIgnoreShield: boolean = false) {
    // TODO: damage animation
    await this._damageAnim(damage);
    if (this.currentShield > 0 && !isIgnoreShield) {
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
    }
    this._checkDeath();
  }

  private _checkDeath() {
    if (this.currentBlood > 0) return;
    this.scene.scene.start(SCENE_KEY.GAME_OVER, {
      desc: "You lost the fight. Chaos wins this round. Again.",
    });
    this.destroy();
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
    getAudioScene(this.scene).playSFX(AUDIO_KEY.FIXING);
    new FloatingHint(
      this.scene,
      x,
      y - 60,
      "PASS\nFIXING SCALE...",
    ).playAndFadeOut(undefined, 1500);
  }

  public addStatus(type: EStatusType, value: number) {
    this.statusBox.addStatus(type, value);
  }

  public async executeEndTurnStatus() {
    await this.statusBox.executeEndTurnStatus();
  }

  public async takeStatusEffect(type: EStatusType, value: number) {
    switch (type) {
      case EStatusType.VENOM: {
        this._maatSprite.setTint(hexToDecimal(COLOR_KEY.GREEN_6));
        await this.applyDamage(value, true);
        this._maatSprite.setTint(0xffffff);
        break;
      }
    }
  }

  public takeAMoveAnim() {
    this._maatSprite.playPlayCard();
  }

  public libraStrikeAnim() {
    this._maatSprite.playLibraStrike();
  }

  public removeAllStatus() {
    this.statusBox.clear();
  }
}
