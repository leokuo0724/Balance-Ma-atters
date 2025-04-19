import { Maat } from "~/characters";
import { EVENT_KEY, MAX_SMALL_LIBRA_STEPS } from "~/constants";
import { EBalanceSetType } from "~/type";
import { Card, LargeLibraGroup } from "~/ui";
import { CardDeck } from "~/ui/card-deck-group/card-deck";
import { SmallLibraSet } from "~/ui/small-libra-group/small-libra-set";
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
  { opponentIds: ["o_00000", "o_00000", "o_00000"] },
  { opponentIds: ["o_00001", "o_00002"] },
  { opponentIds: ["o_00001", "o_00003"] },
  { opponentIds: ["o_00004", "o_00004", "o_00005"] },
];

export class GameManager {
  public availableCardIds: string[] = DEFAULT_AVAILABLE_CARD_IDS;

  public usedCardIds: string[] = [];
  public inHandCards: (Card | null)[] = [null, null, null, null, null];
  public cardDecks: CardDeck[] = [];
  public maat: Maat | null = null;

  // balance_set
  public largeLibraGroup: LargeLibraGroup | null = null;
  public balanceSetMap: Record<EBalanceSetType, SmallLibraSet | null> = {
    [EBalanceSetType.PHY_MAG]: null,
    [EBalanceSetType.DEF_ATK]: null,
    [EBalanceSetType.SHT_LNG]: null,
    [EBalanceSetType.DUT_FIR]: null,
  };

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

  public addCardDecks(deck: CardDeck) {
    this.cardDecks.push(deck);
  }

  public shuffleAvailableCardIds(scene: Phaser.Scene) {
    this.availableCardIds = shuffleArray(this.availableCardIds);
    scene.events.emit(EVENT_KEY.ON_AVAILABLE_CARDS_UPDATED, {
      count: this.availableCardIds.length,
    });
  }

  private _drawCardId(scene: Phaser.Scene): string {
    if (this.availableCardIds.length === 0) {
      throw new Error("No more cards available to draw.");
    }
    const cardId = this.availableCardIds.pop()!;
    scene.events.emit(EVENT_KEY.ON_AVAILABLE_CARDS_UPDATED, {
      count: this.availableCardIds.length,
    });
    // XXX: remember to create Card instance and put into array
    return cardId;
  }

  public async drawCards(scene: Phaser.Scene) {
    for (let i = 0; i < this.inHandCards.length; i++) {
      const card = this.inHandCards[i];
      if (card !== null) continue;
      const cardId = this._drawCardId(scene);
      const cardDeck = this.cardDecks[i];
      await cardDeck.spawnCard(cardId);
    }
  }

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
}
