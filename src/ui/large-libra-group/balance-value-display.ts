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
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
  }
}
