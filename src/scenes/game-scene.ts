import { Maat, OpponentSpawner } from "~/characters";
import { DEPTH, POSITION, SCENE_KEY, SIZE } from "~/constants";
import { GameManager } from "~/manager";
import {
  CardDeckGroup,
  Ground,
  LargeLibraGroup,
  RestCardGroup,
  SmallLibraGroup,
  UsedCardGroup,
} from "~/ui";
import { getCanvasSize } from "~/utils";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEY.GAME });
  }

  create() {
    const gm = GameManager.getInstance();
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
    const largeLibraGroup = new LargeLibraGroup(
      this,
      canvasWidth / 2,
      72,
    ).setDepth(DEPTH.LIBRA_SET);

    const maat = new Maat(this, 360, POSITION.CHARACTER_BASELINE_Y).setDepth(
      DEPTH.CHARACTER,
    );

    const OPPONENT_START_X = 760;
    const OPPONENT_SPACING_X = 180;
    for (let i = 0; i < 3; i++) {
      const spawner = new OpponentSpawner(
        this,
        OPPONENT_START_X + i * OPPONENT_SPACING_X,
        POSITION.CHARACTER_BASELINE_Y,
      ).setDepth(DEPTH.CHARACTER);
      gm.addOpponentSpawner(spawner);
    }

    new CardDeckGroup(
      this,
      SIZE.CARD[0] / 2 + 100,
      canvasHeight / 2 - SIZE.CARD[1] / 2 - 12,
    ).setDepth(DEPTH.CARD_DECK);
    const CARD_COUNT_GROUP_X = 42;
    new RestCardGroup(
      this,
      CARD_COUNT_GROUP_X,
      canvasHeight / 2 + 144,
    ).setDepth(DEPTH.CARD_DECK);
    new UsedCardGroup(
      this,
      CARD_COUNT_GROUP_X,
      canvasHeight / 2 + 248,
    ).setDepth(DEPTH.CARD_DECK);

    gm.shuffleAvailableCardIds(this);
    gm.drawCards(this);
    gm.setupMaat(maat);
    gm.setupLargeLibraGroup(largeLibraGroup);
    gm.setupCurrentLevel();
  }
}
