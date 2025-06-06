import { ATLAS_KEY, AUDIO_KEY, SIZE, TEXTURE_KEY } from "~/constants";
import { GameManager } from "~/manager";
import {
  EEffect,
  EOpponentActionable,
  TCardMetadata,
  TOpponentMetadata,
  TOpponentMove,
} from "~/type";
import { BloodBar, ShieldGroup } from "~/ui";
import { delayedCallAsync, getAudioScene, tweensAsync } from "~/utils";

import { Damaged, FloatingHint } from "../effects";
import { IBlood, IShield, ITarget } from "../interfaces";
import { StatusBox } from "../status-box";
import { NextMove } from "./next-move";

const OPPONENT_TEXTURE_MAP: Record<string, string> = {
  o_00000: TEXTURE_KEY.JACKAL,
  o_00001: TEXTURE_KEY.TURTLE,
  o_00002: TEXTURE_KEY.FOX,
  o_00003: TEXTURE_KEY.MEERKAT,
  o_00004: TEXTURE_KEY.SNAKE,
  o_00005: TEXTURE_KEY.APOPHIS,
  o_00006: TEXTURE_KEY.SHABTI,
  o_00007: TEXTURE_KEY.JACKAL,
};

// TODO: implement IStatus
export class Opponent
  extends Phaser.GameObjects.Container
  implements IBlood, IShield, ITarget
{
  public bloodBar: BloodBar;
  public totalBlood: number = 0;
  public currentBlood: number = 0;

  public shieldGroup: ShieldGroup;
  public currentShield: number = 0;

  public belong: "self" | "opponent" = "opponent";
  public dragAreaRect: Phaser.GameObjects.Rectangle;
  private _spotlight: Phaser.GameObjects.Image;

  public statusBox: StatusBox;

  private _sprite: Phaser.GameObjects.Sprite;
  private _nextMove: NextMove;

  private _currentMoveCount = -1;
  private _defaultMoves: (TOpponentMove | null)[];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    metadata: TOpponentMetadata,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this._defaultMoves = metadata.moves;

    const [width, height] = SIZE.TARGET_RECT;

    this.bloodBar = new BloodBar(scene, 0, 12);
    this.shieldGroup = new ShieldGroup(scene, -84, 14);
    this.statusBox = new StatusBox(scene, -60, 40);

    this._sprite = scene.add
      .sprite(0, -10, ATLAS_KEY.CHARACTER, OPPONENT_TEXTURE_MAP[metadata.id])
      .setOrigin(0.5, 1);
    this._nextMove = new NextMove(scene, 0, this._sprite.getTopCenter().y - 36);
    this.dragAreaRect = scene.add
      .rectangle(0, -12, width, height)
      .setOrigin(0.5, 1);
    this._spotlight = scene.add
      .image(0, 0, ATLAS_KEY.UI_COMPONENT, TEXTURE_KEY.SPOTLIGHT)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.add([
      this._sprite,
      this.bloodBar,
      this.shieldGroup,
      this._nextMove,
      this.statusBox,
      this.dragAreaRect,
      this._spotlight,
    ]);
    this.setSize(width, height);

    this.updateBloodBar(metadata.blood, metadata.blood, metadata.blood);
    this.updateShield(0);
    this.updateMove();
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
    if (card.damage && card.damage > 0) {
      const gm = GameManager.getInstance();
      const multiply = await gm.checkLibraSetBalanced();
      // TODO: extra effects
      if (card.effects.some((e) => e.type === EEffect.CARD_DRAW)) {
        gm.drawCards(this.scene);
      }
      await this.dealtDamage(card.damage, multiply);
      await gm.checkLibraStrike(multiply);
      if (this.scene) await delayedCallAsync(this.scene, 500);
      gm.setApplyingEffect(false);
    }
  }

  public async dealtDamage(damage: number, multiply: number) {
    this._damageAnim(damage, multiply);
    const dealtDamage = damage * multiply;
    // check if shield is available
    if (this.currentShield > 0) {
      this.currentShield -= dealtDamage;
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
      this.currentBlood -= dealtDamage;
      await this.bloodBar.updateBlood(
        this.currentBlood + dealtDamage,
        this.currentBlood,
        this.totalBlood,
      );
    }
    await this._checkDeath();
  }

  private async _checkDeath() {
    if (this.currentBlood > 0) return;
    const gm = GameManager.getInstance();
    await gm.defectedOpponent(this);
  }

  public updateMove() {
    this._currentMoveCount++;
    if (this._currentMoveCount >= this._defaultMoves.length) {
      this._currentMoveCount = 0;
    }
    const move = this._defaultMoves[this._currentMoveCount];
    this._nextMove.updateNextMove(move);
  }

  public async performMovable() {
    const gm = GameManager.getInstance();
    const movable = this._nextMove.nextMovable;
    if (!movable) {
      const { x, y } = this._sprite.getWorldPoint();
      await new FloatingHint(this.scene, x, y - 160, "PASS").playAndFadeOut();
    } else {
      await Promise.all([
        this._movableAnim(movable.action),
        gm.applyOpponentMovable(movable),
      ]);
    }
  }

  private async _movableAnim(actionable: EOpponentActionable) {
    const isSelfApplied = [
      EOpponentActionable.SHIELD,
      EOpponentActionable.HEAL,
      EOpponentActionable.SUMMON,
    ].includes(actionable);

    const config = {
      targets: this,
      ease: Phaser.Math.Easing.Cubic.In,
      duration: 300,
    };
    if (isSelfApplied) {
      await tweensAsync(this.scene, {
        y: "-=12",
        yoyo: true,
        ...config,
      });
    } else {
      await tweensAsync(this.scene, {
        x: "-=12",
        yoyo: true,
        ...config,
      });
    }
  }

  public healing(value: number) {
    // TODO: animation
    this.currentBlood += value;
    if (this.currentBlood > this.totalBlood) {
      this.currentBlood = this.totalBlood;
    }
    this.bloodBar.updateBlood(
      this.currentBlood - value,
      this.currentBlood,
      this.totalBlood,
    );
  }

  private async _damageAnim(damage: number, multiple: number) {
    const { x, y } = this._sprite.getWorldPoint();
    new Damaged(this.scene, x, y - 80).playAndFadeOut();
    new FloatingHint(
      this.scene,
      x,
      y - 160,
      `-${damage}x${multiple}`,
    ).playAndFadeOut();

    await tweensAsync(this.scene, {
      targets: this,
      x: "+=12",
      yoyo: true,
      ease: Phaser.Math.Easing.Cubic.InOut,
      duration: 300,
    });
  }
}
