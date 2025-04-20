import { ATLAS_KEY, COLOR_KEY, TEXTURE_KEY } from "~/constants";
import { hexToDecimal, tweensAsync, tweensCounterAsync } from "~/utils";

export class BloodBar extends Phaser.GameObjects.Container {
  private _blood: Phaser.GameObjects.Rectangle;
  private _bloodDisplay: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const bg = scene.add.rectangle(
      0,
      0,
      122,
      16,
      hexToDecimal(COLOR_KEY.BROWN_8),
    );
    this._blood = scene.add
      .rectangle(-61, 0, 122, 16, hexToDecimal(COLOR_KEY.RED_6))
      .setOrigin(0, 0.5);
    const bloodBarBox = scene.add.image(
      0,
      0,
      ATLAS_KEY.UI_COMPONENT,
      TEXTURE_KEY.BLOOD_BAR_BOX,
    );
    this._bloodDisplay = scene.add
      .text(0, 0, "0/0", {
        fontFamily: "Jersey25",
        fontSize: 16,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);

    this.add([bg, this._blood, bloodBarBox, this._bloodDisplay]);
  }

  public async updateBlood(from: number, to: number, total: number) {
    await Promise.all([
      tweensAsync(this.scene, {
        targets: this._blood,
        duration: 300,
        width: (to / total) * 122,
        ease: Phaser.Math.Easing.Cubic.Out,
      }),
      this.numberTween(from, to, total),
    ]);
  }

  private async numberTween(from: number, to: number, total: number) {
    await tweensCounterAsync(this.scene, {
      from,
      to,
      duration: 300,
      onUpdate: (tween) => {
        const value = Math.round(tween.getValue());
        this._bloodDisplay.setText(`${value}/${total}`);
      },
    });
  }
}
