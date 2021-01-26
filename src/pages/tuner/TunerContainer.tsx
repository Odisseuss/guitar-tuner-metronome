import React from "react";
import styled from "styled-components";
import TuningSelectionButtons from "./components/TuningSelectionButtons";
import StringBeingTuned from "./components/StringBeingTuned";
import { ReactComponent as Wave } from "../../icons/Wave.svg";
import {
  determineStringBeingTuned2,
  noteFromPitch,
} from "../../utils/functions";
import { autocorellation, YIN } from "../../utils/detectors";
import { SVGProps, TunerProps, TunerState } from "../../types/Interfaces";
import { AudioContext } from "standardized-audio-context";
import Ruler from "./components/Ruler";

let SVGContainer = styled.div`
  width: 100%;
  height: 45%;
  position: absolute;
  bottom: 0;
`;
let StyledWaveSvg = styled(Wave)<SVGProps>`
  width: 100%;
  height: 100%;
  position: absolute;
  max-height: 373px;
  --color-1: ${(props) => props.color_1};
  --color-2: ${(props) => props.color_2};
  filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.15));
`;

class Tuner extends React.Component<TunerProps, TunerState> {
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
  gotStream(stream: MediaStream) {
    let volume;
    let mediaStreamSource;
    let newAnalyser = this.state.analyser;
    if (newAnalyser) newAnalyser.fftSize = 2048;
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
      let yin = await YIN();
      if (yin)
        ac = yin(
          this.state.buffer,
          0.15,
          this.state.audioContext.sampleRate,
          0.6
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
      let buffer = new Float32Array(4096);
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
      let result = determineStringBeingTuned2(
        tuning,
        this.state.frequency,
        this.state.buffer,
        this.state.audioContext.sampleRate
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
          echoCancellation: false,
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
    let oscillatorFreq = 83;
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
      <div style={{ height: "90%", width: "100%", position: "relative" }}>
        <TuningSelectionButtons onClick={this.handleTuningSelection} />
        <button onClick={this.oscillator}>Oscillator</button>
        <button onClick={this.liveInput}>Live Input</button>
        <StringBeingTuned
          note={this.state.currentStringBeingTuned.letter}
          frequency={this.state.currentStringBeingTuned.frequency}
          noteProps={{ color: this.props.currentColors.primary }}
        />

        <SVGContainer>
          <h1
            style={{
              position: "absolute",
              width: "100%",
              top: "45%",
              fontWeight: 400,
              fontSize: 18,
              textAlign: "center",
              zIndex: 100,
              color: this.props.currentColors.primary,
            }}
          >
            {this.state.frequency}Hz
          </h1>
          <h1
            style={{
              position: "absolute",
              width: "100%",
              top: "50%",
              fontWeight: 400,
              fontSize: 18,
              textAlign: "center",
              zIndex: 100,
              color: this.props.currentColors.primary,
            }}
          >
            {tuningIndication}
          </h1>
          <h1
            style={{
              position: "absolute",
              width: "100%",
              top: "55%",
              fontWeight: 400,
              fontSize: 18,
              textAlign: "center",
              zIndex: 100,
              color: this.props.currentColors.primary,
            }}
          >
            {this.state.timeToCompute}
          </h1>
          {/* <PerformanceComparison></PerformanceComparison> */}
          <Ruler
            rulerGradings={rulerDivs}
            gradingColors={this.props.currentColors.primary}
            rulerTranslate={rulerTranslate}
          />
          <StyledWaveSvg
            color_1={this.props.currentColors.gradient_lighter}
            color_2={this.props.currentColors.gradient_darker}
            style={{ position: "absolute", bottom: 0, left: 0 }}
          />
        </SVGContainer>
      </div>
    );
  }
}

export default Tuner;
