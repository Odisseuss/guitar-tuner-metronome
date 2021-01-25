import { expose } from "comlink";
export default {} as typeof Worker & { new (): Worker };

// Declare variables
let TOTAL_TAP_VALUES = 5;
let MS_UNTIL_CHAIN_RESET = 2000;
let SKIPPED_TAP_THRESHOLD_LOW = 1.75;
let SKIPPED_TAP_THRESHOLD_HIGH = 2.75;
let beatMS = 500;
let resetMS = new Date().getTime();
let lastTapMS = 0;
let lastTapSkipped = false;
let tapDurations = [0, 0, 0, 0, 0];
let tapDurationIndex = 0;
let tapsInChain = 0;
let timerID = 0;
let buttonDown = false;
let buttonDownOld = false;

// Expose functions through comlink
let api = {
  // Get the average gaps between taps in a chain
  getAverageTapDuration() {
    var amount = tapsInChain - 1;
    if (amount > TOTAL_TAP_VALUES) {
      amount = TOTAL_TAP_VALUES;
    }

    var runningTotal = 0;
    for (var i = 0; i < amount; i++) {
      runningTotal += tapDurations[i];
    }

    return Math.floor(runningTotal / amount);
  },
  // Add another tap to chain
  tap(ms: number) {
    tapsInChain++;
    if (tapsInChain === 1) {
      lastTapMS = ms;
      return -1;
    }

    var duration = ms - lastTapMS;

    // detect if last duration was unreasonable
    if (
      tapsInChain > 1 &&
      !lastTapSkipped &&
      duration > beatMS * SKIPPED_TAP_THRESHOLD_LOW &&
      duration < beatMS * SKIPPED_TAP_THRESHOLD_HIGH
    ) {
      duration = Math.floor(duration * 0.5);
      lastTapSkipped = true;
    } else {
      lastTapSkipped = false;
    }

    tapDurations[tapDurationIndex] = duration;
    tapDurationIndex++;
    if (tapDurationIndex === TOTAL_TAP_VALUES) {
      tapDurationIndex = 0;
    }

    var newBeatMS = api.getAverageTapDuration();

    lastTapMS = ms;
    return newBeatMS;
  },
  // Resets the chain of taps
  resetChain(ms: number) {
    tapsInChain = 0;
    tapDurationIndex = 0;
    resetMS = ms;
    for (var i = 0; i < TOTAL_TAP_VALUES; i++) {
      tapDurations[i] = 0;
    }
  },
  // Tap tempo detection loop
  loop() {
    var ms = new Date().getTime();
    // if a tap has occured...
    if (buttonDown && !buttonDownOld) {
      // start a new tap chain if last tap was over an amount of beats ago
      if (lastTapMS + MS_UNTIL_CHAIN_RESET < ms) {
        api.resetChain(ms);
      }

      var newBeatMS = api.tap(ms);
      if (newBeatMS !== -1) {
        beatMS = newBeatMS;
      }
    }

    let tempo = Math.round(60000 / beatMS);

    // if a beat has occured since last loop()

    // set old vars
    buttonDownOld = buttonDown;
    postMessage(tempo);
  },
  // API
  start() {
    timerID = setInterval(api.loop, 10);
    console.log(timerID);
  },
  stop() {
    clearInterval(timerID);
  },
  press() {
    buttonDown = true;
  },
  release() {
    buttonDown = false;
  },
};

// Instantiate a detector and expose it with comlink

expose(api);
