import { ATLAS_KEY, COLOR_KEY, SIZE, TEXTURE_KEY } from "~/constants";
import { GameManager } from "~/manager";
import {
  EOpponentActionable,
  TCardMetadata,
  TOpponentMetadata,
  TOpponentMove,
} from "~/type";
import { BloodBar, ShieldGroup } from "~/ui";
import { hexToDecimal, tweensAsync } from "~/utils";

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
    this._nextMove = new NextMove(scene, 0, this._sprite.getTopCenter().y - 24);

    this.add([this._sprite, this.bloodBar, this.shieldGroup, this._nextMove]);
    this.setSize(...SIZE.TARGET_RECT); // TODO: modify size

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
      // TODO: check balanced
      // TODO: check effects

      // check if shield is available
      if (this.currentShield > 0) {
        this.currentShield -= card.damage;
        this.shieldGroup.updateValue(this.currentShield);
        if (this.currentShield < 0) {
          this.currentBlood += this.currentShield; // currentBlood will be negative
          await this.bloodBar.updateBlood(
            (this.currentBlood -= this.currentShield),
            this.currentBlood,
            this.totalBlood,
          );
          this.currentShield = 0;
        }
      } else {
        this.currentBlood -= card.damage;
        await this.bloodBar.updateBlood(
          this.currentBlood + card.damage,
          this.currentBlood,
          this.totalBlood,
        );
      }
      this._checkDeath();
    }
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
      // TODO: hint do nothing
    } else {
      await this._movableAnim(movable.action);
      gm.applyOpponentMovable(movable);
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
      duration: 400,
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
    this.bloodBar.updateBlood(
      this.currentBlood - value,
      this.currentBlood,
      this.totalBlood,
    );
  }
}
