import FadeOutDestroy from "phaser3-rex-plugins/plugins/fade-out-destroy";
import { COLOR_KEY, FONT_KEY } from "~/constants";
import { getCanvasSize, hexToDecimal, tweensAsync } from "~/utils";

const BIAS_Y = 24;

export class Banner extends Phaser.GameObjects.Container {
  private _bg: Phaser.GameObjects.Rectangle;
  private _text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    super(scene, x, y);
    scene.add.existing(this);

    const [width, _] = getCanvasSize(scene);
    this._bg = scene.add
      .rectangle(0, BIAS_Y, width, 96, hexToDecimal(COLOR_KEY.BROWN_9))
      .setAlpha(0);
    this._text = scene.add
      .text(0, BIAS_Y, text, {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 48,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.add([this._bg, this._text]);
  }

  public async transitionIn() {
    await Promise.all([
      tweensAsync(this.scene, {
        targets: this._bg,
        y: `-=${BIAS_Y}`,
        duration: 300,
        ease: Phaser.Math.Easing.Cubic.Out,
        alpha: 1,
      }),
      tweensAsync(this.scene, {
        targets: this._text,
        y: `-=${BIAS_Y + 4}`,
        duration: 500,
        ease: Phaser.Math.Easing.Cubic.Out,
        alpha: 1,
      }),
    ]);
    await tweensAsync(this.scene, {
      targets: this._text,
      y: `+=4`,
      duration: 100,
    });
  }

  public async transitionDestroy() {
    FadeOutDestroy(this, 800);
  }
}
