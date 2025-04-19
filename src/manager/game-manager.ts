import { EVENT_KEY } from "~/constants";
import { Card } from "~/ui";
import { CardDeck } from "~/ui/card-deck-group/card-deck";
import { shuffleArray } from "~/utils/math.utility";

export class GameManager {
  public availableCardIds: string[] = [
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
  public usedCardIds: string[] = [];
  public inHandCards: (Card | null)[] = [null, null, null, null, null];
  public cardDecks: CardDeck[] = [];

  private static instance: GameManager;
  private constructor() {}
  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
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
}
