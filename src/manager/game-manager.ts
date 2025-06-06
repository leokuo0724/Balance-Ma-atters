import { ITarget, Maat, Opponent, OpponentSpawner } from "~/characters";
import {
  DEPTH,
  EVENT_KEY,
  MAX_SMALL_LIBRA_STEPS,
  SCENE_KEY,
  STORAGE_KEY,
} from "~/constants";
import { GameScene } from "~/scenes";
import {
  EBalanceSetType,
  EOpponentActionable,
  EStatusType,
  ETurn,
  TOpponentMovable,
} from "~/type";
import { ETutorialStep } from "~/type/tutorial.type";
import {
  Card,
  GameOver,
  LargeLibraGroup,
  SmallLibraGroup,
  TutorialDisplay,
  TutorialOverlay,
} from "~/ui";
import { CardDeck } from "~/ui/card-deck-group/card-deck";
import { SmallLibraSet } from "~/ui/small-libra-group/small-libra-set";
import { delayedCallAsync, getCanvasCenter } from "~/utils";
import { shuffleArray } from "~/utils/math.utility";

const DEFAULT_AVAILABLE_CARD_IDS = [
  "c_00024",
  "c_00000",
  "c_00000",
  "c_00001",
  "c_00002",
  "c_00003",
  "c_00004",
  "c_00004",
  "c_00005",
  "c_00006",
  "c_00009",
  "c_00009",
  "c_00010",
] as const;
const DEFAULT_MAAT_DATA = {
  BLOOD: 30,
  SHIELD: 0,
} as const;
export const LEVEL_OPPONENT_INFO = [
  { opponentIds: [null, "o_00006", null] },
  { opponentIds: ["o_00000", "o_00000", "o_00000"] },
  { opponentIds: ["o_00001", "o_00002", "o_00007"] },
  { opponentIds: ["o_00001", "o_00003", "o_00002"] },
  { opponentIds: ["o_00004", "o_00005", "o_00004"] },
] as const;
export const INITIAL_LOCKED_BALANCE: EBalanceSetType[] = [
  EBalanceSetType.SHT_LNG,
  EBalanceSetType.DUT_FIR,
] as const;
const TUTORIAL_CARD_IDS = ["c_00020", "c_00021"];

export class GameManager {
  // Cards
  private _availableCardIds: string[] = [...DEFAULT_AVAILABLE_CARD_IDS];
  private _usedCardIds: string[] = [];
  private _inHandCards: (Card | null)[] = [null, null, null, null, null];
  // Card Spawners
  private _cardDecks: CardDeck[] = [];

  // Characters
  public maat: Maat | null = null;
  public opponentSpawners: OpponentSpawner[] = [];

  // Libra
  public largeLibraGroup: LargeLibraGroup | null = null;
  public balanceSetGroup: SmallLibraGroup | null = null;
  public balanceSetMap: Record<EBalanceSetType, SmallLibraSet | null> = {
    [EBalanceSetType.PHY_MAG]: null,
    [EBalanceSetType.DEF_ATK]: null,
    [EBalanceSetType.SHT_LNG]: null,
    [EBalanceSetType.DUT_FIR]: null,
  };

  // Game states
  public level: number = 0; // 0: tutorial
  private _startTime: number = 0;
  public get startTime() {
    return this._startTime;
  }
  private _usedTurns: number = 0;
  public get usedTurns() {
    return this._usedTurns;
  }
  private _currentTurn: ETurn = ETurn.PLAYER;
  public get currentTurn() {
    return this._currentTurn;
  }
  private _cardDragTarget: ITarget | null = null;
  public get cardDragTarget() {
    return this._cardDragTarget;
  }
  private _isApplyingEffect: boolean = false;
  public get isApplyingEffect() {
    return this._isApplyingEffect;
  }
  private _isBalanceChecked = true;
  public get isBalanceChecked() {
    return this._isBalanceChecked;
  }

