import { COLOR_KEY, FONT_KEY, SIZE, TEXTURE_KEY } from "~/constants";
import { EBalanceType } from "~/type";
import { getBalanceShortText } from "~/utils/balance.utility";

export class BalanceLabel extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    balanceType: EBalanceType,
    value: number,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const [width, _] = SIZE.LABEL;
    const PADDING_X = 2;
    const map = {
      [EBalanceType.PHY]: TEXTURE_KEY.LABEL_RED,
      [EBalanceType.MAG]: TEXTURE_KEY.LABEL_RED,
      [EBalanceType.ATK]: TEXTURE_KEY.LABEL_YELLOW,
      [EBalanceType.DEF]: TEXTURE_KEY.LABEL_YELLOW,
      [EBalanceType.SHT]: TEXTURE_KEY.LABEL_GREEN,
      [EBalanceType.LNG]: TEXTURE_KEY.LABEL_GREEN,
      [EBalanceType.DUT]: TEXTURE_KEY.LABEL_BLUE,
      [EBalanceType.FIR]: TEXTURE_KEY.LABEL_BLUE,
    };
    const bg = scene.add.image(0, 0, map[balanceType]);
    const leftLabel = scene.add
      .text(-width / 2 + PADDING_X, 0, getBalanceShortText(balanceType), {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 16,
        color: COLOR_KEY.BEIGE_2,
        align: "left",
      })
      .setOrigin(0, 0.5);
    const rightLabel = scene.add
      .text(width / 2 - PADDING_X, 0, value.toString(), {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 16,
        color: COLOR_KEY.BEIGE_2,
        align: "right",
      })
      .setOrigin(1, 0.5);

    this.add([bg, leftLabel, rightLabel]);
  }
}
