// Metronome Scheduler Worker
// Used to receive and send messages that control the scheduler
// By moving the work from the main thread to the worker it is ensured that the scheduling is done spot on
declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

let timerID: number | undefined;
let interval = 100;

self.addEventListener("message", (event: MessageEvent): void => {
  if (event.data === "start") {
    timerID = setInterval(function () {
      postMessage("tick");
    }, interval);
  } else if (event.data.interval) {
    interval = event.data.interval;
    if (timerID) {
      clearInterval(timerID);
      timerID = setInterval(function () {
        postMessage("tick");
      }, interval);
    }
  } else if (event.data === "stop") {
    clearInterval(timerID);
    timerID = undefined;
  }
});
