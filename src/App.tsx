import React from "react";
import styled from "styled-components";
import Button from "./components/Button";
import Buttons from "./components/Buttons";
import Header from "./components/Header";
import StringBeingTuned from "./components/StringBeingTuned";
import { ReactComponent as Wave } from "./Wave.svg";
let CenteredAppContainer = styled.div`
  max-width: 650px;
  max-height: 750px;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    72.19% 72.19% at 49.92% 27.81%,
    #1f0e18 0%,
    #1f0e18 0.01%,
    #0f0910 100%
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
let StyledWaveSvg = styled(Wave)`
  width: 100%;
  height: 100%;
  position: absolute;
  max-height: 373px;
  --color-1: #1f0e18;
  --color-2: #0f0910;
  filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.15));
`;
interface Props {}
interface State {
  note: string;
  frequency: number;
  audioContext: AudioContext | undefined;
  analyser: AnalyserNode | undefined;
  buffer: Float32Array;
  mediaStreamSource: MediaStreamAudioSourceNode | undefined;
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
    };
    this.gotStream = this.gotStream.bind(this);
    this.findPitch = this.findPitch.bind(this);
    this.start = this.start.bind(this);
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
      let newAnalyser = prevState.analyser;
      if (newAnalyser) newAnalyser.fftSize = 2048;
      return {
        mediaStreamSource: this.state.audioContext?.createMediaStreamSource(
          stream
        ),
        analyser: newAnalyser,
      };
    });
    if (this.state.analyser)
      this.state.mediaStreamSource?.connect(this.state.analyser);
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
        frequency: Math.round(pitch),
        note: this.noteFromPitch(pitch),
      });
    } else {
      this.setState({ frequency: 0, note: "-" });
    }
    window.requestAnimationFrame(this.findPitch);
  }
  start() {
    // Live input
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
  render() {
    return (
      <Container>
        <CenteredAppContainer>
          <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <Header />
            <Buttons />
            <button onClick={this.start}>Start</button>
            <StringBeingTuned
              note={"A"}
              frequency={350}
              noteProps={{ color: "#F72640" }}
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
                  color: "#F72640",
                }}
              >
                {this.state.frequency}Hz
              </h1>
              <StyledWaveSvg
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
