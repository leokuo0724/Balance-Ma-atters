import { SCENE_KEY } from "~/constants";
import { GameOver } from "~/ui";

export class GameOverScene extends Phaser.Scene {
  private _gameOverDesc!: string;

  constructor() {
    super(SCENE_KEY.GAME_OVER);
  }

  init({ desc }: { desc: string }) {
    this._gameOverDesc = desc;
  }

  create(): void {
    new GameOver(this, this._gameOverDesc);
  }
}
