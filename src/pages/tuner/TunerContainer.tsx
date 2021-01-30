import React from "react";
import {
  determineStringBeingTuned,
  determineStringBeingTuned2,
  noteFromPitch,
} from "../../utils/functions";
import { autocorellation, YIN, AC } from "../../utils/detectors";
import { TunerProps, TunerState } from "../../types/Interfaces";
import { AudioContext } from "standardized-audio-context";
import Tuner from "./components/Tuner";

class TunerContainer extends React.Component<TunerProps, TunerState> {
  yinDetector: any;
  constructor(props: TunerProps) {
    super(props);
    this.state = {
      analyser: undefined,
      audioContext: undefined,
      buffer: new Float32Array(2048),
      frequency: 0,
      timeToCompute: 0,
      note: "-",
      mediaStreamSource: undefined,
      oscillatorNode: undefined,
      isPlaying: false,
      requestAnimationFrameID: undefined,
      currentTuning: "Standard",
      currentStringBeingTuned: { frequency: 0, letter: "-" },
      windowWidth: 650,
      rulerDistanceBetweenGradings: 27.083333333333332,
    };
    this.gotStream = this.gotStream.bind(this);
    this.findPitch = this.findPitch.bind(this);
    this.findPitchWithYIN = this.findPitchWithYIN.bind(this);
    this.liveInput = this.liveInput.bind(this);
    this.oscillator = this.oscillator.bind(this);
    this.handleTuningSelection = this.handleTuningSelection.bind(this);
  }
  // Resize the ruler spacing on window resize
  componentDidMount() {
    window.addEventListener("resize", (event) => {
      let windowWidth = Math.min(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth,
        650
      );
      this.setState({
        rulerDistanceBetweenGradings: windowWidth / 24,
        windowWidth: windowWidth,
      });
    });
  }
  // Callback for initializing the stream source and running the find pitch algorithm
  gotStream(stream: MediaStream) {
    let volume;
    let mediaStreamSource;
    let newAnalyser = this.state.analyser;
    if (newAnalyser) newAnalyser.fftSize = 4096;
    if (this.state.audioContext) {
      volume = this.state.audioContext.createGain();
      volume.gain.value = 2;
      mediaStreamSource = this.state.audioContext.createMediaStreamSource(
        stream
      );

      mediaStreamSource.connect(volume);
      if (newAnalyser) volume.connect(newAnalyser);
    }
    this.setState({
      mediaStreamSource: mediaStreamSource,
      analyser: newAnalyser,
    });
    this.findPitchWithYIN();
  }
  async findPitchWithYIN() {
    if (this.state.analyser) {
      let buffer = new Float32Array(2048);
      this.state.analyser.getFloatTimeDomainData(buffer);
      this.setState({ buffer: buffer });
    }

    let ac = 0;
    let t0 = performance.now();
    if (this.state.audioContext) {
      // Autocorellation 45-50ms per pass on ngrok
      // let autocorell = await AC();
      // if (autocorell)
      //   ac = autocorell(this.state.buffer, this.state.audioContext.sampleRate);
      // YIN 36-40ms per pass on ngrok server
      let yin = await YIN();
      if (yin)
        ac = yin(
          this.state.buffer,
          0.3,
          this.state.audioContext.sampleRate,
          0.95
        );
    }

    let t1 = performance.now();
    this.setState({
      timeToCompute: t1 - t0,
    });
    if (ac !== -1 && ac > 30 && ac < 1048) {
      let pitch = ac;
      this.setState({
        frequency: Math.floor(pitch),
        note: noteFromPitch(pitch),
      });
    } else {
      this.setState({ frequency: 0, note: "-" });
    }
    let rafID = window.requestAnimationFrame(() =>
      this.setStringCurrentlyBeingTuned(
        this.state.currentTuning,
        this.findPitchWithYIN
      )
    );
    this.setState({ requestAnimationFrameID: rafID });
  }
  findPitch() {
    if (this.state.analyser) {
      let buffer = new Float32Array(2048);
      this.state.analyser.getFloatTimeDomainData(buffer);
      this.setState({ buffer: buffer });
    }

    let t0 = performance.now();
    let ac = 0;
    if (this.state.audioContext)
      ac = autocorellation(
        this.state.buffer,
        this.state.audioContext.sampleRate
      );
    let t1 = performance.now();

    if (ac !== -1) {
      let pitch = ac;
      this.setState({
        frequency: Math.floor(pitch),
        note: noteFromPitch(pitch),
      });
    } else {
      this.setState({ frequency: 0, note: "-" });
    }
    this.setState({
      timeToCompute: t1 - t0,
    });
    let rafID = window.requestAnimationFrame(() =>
      this.setStringCurrentlyBeingTuned(
        this.state.currentTuning,
        this.findPitch
      )
    );
    this.setState({ requestAnimationFrameID: rafID });
  }
  setStringCurrentlyBeingTuned(tuning: string, callback: FrameRequestCallback) {
    if (this.state.frequency !== 0 && this.state.audioContext) {
      let result = determineStringBeingTuned(
        tuning,
        this.state.frequency
        // this.state.buffer,
        // this.state.audioContext.sampleRate
      );

      this.props.setColors(result.currentColors);
      this.setState({
        currentStringBeingTuned: result.currentStringBeingTuned,
      });
    }
    requestAnimationFrame(callback);
  }
  liveInput() {
    if (this.state.isPlaying) {
      //stop playing and return
      this.state.oscillatorNode?.stop();
      this.setState({
        isPlaying: false,
        oscillatorNode: undefined,
        analyser: undefined,
      });
      if (this.state.requestAnimationFrameID)
        window.cancelAnimationFrame(this.state.requestAnimationFrameID);
    }
    let context = new AudioContext();
    this.setState({
      audioContext: context,
      analyser: context.createAnalyser(),
    });
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          autoGainControl: false,
          noiseSuppression: false,
        },
      })
      .then(this.gotStream)
      .catch((err) => {
        console.log("Getusermedia threw error: " + err);
      });
  }
  oscillator() {
    if (this.state.isPlaying) {
      //stop playing and return
      if (this.state.oscillatorNode) this.state.oscillatorNode.stop(0);
      this.setState({
        oscillatorNode: undefined,
        analyser: undefined,
        isPlaying: false,
      });
      if (this.state.requestAnimationFrameID)
        window.cancelAnimationFrame(this.state.requestAnimationFrameID);
    }
    let context = new AudioContext();
    let analyser = context.createAnalyser();
    analyser.fftSize = 4096;
    let oscillator = context.createOscillator();
    oscillator.connect(analyser);
    analyser.connect(context.destination);
    let volume = context.createGain();
    volume.connect(context.destination);
    volume.gain.value = -0.95;
    oscillator.connect(volume);
    let oscillatorFreq = 60;
    oscillator.frequency.setValueAtTime(oscillatorFreq, context.currentTime);
    setInterval(() => {
      oscillator.frequency.setValueAtTime(oscillatorFreq, context.currentTime);
      oscillatorFreq += 1;
    }, 50);
    oscillator.start(0);
    this.setState({
      audioContext: context,
      analyser: analyser,
      oscillatorNode: oscillator,
      isPlaying: true,
    });
    this.findPitchWithYIN();
  }
  handleTuningSelection(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    tuning: string
  ) {
    this.setState({ currentTuning: tuning });
  }

  render() {
    let rulerDivs = new Array(23).fill(0).map((line, index) => {
      let height;
      if (index === 0 || (index - 1) % 5 !== 0) {
        height = 60;
      } else {
        height = 110;
      }
      return (
        <div
          key={index}
          style={{
            width: "3px",
            height: height + "px",
            backgroundColor: "rgba(51, 51, 51, 70)",
          }}
        ></div>
      );
    });
    let translationDistanceToLastLine =
      this.state.windowWidth / 2 - this.state.rulerDistanceBetweenGradings;
    let clampRulerToWindowCondition =
      (Math.abs(
        this.state.frequency - this.state.currentStringBeingTuned.frequency
      ) /
        5) *
        this.state.rulerDistanceBetweenGradings >
      translationDistanceToLastLine;
    let signOfDifference =
      this.state.frequency - this.state.currentStringBeingTuned.frequency < 0
        ? -1
        : 1;
    let rulerTranslate =
      this.state.frequency !== 0
        ? clampRulerToWindowCondition
          ? signOfDifference * translationDistanceToLastLine
          : ((this.state.frequency -
              this.state.currentStringBeingTuned.frequency) /
              5) *
            this.state.rulerDistanceBetweenGradings
        : 0;

    let tuningIndication;
    if (this.state.frequency !== 0) {
      if (this.state.frequency < this.state.currentStringBeingTuned.frequency) {
        tuningIndication = "Tune Higher";
      } else if (
        this.state.frequency > this.state.currentStringBeingTuned.frequency
      ) {
        tuningIndication = "Tune Lower";
      } else {
        tuningIndication = "In Tune";
      }
    } else {
      tuningIndication = "";
    }
    return (
      <React.Fragment>
        <Tuner
          currentColors={this.props.currentColors}
          currentStringBeingTuned={this.state.currentStringBeingTuned}
          frequency={this.state.frequency}
          handleTuningSelection={this.handleTuningSelection}
          rulerDivs={rulerDivs}
          rulerTranslate={rulerTranslate}
          startLiveInput={this.liveInput}
          startOscillator={this.oscillator}
          timeToCompute={this.state.timeToCompute}
          tuningIndication={tuningIndication}
        />
      </React.Fragment>
    );
  }
}

export default TunerContainer;
