import React from "react";
import styled from "styled-components";
import TuningSelectionButtons from "./TuningSelectionButtons";
import Header from "./Header";
import StringBeingTuned from "./StringBeingTuned";
import { ReactComponent as Wave } from "../Wave.svg";
import functions from "./Functions";
import detectors from "./Detectors";
import {
  ContainerGradientProps,
  SVGProps,
  TunerProps,
  TunerState,
} from "../Interfaces";
import PerformanceComparison from "./PerformanceComparison";
let CenteredAppContainer = styled.div<ContainerGradientProps>`
  max-width: 650px;
  max-height: 750px;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    72.19% 72.19% at 49.92% 27.81%,
    ${(props) => props.color_1} 0%,
    ${(props) => props.color_1} 0.01%,
    ${(props) => props.color_2} 100%
  );
`;
let Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
`;
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
      buffer: new Float32Array(4096),
      frequency: 0,
      timeToCompute: 0,
      note: "-",
      mediaStreamSource: undefined,
      oscillatorNode: undefined,
      isPlaying: false,
      requestAnimationFrameID: undefined,
      currentTuning: "Standard",
      currentStringBeingTuned: { frequency: 0, letter: "-" },
      currentColors: {
        primary: "#F72640",
        gradient_darker: "#0F0910",
        gradient_lighter: "#1F0E18",
      },
    };
    this.gotStream = this.gotStream.bind(this);
    this.findPitch = this.findPitch.bind(this);
    this.findPitchWithYIN = this.findPitchWithYIN.bind(this);
    this.liveInput = this.liveInput.bind(this);
    this.oscillator = this.oscillator.bind(this);
    this.handleTuningSelection = this.handleTuningSelection.bind(this);
  }

  gotStream(stream: MediaStream) {
    this.setState((prevState) => {
      let volume;
      let mediaStreamSource;
      let newAnalyser = prevState.analyser;
      if (newAnalyser) newAnalyser.fftSize = 4096;
      if (this.state.audioContext) {
        volume = this.state.audioContext.createGain();
        volume.gain.value = 4;
        mediaStreamSource = this.state.audioContext.createMediaStreamSource(
          stream
        );
        mediaStreamSource.connect(volume);
        if (newAnalyser) volume.connect(newAnalyser);
      }
      return {
        mediaStreamSource: mediaStreamSource,
        analyser: newAnalyser,
      };
    });
    this.findPitchWithYIN();
  }
  async findPitchWithYIN() {
    if (this.state.analyser)
      this.state.analyser.getFloatTimeDomainData(this.state.buffer);

    let ac = 0;
    let t0 = performance.now();
    if (this.state.audioContext) {
      let YIN = await detectors.YIN();
      if (YIN)
        ac = YIN(
          this.state.buffer,
          0.1,
          this.state.audioContext.sampleRate,
          0.1
        );
    }

    let t1 = performance.now();
    this.setState({
      timeToCompute: t1 - t0,
    });
    if (ac !== -1 && ac > 30 && ac < 1048) {
      let pitch = ac;
      console.log(Math.floor(pitch));
      this.setState({
        frequency: Math.floor(pitch),
        note: functions.noteFromPitch(pitch),
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
    if (this.state.analyser)
      this.state.analyser.getFloatTimeDomainData(this.state.buffer);

    let t0 = performance.now();
    let ac = 0;
    if (this.state.audioContext)
      ac = detectors.autocorellation(
        this.state.buffer,
        this.state.audioContext.sampleRate
      );
    let t1 = performance.now();

    if (ac !== -1) {
      let pitch = ac;
      this.setState({
        frequency: Math.floor(pitch),
        note: functions.noteFromPitch(pitch),
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
    let result = functions.determineStringBeingTuned(
      tuning,
      this.state.frequency
    );
    this.setState({
      currentStringBeingTuned: result.currentStringBeingTuned,
      currentColors: result.currentColors,
    });
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
    this.setState(() => {
      let context = new AudioContext({ sampleRate: 44100 });
      return { audioContext: context, analyser: context.createAnalyser() };
    });
    navigator.getUserMedia(
      {
        audio: {
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
        },
      },
      this.gotStream,
      (err) => {
        console.log("Getusermedia threw error: " + err);
      }
    );
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
    oscillator.frequency.setValueAtTime(82, context.currentTime);
    oscillator.start(0);
    this.setState({
      audioContext: context,
      analyser: analyser,
      oscillatorNode: oscillator,
      isPlaying: true,
    });
    this.findPitch();
  }
  handleTuningSelection(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    tuning: string
  ) {
    this.setState({ currentTuning: tuning });
    console.log(this.state.currentTuning);
  }

  render() {
    return (
      <Container>
        <CenteredAppContainer
          color_1={this.state.currentColors.gradient_lighter}
          color_2={this.state.currentColors.gradient_darker}
        >
          <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <Header />
            <TuningSelectionButtons onClick={this.handleTuningSelection} />
            <button onClick={this.oscillator}>Oscillator</button>
            <button onClick={this.liveInput}>Live Input</button>
            <StringBeingTuned
              note={this.state.currentStringBeingTuned.letter}
              frequency={this.state.currentStringBeingTuned.frequency}
              noteProps={{ color: this.state.currentColors.primary }}
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
                  color: this.state.currentColors.primary,
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
                  color: this.state.currentColors.primary,
                }}
              >
                {this.state.frequency !== 0
                  ? this.state.frequency ===
                    this.state.currentStringBeingTuned.frequency
                    ? "GOOD"
                    : this.state.frequency >
                      this.state.currentStringBeingTuned.frequency
                    ? "Lower"
                    : "Higher"
                  : ""}
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
                  color: this.state.currentColors.primary,
                }}
              >
                {this.state.timeToCompute}
              </h1>
              {/* <PerformanceComparison></PerformanceComparison> */}
              <StyledWaveSvg
                color_1={this.state.currentColors.gradient_lighter}
                color_2={this.state.currentColors.gradient_darker}
                style={{ position: "absolute", bottom: 0, left: 0 }}
              />
            </SVGContainer>
          </div>
        </CenteredAppContainer>
      </Container>
    );
  }
}

export default Tuner;
