import KeynoteArtHansFont from "~/assets/fonts/Jersey25-Regular.ttf";
import { FONT_KEY, SCENE_KEY } from "~/constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEY.BOOT });
  }

  preload() {
    // Load essential assets used in preload scene
    this.load.font(FONT_KEY.JERSEY_25, KeynoteArtHansFont);
  }

  create() {
    this.scene.start(SCENE_KEY.PRELOAD);
  }
}
