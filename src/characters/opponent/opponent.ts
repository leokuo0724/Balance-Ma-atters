import { ATLAS_KEY, COLOR_KEY, SIZE, TEXTURE_KEY } from "~/constants";
import { TCardMetadata, TOpponentMetadata, TOpponentMove } from "~/type";
import { BloodBar, ShieldGroup } from "~/ui";
import { hexToDecimal } from "~/utils";

import { IBlood, IShield, ITarget } from "../interfaces";

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

  private _currentMove = 0;
  private _moves: (TOpponentMove | null)[];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    metadata: TOpponentMetadata,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this._moves = metadata.moves;

    this.bloodBar = new BloodBar(scene, 0, 14);
    this.shieldGroup = new ShieldGroup(scene, -84, 14);

    this._sprite = scene.add
      .sprite(0, 0, ATLAS_KEY.CHARACTER, OPPONENT_TEXTURE_MAP[metadata.id])
      .setOrigin(0.5, 1);

    this.add([this._sprite, this.bloodBar, this.shieldGroup]);
    this.setSize(...SIZE.TARGET_RECT); // TODO: modify size

    this.updateBloodBar(metadata.blood, metadata.blood, metadata.blood);
    this.updateShield(0);
    // TODO: display next move
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
    this._sprite.setTint(isCovered ? hexToDecimal(COLOR_KEY.RED_6) : 0xffffff);
  }

  public applyCardEffect(card: TCardMetadata) {
    if (card.damage && card.damage > 0) {
      // TODO: check balanced
      // TODO: check effects

      // check if shield is available
      if (this.currentShield > 0) {
        this.currentShield -= card.damage;
        this.shieldGroup.updateValue(this.currentShield);
        if (this.currentShield < 0) {
          this.currentBlood += this.currentShield; // currentBlood will be negative
          this.shieldGroup.updateValue(0);
          this.currentShield = 0;
        }
      } else {
        this.currentBlood -= card.damage;
        this.bloodBar.updateBlood(
          this.currentBlood + card.damage,
          this.currentBlood,
          this.totalBlood,
        );
      }
    }
  }
}
