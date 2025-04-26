import { AUDIO_KEY, EVENT_KEY } from "~/constants";
import { GameManager } from "~/manager";
import { ETurn } from "~/type";
import { getAudioScene } from "~/utils";

import { Button } from "./button";

export class EndTurnButton extends Button {
  private _onTurnUpdated: Function;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    super(scene, x, y, text);

    this._onTurnUpdated = ({ turn }: { turn: ETurn }) => {
      if (turn === ETurn.PLAYER) {
        this.setDisabled(false);
        this.resetY();
        this.setText("End Turn");
      } else {
        this.setDisabled(true);
        this.setText("Enemies...");
      }
    };
    this.scene.events.on(EVENT_KEY.ON_TURN_UPDATED, this._onTurnUpdated);
  }

  onClick(): void {
    getAudioScene(this.scene).playSFX(AUDIO_KEY.CLICK);
    const gm = GameManager.getInstance();
    if (gm.isApplyingEffect) return;
    gm.updateTurn(this.scene);
  }
}
