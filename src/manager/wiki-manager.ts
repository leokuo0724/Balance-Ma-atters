import cardData from "~/assets/data/card_metadata.json";
import { TCardMetadata } from "~/type";

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

  public queryCardData(id: string): TCardMetadata {
    const data = this._cardData[id];
    if (!data) throw new Error(`Card data not found for id: ${id}`);
    return data;
  }
}