  // Tutorial related
  private _tutorialOverlay: TutorialOverlay | null = null;
  public get isTutorialLevel() {
    return this.level === 0;
  }
  public currentTutorialSteps = 0;
  public setupTutorialOverlay(overlay: TutorialOverlay) {
    this._tutorialOverlay = overlay;
  }
  public get isAbleToDrag() {
    if (!this.isTutorialLevel) return true;
    const draggableSteps = [
      ETutorialStep.DRAG_CARD_TO_ATTACK,
      ETutorialStep.DRAG_CARD_TO_ATTACK_2,
      ETutorialStep.HAND_OVER,
    ];
    if (draggableSteps.includes(this.currentTutorialSteps)) return true;
    return false;
  }
  public async checkStartTutorial(scene: Phaser.Scene) {
    if (this.isTutorialLevel) {
      this.nextTutorial(scene);
    } else {
      this._startTime = Date.now();
      this.shuffleAvailableCardIds(scene);
      this.drawCards(scene);
    }
  }
  public async nextTutorial(scene: Phaser.Scene) {
    this.currentTutorialSteps += 1;
    this._tutorialOverlay!.updateByStep(this.currentTutorialSteps);
    switch (this.currentTutorialSteps) {
      case ETutorialStep.IDLE:
        const [x, y] = getCanvasCenter(scene);
        new TutorialDisplay(scene, x, y);
        break;
      case ETutorialStep.INTRO_CARD:
        await this._drawSingleCard("c_00020");
        this._inHandCards[0]?.setBasicDepth(DEPTH.TUTORIAL_FOCUS);
        break;
      case ETutorialStep.INTRO_SCALE_VALUE:
        this.balanceSetGroup?.setDepth(DEPTH.TUTORIAL_FOCUS);
        break;
      case ETutorialStep.DRAG_CARD_TO_ATTACK:
        this.opponentSpawners[1].setDepth(DEPTH.TUTORIAL_FOCUS);
        break;
      case ETutorialStep.INTRO_LARGE_SCALE:
        this.largeLibraGroup?.setDepth(DEPTH.TUTORIAL_FOCUS);
        break;
      case ETutorialStep.DRAG_CARD_TO_ATTACK_2:
        await this._drawSingleCard("c_00021");
        this._inHandCards[0]?.setBasicDepth(DEPTH.TUTORIAL_FOCUS);
        break;
      case ETutorialStep.HAND_OVER:
        this.balanceSetGroup?.setDepth(DEPTH.LIBRA_SET);
        this.largeLibraGroup?.setDepth(DEPTH.LIBRA_SET);
        this.opponentSpawners[1].setDepth(DEPTH.CHARACTER);
        this._tutorialOverlay?.endTutorial();
        window.localStorage.setItem(STORAGE_KEY.TUTORIAL_VIEWED, "true");
        break;
    }
  }
  public setSkipTutorial() {
    this.level = 1;
  }
  /** For tutorial */
  private async _drawSingleCard(id: string) {
    const newCard = await this._cardDecks[0].spawnCard(id, true);
    this._inHandCards[0] = newCard;
  }

  private static instance: GameManager;
  private constructor() {}
  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  // Initialize
  public setupMaat(maat: Maat) {
    this.maat = maat;
    this.maat.updateBloodBar(
      DEFAULT_MAAT_DATA.BLOOD,
      DEFAULT_MAAT_DATA.BLOOD,
      DEFAULT_MAAT_DATA.BLOOD,
    );
    this.maat.updateShield(DEFAULT_MAAT_DATA.SHIELD);
  }
  public setupBalanceSet(type: EBalanceSetType, set: SmallLibraSet) {
    this.balanceSetMap[type] = set;
  }
  public setupBalanceSetGroup(group: SmallLibraGroup) {
    this.balanceSetGroup = group;
  }
  public setupLargeLibraGroup(libra: LargeLibraGroup) {
    this.largeLibraGroup = libra;
  }
  public addOpponentSpawner(spawner: OpponentSpawner) {
    if (this.opponentSpawners.length >= 3)
      throw new Error("Limited to 3 spawners");
    this.opponentSpawners.push(spawner);
  }
  public addCardDecks(deck: CardDeck) {
    this._cardDecks.push(deck);
  }

  // Cards
  public shuffleAvailableCardIds(scene: Phaser.Scene) {
    this._availableCardIds = shuffleArray(this._availableCardIds);
    scene.events.emit(EVENT_KEY.ON_AVAILABLE_CARDS_UPDATED, {
      count: this._availableCardIds.length,
    });
  }

