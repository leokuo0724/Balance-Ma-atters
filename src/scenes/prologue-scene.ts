import { MaatSprite } from "~/characters/maat/maat-sprite";
import {
  ATLAS_KEY,
  COLOR_KEY,
  FONT_KEY,
  SCENE_KEY,
  TEXTURE_KEY,
} from "~/constants";
import {
  TypewriterController,
  delayedCallAsync,
  getCanvasCenter,
  getCanvasSize,
  hexToDecimal,
  tweensAsync,
  typewriterText,
} from "~/utils";

const DIALOG = [
  "I'm Ma’at.\nI keep the world in balance.",
  "At least I did...\nuntil Apophis knocked everything sideways.",
  "So now I’m fixing it the classic way...\nWith cards. Obviously.",
  "Let’s restore some order.",
];

export class PrologueScene extends Phaser.Scene {
  private _currentDialogIndex = -1;
  private _typewriter: TypewriterController | null = null;
  private _text!: Phaser.GameObjects.Text;

  private _onPointerDown: Function | null = null;

  constructor() {
    super({ key: SCENE_KEY.PROLOGUE });
  }

  async create() {
    const [width, height] = getCanvasSize(this);
    const padding = 24;
    const maatSprite = new MaatSprite(this, padding, height - padding)
      .setOrigin(0, 1)
      .setScale(2)
      .setAlpha(0)
      .setDepth(1);
    const { x: maatX, y: maatY } = maatSprite.getBottomRight();
    this._text = this.add
      .text(maatX + 48, maatY - 24, "", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 36,
        color: COLOR_KEY.BEIGE_2,
        align: "left",
        lineSpacing: 8,
      })
      .setOrigin(0, 1)
      .setDepth(1);
    tweensAsync(this, {
      targets: maatSprite,
      alpha: 1,
      duration: 500,
    });
    this.updateDialog();

    this._onPointerDown = async () => {
      if (!this._typewriter) return;

      if (!this._typewriter.isFinished) {
        this._typewriter.finish();
      } else {
        await this.updateDialog();
      }
    };
    this.input.on("pointerdown", this._onPointerDown);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this._onPointerDown) {
        this.input.off("pointerdown", this._onPointerDown);
        this._onPointerDown = null;
      }
    });
  }

  private async updateDialog() {
    this._currentDialogIndex++;
    // Apophis image
    if (this._currentDialogIndex === 1) {
      const [centerX, centerY] = getCanvasCenter(this);
      const apophisImage = this.add
        .image(
          centerX + 260,
          centerY + 60,
          ATLAS_KEY.UI_COMPONENT,
          TEXTURE_KEY.APOPHIS,
        )
        .setAlpha(0)
        .setDepth(0)
        .setScale(1.2);
      this.add.tween({
        targets: apophisImage,
        alpha: 0.5,
        duration: 1000,
      });
    }

    if (this._currentDialogIndex >= DIALOG.length) {
      if (this._onPointerDown)
        this.input.off("pointerdown", this._onPointerDown);
      this.cameras.main.fadeOut(800);
      await delayedCallAsync(this, 800);
      this.scene.start(SCENE_KEY.GAME);
      return;
    }
    this._typewriter = typewriterText(
      this,
      this._text,
      DIALOG[this._currentDialogIndex],
      30,
    );
  }
}
