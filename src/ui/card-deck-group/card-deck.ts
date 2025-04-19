import { TEXTURE_KEY } from "~/constants";
import { EBalanceType } from "~/type";

import { Card } from "../card/card";

export class CardDeck extends Phaser.GameObjects.Container {
  private _worldX: number;
  private _worldY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    worldX: number,
    worldY: number,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this._worldX = worldX;
    this._worldY = worldY;

    const bg = scene.add.image(0, 0, TEXTURE_KEY.CARD_DECK);
    this.add([bg]);
    this.spawnCard();
  }

  public spawnCard() {
    const FLOATING_SPACE = 8;
    new Card(
      this.scene,
      this._worldX + this.x - FLOATING_SPACE,
      this._worldY + this.y - FLOATING_SPACE,
      {
        damage: 1,
        shield: 0,
        title: "Fist",
        description: "A fist for justice",
        balances: [
          {
            type: EBalanceType.PHY,
            value: 1,
          },
          {
            type: EBalanceType.ATK,
            value: 1,
          },
        ],
      },
    );
  }
}
