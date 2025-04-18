import { ATLAS_KEY, COLOR_KEY, FONT_KEY, SIZE, TEXTURE_KEY } from "~/constants";

export class SmallLibraSet extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const [libraSetWidth, libraSetHeight] = SIZE.SMALL_LIBRA_SET;
    const PADDING_X = 8;

    const bg = scene.add.image(0, 0, TEXTURE_KEY.SMALL_LIBRA_SET_BG);
    const libraIcon = scene.add
      .image(0, 0, ATLAS_KEY.UI_COMPONENT, TEXTURE_KEY.LIBRA_YELLOW)
      .setOrigin(0.5, 1);
    const leftLabel = scene.add
      .text(-libraSetWidth / 2 + PADDING_X, 0, "Physical", {
        fontSize: "16px",
        color: COLOR_KEY.BROWN_8,
        fontFamily: FONT_KEY.JERSEY_25,
      })
      .setOrigin(0, 1);
    const rightLabel = scene.add
      .text(libraSetWidth / 2 - PADDING_X, 0, "Magical", {
        fontSize: "16px",
        color: COLOR_KEY.BROWN_8,
        fontFamily: FONT_KEY.JERSEY_25,
      })
      .setOrigin(1, 1);

    const ruler = scene.add
      .image(0, 14, ATLAS_KEY.UI_COMPONENT, TEXTURE_KEY.RULER)
      .setScale(210 / 172);

    this.add([bg, libraIcon, leftLabel, rightLabel, ruler]);
    this.setSize(libraSetWidth, libraSetHeight);
  }
}
