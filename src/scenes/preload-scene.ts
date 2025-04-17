export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "preload" });
  }

  preload() {
    console.log("PreloadScene: preload");
  }
}
