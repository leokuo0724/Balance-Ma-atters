import { AUDIO_KEY, COLOR_KEY, DEPTH, EVENT_KEY, FONT_KEY } from "~/constants";
import { GameManager } from "~/manager";
import {
  getAudioScene,
  getCanvasCenter,
  getCanvasSize,
  hexToDecimal,
} from "~/utils";

import { Button } from "../button";

export class NextLevel extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    level: number,
    totalLevel: number,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(DEPTH.OVERLAY);

    const [width, height] = getCanvasSize(scene);
    const bg = scene.add
      .rectangle(0, 0, width, height, hexToDecimal(COLOR_KEY.BROWN_8))
      .setOrigin(0.5);
    const text = scene.add
      .text(0, -32, "Level Completed", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 64,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    const subText = scene.add
      .text(0, 20, `Balance Restored (${level} / ${totalLevel})`, {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 32,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    const button = new NextLevelButton(scene, 0, 72);
    this.add([bg, text, subText, button]);

    this.setPosition(width / 2, -height / 2);
    const [_, centerY] = getCanvasCenter(scene);
    scene.add.tween({
      targets: this,
      y: centerY,
      duration: 800,
      ease: Phaser.Math.Easing.Bounce.Out,
    });

    scene.events.once(EVENT_KEY.ON_NEXT_LEVEL_OPEN, async () => {
      scene.add.tween({
        targets: this,
        y: -height / 2,
        duration: 800,
        ease: Phaser.Math.Easing.Quadratic.Out,
        onComplete: () => {
          this.destroy();
        },
      });
    });
  }
}

class NextLevelButton extends Button {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "Next");
  }
  onClick(): void {
    getAudioScene(this.scene).playSFX(AUDIO_KEY.CLICK);
    const gm = GameManager.getInstance();
    gm.setNextLevel(this.scene);
    this.scene.events.emit(EVENT_KEY.ON_NEXT_LEVEL_OPEN);
  }
}
