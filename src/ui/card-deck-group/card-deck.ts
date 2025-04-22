import { TEXTURE_KEY } from "~/constants";

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
  }

  public async spawnCard(
    id: string,
    isForTutorial: boolean = false,
  ): Promise<Card> {
    const FLOATING_SPACE = 8;
    const card = new Card(
      this.scene,
      this._worldX + this.x - FLOATING_SPACE,
      this._worldY + this.y - FLOATING_SPACE,
      id,
      isForTutorial,
    );
    await card.enter();
    return card;
  }
}
