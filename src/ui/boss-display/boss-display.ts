import FadeOutDestroy from "phaser3-rex-plugins/plugins/fade-out-destroy";
import { ATLAS_KEY, COLOR_KEY, FONT_KEY, TEXTURE_KEY } from "~/constants";
import {
  TypewriterController,
  delayedCallAsync,
  getCanvasSize,
  tweensAsync,
  typewriterText,
} from "~/utils";

const DIALOG = [
  "Balance?\nWhat a boring little dream.",
  "Let's tip those scales...\nall the way down.",
  "Hope you brought\nmore than a feather.",
];

export class BossDisplay extends Phaser.GameObjects.Container {
  private _bg: Phaser.GameObjects.Rectangle;
  private _nameText: Phaser.GameObjects.Text;
  private _bossImage: Phaser.GameObjects.Image;
  private _bossSpeech: Phaser.GameObjects.Text;
  private _typewriter: TypewriterController | null = null;

  private _appearancePlayed: boolean = false;
  private _currentDialogIndex = -1;

  private _onPointerDown: Function;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const [width, height] = getCanvasSize(scene);
    this._bg = scene.add
      .rectangle(0, 0, width, height, 0x994031, 0.7)
      .setOrigin(0.5)
      .setScale(1, 0);
    this._nameText = scene.add
      .text(-width / 2, 200, "APOPHIS", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 144,
        color: COLOR_KEY.BEIGE_2,
      })
      .setOrigin(1);
    this._bossImage = scene.add
      .image(width / 2, 250, ATLAS_KEY.UI_COMPONENT, TEXTURE_KEY.APOPHIS)
      .setOrigin(0, 1);
    this._bossSpeech = scene.add
      .text(10, 60, "", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 36,
        color: COLOR_KEY.BEIGE_2,
        align: "right",
      })
      .setOrigin(1);

    this.add([this._bg, this._nameText, this._bossImage, this._bossSpeech])
      .setSize(width, height)
      .setVisible(false);

    this._onPointerDown = async () => {
      if (!this._appearancePlayed) return;
      if (this._typewriter && !this._typewriter.isFinished) {
        this._typewriter.finish();
      } else {
        await this._updateDialog();
      }
    };
    this.setInteractive().on("pointerdown", this._onPointerDown);

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.once(Phaser.GameObjects.Events.DESTROY, this._onDestroy, this);
  }

  public async play() {
    this.setVisible(true);
    await delayedCallAsync(this.scene, 500);
    await Promise.all([
      tweensAsync(this.scene, {
        targets: this._bg,
        scaleY: 1,
        duration: 500,
        ease: Phaser.Math.Easing.Cubic.Out,
      }),
      tweensAsync(this.scene, {
        targets: this._nameText,
        x: 10,
        duration: 600,
        ease: Phaser.Math.Easing.Cubic.Out,
        delay: 200,
      }),
      tweensAsync(this.scene, {
        targets: this._bossImage,
        x: 40,
        duration: 500,
        ease: Phaser.Math.Easing.Cubic.Out,
        delay: 100,
      }),
    ]);
    this._appearancePlayed = true;
  }

  private async _updateDialog() {
    this._currentDialogIndex++;

    if (this._currentDialogIndex >= DIALOG.length) {
      FadeOutDestroy(this, 300);
    } else {
      this._typewriter = typewriterText(
        this.scene,
        this._bossSpeech,
        DIALOG[this._currentDialogIndex],
        30,
      );
    }
  }

  private _onDestroy(): void {
    if (this._onPointerDown) this.off("pointerdown", this._onPointerDown);
  }
}
