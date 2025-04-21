import { COLOR_KEY, FONT_KEY } from "~/constants";
import { hexToDecimal } from "~/utils";

export class SimpleTooltip extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    width: number,
    height: number,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const bg = scene.add
      .rectangle(0, 0, width, height, hexToDecimal(COLOR_KEY.BROWN_9), 0.9)
      .setOrigin(0.5);

    const textObj = scene.add
      .text(0, 8, text, {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 18,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    this.add([bg, textObj]);
  }
}
