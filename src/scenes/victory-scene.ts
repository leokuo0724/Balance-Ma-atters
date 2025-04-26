import {
  ATLAS_KEY,
  COLOR_KEY,
  FONT_KEY,
  SCENE_KEY,
  TEXTURE_KEY,
} from "~/constants";
import { GameManager } from "~/manager";
import { Background, Ground, RestartButton } from "~/ui";
import {
  delayedCallAsync,
  getAudioScene,
  getCanvasCenter,
  getCanvasSize,
  hexToDecimal,
  tweensAsync,
  typewriterText,
} from "~/utils";

export class VictoryScene extends Phaser.Scene {
  private _apophisSaid!: Phaser.GameObjects.Text;
  private _maatSaid!: Phaser.GameObjects.Text;

  private _victoryText!: Phaser.GameObjects.Text;
  private _timeRecordText!: Phaser.GameObjects.Text;
  private _turnsRecordText!: Phaser.GameObjects.Text;
  private _restartButton!: RestartButton;

  constructor() {
    super(SCENE_KEY.VICTORY);
  }

  create() {
    const [canvasWidth, canvasHeight] = getCanvasSize(this);
    const [centerX, centerY] = getCanvasCenter(this);

    this.add
      .rectangle(
        0,
        0,
        canvasWidth,
        canvasHeight,
        hexToDecimal(COLOR_KEY.BEIGE_3),
      )
      .setOrigin(0, 0);
    new Background(this, centerX, canvasHeight - 32, true);
    this.add
      .rectangle(
        centerX,
        canvasHeight,
        canvasWidth,
        32,
        hexToDecimal(COLOR_KEY.BROWN_3),
      )
      .setOrigin(0.5, 1);
    const paddingX = 32;
    const paddingY = 20;
    const maat = this.add
      .image(
        paddingX,
        canvasHeight - paddingY,
        ATLAS_KEY.UI_COMPONENT,
        TEXTURE_KEY.MAAT_SMILE,
      )
      .setOrigin(0, 1);
    const apophis = this.add
      .image(
        canvasWidth - paddingX,
        canvasHeight - paddingY,
        ATLAS_KEY.UI_COMPONENT,
        TEXTURE_KEY.APOPHIS_CRY,
      )
      .setOrigin(1, 1);

    const apophisTR = apophis.getTopRight();
    this._apophisSaid = this.add
      .text(apophisTR.x, apophisTR.y - 32, "", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 24,
        color: COLOR_KEY.BROWN_3,
        align: "right",
      })
      .setOrigin(1, 1);
    const maatTL = maat.getTopLeft();
    this._maatSaid = this.add
      .text(maatTL.x, maatTL.y - 28, "", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 24,
        color: COLOR_KEY.BROWN_3,
        align: "left",
      })
      .setOrigin(0, 1);

    this._victoryText = this.add
      .text(centerX, centerY - 160, "Victory", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 72,
        color: COLOR_KEY.ORANGE_6,
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this._timeRecordText = this.add
      .text(centerX - 24, centerY - 40, "Time Taken: 0:00", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 32,
        color: COLOR_KEY.YELLOW_6,
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this._turnsRecordText = this.add
      .text(centerX - 24, centerY, "Turns Taken: 0", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 32,
        color: COLOR_KEY.YELLOW_6,
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this._restartButton = new RestartButton(
      this,
      centerX,
      centerY + 120,
    ).setAlpha(0);

    this._play();
  }

  private async _play() {
    getAudioScene(this).switchToVictoryBgm();
    this.cameras.main.fadeIn(1000);
    await delayedCallAsync(this, 500);

    tweensAsync(this, {
      targets: [this._victoryText, this._restartButton],
      alpha: 1,
    });
    const [centerX, _] = getCanvasCenter(this);
    tweensAsync(this, {
      targets: this._timeRecordText,
      x: centerX,
      alpha: 1,
      ease: Phaser.Math.Easing.Cubic.Out,
      duration: 800,
      delay: 200,
    });
    tweensAsync(this, {
      targets: this._turnsRecordText,
      x: centerX,
      alpha: 1,
      ease: Phaser.Math.Easing.Cubic.Out,
      duration: 800,
      delay: 400,
    });

    await delayedCallAsync(this, 1000);

    await typewriterText(
      this,
      this._apophisSaid,
      "...Turns out...\na feather was enough.",
      30,
    ).promise;
    await delayedCallAsync(this, 100);
    await typewriterText(
      this,
      this._maatSaid,
      "Balance Ma’atters, after all.\nTold you so.",
      30,
    ).promise;

    const gm = GameManager.getInstance();
    // get game record
  }
}
