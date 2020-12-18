import React from "react";
import styled from "styled-components";
import Buttons from "./components/Buttons";
import Header from "./components/Header";
import StringBeingTuned from "./components/StringBeingTuned";
import Tunings, { Letters, Frequencies } from "./tunings";
import { ReactComponent as Wave } from "./Wave.svg";
import colors, { ColorScheme, ColorSchemes } from "./colors";
import mod from "./components/WasmLoader";
console.log(mod);
// import LoadPitchDetectorWasm from "./LoadPitchDetectorWasm";

// LoadPitchDetectorWasm().then((data) => {});
interface ContainerGradientProps {
  color_1: string;
  color_2: string;
}
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
interface SVGProps {
  color_1: string;
  color_2: string;
}
interface Props {}
interface CurrentStringData {
  frequency: number;
  letter: string;
}

interface State {
  note: string;
  frequency: number;
  audioContext: AudioContext | undefined;
  analyser: AnalyserNode | undefined;
  buffer: Float32Array;
  mediaStreamSource: MediaStreamAudioSourceNode | undefined;
  oscillatorNode: OscillatorNode | undefined;
  isPlaying: boolean;
  requestAnimationFrameID: number | undefined;
  currentTuning: string;
  currentStringBeingTuned: CurrentStringData;
  currentColors: ColorScheme;
}
class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      analyser: undefined,
      audioContext: undefined,
      buffer: new Float32Array(2048),
      frequency: 0,
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
    this.liveInput = this.liveInput.bind(this);
    this.oscillator = this.oscillator.bind(this);
    this.handleTuningSelection = this.handleTuningSelection.bind(this);
  }

  getUserMedia(
    callback: NavigatorUserMediaSuccessCallback,
    errorCallback: NavigatorUserMediaErrorCallback
  ) {
    navigator.getUserMedia(
      {
        audio: {
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
        },
      },
      callback,
      errorCallback
    );
  }
  autocorellate(buffer: Float32Array, sampleRate: number) {
    let rms = 0;
    let size = buffer.length;
    for (let index = 0; index < size; index++) {
      const val = buffer[index];
      rms += val * val;
    }
    rms = Math.sqrt(rms / size);
    if (rms < 0.01) return -1;

    let r1 = 0,
      r2 = size - 1,
      thresh = 0.2;

    for (let index = 0; index < size / 2; index++) {
      if (Math.abs(buffer[index]) < thresh) {
        r1 = index;
        break;
      }
    }
    for (let index = 0; index < size / 2; index++) {
      if (Math.abs(buffer[size - 1]) < thresh) {
        r2 = size - index;
        break;
      }
    }
    buffer = buffer.slice(r1, r2);
    size = buffer.length;

    let c = new Array(size).fill(0);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j + i];
      }
    }
    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1,
      maxpos = -1;
    for (let index = d; index < size; index++) {
      if (c[index] > maxval) {
        maxval = c[index];
        maxpos = index;
      }
    }
    let t0 = maxpos;
    let x1 = c[t0 - 1],
      x2 = c[t0],
      x3 = c[t0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2,
      b = (x3 - x1) / 2;
    if (a) t0 = t0 - b / (2 * a);
    return sampleRate / t0;
  }
  noteFromPitch(frequency: number) {
    let noteStrings = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    let noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return noteStrings[(Math.round(noteNum) + 69) % 12];
  }
  gotStream(stream: MediaStream) {
    this.setState((prevState) => {
      let volume;
      let mediaStreamSource;
      let newAnalyser = prevState.analyser;
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
      return {
        mediaStreamSource: mediaStreamSource,
        analyser: newAnalyser,
      };
    });
    this.findPitch();
  }
  findPitch() {
    if (this.state.analyser)
      this.state.analyser.getFloatTimeDomainData(this.state.buffer);

    let ac = 0;
    if (this.state.audioContext)
      ac = this.autocorellate(
        this.state.buffer,
        this.state.audioContext.sampleRate
      );

    if (ac !== -1) {
      let pitch = ac;
      this.setState({
        frequency: Math.floor(pitch),
        note: this.noteFromPitch(pitch),
      });
    } else {
      this.setState({ frequency: 0, note: "-" });
    }
    let rafID = window.requestAnimationFrame(() =>
      this.determineStringBeingTuned(this.state.currentTuning)
    );
    this.setState({ requestAnimationFrameID: rafID });
  }
  getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName];
  }
  absoluteValOfDifference(a: number, b: number) {
    return Math.abs(a - b);
  }
  determineStringBeingTuned(tuning: string) {
    // Get the frequencies and letters for the specific tuning
    let tuningFrequencies = this.getProperty(
      this.getProperty(
        Tunings,
        tuning as "Standard" | "Drop D" | "Double Drop D" | "DADGAD"
      ),
      "frequencies"
    );
    let tuningLetters = this.getProperty(
      this.getProperty(
        Tunings,
        tuning as "Standard" | "Drop D" | "Double Drop D" | "DADGAD"
      ),
      "letters"
    );
    let detectedFreq = this.state.frequency;
    let closestFreq = 0;
    let closestLetter = "-";
    let maxDifference = 9999;
    let minIndex = 0;
    // Compute the absolute differences and figure out the minimum
    // Map over the list of string frequencies
    Object.values(tuningFrequencies).map((stringFreq, index) => {
      // Compute the difference between the one detected, and the one known
      let diff = this.absoluteValOfDifference(detectedFreq, stringFreq);
      // If the diffrence is smaller
      if (diff < maxDifference && detectedFreq !== 0) {
        // We found the new minimum
        maxDifference = diff;
        // Get the index of the minimum
        minIndex = index;
        // Update the closest letter and freq
      }
    });
    console.log(minIndex);
    closestLetter = this.getProperty(
      tuningLetters,
      `string_${minIndex + 1}` as keyof Letters
    );
    closestFreq = this.getProperty(
      tuningFrequencies,
      `string_${minIndex + 1}` as keyof Frequencies
    );
    let currentColors = this.getProperty(
      colors,
      closestLetter as keyof ColorSchemes
    );
    console.log(closestLetter);
    console.log(currentColors);
    this.setState({
      currentStringBeingTuned: {
        letter: closestLetter,
        frequency: closestFreq,
      },
      currentColors: this.getProperty(
        colors,
        closestLetter as keyof ColorSchemes
      ),
    });
    requestAnimationFrame(this.findPitch);
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
      let context = new AudioContext();
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
    analyser.fftSize = 2048;
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
            <Buttons onClick={this.handleTuningSelection} />
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

export default App;
