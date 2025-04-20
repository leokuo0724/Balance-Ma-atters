import FadeOutDestroy from "phaser3-rex-plugins/plugins/fade-out-destroy";
import { Opponent } from "~/characters";
import {
  COLOR_KEY,
  DEPTH,
  EVENT_KEY,
  FONT_KEY,
  SIZE,
  TEXTURE_KEY,
} from "~/constants";
import { GameManager } from "~/manager";
import { TCardBalance, TCardMetadata, TSimpleVector2 } from "~/type";
import { getIsRightLibraValue, tweensAsync, tweensCounterAsync } from "~/utils";

import {
  BalancedDisplay,
  UnbalanceValueDisplay,
} from "./balance-value-display";
import { LargeLibraIndicator } from "./large-libra-indicator";

export class LargeLibraGroup extends Phaser.GameObjects.Container {
  private _jackpotValue = 0;
  public get jackpotValue() {
    return this._jackpotValue;
  }
  private _balanceValue = 0;

  private _displayValue: Phaser.GameObjects.Text;
  private _largeLibraIndicator: LargeLibraIndicator;
  private _unbalanceValueDisplay: UnbalanceValueDisplay;
  private _balancedDisplay: BalancedDisplay;

  private _onCardDrag: Function;
  private _onCardDragCancel: Function;
  private _onCardApply: Function;

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

    this._onCardDrag = async () => {
      await this.updateBalanceValue(
        gm.getTotalBalance(),
        gm.getHalfTotalLibraValue(),
      );
    };
    this.scene.events.on(EVENT_KEY.ON_CARD_DRAG, this._onCardDrag);

    this._onCardDragCancel = async () => {
      await this.updateBalanceValue(
        gm.getTotalBalance(),
        gm.getHalfTotalLibraValue(),
      );
    };
    this.scene.events.on(EVENT_KEY.ON_CARD_DRAG_CANCEL, this._onCardDragCancel);

    this._onCardApply = ({ metadata }: { metadata: TCardMetadata }) => {
      const { damage, shield } = metadata;
      this.updateJackpotValue(this._jackpotValue + (damage ?? 0) + shield);
    };
    this.scene.events.on(EVENT_KEY.ON_CARD_APPLY, this._onCardApply);

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.once(Phaser.GameObjects.Events.DESTROY, this._onDestroy, this);
  }

  public updateJackpotValue(value: number) {
    if (this._jackpotValue === value) return;
    this.numberTween(this._jackpotValue, value);
    this._jackpotValue = value;
  }

  public async updateBalanceValue(value: number, halfTotal: number) {
    // TODO: Imbalance punishment
    this._balanceValue = Phaser.Math.Clamp(value, -halfTotal, halfTotal);
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

  public async jackpotAttack(opponents: Opponent[], multiply: number) {
    const { centerX, centerY } = this.getBounds();
    const value = this._jackpotValue;

    for (const op of opponents) {
      const bounds = op.getBounds();
      const { centerX: targetX, centerY: targetY } = bounds;

      const valueObject = this.scene.add
        .text(centerX, centerY, value.toString(), {
          fontFamily: FONT_KEY.JERSEY_25,
          fontSize: 80,
          color: COLOR_KEY.YELLOW_6,
          align: "center",
        })
        .setScale(0.5)
        .setOrigin(0.5)
        .setDepth(DEPTH.EFFECT);
      await tweensAsync(this.scene, {
        targets: valueObject,
        duration: 200,
        x: targetX - 8,
        y: "-=12",
        scale: 0.7,
        ease: Phaser.Math.Easing.Quadratic.Out,
      });
      await tweensAsync(this.scene, {
        targets: valueObject,
        duration: 200,
        x: targetX,
        y: targetY,
        scale: 1,
        ease: Phaser.Math.Easing.Quadratic.In,
      });
      op.dealtDamage(value, multiply);
      FadeOutDestroy(valueObject, 500);
    }
    return value;
  }

  private _onDestroy() {
    this.scene.events.off(EVENT_KEY.ON_CARD_DRAG, this._onCardDrag);
    this.scene.events.off(
      EVENT_KEY.ON_CARD_DRAG_CANCEL,
      this._onCardDragCancel,
    );
    this.scene.events.off(EVENT_KEY.ON_CARD_APPLY, this._onCardApply);
  }
}
