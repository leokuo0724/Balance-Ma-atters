import { COLOR_KEY, DEPTH, FONT_KEY, SIZE } from "~/constants";
import { GameManager } from "~/manager";
import { ETutorialStep } from "~/type/tutorial.type";
import { getCanvasSize, hexToDecimal } from "~/utils";

import { Button } from "../button";

export class TutorialOverlay extends Phaser.GameObjects.Container {
  private _text: Phaser.GameObjects.Text;
  private _nextButton: Button;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const [width, height] = getCanvasSize(scene);
    const bg = scene.add
      .rectangle(0, 0, width, height, hexToDecimal(COLOR_KEY.BROWN_9), 0.6)
      .setOrigin(0.5);
    this._text = scene.add
      .text(0, 0, "", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 24,
        color: COLOR_KEY.BEIGE_2,
        align: "left",
      })
      .setOrigin(0.5);
    this._nextButton = new NextButton(
      this.scene,
      width / 2 - SIZE.BUTTON_LG[0] / 2 - 18,
      height / 2 - SIZE.BUTTON_LG[1] / 2 - 20,
    );

    this.add([bg, this._text, this._nextButton])
      .setSize(width, height)
      .setDepth(DEPTH.TUTORIAL_OVER)
      .setVisible(false)
      .setInteractive(); // prevent click through
  }

  public updateByStep(step: ETutorialStep) {
    const data = TUTORIAL_METADATA[step];
    if (step === ETutorialStep.INTRO_CARD) {
      this.setVisible(true);
      this._text
        .setText(data?.text ?? "")
        .setPosition(data?.position.x, data?.position.y);
    }
  }
}

type TTutorialMetadata = {
  text: string;
  position: Phaser.Types.Math.Vector2Like;
};

const TUTORIAL_METADATA: Record<ETutorialStep, TTutorialMetadata | null> = {
  [ETutorialStep.NONE]: null,
  [ETutorialStep.IDLE]: null,
  [ETutorialStep.INTRO_CARD]: {
    text: "Here’s your card!\nTop-left corner is attack or shied value.",
    position: {
      x: -320,
      y: 70,
    },
  },
  [ETutorialStep.DRAG_CARD_TO_ATTACK]: null,
};

class NextButton extends Button {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "Next");
  }
  onClick(): void {
    const gm = GameManager.getInstance();
    gm.nextTutorial(this.scene);
  }
}
