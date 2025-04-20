import { ATLAS_KEY, COLOR_KEY, SIZE, TEXTURE_KEY } from "~/constants";
import { GameManager } from "~/manager";
import {
  EOpponentActionable,
  TCardMetadata,
  TOpponentMetadata,
  TOpponentMove,
} from "~/type";
import { BloodBar, ShieldGroup } from "~/ui";
import { delayedCallAsync, hexToDecimal, tweensAsync } from "~/utils";

import { Damaged, FloatingHint } from "../effects";
import { IBlood, IShield, ITarget } from "../interfaces";
import { NextMove } from "./next-move";

const OPPONENT_TEXTURE_MAP: Record<string, string> = {
  o_00000: TEXTURE_KEY.JACKAL,
};

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

    this.bloodBar = new BloodBar(scene, 0, 14);
    this.shieldGroup = new ShieldGroup(scene, -84, 14);

    this._sprite = scene.add
      .sprite(0, 0, ATLAS_KEY.CHARACTER, OPPONENT_TEXTURE_MAP[metadata.id])
      .setOrigin(0.5, 1);
    this._nextMove = new NextMove(scene, 0, this._sprite.getTopCenter().y - 36);

    this.add([this._sprite, this.bloodBar, this.shieldGroup, this._nextMove]);
    this.setSize(...SIZE.TARGET_RECT);

    this.updateBloodBar(metadata.blood, metadata.blood, metadata.blood);
    this.updateShield(0);
    this.updateMove();
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
    this._sprite.setTint(isCovered ? hexToDecimal(COLOR_KEY.RED_6) : 0xffffff);
  }

  public async applyCardEffect(card: TCardMetadata) {
    if (card.damage && card.damage > 0) {
      const gm = GameManager.getInstance();
      const multiply = await gm.checkLibraSetBalanced();
      // TODO: check effects
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
    this._checkDeath();
  }

  private _checkDeath() {
    if (this.currentBlood > 0) return;
    const gm = GameManager.getInstance();
    gm.defectedOpponent(this);
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
