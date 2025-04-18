import { ATLAS_KEY, COLOR_KEY, FONT_KEY, SIZE, TEXTURE_KEY } from "~/constants";
import { hexToDecimal, tweensAsync } from "~/utils";

const origIndicatorWidth = 164;
const adjustedRatio = 210 / 172;
const adjustedIndicatorWidth = origIndicatorWidth * adjustedRatio;
const unitWidth = adjustedIndicatorWidth / 4 / 2;

export class SmallLibraSet extends Phaser.GameObjects.Container {
  // Props
  private value = 0;

  // UI
  private _indicator: Phaser.GameObjects.Image;
  private _bar: Phaser.GameObjects.Rectangle;
  // private _rightBar: Phaser.GameObjects.Rectangle;

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

    const rulerBg = scene.add.rectangle(
      0,
      14,
      adjustedIndicatorWidth,
      8,
      hexToDecimal(COLOR_KEY.BEIGE_3),
    );
    const ruler = scene.add
      .image(0, 14, ATLAS_KEY.UI_COMPONENT, TEXTURE_KEY.RULER)
      .setScale(adjustedRatio);
    this._bar = scene.add
      .rectangle(0, 14, 0, 8, hexToDecimal(COLOR_KEY.YELLOW_6))
      .setOrigin(0, 0.5);
    // this._rightBar = scene.add
    //   .rectangle(0, 14, 0, 8, hexToDecimal(COLOR_KEY.YELLOW_6))
    //   .setOrigin(0, 0.5);
    this._indicator = scene.add.image(
      0,
      14,
      TEXTURE_KEY.RULER_INDICATOR_YELLOW,
    );

    this.add([
      bg,
      libraIcon,
      leftLabel,
      rightLabel,
      rulerBg,
      this._bar,
      ruler,
      this._indicator,
    ]);
    this.setSize(libraSetWidth, libraSetHeight);
  }

  public async updateValue(value: number) {
    if (this.value === value) return;
    const commonConfig = {
      duration: 800,
      ease: Phaser.Math.Easing.Bounce.Out,
    };

    tweensAsync(this.scene, {
      targets: this._bar,
      width: value * unitWidth,
      ...commonConfig,
    });
    tweensAsync(this.scene, {
      targets: this._indicator,
      x: value * unitWidth,
      ...commonConfig,
    });
  }
}
