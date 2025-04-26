import { AUDIO_KEY, COLOR_KEY, DEPTH, FONT_KEY } from "~/constants";
import {
  getAudioScene,
  getCanvasCenter,
  getCanvasSize,
  hexToDecimal,
} from "~/utils";

import { Button, RestartButton } from "../button";

export class GameOver extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, desc: string) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(DEPTH.OVERLAY);

    const [width, height] = getCanvasSize(scene);
    const bg = scene.add
      .rectangle(0, 0, width, height, hexToDecimal(COLOR_KEY.BROWN_8))
      .setOrigin(0.5);
    const text = scene.add
      .text(0, -32, "Game Over", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 64,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    const subText = scene.add
      .text(0, 20, desc, {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 32,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    const button = new RestartButton(scene, 0, 72);
    this.add([bg, text, subText, button]);

    this.setPosition(width / 2, -height / 2);
    const [_, centerY] = getCanvasCenter(scene);
    scene.add.tween({
      targets: this,
      y: centerY,
      duration: 800,
      ease: Phaser.Math.Easing.Bounce.Out,
    });
    const audioScene = getAudioScene(scene);
    audioScene.fadeOutMainBGM(2000);
    audioScene.playSFX(AUDIO_KEY.FAIL);
  }
}
