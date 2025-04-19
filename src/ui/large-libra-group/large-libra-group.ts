import { COLOR_KEY, FONT_KEY, TEXTURE_KEY } from "~/constants";
import { tweensCounterAsync } from "~/utils";

import { LargeLibraIndicator } from "./large-libra-indicator";

export class LargeLibraGroup extends Phaser.GameObjects.Container {
  private _jackpotValue = 0;
  private _balanceValue = 0;

  private _displayValue: Phaser.GameObjects.Text;
  private _largeLibraIndicator: LargeLibraIndicator;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this._largeLibraIndicator = new LargeLibraIndicator(scene, 0, 0);
    const outerBox = scene.add.image(0, 0, TEXTURE_KEY.LARGE_LIBRA_BOX_BG);
    const innerBox = scene.add.image(0, 0, TEXTURE_KEY.LARGE_LIBRA_BOX_BG_2);
    this._displayValue = scene.add
      .text(0, 0, this._jackpotValue.toString(), {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 36,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);

    this.add([
      this._largeLibraIndicator,
      outerBox,
      innerBox,
      this._displayValue,
    ]);

    // this.updateJackpotValue(20);
    // this.updateBalanceValue(-5, 10);
  }

  public updateJackpotValue(value: number) {
    if (this._jackpotValue === value) return;
    this.numberTween(this._jackpotValue, value);
    this._jackpotValue = value;
  }

  public updateBalanceValue(value: number, halfTotal: number) {
    this._balanceValue = value;
    this._largeLibraIndicator.updateDisplay(value, halfTotal);
  }

  private async numberTween(from: number, to: number) {
    await tweensCounterAsync(this.scene, {
      from,
      to,
      duration: 300,
      onUpdate: (tween) => {
        const value = Math.round(tween.getValue());
        this._displayValue.setText(value.toString());
      },
    });
  }
}
