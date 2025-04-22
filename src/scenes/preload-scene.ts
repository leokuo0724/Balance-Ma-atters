import characterJson from "~/assets/atlas/character.json";
import characterPng from "~/assets/atlas/character.png";
import damagedJson from "~/assets/atlas/damaged.json";
import damagedPng from "~/assets/atlas/damaged.png";
import uiComponentJson from "~/assets/atlas/ui-component.json";
import uiComponentPng from "~/assets/atlas/ui-component.png";
import maatTest from "~/assets/maat-test.png";
import {
  ATLAS_KEY,
  COLOR_KEY,
  FONT_KEY,
  SCENE_KEY,
  SIZE,
  TColorKey,
  TEXTURE_KEY,
} from "~/constants";
import { delayedCallAsync, getCanvasCenter, hexToDecimal } from "~/utils";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEY.PRELOAD });
  }

  preload() {
    this._setupLoadingBar();

    this.load.image("maat-test", maatTest);
    this.load.atlas(ATLAS_KEY.UI_COMPONENT, uiComponentPng, uiComponentJson);
    this.load.atlas(ATLAS_KEY.CHARACTER, characterPng, characterJson);
    this.load.atlas(ATLAS_KEY.DAMAGED, damagedPng, damagedJson);

    const graphics = new Phaser.GameObjects.Graphics(this);
    this._drawSmallLibraSetBg(graphics, TEXTURE_KEY.SMALL_LIBRA_SET_BG);
    this._drawSmallLibraSetBg(graphics, TEXTURE_KEY.SMALL_LIBRA_SET_BG_2);
    this._drawRulerIndicator(graphics, TEXTURE_KEY.RULER_INDICATOR_YELLOW);
    this._drawRulerIndicator(graphics, TEXTURE_KEY.RULER_INDICATOR_BLUE);
    this._drawRulerIndicator(graphics, TEXTURE_KEY.RULER_INDICATOR_RED);
    this._drawRulerIndicator(graphics, TEXTURE_KEY.RULER_INDICATOR_GREEN);
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.LARGE_LIBRA_INDICATOR_BG,
      ...SIZE.LARGE_LIBRA_INDICATOR,
      4,
      COLOR_KEY.BEIGE_4,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.LARGE_LIBRA_BOX_BG,
      ...SIZE.LARGE_LIBRA_BOX,
      8,
      COLOR_KEY.BROWN_8,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.LARGE_LIBRA_BOX_BG_2,
      44,
      42,
      6,
      COLOR_KEY.BROWN_9,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.CARD_DECK,
      ...SIZE.CARD,
      8,
      COLOR_KEY.BROWN_4,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.LABEL_YELLOW,
      ...SIZE.LABEL,
      4,
      COLOR_KEY.YELLOW_6,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.LABEL_GREEN,
      ...SIZE.LABEL,
      4,
      COLOR_KEY.GREEN_6,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.LABEL_RED,
      ...SIZE.LABEL,
      4,
      COLOR_KEY.RED_6,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.LABEL_BLUE,
      ...SIZE.LABEL,
      4,
      COLOR_KEY.BLUE_6,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.REST_CARD_BG,
      52,
      64,
      4,
      COLOR_KEY.BROWN_8,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.BUTTON_LG_UNDER,
      ...SIZE.BUTTON_LG,
      6,
      COLOR_KEY.BROWN_9,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.BUTTON_LG_BG_TOP,
      ...SIZE.BUTTON_LG,
      6,
      COLOR_KEY.BROWN_8,
    );
    const [buttonLgWidth, buttonLgHeight] = SIZE.BUTTON_LG;
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.BUTTON_LG_BG_NORMAL,
      buttonLgWidth - 6,
      buttonLgHeight - 6,
      4,
      COLOR_KEY.YELLOW_6,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.BUTTON_LG_BG_HOVER,
      buttonLgWidth - 6,
      buttonLgHeight - 6,
      4,
      COLOR_KEY.ORANGE_6,
    );
    this._drawRoundedRect(
      graphics,
      TEXTURE_KEY.BUTTON_LG_BG_DISABLED,
      buttonLgWidth - 6,
      buttonLgHeight - 6,
      4,
      COLOR_KEY.BEIGE_4,
    );
  }

  async create() {
    await delayedCallAsync(this, 500);
    this.scene.start(SCENE_KEY.GAME);
  }

  private _drawSmallLibraSetBg(
    graphics: Phaser.GameObjects.Graphics,
    key: string,
  ) {
    const keyColorMap = {
      [TEXTURE_KEY.SMALL_LIBRA_SET_BG]: COLOR_KEY.BEIGE_2,
      [TEXTURE_KEY.SMALL_LIBRA_SET_BG_2]: COLOR_KEY.BEIGE_4,
    };

    graphics.clear();
    const [width, height] = SIZE.SMALL_LIBRA_SET;
    graphics
      .fillStyle(hexToDecimal(keyColorMap[key]), 1)
      .fillRoundedRect(0, 0, width, height, 4);
    graphics.generateTexture(key, width, height);
  }

  private _drawRulerIndicator(
    graphics: Phaser.GameObjects.Graphics,
    key: string,
  ) {
    const keyColorMap = {
      [TEXTURE_KEY.RULER_INDICATOR_YELLOW]: COLOR_KEY.YELLOW_6,
      [TEXTURE_KEY.RULER_INDICATOR_BLUE]: COLOR_KEY.BLUE_6,
      [TEXTURE_KEY.RULER_INDICATOR_RED]: COLOR_KEY.RED_6,
      [TEXTURE_KEY.RULER_INDICATOR_GREEN]: COLOR_KEY.GREEN_6,
    };
    const color = keyColorMap[key];
    const width = 6;
    const height = 18;
    graphics.clear();
    graphics
      .fillStyle(hexToDecimal(color), 1)
      .fillRoundedRect(0, 0, width, height, 2);
    graphics.generateTexture(key, width, height);
  }

  private _drawRoundedRect(
    graphics: Phaser.GameObjects.Graphics,
    key: string,
    width: number,
    height: number,
    radius: number,
    color: TColorKey,
  ) {
    graphics.clear();
    graphics
      .fillStyle(hexToDecimal(color), 1)
      .fillRoundedRect(0, 0, width, height, radius);
    graphics.generateTexture(key, width, height);
  }

  private _setupLoadingBar() {
    const width = 248;
    const height = 30;
    const padding = 4;

    const [centerX, centerY] = getCanvasCenter(this);
    const outerBox = this.add.graphics();
    outerBox.fillStyle(hexToDecimal(COLOR_KEY.BROWN_9), 1);
    outerBox.fillRoundedRect(
      centerX - width / 2,
      centerY - height / 2,
      width,
      height,
      8,
    );
    const innerBox = this.add.graphics();
    innerBox.fillStyle(hexToDecimal(COLOR_KEY.BEIGE_3), 1);
    innerBox.fillRoundedRect(
      centerX - width / 2 + padding,
      centerY - height / 2 + padding,
      width - padding * 2,
      height - padding * 2,
      6,
    );
    this.make
      .text({
        x: centerX,
        y: centerY + 48,
        text: "LOADING",
        style: {
          fontSize: 24,
          fontFamily: FONT_KEY.JERSEY_25,
          color: COLOR_KEY.BEIGE_2,
        },
      })
      .setOrigin(0.5);
    const progressBar = this.add.graphics();
    this.load.on("progress", function (value: number) {
      progressBar.clear();
      progressBar.fillStyle(hexToDecimal(COLOR_KEY.YELLOW_6), 1);
      progressBar.fillRoundedRect(
        centerX - width / 2 + padding,
        centerY - height / 2 + padding,
        (width - padding * 2) * value,
        height - padding * 2,
        6,
      );
    });
  }
}
