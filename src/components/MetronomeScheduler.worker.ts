// Metronome Scheduler Worker
// Used to receive and send messages that control the scheduler
// By moving the work from the main thread to the worker it is ensured that the scheduling is done spot on
declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

let timerID: number | undefined;
let interval = 100;

self.addEventListener("message", (event: MessageEvent): void => {
  if (event.data === "start") {
    console.log("starting");
    timerID = setInterval(function () {
      postMessage("tick");
    }, interval);
  } else if (event.data.interval) {
    console.log("setting interval");
    interval = event.data.interval;
    console.log("interval=" + interval);
    if (timerID) {
      clearInterval(timerID);
      timerID = setInterval(function () {
        postMessage("tick");
      }, interval);
    }
  } else if (event.data === "stop") {
    console.log("stopping");
    clearInterval(timerID);
    timerID = undefined;
  }
});
