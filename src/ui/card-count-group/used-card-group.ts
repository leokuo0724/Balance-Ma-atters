import { COLOR_KEY, EVENT_KEY, FONT_KEY, TEXTURE_KEY } from "~/constants";

export class UsedCardGroup extends Phaser.GameObjects.Container {
  private _onUsedCardsUpdated: Function;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const bg = scene.add.image(0, 0, TEXTURE_KEY.REST_CARD_BG);
    const restLabel = scene.add
      .text(0, -18, "Used", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 20,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    const valueLabel = scene.add
      .text(0, 8, "0", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 42,
        color: COLOR_KEY.BEIGE_2,
        align: "center",
      })
      .setOrigin(0.5);
    this.add([bg, restLabel, valueLabel]);

    this._onUsedCardsUpdated = ({ count }: { count: number }) => {
      valueLabel.setText(count.toString());
    };
    this.scene.events.on(
      EVENT_KEY.ON_USED_CARDS_UPDATED,
      this._onUsedCardsUpdated,
    );

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.once(Phaser.GameObjects.Events.DESTROY, this._onDestroy, this);
  }

  private _onDestroy() {
    this.scene.events.off(
      EVENT_KEY.ON_USED_CARDS_UPDATED,
      this._onUsedCardsUpdated,
    );
  }
}
