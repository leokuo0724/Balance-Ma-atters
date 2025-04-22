import FadeOutDestroy from "phaser3-rex-plugins/plugins/fade-out-destroy";
import { COLOR_KEY, DEPTH, FONT_KEY } from "~/constants";
import { GameManager } from "~/manager";
import { getCanvasSize, hexToDecimal } from "~/utils";

import { Banner } from "../banner";

export class TutorialDisplay extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const [width, height] = getCanvasSize(scene);
    const bg = scene.add
      .rectangle(0, 0, width, height, hexToDecimal(COLOR_KEY.BROWN_9), 0.6)
      .setOrigin(0.5);
    const banner = new Banner(scene, 0, 0, "Tutorial");
    const subText = scene.add
      .text(0, 96, "Click to continue", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 24,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);

    this.add([bg, banner, subText])
      .setSize(width, height)
      .setDepth(DEPTH.TUTORIAL_OVER);
    banner.transitionIn();
    this.setInteractive().once("pointerdown", async () => {
      FadeOutDestroy(this, 500);
      const gm = GameManager.getInstance();
      gm.nextTutorial(this.scene);
    });
  }
}
