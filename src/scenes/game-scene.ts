import { Maat } from "~/characters";
import { DEPTH, POSITION, SCENE_KEY, SIZE } from "~/constants";
import { GameManager } from "~/manager";
import { CardDeckGroup, Ground, LargeLibraGroup, SmallLibraGroup } from "~/ui";
import { getCanvasSize } from "~/utils";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEY.GAME });
  }

  create() {
    const [canvasWidth, canvasHeight] = getCanvasSize(this);

    new Ground(this, 0, canvasHeight).setDepth(DEPTH.BG_GROUND);

    const MARGIN_Y = 18;
    const MARGIN_X = 12;
    const [libraSetWidth, libraSetHeight] = SIZE.SMALL_LIBRA_SET;
    new SmallLibraGroup(
      this,
      libraSetWidth / 2 + MARGIN_X,
      libraSetHeight / 2 + MARGIN_Y,
    ).setDepth(DEPTH.LIBRA_SET);

    new LargeLibraGroup(this, canvasWidth / 2, 72).setDepth(DEPTH.LIBRA_SET);
    new Maat(this, 360, POSITION.CHARACTER_BASELINE_Y).setDepth(
      DEPTH.CHARACTER,
    );
    new CardDeckGroup(
      this,
      SIZE.CARD[0] / 2 + 96,
      canvasHeight / 2 - SIZE.CARD[1] / 2 - 12,
    ).setDepth(DEPTH.CARD_DECK);

    const gm = GameManager.getInstance();
    gm.drawCards();
  }
}
