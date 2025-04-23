import { COLOR_KEY, FONT_KEY, SIZE, TEXTURE_KEY } from "~/constants";
import { tweensAsync } from "~/utils";

const BUTTON_TYPE_TEXTURE_MAP = {
  normal: TEXTURE_KEY.BUTTON_LG_BG_NORMAL,
  hover: TEXTURE_KEY.BUTTON_LG_BG_HOVER,
  disabled: TEXTURE_KEY.BUTTON_LG_BG_DISABLED,
};

export abstract class Button extends Phaser.GameObjects.Container {
  private _text: Phaser.GameObjects.Text;
  private _bgTop: Phaser.GameObjects.Image;

  private _bg: Phaser.GameObjects.Image;

  public isDisabled: boolean = false;

  abstract onClick(): void;

  private _onPointerOver: Function;
  private _onPointerOut: Function;
  private _onPointerDown: Function;
  private _onPointerUp: Function;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    super(scene, x, y);
    scene.add.existing(this);

    const bgUnder = scene.add
      .image(0, 2, TEXTURE_KEY.BUTTON_LG_UNDER)
      .setOrigin(0.5);
    this._bgTop = scene.add
      .image(0, -2, TEXTURE_KEY.BUTTON_LG_BG_TOP)
      .setOrigin(0.5);
    this._bg = scene.add
      .image(0, -2, TEXTURE_KEY.BUTTON_LG_BG_NORMAL)
      .setOrigin(0.5);
    this._text = scene.add
      .text(0, -2, text, {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 28,
        color: "#fff",
      })
      .setOrigin(0.5);
    this.add([bgUnder, this._bgTop, this._bg, this._text]);

    const [width, height] = SIZE.BUTTON_LG;
    this.setSize(width + 6, height + 6);

    this._onPointerOver = () => {
      if (this.isDisabled) return;
      this._hoverTweens(true);
      this._bg.setTexture(BUTTON_TYPE_TEXTURE_MAP.hover);
    };
    this._onPointerOut = () => {
      if (this.isDisabled) return;
      this._hoverTweens(false);
      this._bg.setTexture(BUTTON_TYPE_TEXTURE_MAP.normal);
    };
    this._onPointerDown = () => {
      if (this.isDisabled) return;
      this._pressTweens(true);
      this.onClick();
    };
    this._onPointerUp = () => {
      if (this.isDisabled) return;
      this._pressTweens(false);
    };

    this.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, this._onPointerOver)
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, this._onPointerOut)
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this._onPointerDown)
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this._onPointerUp);

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.once(Phaser.GameObjects.Events.DESTROY, this._onDestroy, this);
  }

  public setDisabled(isDisabled: boolean, keepYPosition: boolean = false) {
    this.isDisabled = isDisabled;
    this._bg.setTexture(
      isDisabled
        ? BUTTON_TYPE_TEXTURE_MAP.disabled
        : BUTTON_TYPE_TEXTURE_MAP.normal,
    );
    this._text.setColor(isDisabled ? COLOR_KEY.BEIGE_3 : COLOR_KEY.BEIGE_2);
    if (isDisabled && keepYPosition) this._hoverTweens(false);
  }
  public setText(text: string) {
    this._text.setText(text);
  }

  private _hoverTweens(isHover: boolean) {
    tweensAsync(this.scene, {
      targets: [this._bgTop, this._bg, this._text],
      duration: 300,
      y: isHover ? -4 : -2,
      ease: Phaser.Math.Easing.Bounce.Out,
    });
  }

  private _pressTweens(isPressed: boolean) {
    tweensAsync(this.scene, {
      targets: [this._bgTop, this._bg, this._text],
      duration: 300,
      y: isPressed ? 2 : -2,
      ease: Phaser.Math.Easing.Quartic.Out,
    });
  }

  public resetY() {
    [this._bgTop, this._bg, this._text].forEach((item) => {
      item.setY(-2);
    });
  }

  private _onDestroy() {
    this.setInteractive(false);
    this.off(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, this._onPointerOver);
    this.off(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, this._onPointerOut);
    this.off(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this._onPointerDown);
    this.off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this._onPointerUp);
  }
}
