import uiComponentJson from "~/assets/atlas/ui-component.json";
import uiComponentPng from "~/assets/atlas/ui-component.png";
import {
  ATLAS_KEY,
  COLOR_KEY,
  SCENE_KEY,
  SIZE,
  TEXTURE_KEY,
} from "~/constants";
import { hexToDecimal } from "~/utils";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEY.PRELOAD });
  }

  preload() {
    this.load.atlas(ATLAS_KEY.UI_COMPONENT, uiComponentPng, uiComponentJson);

    const graphics = new Phaser.GameObjects.Graphics(this);
    this._drawSmallLibraSetBg(graphics);
  }

  create() {
    this.scene.start(SCENE_KEY.GAME);
  }

  private _drawSmallLibraSetBg(graphics: Phaser.GameObjects.Graphics) {
    graphics.clear();
    const [width, height] = SIZE.SMALL_LIBRA_SET;
    graphics
      .fillStyle(hexToDecimal(COLOR_KEY.BEIGE_2), 1)
      .fillRoundedRect(0, 0, width, height, 4);
    graphics.generateTexture(TEXTURE_KEY.SMALL_LIBRA_SET_BG, width, height);
  }
}
