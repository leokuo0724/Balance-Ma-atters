import { ITarget } from "~/characters/interfaces";
import {
  ATLAS_KEY,
  COLOR_KEY,
  DEPTH,
  FONT_KEY,
  SIZE,
  TEXTURE_KEY,
} from "~/constants";
import { GameManager, WikiManager } from "~/manager";
import { ETarget, TCardMetadata } from "~/type";
import { tweensAsync } from "~/utils";

import { BalanceLabel } from "./balance-label";

export class Card extends Phaser.GameObjects.Container {
  private _origX: number;
  private _origY: number;
  public metadata: TCardMetadata;

  private _dragTarget: ITarget | null = null;

  private _onDrag:
    | ((
        pointer: Phaser.Input.Pointer,
        gameObject: any,
        dragX: number,
        dragY: number,
      ) => void)
    | null = null;
  private _onDragEnd:
    | ((pointer: Phaser.Input.Pointer, gameObject: any) => void)
    | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, id: string) {
    super(scene, x, y + 20);
    scene.add.existing(this);
    this._origX = x;
    this._origY = y;

    const wm = WikiManager.getInstance();
    this.metadata = wm.queryCardData(id);

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
      .text(LEFT, 32, this.metadata.title, {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 18,
        color: COLOR_KEY.BEIGE_2,
        align: "left",
      })
      .setOrigin(0, 0.5);
    const descriptionLabel = scene.add.text(
      LEFT,
      44,
      this.metadata.description,
      {
        fontFamily: FONT_KEY.JERSEY_25,
        fontSize: 16,
        color: COLOR_KEY.BEIGE_4,
        align: "left",
      },
    );
    const isShield = this.metadata.shield > 0;
    const shieldIcon = scene.add
      .image(
        LEFT + 12,
        TOP + 14,
        ATLAS_KEY.UI_COMPONENT,
        TEXTURE_KEY.SHIELD_ICON,
      )
      .setVisible(isShield);
    const valueLabel = scene.add
      .text(
        LEFT + 12,
        TOP + 14,
        isShield
          ? this.metadata.shield.toString()
          : (this.metadata.damage?.toString() ?? "?"),
        {
          fontFamily: FONT_KEY.JERSEY_25,
          fontSize: 44,
          color: COLOR_KEY.BEIGE_2,
          align: "left",
        },
      )
      .setOrigin(0.5);

    this.add([bg, cover, titleLabel, descriptionLabel, shieldIcon, valueLabel]);
    this.metadata.balances.forEach((balance, index) => {
      const rowNum = Math.floor(index / 2);
      const colNum = index % 2;
      const balanceLabel = new BalanceLabel(
        scene,
        LEFT + 54 + colNum * 48,
        TOP + 8 + rowNum * 20,
        balance.type,
        balance.value,
      );
      this.add(balanceLabel);
    });
    this.setSize(...SIZE.CARD)
      .setDepth(DEPTH.CARD)
      .setAlpha(0)
      .setInteractive();
    scene.input.setDraggable(this);

    this._registerDragEvents();
  }

  public async enter() {
    await tweensAsync(this.scene, {
      targets: this,
      duration: 200,
      y: this._origY,
      alpha: 1,
      ease: Phaser.Math.Easing.Cubic.Out,
    });
  }

  public _registerDragEvents() {
    this._onDrag = (
      pointer: Phaser.Input.Pointer,
      gameObject: any,
      dragX: number,
      dragY: number,
    ) => {
      if (gameObject !== this) return;
      this.x = dragX;
      this.y = dragY;
      this.setDepth(DEPTH.DRAGGING_CARD);

      const gm = GameManager.getInstance();
      const targets = [gm.maat!];

      for (const target of targets) {
        const isTargetCovered = Phaser.Geom.Intersects.RectangleToRectangle(
          this.getBounds(),
          target.getBounds(),
        );
        const isAppliable = this._checkIsAppliable(target);
        const isMatched = isTargetCovered && isAppliable;

        target.markAsCovered(isMatched);
        if (isMatched) {
          this._dragTarget = target;
          break;
        } else {
          this._dragTarget = null;
        }
      }
    };
    this.scene.input.on("drag", this._onDrag);

    this._onDragEnd = (pointer: Phaser.Input.Pointer, gameObject: any) => {
      if (gameObject !== this) return;
      if (this._dragTarget) {
        console.log(this._dragTarget);
        this._dragTarget.markAsCovered(false);
        this._dragTarget = null;
        this.destroy(true);
      } else {
        this.setDepth(DEPTH.CARD);
        this.x = this._origX;
        this.y = this._origY;
      }
    };
    this.scene.input.on("dragend", this._onDragEnd);
  }

  private _checkIsAppliable({ belong }: ITarget) {
    const isSelfAppliable =
      belong === "self" && this.metadata.target === ETarget.SELF;
    const isEnemyAppliable =
      belong === "opponent" && this.metadata.target === ETarget.SINGLE_OPPONENT;
    return isSelfAppliable || isEnemyAppliable;
  }

  public destroy(fromScene?: boolean): void {
    if (this._onDrag) this.scene.input.off("drag", this._onDrag);
    if (this._onDragEnd) this.scene.input.off("dragend", this._onDragEnd);
    super.destroy(fromScene);
  }
}
