import { COLOR_KEY, FONT_KEY } from "~/constants";
import {
  EOpponentAction,
  EOpponentActionable,
  TOpponentMovable,
  TOpponentMove,
} from "~/type";
import { hexToDecimal, tweensAsync } from "~/utils";

const ACTION_TEXT_MAP: Record<EOpponentActionable, string> = {
  [EOpponentActionable.ATTACK]: "Attack {amount}",
  [EOpponentActionable.SHIELD]: "Shield {amount}",
  [EOpponentActionable.HEAL]: "Heal {amount}",
  [EOpponentActionable.SUMMON]: "Summon Snakes",
  [EOpponentActionable.VENOM]: "Venom {amount}",
  [EOpponentActionable.INTERRUPT_ATK]: "Interrupt\nATK Balance {amount}",
  [EOpponentActionable.INTERRUPT_DEF]: "Interrupt\nDEF Balance {amount}",
  [EOpponentActionable.INTERRUPT_PHY]: "Interrupt\nPHY Balance {amount}",
  [EOpponentActionable.INTERRUPT_MAG]: "Interrupt\nMAG Balance {amount}",
  [EOpponentActionable.INTERRUPT_SHT]: "Interrupt\nSHT Balance {amount}",
  [EOpponentActionable.INTERRUPT_LNG]: "Interrupt\nLNG Balance {amount}",
  [EOpponentActionable.INTERRUPT_DUT]: "Interrupt\nDUT Balance {amount}",
  [EOpponentActionable.INTERRUPT_FIR]: "Interrupt\nFIR Balance {amount}",
};

const COVER_WIDTH = 84;

export class NextMove extends Phaser.GameObjects.Container {
  private _text: Phaser.GameObjects.Text;
  private _cover: Phaser.GameObjects.Rectangle;
  public nextMovable: TOpponentMovable | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this._text = scene.add
      .text(0, 0, "", {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 20,
        color: COLOR_KEY.BROWN_8,
        align: "center",
      })
      .setOrigin(0.5);
    this._cover = scene.add
      .rectangle(
        -COVER_WIDTH / 2,
        0,
        COVER_WIDTH,
        32,
        hexToDecimal(COLOR_KEY.RED_8),
      )
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.add([this._text, this._cover]);
  }

  public async updateNextMove(move: TOpponentMove | null) {
    this._cover.setX(-COVER_WIDTH / 2).setOrigin(0, 0.5);
    await tweensAsync(this.scene, {
      targets: this._cover,
      duration: 100,
      scaleX: 1,
    });

    if (!move) {
      this.nextMovable = null;
      this._text.setText("No Action");
    } else {
      const { action, value } = move;
      const actionable = this._getActionable(action);
      this.nextMovable = { action: actionable, value };
      const text = ACTION_TEXT_MAP[actionable];
      this._text.setText(text.replace("{amount}", value.toString()));
    }

    this._cover.setX(COVER_WIDTH / 2).setOrigin(1, 0.5);
    await tweensAsync(this.scene, {
      targets: this._cover,
      duration: 100,
      scaleX: 0,
      onComplete: () => {
        this._cover.setScale(0, 1);
      },
    });
  }

  private _getActionable(action: EOpponentAction) {
    switch (action) {
      case EOpponentAction.ATTACK:
        return EOpponentActionable.ATTACK;
      case EOpponentAction.SHIELD:
        return EOpponentActionable.SHIELD;
      case EOpponentAction.HEAL:
        return EOpponentActionable.HEAL;
      case EOpponentAction.SUMMON:
        return EOpponentActionable.SUMMON;
      case EOpponentAction.VENOM:
        return EOpponentActionable.VENOM;
      case EOpponentAction.RANDOM_BALANCE:
        return Phaser.Math.RND.pick([
          EOpponentActionable.INTERRUPT_ATK,
          EOpponentActionable.INTERRUPT_DEF,
          EOpponentActionable.INTERRUPT_PHY,
          EOpponentActionable.INTERRUPT_MAG,
          EOpponentActionable.INTERRUPT_SHT,
          EOpponentActionable.INTERRUPT_LNG,
          EOpponentActionable.INTERRUPT_DUT,
          EOpponentActionable.INTERRUPT_FIR,
        ]);
    }
  }
}
