import { TEXTURE_KEY } from "~/constants";

export class CardDeck extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const bg = scene.add.image(0, 0, TEXTURE_KEY.CARD_DECK);
    this.add([bg]);
  }
}
