import { SIZE } from "~/constants";
import { GameManager } from "~/manager";

import { CardDeck } from "./card-deck";

export class CardDeckGroup extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const gm = GameManager.getInstance();
    const PADDING_X = 16;
    for (let i = 0; i < 5; i++) {
      const cardDeck = new CardDeck(
        scene,
        (SIZE.CARD[0] + PADDING_X) * i,
        300,
        this.x,
        this.y,
      );
      this.add(cardDeck);
      gm.addCardDecks(cardDeck);
    }
  }
}
