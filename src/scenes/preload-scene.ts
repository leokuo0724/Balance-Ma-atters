import { SCENE_KEY } from "~/constants";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEY.PRELOAD });
  }

  preload() {}
}