  private _drawCardId(scene: Phaser.Scene): string {
    let cardId = this._availableCardIds.pop();
    if (!cardId && this._availableCardIds.length === 0) {
      // Reset available cards
      // TODO: add shuffle animation
      this._availableCardIds = shuffleArray(this._usedCardIds);
      this._usedCardIds = [];
      cardId = this._availableCardIds.pop();
      scene.events.emit(EVENT_KEY.ON_USED_CARDS_UPDATED, {
        count: this._usedCardIds.length,
      });
    }
    scene.events.emit(EVENT_KEY.ON_AVAILABLE_CARDS_UPDATED, {
      count: this._availableCardIds.length,
    });
    if (!cardId) throw new Error("Card ID is null");
    return cardId;
  }

  public async drawCards(scene: Phaser.Scene) {
    for (let i = 0; i < this._inHandCards.length; i++) {
      if (this._inHandCards[i] !== null) continue;
      const cardId = this._drawCardId(scene);
      const cardDeck = this._cardDecks[i];
      const newCard = await cardDeck.spawnCard(cardId);
      this._inHandCards[i] = newCard;
    }
  }

  public async markAsUsed(card: Card, scene: Phaser.Scene) {
    const targetIndex = this._inHandCards.findIndex((c) => c === card);
    if (targetIndex < 0) throw new Error("Card not found in hand");
    const targetCard = this._inHandCards[targetIndex]!;
    const targetCardId = targetCard.metadata.id;

    targetCard.destroy();
    this._inHandCards[targetIndex] = null;
    if (TUTORIAL_CARD_IDS.includes(targetCardId)) return;
    this._usedCardIds.push(targetCardId);
    scene.events.emit(EVENT_KEY.ON_USED_CARDS_UPDATED, {
      count: this._usedCardIds.length,
    });
  }

  public setCardDragTarget(target: ITarget | null) {
    this._cardDragTarget = target;
    // mark as covered
    [this.maat, ...this.getOpponents()].forEach((character) => {
      if (character) {
        character.markAsCovered(character === target);
      }
    });
  }

  // Libra
  public getHalfTotalLibraValue() {
    return (
      Object.values(this.balanceSetMap).filter((set) => !set?.locked).length *
      MAX_SMALL_LIBRA_STEPS
    );
  }
  public getTotalBalance() {
    return Object.values(this.balanceSetMap).reduce((sum, current) => {
      return (sum += current?.value ?? 0);
    }, 0);
  }
  // public isAnyLibraSetImbalanced() {
  //   return Object.values(this.balanceSetMap).some(
  //     (set) =>
  //       !set?.locked && Math.abs(set?.value ?? 0) >= MAX_SMALL_LIBRA_STEPS,
  //   );
  // }
  // return multiply number
  public async checkLibraSetBalanced(): Promise<number> {
    let multiply = 1;
    for (const set of Object.values(this.balanceSetMap).filter(
      (set) => !set?.locked,
    )) {
      if (set?.value === 0) {
        multiply += 1;
        await set.displayMultiplyHint(multiply);
      }
    }
    return multiply;
  }
  public async checkLibraStrike(multiply: number) {
    const totalBalance = this.getTotalBalance();
    if (totalBalance !== 0) return 0;
    this.maat?.libraStrikeAnim();
    const opponents = this.getOpponents();
    await this.largeLibraGroup!.jackpotAttack(opponents, multiply);
  }
  public getIsBalanceSetLocked(type: EBalanceSetType) {
    return Boolean(this.balanceSetMap[type]?.locked);
  }
  private async _fixLibraSetImbalanced() {
    for (const set of Object.values(this.balanceSetMap)) {
      if (set!.locked) continue;
      await set!.fixImbalance();
    }
  }
  private _checkLibraSetImbalanced() {
    for (const set of Object.values(this.balanceSetMap)) {
      if (set!.locked) continue;
      const imbalanced = set!.checkImbalanced();
      if (imbalanced) return true;
    }
    return false;
  }
  private _checkTotalImbalance(scene: Phaser.Scene) {
    const balances = Object.values(this.balanceSetMap).filter(
      (set) => !set?.locked,
    );
    const maxValue = balances.length * MAX_SMALL_LIBRA_STEPS;
    const currentValue = this.getTotalBalance();
    if (Math.abs(currentValue) >= maxValue) {
      scene.scene.start(SCENE_KEY.GAME_OVER, {
        desc: "The scales have totally tipped... and so have you.",
      });
    }
  }

