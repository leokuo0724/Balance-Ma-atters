import uiComponentJson from "~/assets/atlas/ui-component.json";
import uiComponentPng from "~/assets/atlas/ui-component.png";
import maatTest from "~/assets/maat-test.png";
import {
  ATLAS_KEY,
  COLOR_KEY,
  SCENE_KEY,
  SIZE,
  TColorKey,
  TEXTURE_KEY,
} from "~/constants";
import { hexToDecimal } from "~/utils";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEY.PRELOAD });
  }

  preload() {
    this.load.image("maat-test", maatTest);
    this.load.atlas(ATLAS_KEY.UI_COMPONENT, uiComponentPng, uiComponentJson);

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
  }

  create() {
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
}
