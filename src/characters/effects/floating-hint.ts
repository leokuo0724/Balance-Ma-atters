import FadeOutDestroy from "phaser3-rex-plugins/plugins/fade-out-destroy";
import { COLOR_KEY, DEPTH, FONT_KEY } from "~/constants";
import { delayedCallAsync, tweensAsync } from "~/utils";

export class FloatingHint extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(DEPTH.EFFECT);

    const label = scene.add
      .text(0, 0, text, {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 36,
        color: COLOR_KEY.BEIGE_2,
        stroke: COLOR_KEY.BROWN_4,
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);
    this.add([label]);
  }

  public async playAndFadeOut(fadeoutDuration?: number) {
    await tweensAsync(this.scene, {
      targets: this,
      y: "-=12",
      duration: 500,
      ease: Phaser.Math.Easing.Bounce.Out,
    });
    FadeOutDestroy(this, fadeoutDuration ?? 500);
  }
}