  // Opponents
  public getOpponents(): Opponent[] {
    return this.opponentSpawners
      .filter((spawner) => spawner.opponent)
      .map((spawner) => spawner.opponent!);
  }
  public setupLevelOpponents() {
    const opponentIds = LEVEL_OPPONENT_INFO[this.level].opponentIds;
    this.opponentSpawners.forEach((spawner, index) => {
      const opponentId = opponentIds[index];
      if (opponentId) {
        spawner.spawnOpponent(opponentId);
      }
    });
  }
  public async defectedOpponent(opponent: Opponent) {
    const targetIndex = this.opponentSpawners.findIndex(
      (spawner) => spawner.opponent === opponent,
    );
    if (targetIndex < 0) throw new Error("Opponent not found");
    // check if able to next level
    // XXX: we have to do that before destroy or scene will be undefined
    const isAllDefeated =
      this.opponentSpawners.filter((spawner) => spawner.opponent).length === 1;
    if (isAllDefeated) {
      await delayedCallAsync(opponent.scene, 800);
      if (this.level === LEVEL_OPPONENT_INFO.length - 1) {
        opponent.scene.scene.start(SCENE_KEY.VICTORY);
      } else {
        opponent.scene.events.emit(EVENT_KEY.ON_NEXT_LEVEL);
      }
    }
    this.opponentSpawners[targetIndex].opponent!.destroy();
    this.opponentSpawners[targetIndex].opponent = null;
  }

  // Game states
  public async updateTurn(scene: Phaser.Scene) {
    if (this._currentTurn === ETurn.PLAYER) {
      // status check
      await this.maat!.executeEndTurnStatus();
      await this._checkTotalImbalance(scene);
      this._currentTurn = ETurn.OPPONENT;
      scene.events.emit(EVENT_KEY.ON_TURN_UPDATED, { turn: ETurn.OPPONENT });
      await delayedCallAsync(scene, 1000);
      await this._performOpponentTurn(scene);
      this._inHandCards.forEach((card) => card?.setControllable(false));
    } else {
      if (!this.isTutorialLevel) this._usedTurns += 1;

      // TODO: check all opponents end turn status
      scene.events.emit(EVENT_KEY.ON_TURN_UPDATED, { turn: ETurn.PLAYER });
      await delayedCallAsync(scene, 1000);
      const isNewlyImbalanced = this._checkLibraSetImbalanced();
      if (isNewlyImbalanced) {
        await delayedCallAsync(scene, 500);
        await this.maat!.fixingLibraHint();
        await delayedCallAsync(scene, 2500);
        this._currentTurn = ETurn.PLAYER; // FIXME: protect from dragging card while imbalanced scales
        this.updateTurn(scene);
        return;
      }
      this._currentTurn = ETurn.PLAYER;
      await this._fixLibraSetImbalanced();
      const balanceSets = Object.values(this.balanceSetMap).filter(
        (set) => !set?.locked,
      );
      const totalBalance = balanceSets.reduce(
        (sum, current) => (sum += current!.value),
        0,
      );
      this.largeLibraGroup!.updateBalanceValue(
        totalBalance,
        balanceSets.length * MAX_SMALL_LIBRA_STEPS,
      );
      this._inHandCards.forEach((card) => card?.setControllable(true));
    }
  }

  private async _performOpponentTurn(scene: Phaser.Scene) {
    const opponents = this.getOpponents();
    for (const opponent of opponents) {
      await delayedCallAsync(scene, 100);
      await opponent.performMovable();
    }
    await delayedCallAsync(scene, 500);
    for (const opponent of opponents) {
      opponent.updateMove();
    }
    await delayedCallAsync(scene, 500);
    this.drawCards(scene);
    this.updateTurn(scene);
  }

