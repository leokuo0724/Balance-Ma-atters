import { ATLAS_KEY, COLOR_KEY, SIZE, TEXTURE_KEY } from "~/constants";
import { hexToDecimal, tweensAsync } from "~/utils";

const PADDING_X = 2;
const FULL_HALF_WIDTH = SIZE.LARGE_LIBRA_INDICATOR[0] / 2 - PADDING_X;
const START_WIDTH = SIZE.LARGE_LIBRA_BOX[0] / 2;

export class LargeLibraIndicator extends Phaser.GameObjects.Container {
  private _bar: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const icon = scene.add.image(
      0,
      -36,
      ATLAS_KEY.UI_COMPONENT,
      TEXTURE_KEY.LIBRA_LARGE,
    );
    const barBg = scene.add.image(0, 0, TEXTURE_KEY.LARGE_LIBRA_INDICATOR_BG);
    this._bar = scene.add
      .rectangle(0, 0, 0, 8, hexToDecimal(COLOR_KEY.BROWN_8))
      .setOrigin(0, 0.5);
    this.add([barBg, this._bar, icon]);
  }

  public async updateDisplay(
    value: number,
    halfTotal: number,
  ): Promise<Phaser.Geom.Rectangle> {
    const DURATION = 800;
    const MAX_UNBALANCED_ROTATION = Math.PI / 15;
    const ratio = value / halfTotal;
    tweensAsync(this.scene, {
      targets: this,
      duration: DURATION,
      rotation: value === 0 ? 0 : ratio * MAX_UNBALANCED_ROTATION,
      ease: Phaser.Math.Easing.Bounce.Out,
    });
    await tweensAsync(this.scene, {
      targets: this._bar,
      duration: DURATION,
      width:
        START_WIDTH * (value === 0 ? 0 : value > 0 ? 1 : -1) +
        ratio * (FULL_HALF_WIDTH - START_WIDTH),
      ease: Phaser.Math.Easing.Cubic.Out,
    });

    return this._bar.getBounds();
  }
}
