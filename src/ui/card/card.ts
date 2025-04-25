import { ITarget } from "~/characters/interfaces";
import {
  ATLAS_KEY,
  COLOR_KEY,
  DEPTH,
  EVENT_KEY,
  FONT_KEY,
  SIZE,
  TEXTURE_KEY,
} from "~/constants";
import { GameManager, WikiManager } from "~/manager";
import { ETarget, ETurn, TCardMetadata } from "~/type";
import { getBalanceSetType, tweensAsync } from "~/utils";

import { BalanceLabel } from "./balance-label";

export class Card extends Phaser.GameObjects.Container {
  private _origX: number;
  private _origY: number;
  public metadata: TCardMetadata;
  private _isForTutorial = false;

  private _startDragging: boolean = false;

  private _onDrag: Function | null = null;
  private _onDragEnd: Function | null = null;

  private _basicDepth = DEPTH.CARD;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    isForTutorial: boolean = false,
  ) {
    super(scene, x, y + 20);
    scene.add.existing(this);
    this._origX = x;
    this._origY = y;
    this._isForTutorial = isForTutorial;

    const gm = GameManager.getInstance();
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
    const cardImage = scene.add.image(
      0,
      -8,
      ATLAS_KEY.UI_COMPONENT,
      this._getCardTexture(),
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
        TEXTURE_KEY.SILVER_SHIELD_ICON,
      )
      .setAlpha(0.5)
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

    this.add([
      bg,
      cardImage,
      cover,
      titleLabel,
      descriptionLabel,
      shieldIcon,
      valueLabel,
    ]);

    this.metadata.balances.forEach((balance, index) => {
      const balanceSet = getBalanceSetType(balance.type);
      const isTypeLocked = gm.getIsBalanceSetLocked(balanceSet);
      if (!isTypeLocked) {
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
      }
    });
    this.setSize(cardWidth - 30, cardHeight - 40)
      .setDepth(DEPTH.CARD)
      .setAlpha(0)
      .setInteractive();
    scene.input.setDraggable(this);

    this._registerDragEvents();
  }

  private _getCardTexture() {
    const id = this.metadata.id;
    switch (id) {
      case "c_00000":
      case "c_00001":
      case "c_00002":
      case "c_00003":
        return TEXTURE_KEY.CARD_FIST;
      case "c_00004":
      case "c_00005":
      case "c_00006":
        return TEXTURE_KEY.CARD_FEATHER;
      case "c_00009":
      case "c_00010":
        return TEXTURE_KEY.CARD_SHIELD;
      default:
        return TEXTURE_KEY.CARD_FIST;
    }
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
      const gm = GameManager.getInstance();
      if (!gm.isAbleToDrag) return;
      if (gm.currentTurn !== ETurn.PLAYER) return;
      if (gm.isApplyingEffect) return;

      this.x = dragX;
      this.y = dragY;
      this.setDepth(this._basicDepth + 1);
      if (!this._startDragging) {
        this.scene.events.emit(EVENT_KEY.ON_CARD_DRAG, {
          balances: this.metadata.balances,
        });
        this._startDragging = true;
      }

      const targets = [gm.maat!, ...gm.getOpponents()];

      for (const target of targets) {
        const isTargetCovered = Phaser.Geom.Intersects.RectangleToRectangle(
          this.getBounds(),
          target.getDragArea(),
        );
        const isAppliable = this._checkIsAppliable(target);
        const isMatched = isTargetCovered && isAppliable;

        if (isMatched) {
          gm.setCardDragTarget(target);
          break;
        } else {
          gm.setCardDragTarget(null);
        }
      }
    };
    this.scene.input.on("drag", this._onDrag);

    this._onDragEnd = async (
      pointer: Phaser.Input.Pointer,
      gameObject: any,
    ) => {
      if (gameObject !== this) return;
      const gm = GameManager.getInstance();
      if (gm.currentTurn !== ETurn.PLAYER) return;
      if (gm.isApplyingEffect) return;

      this._startDragging = false;
      const target = gm.cardDragTarget;
      if (target) {
        this.scene.events.emit(EVENT_KEY.ON_CARD_APPLY, {
          metadata: this.metadata,
        });
        target.markAsCovered(false);
        gm.setCardDragTarget(null);
        gm.markAsUsed(this, this.scene);
        gm.setApplyingEffect(true);
        await target.applyCardEffect(this.metadata);
        if (this._isForTutorial) {
          gm.nextTutorial(this.scene);
        }
      } else {
        this.scene.events.emit(EVENT_KEY.ON_CARD_DRAG_CANCEL, {
          balances: this.metadata.balances,
        });
        this.setDepth(this._basicDepth);
        this.x = this._origX;
        this.y = this._origY;
      }
    };
    this.scene.input.on("dragend", this._onDragEnd);

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.once(Phaser.GameObjects.Events.DESTROY, this._onDestroy, this);
  }

  private _checkIsAppliable({ belong }: ITarget) {
    const isSelfAppliable =
      belong === "self" && this.metadata.target === ETarget.SELF;
    const isEnemyAppliable =
      belong === "opponent" && this.metadata.target === ETarget.SINGLE_OPPONENT;
    return isSelfAppliable || isEnemyAppliable;
  }

  public setControllable(isControllable: boolean) {
    tweensAsync(this.scene, {
      targets: this,
      duration: 200,
      x: isControllable ? this._origX : "+=4",
      y: isControllable ? this._origY : "+=4",
      ease: Phaser.Math.Easing.Cubic.Out,
    });
  }

  public setBasicDepth(depth: number) {
    this._basicDepth = depth;
    this.setDepth(depth);
  }

  public _onDestroy(): void {
    if (this._onDrag) this.scene.input.off("drag", this._onDrag);
    if (this._onDragEnd) this.scene.input.off("dragend", this._onDragEnd);
  }
}
