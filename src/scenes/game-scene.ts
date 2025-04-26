import { Maat, OpponentSpawner } from "~/characters";
import {
  COLOR_KEY,
  DEPTH,
  EVENT_KEY,
  POSITION,
  SCENE_KEY,
  SIZE,
} from "~/constants";
import { GameManager, LEVEL_OPPONENT_INFO } from "~/manager";
import { ETurn } from "~/type";
import {
  Background,
  BossDisplay,
  CardDeckGroup,
  EndTurnButton,
  Ground,
  LargeLibraGroup,
  NextLevel,
  RestCardGroup,
  SmallLibraGroup,
  TutorialOverlay,
  UsedCardGroup,
} from "~/ui";
import { Banner } from "~/ui/banner";
import { getCanvasCenter, getCanvasSize, hexToDecimal } from "~/utils";

export class GameScene extends Phaser.Scene {
  private _bossDisplay!: BossDisplay;

  private _onNextLevel: Function | null = null;
  private _onTurnUpdated: Function | null = null;

  constructor() {
    super({ key: SCENE_KEY.GAME });
  }

  create() {
    const gm = GameManager.getInstance();
    const [canvasWidth, canvasHeight] = getCanvasSize(this);
    const [centerX, centerY] = getCanvasCenter(this);

    this.add
      .rectangle(
        0,
        0,
        canvasWidth,
        canvasHeight,
        hexToDecimal(COLOR_KEY.BEIGE_3),
      )
      .setOrigin(0, 0)
      .setDepth(DEPTH.BG);
    new Background(this, centerX, centerY + 12).setDepth(DEPTH.BG_DECORATION);
    new Ground(this, 0, canvasHeight).setDepth(DEPTH.BG_GROUND);

    const MARGIN_Y = 18;
    const MARGIN_X = 12;
    const [libraSetWidth, libraSetHeight] = SIZE.SMALL_LIBRA_SET;
    const smallLibraGroup = new SmallLibraGroup(
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
    new EndTurnButton(
      this,
      canvasWidth - SIZE.BUTTON_LG[0] / 2 - 18,
      canvasHeight - SIZE.BUTTON_LG[1] / 2 - 20,
      "End Turn",
    ).setDepth(DEPTH.CARD_DECK);
    const tutorialOverlay = new TutorialOverlay(this, centerX, centerY);
    const turnBanner = new Banner(this, centerX, centerY, "Your Turn").setDepth(
      DEPTH.OVERLAY,
    );
    this._bossDisplay = new BossDisplay(this, centerX, centerY).setDepth(
      DEPTH.DISPLAY,
    );

    gm.setupMaat(maat);
    gm.setupBalanceSetGroup(smallLibraGroup);
    gm.setupLargeLibraGroup(largeLibraGroup);
    gm.setupLevelOpponents();
    gm.setupTutorialOverlay(tutorialOverlay);
    gm.checkStartTutorial(this);

    this._onNextLevel = () => {
      new NextLevel(this, 0, 0, gm.level + 1, LEVEL_OPPONENT_INFO.length);
    };
    this.events.on(EVENT_KEY.ON_NEXT_LEVEL, this._onNextLevel);

    this._onTurnUpdated = async ({ turn }: { turn: ETurn }) => {
      turnBanner.setText(turn === ETurn.PLAYER ? "Your Turn" : "Enemy Turn");
      await turnBanner.transitionIn();
      await turnBanner.transitionOut();
    };
    this.events.on(EVENT_KEY.ON_TURN_UPDATED, this._onTurnUpdated);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this._onNextLevel)
        this.events.off(EVENT_KEY.ON_NEXT_LEVEL, this._onNextLevel);
      if (this._onTurnUpdated)
        this.events.off(EVENT_KEY.ON_TURN_UPDATED, this._onTurnUpdated);
    });
  }

  public async showBossAppearance() {
    this.cameras.main.shake(250, 0.05);
    await this._bossDisplay.play();
  }
}
