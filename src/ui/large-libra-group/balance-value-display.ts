import { Tweens } from "phaser";
import { ATLAS_KEY, COLOR_KEY, FONT_KEY, TEXTURE_KEY } from "~/constants";

export class UnbalanceValueDisplay extends Phaser.GameObjects.Container {
  private valueDisplay: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const bg = scene.add.image(
      0,
      0,
      ATLAS_KEY.UI_COMPONENT,
      TEXTURE_KEY.NUMBER_DISPLAY_BOX,
    );
    this.valueDisplay = scene.add
      .text(0, 4, "0", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 24,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    this.add([bg, this.valueDisplay]).setVisible(false);
  }

  public updateValueAndVisibility(value: number) {
    this.valueDisplay.setText(value.toString());
    this.setVisible(value !== 0);
  }
}

export class BalancedDisplay extends Phaser.GameObjects.Container {
  private bounceTween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const bg = scene.add.image(
      0,
      0,
      ATLAS_KEY.UI_COMPONENT,
      TEXTURE_KEY.BALANCED_DISPLAY_BOX,
    );
    const text = scene.add
      .text(0, 4, "Balanced", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 36,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    this.add([bg, text]).setVisible(false);

    this.bounceTween = this.scene.tweens.add({
      targets: this,
      y: "+=3",
      repeat: -1,
      yoyo: true,
      paused: true,
      ease: Phaser.Math.Easing.Sine.InOut,
    });
  }

  public updateVisibility(isVisible: boolean) {
    this.setVisible(isVisible);
    if (isVisible) {
      this.bounceTween.resume();
    } else {
      this.bounceTween.pause();
    }
  }
}
