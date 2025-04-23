import FadeOutDestroy from "phaser3-rex-plugins/plugins/fade-out-destroy";
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
      .rectangle(0, 0, width, height, hexToDecimal(COLOR_KEY.BROWN_9), 0.65)
      .setOrigin(0.5);
    this._text = scene.add
      .text(0, 0, "", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 24,
        color: COLOR_KEY.BEIGE_2,
        align: "left",
      })
      .setOrigin(0);
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
    this.setVisible(true);
    this._text
      .setText(data?.text ?? "")
      .setPosition(data?.position.x, data?.position.y)
      .setAlign(data?.align ?? "left")
      .setOrigin(...(data?.origin ?? [0.5, 0.5]));
    const lockButtonSteps = [
      ETutorialStep.DRAG_CARD_TO_ATTACK,
      ETutorialStep.DRAG_CARD_TO_ATTACK_2,
      ETutorialStep.HAND_OVER,
    ];
    if (lockButtonSteps.includes(step)) {
      this._nextButton.setDisabled(true, true);
    }
    const restoreButtonSteps = [
      ETutorialStep.INTRO_LARGE_SCALE,
      ETutorialStep.IMBALANCE_REMINDER,
    ];
    if (restoreButtonSteps.includes(step)) {
      this._nextButton.setDisabled(false);
    }
  }

  public endTutorial() {
    FadeOutDestroy(this, 800);
  }
}

type TTutorialMetadata = {
  text: string;
  position: Phaser.Types.Math.Vector2Like;
  align: "left" | "center" | "right";
  origin: [number, number];
};

const TUTORIAL_METADATA: Record<ETutorialStep, TTutorialMetadata | null> = {
  [ETutorialStep.NONE]: null,
  [ETutorialStep.IDLE]: null,
  [ETutorialStep.INTRO_CARD]: {
    text: "Here’s your card!\nTop-left corner is attack or shied value.",
    position: {
      x: -510,
      y: 100,
    },
    align: "left",
    origin: [0, 1],
  },
  [ETutorialStep.INTRO_SCALE_VALUE]: {
    text: "The top-right corner shows scale values.\nThese numbers will shift your balance\nwhen the card is played.",
    position: {
      x: -352,
      y: 108,
    },
    align: "left",
    origin: [0, 0],
  },
  [ETutorialStep.DRAG_CARD_TO_ATTACK]: {
    text: "Now, drag the card here\nto attack the enemy!",
    position: {
      x: 280,
      y: 72,
    },
    align: "left",
    origin: [0, 0],
  },
  [ETutorialStep.INTRO_LARGE_SCALE]: {
    text: "Good job!\nPlayed values are stored in the center.\nBalance the big scale to unleash them on all enemies.",
    position: {
      x: 0,
      y: -188,
    },
    align: "center",
    origin: [0.5, 0],
  },
  [ETutorialStep.INTRO_SMALL_SCALE]: {
    text: "As for the small scales,\nbalancing them gives a multiplier\nto your played card.",
    position: {
      x: -360,
      y: -210,
    },
    align: "left",
    origin: [0, 0],
  },
  [ETutorialStep.DRAG_CARD_TO_ATTACK_2]: {
    text: "Now, drag the card again\nto attack with perfect balance!",
    position: {
      x: 280,
      y: 72,
    },
    align: "left",
    origin: [0, 0],
  },
  [ETutorialStep.IMBALANCE_REMINDER]: {
    text: "Nice job!\nBefore ending your turn,\ndon’t let the scales tip all the way.",
    position: {
      x: 0,
      y: -150,
    },
    align: "center",
    origin: [0.5, 0],
  },
  [ETutorialStep.IMBALANCE_INTRO]: {
    text: "If a small scale fully tips,\nMa’at will skip her next turn to recover.\n\nIf the big scale fully tips,\nthe game ends.",
    position: {
      x: 0,
      y: -150,
    },
    align: "center",
    origin: [0.5, 0],
  },
  [ETutorialStep.FINAL_WORDS]: {
    text: "Now it’s your turn!\nFace the chaos and\nrestore balance to the world.",
    position: {
      x: 580,
      y: 220,
    },
    align: "right",
    origin: [1, 1],
  },
  [ETutorialStep.HAND_OVER]: null,
  [ETutorialStep.END]: null,
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
