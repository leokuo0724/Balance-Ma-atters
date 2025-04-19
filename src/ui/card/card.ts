import { ATLAS_KEY, DEPTH, SIZE, TEXTURE_KEY } from "~/constants";

export class Card extends Phaser.GameObjects.Container {
  private _origX: number;
  private _origY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    this._origX = x;
    this._origY = y;

    const bg = scene.add.image(
      0,
      0,
      ATLAS_KEY.UI_COMPONENT,
      TEXTURE_KEY.CARD_BG,
    );
    const cover = scene.add.image(
      0,
      0,
      ATLAS_KEY.UI_COMPONENT,
      TEXTURE_KEY.CARD_TOP,
    );
    this.add([bg, cover]);
    this.setSize(...SIZE.CARD).setDepth(DEPTH.CARD);
  }
}
