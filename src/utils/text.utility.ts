export type TypewriterController = {
  promise: Promise<void>;
  finish: () => void;
  isFinished: boolean;
};

export function typewriterText(
  scene: Phaser.Scene,
  textObject: Phaser.GameObjects.Text,
  fullText: string,
  speed: number = 50,
): TypewriterController {
  let resolvePromise: () => void;
  let i = 0;
  let finished = false;
  let typingEvent: Phaser.Time.TimerEvent;

  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve;

    typingEvent = scene.time.addEvent({
      delay: speed,
      callback: () => {
        i++;
        textObject.setText(fullText.slice(0, i));
        if (i >= fullText.length) {
          finish();
        }
      },
      loop: true,
    });
  });

  function finish() {
    if (finished) return;
    finished = true;
    if (typingEvent) typingEvent.remove();
    textObject.setText(fullText);
    resolvePromise();
  }

  return {
    promise,
    finish,
    get isFinished() {
      return finished;
    },
  };
}
