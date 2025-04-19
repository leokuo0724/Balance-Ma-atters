import { ATLAS_KEY, COLOR_KEY, TEXTURE_KEY } from "~/constants";

export class ShieldGroup extends Phaser.GameObjects.Container {
  private _displayValue: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const bg = scene.add.image(
      0,
      0,
      ATLAS_KEY.UI_COMPONENT,
      TEXTURE_KEY.SILVER_SHIELD_ICON,
    );
    this._displayValue = scene.add
      .text(0, 0, "0", {
        fontFamily: "Arial",
        fontSize: 16,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);

    this.add([bg, this._displayValue]);
  }

  public updateValue(value: number) {
    this._displayValue.setText(value.toString());
    this.setVisible(value > 0);
  }
}
