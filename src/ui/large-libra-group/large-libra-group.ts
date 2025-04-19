import { COLOR_KEY, EVENT_KEY, FONT_KEY, SIZE, TEXTURE_KEY } from "~/constants";
import { GameManager } from "~/manager";
import { TCardBalance } from "~/type";
import { getIsRightLibraValue, tweensAsync, tweensCounterAsync } from "~/utils";

import {
  BalancedDisplay,
  UnbalanceValueDisplay,
} from "./balance-value-display";
import { LargeLibraIndicator } from "./large-libra-indicator";

export class LargeLibraGroup extends Phaser.GameObjects.Container {
  private _jackpotValue = 0;
  private _balanceValue = 0;

  private _displayValue: Phaser.GameObjects.Text;
  private _largeLibraIndicator: LargeLibraIndicator;
  private _unbalanceValueDisplay: UnbalanceValueDisplay;
  private _balancedDisplay: BalancedDisplay;

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
    this._unbalanceValueDisplay = new UnbalanceValueDisplay(scene, 0, 48);
    this._balancedDisplay = new BalancedDisplay(scene, 0, 48);

    this.add([
      this._largeLibraIndicator,
      outerBox,
      innerBox,
      this._displayValue,
      this._unbalanceValueDisplay,
      this._balancedDisplay,
    ]);
    const gm = GameManager.getInstance();
    this.updateBalanceValue(0, gm.getHalfTotalLibraValue());

    this.scene.events.on(
      EVENT_KEY.ON_CARD_DRAG,
      async ({ balances }: { balances: TCardBalance[] }) => {
        const currentValue = this._balanceValue;
        const diff = this._gatherBalanceDiff(balances);
        await this.updateBalanceValue(
          currentValue + diff,
          gm.getHalfTotalLibraValue(),
        );
      },
    );
    this.scene.events.on(
      EVENT_KEY.ON_CARD_DRAG_CANCEL,
      async ({ balances }: { balances: TCardBalance[] }) => {
        const currentValue = this._balanceValue;
        const diff = this._gatherBalanceDiff(balances);
        await this.updateBalanceValue(
          currentValue - diff,
          gm.getHalfTotalLibraValue(),
        );
      },
    );
  }

  private _gatherBalanceDiff(balances: TCardBalance[]) {
    let total = 0;
    for (const { type, value } of balances) {
      const isRight = getIsRightLibraValue(type);
      total += isRight ? value : -value;
    }
    return total;
  }

  public updateJackpotValue(value: number) {
    if (this._jackpotValue === value) return;
    this.numberTween(this._jackpotValue, value);
    this._jackpotValue = value;
  }

  public async updateBalanceValue(value: number, halfTotal: number) {
    this._balanceValue = value;
    this._balancedDisplay.updateVisibility(this._balanceValue === 0);
    const rect = await this._largeLibraIndicator.updateDisplay(
      value,
      halfTotal,
    );
    const localPoint = this.getWorldTransformMatrix().applyInverse(
      value > 0 ? rect.right : rect.left,
      rect.bottom,
    );
    this._unbalanceValueDisplay.updateValueAndVisibility(this._balanceValue);
    if (this._balanceValue !== 0) {
      await tweensAsync(this.scene, {
        targets: this._unbalanceValueDisplay,
        duration: 300,
        x: localPoint.x,
        y: localPoint.y + SIZE.LARGE_LIBRA_BOX[1] / 2 + 8,
        ease: Phaser.Math.Easing.Cubic.Out,
      });
    }
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
