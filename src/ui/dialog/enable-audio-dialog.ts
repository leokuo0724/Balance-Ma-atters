import { COLOR_KEY, FONT_KEY, SCENE_KEY } from "~/constants";

import { Button } from "../button";
import { Dialog } from "./dialog";

export class EnableAudioDialog extends Dialog {
  leftButton: Button;
  rightButton: Button;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const BUTTON_BASELINE = 48;
    this.leftButton = new NoButton(scene, -100, BUTTON_BASELINE);
    this.rightButton = new YesButton(scene, 100, BUTTON_BASELINE);
    const description = scene.add
      .text(0, -32, "Enable audio?", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 32,
        color: COLOR_KEY.BROWN_8,
        align: "center",
      })
      .setOrigin(0.5);

    this.add([description, this.leftButton, this.rightButton]);
  }
}

class NoButton extends Button {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "No");
  }

  onClick(): void {
    this.scene.scene.start(SCENE_KEY.GAME);
  }
}

class YesButton extends Button {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "Yes");
  }

  onClick(): void {
    // TODO: start audio
    this.scene.scene.start(SCENE_KEY.GAME);
  }
}
