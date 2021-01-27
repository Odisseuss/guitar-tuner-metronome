import * as React from "react";
// @ts-ignore
import MetronomeLogic from "../../utils/workers/MetronomeScheduler.worker";
import TapTempoWorker from "../../utils/workers/DetectTapTempo.worker";
import { wrap } from "comlink";
import { AudioContext } from "standardized-audio-context";
import Metronome from "./components/Metronome";
export interface MetronomeProps {
  primaryColor: string;
}

export interface MetronomeState {
  beatsPerMeasure: number;
  tempo: number;
  isPlaying: boolean;
  startTime: number | null;
  current16thNote: number;
  lookahead: number;
  scheduleAheadTime: number;
  audioContext: AudioContext;
  nextNoteTime: number;
  noteResolution: number;
  noteLength: number;
  notesInQueue: Array<{ note: any; time: any }>;
  timerWorker: Worker;
  tapTempoActive: boolean;
}
class MetronomeContainer extends React.Component<
  MetronomeProps,
  MetronomeState
> {
  tempoValuesArray: number[];
  comlinkWorkerApi: any;
  comlinkWorkerInstance: Worker;
  constructor(props: MetronomeProps) {
    super(props);
    this.state = {
      beatsPerMeasure: 4,
      tempo: 60,
      isPlaying: false,
      startTime: null,
      current16thNote: 0,
      lookahead: 25,
      scheduleAheadTime: 0.1,
      nextNoteTime: 0.0,
      noteResolution: 2, // 0 = 16th note, 1 = 8th note, 2 = 4th note
      noteLength: 0.05,
      notesInQueue: [],
      audioContext: new AudioContext(),
      timerWorker: new MetronomeLogic(),
      tapTempoActive: false,
    };
    this.setBeatsPerMeasure = this.setBeatsPerMeasure.bind(this);
    this.setNoteType = this.setNoteType.bind(this);
    this.nextNote = this.nextNote.bind(this);
    this.scheduleNote = this.scheduleNote.bind(this);
    this.scheduler = this.scheduler.bind(this);
    this.play = this.play.bind(this);
    this.handleSliderInputChange = this.handleSliderInputChange.bind(this);
    this.handleStartTapTempo = this.handleStartTapTempo.bind(this);
    this.handleTempoTap = this.handleTempoTap.bind(this);
    this.tempoValuesArray = [...Array(261).keys()].slice(30);
    this.comlinkWorkerInstance = new TapTempoWorker();
    this.comlinkWorkerApi = wrap(this.comlinkWorkerInstance);
  }
  setBeatsPerMeasure(beatsPerMeasure: number) {
    this.setState({ beatsPerMeasure: beatsPerMeasure });
    // Metronome scheduler crashes when you set it to a high value and then decrease the beats per measure very quickly. It continues with infinity beats per measure
    // One quick option is to stop the metronome when adjusting beats per measure although it might be annoying
    // Second option is to create a check for if the current beats per minute are smaller than the current and to wait untill execution of the current run terminates
    this.stop();
  }
  setNoteType(noteType: 0 | 1 | 2) {
    this.setState({ noteResolution: noteType });
  }
  // Calculates the time until the next note, and which 16th note the scheduler is at
  nextNote() {
    var secondsPerBeat = 60 / this.state.tempo;
    this.setState((prevState) => {
      return {
        nextNoteTime: prevState.nextNoteTime + 0.25 * secondsPerBeat,
        current16thNote:
          prevState.current16thNote + 1 === 4 * this.state.beatsPerMeasure
            ? 0
            : prevState.current16thNote + 1,
      };
    });
  }
  // Schedules the oscillator to play a certain note for a set time at a beat number
  scheduleNote(beatNumber: any, time: any) {
    let notesInQueue = this.state.notesInQueue;
    notesInQueue.push({ note: beatNumber, time: time });

    if (this.state.noteResolution === 1 && beatNumber % 2) {
      return;
    }
    if (this.state.noteResolution === 2 && beatNumber % 4) {
      return;
    }

    var osc = this.state.audioContext.createOscillator();
    osc.connect(this.state.audioContext.destination);

    if (beatNumber === 0)
      // beat 0 == high pitch
      osc.frequency.value = 880.0;
    else if (beatNumber % 4 === 0)
      // quarter notes = medium pitch
      osc.frequency.value = 440.0;
    // other 16th notes = low pitch
    else osc.frequency.value = 220.0;

    osc.start(time);
    osc.stop(time + this.state.noteLength);
  }
  // Schedules all notes before next interval
  scheduler() {
    // while there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    while (
      this.state.nextNoteTime <
      this.state.audioContext.currentTime + this.state.scheduleAheadTime
    ) {
      this.scheduleNote(this.state.current16thNote, this.state.nextNoteTime);
      this.nextNote();
    }
  }
  // Start / Stop the metronome
  play() {
    this.setState((prevState) => ({ isPlaying: !prevState.isPlaying }));
    if (!this.state.isPlaying) {
      // start playing
      this.setState({
        current16thNote: 0,
        nextNoteTime: this.state.audioContext.currentTime,
      });
      this.state.timerWorker?.postMessage("start");
      return "stop";
    } else {
      this.state.timerWorker?.postMessage("stop");
      return "play";
    }
  } // Stop the metronome
  stop() {
    this.setState({ isPlaying: false });
    if (this.state.isPlaying) {
      this.state.timerWorker?.postMessage("stop");
      return "play";
    }
  }
  // Set what happens when a message is received from the worker thread
  componentDidMount() {
    this.comlinkWorkerInstance.addEventListener("message", (ev) => {
      if (ev.data && typeof ev.data === "number") {
        this.setState({ tempo: ev.data });
        console.log("Tempo changed to " + ev.data);
      }
    });
    let timerWorker = this.state.timerWorker;
    timerWorker.onmessage = (e) => {
      if (e.data === "tick") {
        this.scheduler();
      } else {
        console.log(e.data);
      }
    };
    this.setState({ timerWorker: timerWorker });
    this.state.timerWorker.postMessage({ interval: this.state.lookahead });
  }
  shouldComponentUpdate(
    nextProps: Readonly<MetronomeProps>,
    nextState: Readonly<MetronomeState>
  ) {
    return nextState.beatsPerMeasure !== this.state.beatsPerMeasure ||
      nextState.tempo !== this.state.tempo ||
      nextProps.primaryColor !== this.props.primaryColor
      ? true
      : false;
  }
  handleTempoTap(action: string) {
    switch (action) {
      case "press":
        this.comlinkWorkerApi.press();
        break;
      case "release":
        this.comlinkWorkerApi.release();
        break;

      default:
        break;
    }
  }
  handleStartTapTempo(action: string) {
    switch (action) {
      case "start":
        this.setState({ tapTempoActive: true });
        this.comlinkWorkerApi.start();
        break;
      case "stop":
        this.setState({ tapTempoActive: false });
        this.comlinkWorkerApi.stop();
        break;

      default:
        break;
    }
  }
  handleSliderInputChange(value: number) {
    this.setState({ tempo: value });
  }
  render() {
    return (
      <React.Fragment>
        <Metronome
          beatsPerMeasure={this.state.beatsPerMeasure}
          handleSliderInputChange={this.handleSliderInputChange}
          handleStartTapTempo={this.handleStartTapTempo}
          handleTapTempo={this.handleTempoTap}
          play={this.play}
          primaryColor={this.props.primaryColor}
          setBeatsPerMeasure={this.setBeatsPerMeasure}
          setNoteType={this.setNoteType}
          tapTempoActive={this.state.tapTempoActive}
          tempo={this.state.tempo}
        />
      </React.Fragment>
    );
  }
}

export default MetronomeContainer;