import {
  ATLAS_KEY,
  COLOR_KEY,
  DEPTH,
  FONT_KEY,
  SIZE,
  TEXTURE_KEY,
} from "~/constants";
import { EStatusType } from "~/type";
import { SimpleTooltip } from "~/ui";

const TEXTURE_MAP = {
  [EStatusType.VENOM]: TEXTURE_KEY.VENOM,
};
const DESC_MAP = {
  [EStatusType.VENOM]: `Poisoned.\nLose HP each turn.
`,
};

export class StatusTag extends Phaser.GameObjects.Container {
  private _valueText: Phaser.GameObjects.Text;
  public readonly _statusType: EStatusType;
  private _value: number;
  public get value() {
    return this._value;
  }

  private _onPointerOver: Function;
  private _onPointerOut: Function;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EStatusType,
    value: number,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this._statusType = type;
    this._value = value;

    const bg = scene.add.image(0, 0, ATLAS_KEY.UI_COMPONENT, TEXTURE_MAP[type]);
    this._valueText = scene.add
      .text(8, 8, `${value}`, {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 20,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    const tooltip = new SimpleTooltip(scene, 0, -48, DESC_MAP[type], 156, 64)
      .setDepth(DEPTH.OVERLAY)
      .setVisible(false);
    this.add([bg, this._valueText, tooltip]);
    this.setSize(...SIZE.STATUS_TAG);

    this._onPointerOver = () => {
      tooltip.setVisible(true);
    };
    this._onPointerOut = () => {
      tooltip.setVisible(false);
    };
    this.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, this._onPointerOver)
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, this._onPointerOut);

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.once(Phaser.GameObjects.Events.DESTROY, this._onDestroy, this);
  }

  public addValue(value: number) {
    this._value += value;
    this._valueText.setText(`${this._value}`);
  }

  private _onDestroy() {
    this.setInteractive(false);
    this.off(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, this._onPointerOver);
    this.off(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, this._onPointerOut);
  }
}
