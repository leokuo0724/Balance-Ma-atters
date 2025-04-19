import {
  ATLAS_KEY,
  COLOR_KEY,
  EVENT_KEY,
  FONT_KEY,
  MAX_SMALL_LIBRA_STEPS,
  SIZE,
  TEXTURE_KEY,
} from "~/constants";
import { EBalanceSetType, TCardBalance } from "~/type";
import {
  getBalanceLeftRightSet,
  getBalanceLongText,
  getBalanceSetColor,
  hexToDecimal,
  isNil,
  tweensAsync,
} from "~/utils";

const origIndicatorWidth = 164;
const adjustedRatio = 210 / 172;
const adjustedIndicatorWidth = origIndicatorWidth * adjustedRatio;
const unitWidth = adjustedIndicatorWidth / MAX_SMALL_LIBRA_STEPS / 2;

const LIBRA_TEXTURE_MAP = {
  [EBalanceSetType.PHY_MAG]: TEXTURE_KEY.LIBRA_RED,
  [EBalanceSetType.DEF_ATK]: TEXTURE_KEY.LIBRA_YELLOW,
  [EBalanceSetType.SHT_LNG]: TEXTURE_KEY.LIBRA_GREEN,
  [EBalanceSetType.DUT_FIR]: TEXTURE_KEY.LIBRA_BLUE,
};
const INDICATOR_TEXTURE_MAP = {
  [EBalanceSetType.PHY_MAG]: TEXTURE_KEY.RULER_INDICATOR_RED,
  [EBalanceSetType.DEF_ATK]: TEXTURE_KEY.RULER_INDICATOR_YELLOW,
  [EBalanceSetType.SHT_LNG]: TEXTURE_KEY.RULER_INDICATOR_GREEN,
  [EBalanceSetType.DUT_FIR]: TEXTURE_KEY.RULER_INDICATOR_BLUE,
};

export class SmallLibraSet extends Phaser.GameObjects.Container {
  // Props
  private _value = 0;
  public get value() {
    return this._value;
  }
  public locked = false;
  public balanceSetType: EBalanceSetType;
  private _tempValue: number | null = null;

  // UI
  private _indicator: Phaser.GameObjects.Image;
  private _bar: Phaser.GameObjects.Rectangle;
  private _lockCover: LockCover;

  private _onCardDrag: Function;
  private _onCardDragCancel: Function;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    balanceSetType: EBalanceSetType,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.balanceSetType = balanceSetType;

    const [libraSetWidth, libraSetHeight] = SIZE.SMALL_LIBRA_SET;
    const PADDING_X = 8;
    const [lBalanceType, rBalanceType] = getBalanceLeftRightSet(balanceSetType);

    const bg = scene.add.image(0, 0, TEXTURE_KEY.SMALL_LIBRA_SET_BG);
    const libraIcon = scene.add
      .image(0, 0, ATLAS_KEY.UI_COMPONENT, LIBRA_TEXTURE_MAP[balanceSetType])
      .setOrigin(0.5, 1);
    const leftLabel = scene.add
      .text(
        -libraSetWidth / 2 + PADDING_X,
        0,
        getBalanceLongText(lBalanceType),
        {
          fontSize: 16,
          color: COLOR_KEY.BROWN_8,
          fontFamily: FONT_KEY.JERSEY_25,
        },
      )
      .setOrigin(0, 1);
    const rightLabel = scene.add
      .text(
        libraSetWidth / 2 - PADDING_X,
        0,
        getBalanceLongText(rBalanceType),
        {
          fontSize: "16px",
          color: COLOR_KEY.BROWN_8,
          fontFamily: FONT_KEY.JERSEY_25,
        },
      )
      .setOrigin(1, 1);

    const rulerBg = scene.add.rectangle(
      0,
      14,
      adjustedIndicatorWidth,
      8,
      hexToDecimal(COLOR_KEY.BEIGE_3),
    );
    const ruler = scene.add
      .image(0, 14, ATLAS_KEY.UI_COMPONENT, TEXTURE_KEY.RULER)
      .setScale(adjustedRatio);
    this._bar = scene.add
      .rectangle(0, 14, 0, 8, hexToDecimal(getBalanceSetColor(balanceSetType)))
      .setOrigin(0, 0.5);
    this._indicator = scene.add.image(
      0,
      14,
      INDICATOR_TEXTURE_MAP[balanceSetType],
    );
    this._lockCover = new LockCover(scene, 0, 0).setVisible(this.locked);

    this.add([
      bg,
      libraIcon,
      leftLabel,
      rightLabel,
      rulerBg,
      this._bar,
      ruler,
      this._indicator,
      this._lockCover,
    ]);
    this.setSize(libraSetWidth, libraSetHeight);

    this._onCardDrag = ({ balances }: { balances: TCardBalance[] }) => {
      if (this.locked) return;
      this._tempValue = this._value;
      const diff = this._gatherBalanceDiff(balances);
      this.updateValue(this._value + diff);
    };
    this.scene.events.on(EVENT_KEY.ON_CARD_DRAG, this._onCardDrag);

    this._onCardDragCancel = () => {
      if (this.locked || isNil(this._tempValue)) return;
      this.updateValue(this._tempValue);
      this._tempValue = null;
    };
    this.scene.events.on(EVENT_KEY.ON_CARD_DRAG_CANCEL, this._onCardDragCancel);

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.once(Phaser.GameObjects.Events.DESTROY, this._onDestroy, this);
  }

  private _gatherBalanceDiff(balances: TCardBalance[]): number {
    const [lBalanceType, rBalanceType] = getBalanceLeftRightSet(
      this.balanceSetType,
    );
    let diff = 0;
    balances.forEach(({ type, value }) => {
      if (type === lBalanceType) {
        diff -= value;
      }
      if (type === rBalanceType) {
        diff += value;
      }
    });
    return diff;
  }

  public async unlock() {
    if (!this.locked) return;
    this.locked = false;
    await tweensAsync(this.scene, {
      targets: this._lockCover,
      alpha: 0,
      y: "+=8",
      duration: 400,
    });
    this._lockCover.setVisible(false);
  }

  public async updateValue(value: number) {
    if (this._value === value) return;
    const commonConfig = {
      duration: 800,
      ease: Phaser.Math.Easing.Bounce.Out,
    };

    // TODO: Imbalance punishment
    this._value = Phaser.Math.Clamp(
      value,
      -MAX_SMALL_LIBRA_STEPS,
      MAX_SMALL_LIBRA_STEPS,
    );
    await Promise.all([
      tweensAsync(this.scene, {
        targets: this._bar,
        width: this._value * unitWidth,
        ...commonConfig,
      }),
      tweensAsync(this.scene, {
        targets: this._indicator,
        x: this._value * unitWidth,
        ...commonConfig,
      }),
    ]);
  }

  private _onDestroy() {
    this.scene.events.off(EVENT_KEY.ON_CARD_DRAG, this._onCardDrag);
    this.scene.events.off(
      EVENT_KEY.ON_CARD_DRAG_CANCEL,
      this._onCardDragCancel,
    );
  }
}

class LockCover extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const bg = scene.add.image(0, 0, TEXTURE_KEY.SMALL_LIBRA_SET_BG_2);
    const lockIcon = scene.add.image(
      0,
      0,
      ATLAS_KEY.UI_COMPONENT,
      TEXTURE_KEY.LOCK,
    );
    this.add([bg, lockIcon]);
  }
}