  public async applyOpponentMovable(movable: TOpponentMovable) {
    const { action, value } = movable;
    switch (action) {
      case EOpponentActionable.ATTACK: {
        await this.maat!.applyDamage(value);
        break;
      }
      case EOpponentActionable.SHIELD: {
        this.getOpponents().forEach((op) => op.addShield(value));
        break;
      }
      case EOpponentActionable.HEAL: {
        this.getOpponents().forEach((op) => op.healing(value));
        break;
      }
      case EOpponentActionable.SUMMON: {
        this.opponentSpawners.forEach((spawner) => {
          if (!spawner.opponent) {
            spawner.spawnOpponent("o_00004");
          }
        });
        break;
      }
      case EOpponentActionable.VENOM: {
        this.maat!.addStatus(EStatusType.VENOM, value);
        break;
      }
      case EOpponentActionable.INTERRUPT_ATK:
      case EOpponentActionable.INTERRUPT_DEF:
      case EOpponentActionable.INTERRUPT_PHY:
      case EOpponentActionable.INTERRUPT_MAG:
      case EOpponentActionable.INTERRUPT_SHT:
      case EOpponentActionable.INTERRUPT_LNG:
      case EOpponentActionable.INTERRUPT_DUT:
      case EOpponentActionable.INTERRUPT_FIR: {
        this._interruptBalance(action, value);
        break;
      }
    }
  }

  private _interruptBalance(type: EOpponentActionable, value: number) {
    if (type === EOpponentActionable.INTERRUPT_ATK) {
      this.balanceSetMap[EBalanceSetType.DEF_ATK]!.addValue(value);
    }
    if (type === EOpponentActionable.INTERRUPT_DEF) {
      this.balanceSetMap[EBalanceSetType.DEF_ATK]!.addValue(-value);
    }
    if (type === EOpponentActionable.INTERRUPT_PHY) {
      this.balanceSetMap[EBalanceSetType.PHY_MAG]!.addValue(-value);
    }
    if (type === EOpponentActionable.INTERRUPT_MAG) {
      this.balanceSetMap[EBalanceSetType.PHY_MAG]!.addValue(value);
    }
    if (type === EOpponentActionable.INTERRUPT_SHT) {
      this.balanceSetMap[EBalanceSetType.SHT_LNG]!.addValue(-value);
    }
    if (type === EOpponentActionable.INTERRUPT_LNG) {
      this.balanceSetMap[EBalanceSetType.SHT_LNG]!.addValue(value);
    }
    if (type === EOpponentActionable.INTERRUPT_DUT) {
      this.balanceSetMap[EBalanceSetType.DUT_FIR]!.addValue(-value);
    }
    if (type === EOpponentActionable.INTERRUPT_FIR) {
      this.balanceSetMap[EBalanceSetType.DUT_FIR]!.addValue(value);
    }
  }

  public setApplyingEffect(isApplying: boolean) {
    this._isApplyingEffect = isApplying;
    for (const card of this._inHandCards) {
      if (!card) continue;
      card.setControllable(!isApplying);
    }
  }

  public setNextLevel(scene: Phaser.Scene) {
    this.level += 1;
    if (this.level === 1 && !this._startTime) {
      // set start time
      this._startTime = Date.now();
    }
    if (!this.isTutorialLevel) {
      this._usedTurns += 1;
    }

    this.setupLevelOpponents();
    // unlock libra set
    if (this.level === 2) {
      this.balanceSetMap[EBalanceSetType.SHT_LNG]!.unlock();
    } else if (this.level === 3) {
      this.balanceSetMap[EBalanceSetType.DUT_FIR]!.unlock();
    } else if (this.level === LEVEL_OPPONENT_INFO.length - 1) {
      // BOSS
      (scene as GameScene).showBossAppearance();
    }
    // reset cards
    for (const card of this._inHandCards) {
      if (!card) continue;
      card.destroy();
    }
    this._inHandCards = [null, null, null, null, null];
    this._usedCardIds = [];
    scene.events.emit(EVENT_KEY.ON_USED_CARDS_UPDATED, {
      count: this._usedCardIds.length,
    });
    this._availableCardIds = [...DEFAULT_AVAILABLE_CARD_IDS];
    this.shuffleAvailableCardIds(scene);
    this.drawCards(scene);

    // reset libra
    for (const set of Object.values(this.balanceSetMap)) {
      set!.updateValue(0);
    }
    this.largeLibraGroup!.updateJackpotValue(0);
    this.largeLibraGroup!.updateBalanceValue(0, this.getHalfTotalLibraValue());

    // rest character
    this.maat!.updateShield(0);
    this.maat!.removeAllStatus();
  }
}
