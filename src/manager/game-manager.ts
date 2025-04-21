import { ITarget, Maat, Opponent, OpponentSpawner } from "~/characters";
import { EVENT_KEY, MAX_SMALL_LIBRA_STEPS } from "~/constants";
import {
  EBalanceSetType,
  EOpponentActionable,
  ETurn,
  TOpponentMovable,
} from "~/type";
import { Card, GameOver, LargeLibraGroup } from "~/ui";
import { CardDeck } from "~/ui/card-deck-group/card-deck";
import { SmallLibraSet } from "~/ui/small-libra-group/small-libra-set";
import { delayedCallAsync } from "~/utils";
import { shuffleArray } from "~/utils/math.utility";

const DEFAULT_AVAILABLE_CARD_IDS = [
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
];
const DEFAULT_MAAT_DATA = {
  BLOOD: 20,
  SHIELD: 0,
};
const LEVEL_OPPONENT_INFO = [
  { opponentIds: [null, "o_00005", "o_00004"] },
  { opponentIds: ["o_00000", "o_00000", "o_00000"] },
  { opponentIds: ["o_00001", "o_00002"] },
  { opponentIds: ["o_00001", "o_00003"] },
  { opponentIds: ["o_00004", "o_00005", "o_00004"] },
];

export class GameManager {
  // Cards
  private _availableCardIds: string[] = DEFAULT_AVAILABLE_CARD_IDS;
  private _usedCardIds: string[] = [];
  private _inHandCards: (Card | null)[] = [null, null, null, null, null];
  // Card Spawners
  private _cardDecks: CardDeck[] = [];

  // Characters
  public maat: Maat | null = null;
  public opponentSpawners: OpponentSpawner[] = [];

  // Libra
  public largeLibraGroup: LargeLibraGroup | null = null;
  public balanceSetMap: Record<EBalanceSetType, SmallLibraSet | null> = {
    [EBalanceSetType.PHY_MAG]: null,
    [EBalanceSetType.DEF_ATK]: null,
    [EBalanceSetType.SHT_LNG]: null,
    [EBalanceSetType.DUT_FIR]: null,
  };

  // Game states
  public level: number = 0;
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

    targetCard.destroy(true);
    this._inHandCards[targetIndex] = null;
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
      new GameOver(scene, "The scales have tipped... and so have you.");
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
  public defectedOpponent(opponent: Opponent) {
    const targetIndex = this.opponentSpawners.findIndex(
      (spawner) => spawner.opponent === opponent,
    );
    if (targetIndex < 0) throw new Error("Opponent not found");
    // check if able to next level
    // XXX: we have to do that before destroy or scene will be undefined
    const isAllDefeated =
      this.opponentSpawners.filter((spawner) => spawner.opponent).length === 1;
    // TODO: check win
    if (isAllDefeated) {
      opponent.scene.events.emit(EVENT_KEY.ON_NEXT_LEVEL);
    }
    this.opponentSpawners[targetIndex].opponent!.destroy();
    this.opponentSpawners[targetIndex].opponent = null;
  }

  // Game states
  public async updateTurn(scene: Phaser.Scene) {
    if (this._currentTurn === ETurn.PLAYER) {
      await this._checkTotalImbalance(scene);
      this._currentTurn = ETurn.OPPONENT;
      this._performOpponentTurn(scene);
      this._inHandCards.forEach((card) => card?.setControllable(false));
    } else {
      this._currentTurn = ETurn.PLAYER;
      const isNewlyImbalanced = this._checkLibraSetImbalanced();
      if (isNewlyImbalanced) {
        await delayedCallAsync(scene, 500);
        await this.maat!.fixingLibraHint();
        await delayedCallAsync(scene, 2500);
        this.updateTurn(scene);
        return;
      }
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
    scene.events.emit(EVENT_KEY.ON_TURN_UPDATED, { turn: this._currentTurn });
  }

  private async _performOpponentTurn(scene: Phaser.Scene) {
    const opponents = this.getOpponents();
    for (const opponent of opponents) {
      await delayedCallAsync(scene, 300);
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
        // TODO: apply venom
        // this.maat!.applyVenom(value);
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
    this.setupLevelOpponents();
    // unlock libra set
    if (this.level === 1) {
      this.balanceSetMap[EBalanceSetType.SHT_LNG]!.unlock();
    } else if (this.level === 2) {
      this.balanceSetMap[EBalanceSetType.DUT_FIR]!.unlock();
    }
    // reset cards
    let inHandCardIds = [];
    for (const card of this._inHandCards) {
      if (!card) continue;
      inHandCardIds.push(card.metadata.id);
      card.destroy(true);
    }
    this._inHandCards = [null, null, null, null, null];
    this._usedCardIds.push(...inHandCardIds);
    this.drawCards(scene);

    // reset libra
    for (const set of Object.values(this.balanceSetMap)) {
      set!.updateValue(0);
    }
    this.largeLibraGroup!.updateJackpotValue(0);
    this.largeLibraGroup!.updateBalanceValue(0, this.getHalfTotalLibraValue());

    // rest character
    this.maat!.updateShield(0);
  }
}
