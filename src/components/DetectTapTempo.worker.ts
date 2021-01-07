import { expose } from "comlink";
export default {} as typeof Worker & { new (): Worker };
class TapTempoDetector {
  TOTAL_TAP_VALUES: number;
  MS_UNTIL_CHAIN_RESET: number;
  SKIPPED_TAP_THRESHOLD_LOW: number;
  SKIPPED_TAP_THRESHOLD_HIGH: number;
  sinceResetMS: number;
  sinceResetMSOld: number;
  beatMS: number;
  resetMS: number;
  lastTapMS: number;
  lastTapSkipped: boolean;
  beatProgress: number;
  tapDurations: number[];
  tapDurationIndex: number;
  tapsInChain: number;
  constructor() {
    this.TOTAL_TAP_VALUES = 5;
    this.MS_UNTIL_CHAIN_RESET = 2000;
    this.SKIPPED_TAP_THRESHOLD_LOW = 1.75;
    this.SKIPPED_TAP_THRESHOLD_HIGH = 2.75;
    this.sinceResetMS = 0;
    this.sinceResetMSOld = 0;
    this.beatMS = 500;
    this.resetMS = this.time();
    this.lastTapMS = 0;
    this.lastTapSkipped = false;
    this.beatProgress = 0;
    this.tapDurations = [0, 0, 0, 0, 0];
    this.tapDurationIndex = 0;
    this.tapsInChain = 0;
  }

  // Get current time in milliseconds
  time() {
    var d = new Date();
    return d.getTime();
  }

  // Get the average gaps between taps in a chain
  getAverageTapDuration() {
    var amount = this.tapsInChain - 1;
    if (amount > this.TOTAL_TAP_VALUES) {
      amount = this.TOTAL_TAP_VALUES;
    }

    var runningTotal = 0;
    for (var i = 0; i < amount; i++) {
      runningTotal += this.tapDurations[i];
    }

    return Math.floor(runningTotal / amount);
  }
  // Add another tap to chain
  tap(ms: number) {
    this.tapsInChain++;
    if (this.tapsInChain == 1) {
      this.lastTapMS = ms;
      return -1;
    }

    var duration = ms - this.lastTapMS;

    // detect if last duration was unreasonable
    if (
      this.tapsInChain > 1 &&
      !this.lastTapSkipped &&
      duration > this.beatMS * this.SKIPPED_TAP_THRESHOLD_LOW &&
      duration < this.beatMS * this.SKIPPED_TAP_THRESHOLD_HIGH
    ) {
      duration = Math.floor(duration * 0.5);
      this.lastTapSkipped = true;
    } else {
      this.lastTapSkipped = false;
    }

    this.tapDurations[this.tapDurationIndex] = duration;
    this.tapDurationIndex++;
    if (this.tapDurationIndex === this.TOTAL_TAP_VALUES) {
      this.tapDurationIndex = 0;
    }

    var newBeatMS = this.getAverageTapDuration();

    this.lastTapMS = ms;
    return newBeatMS;
  }
  // Resets the chain of taps
  resetChain(ms: number) {
    this.tapsInChain = 0;
    this.tapDurationIndex = 0;
    this.resetMS = ms;
    for (var i = 0; i < this.TOTAL_TAP_VALUES; i++) {
      this.tapDurations[i] = 0;
    }
  }
  // Tap tempo detection loop
  loop() {
    var ms = this.time();
    let buttonDown, buttonDownOld;
    // if a tap has occured...
    if (buttonDown && !buttonDownOld) {
      // start a new tap chain if last tap was over an amount of beats ago
      if (this.lastTapMS + this.MS_UNTIL_CHAIN_RESET < ms) {
        this.resetChain(ms);
      }

      var newBeatMS = this.tap(ms);
      if (newBeatMS !== -1) {
        this.beatMS = newBeatMS;
      }
    }

    this.beatProgress = (this.sinceResetMS / this.beatMS) % 1;

    let tempo = 60000 / this.beatMS;

    // if a beat has occured since last loop()
    this.sinceResetMS = ms - this.resetMS;

    // set old vars
    buttonDownOld = buttonDown;
    this.sinceResetMSOld = this.sinceResetMS;
    return tempo;
  }
  // setInterval(loop, 10);
  // document.onmousedown = function () {
  //   buttonDown = true;
  // };

  // document.onmouseup = function () {
  //   buttonDown = false;
  // };
}

// Instantiate a detector and expose it with comlink
let detector = new TapTempoDetector();

expose(detector);
