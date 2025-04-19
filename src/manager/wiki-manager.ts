import cardData from "~/assets/data/card_metadata.json";
import opponentData from "~/assets/data/opponent_metadata.json";
import { TCardMetadata, TOpponentMetadata } from "~/type";

export class WikiManager {
  private static instance: WikiManager;
  private constructor() {}
  static getInstance(): WikiManager {
    if (!WikiManager.instance) {
      WikiManager.instance = new WikiManager();
    }
    return WikiManager.instance;
  }

  private _cardData: Record<string, TCardMetadata> = cardData as Record<
    string,
    TCardMetadata
  >;
  private _opponentData: Record<string, TOpponentMetadata> =
    opponentData as Record<string, TOpponentMetadata>;

  public queryCardData(id: string): TCardMetadata {
    const data = this._cardData[id];
    if (!data) throw new Error(`Card data not found for id: ${id}`);
    return data;
  }
  public queryOpponentData(id: string): TOpponentMetadata {
    const data = this._opponentData[id];
    if (!data) throw new Error(`Opponent data not found for id: ${id}`);
    return data;
  }
}
