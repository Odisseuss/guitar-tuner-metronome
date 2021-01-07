import { expose } from "comlink";
export default {} as typeof Worker & { new (): Worker };
class Metronome {
  tempo: number;
  playing: boolean;
  audioCtx: any;
  tick: any;
  tickVolume: any;
  soundHz: number;
  scheduledTicks: number;
  constructor(tempo = 60, ticks = 1000) {
    this.tempo = tempo;
    this.playing = false;
    this.audioCtx = null;
    this.tick = null;
    this.tickVolume = null;
    this.soundHz = 1000;
    this.scheduledTicks = ticks;
  }

  start(callbackFn: (arg0: any) => void) {
    this.playing = true;
    this.initAudio();
    const timeoutDuration = 60 / this.tempo;

    let now = this.audioCtx.currentTime;

    // Schedule all the clicks ahead.
    for (let i = 0; i < this.scheduledTicks; i++) {
      this.clickAtTime(now);
      const x = now;
      setTimeout(() => callbackFn(x), now * 1000);
      now += timeoutDuration;
    }
  }

  stop() {
    this.playing = false;
    this.tickVolume.gain.value = 0;
  }

  initAudio() {
    // @ts-ignore
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.tick = this.audioCtx.createOscillator();
    this.tickVolume = this.audioCtx.createGain();

    this.tick.type = "sine";
    this.tick.frequency.value = this.soundHz;
    this.tickVolume.gain.value = 0;

    this.tick.connect(this.tickVolume);
    this.tickVolume.connect(this.audioCtx.destination);
    this.tick.start(0); // No offset, start immediately.
  }

  click(callbackFn: (arg0: any) => void) {
    const time = this.audioCtx.currentTime;
    this.clickAtTime(time);

    if (callbackFn) {
      callbackFn(time);
    }
  }

  clickAtTime(time: number) {
    // Silence the click.
    this.tickVolume.gain.cancelScheduledValues(time);
    this.tickVolume.gain.setValueAtTime(0, time);

    // Audible click sound.
    this.tickVolume.gain.linearRampToValueAtTime(1, time + 0.001);
    this.tickVolume.gain.linearRampToValueAtTime(0, time + 0.001 + 0.01);
  }
}
let metronome = new Metronome();
expose(metronome);
