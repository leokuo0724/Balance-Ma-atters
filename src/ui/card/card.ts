import {
  ATLAS_KEY,
  COLOR_KEY,
  DEPTH,
  FONT_KEY,
  SIZE,
  TEXTURE_KEY,
} from "~/constants";
import { TCardMetadata } from "~/type";

export class Card extends Phaser.GameObjects.Container {
  private _origX: number;
  private _origY: number;
  public metadata: TCardMetadata;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    metadata: TCardMetadata, // FIXME: pass id to search data
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this._origX = x;
    this._origY = y;
    this.metadata = metadata;

    const [cardWidth, cardHeight] = SIZE.CARD;
    const LEFT = -cardWidth / 2 + 8;
    const TOP = -cardHeight / 2 + 8;
    const bg = scene.add.image(
      0,
      0,
      ATLAS_KEY.UI_COMPONENT,
      TEXTURE_KEY.CARD_BG,
    );

    const cover = scene.add.image(
      0,
      0,
      ATLAS_KEY.UI_COMPONENT,
      TEXTURE_KEY.CARD_TOP,
    );
    const titleLabel = scene.add
      .text(LEFT, 32, metadata.title, {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 18,
        color: COLOR_KEY.BEIGE_2,
        align: "left",
      })
      .setOrigin(0, 0.5);
    const descriptionLabel = scene.add.text(LEFT, 44, metadata.description, {
      fontFamily: FONT_KEY.JERSEY_25,
      fontSize: 16,
      color: COLOR_KEY.BEIGE_4,
      align: "left",
    });
    const isShield = metadata.shield > 0;
    const valueLabel = scene.add
      .text(
        LEFT + 12,
        TOP + 14,
        isShield
          ? metadata.shield.toString()
          : (metadata.damage?.toString() ?? "?"),
        {
          fontFamily: FONT_KEY.JERSEY_25,
          fontSize: 44,
          color: COLOR_KEY.BEIGE_2,
          align: "left",
        },
      )
      .setOrigin(0.5);
    this.add([bg, cover, titleLabel, descriptionLabel, valueLabel]);
    this.setSize(...SIZE.CARD).setDepth(DEPTH.CARD);
  }
}
