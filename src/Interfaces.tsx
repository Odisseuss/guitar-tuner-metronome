import { ColorScheme } from "./colors";
export interface ContainerGradientProps {
  color_1: string;
  color_2: string;
}
export interface SVGProps {
  color_1: string;
  color_2: string;
}
export interface TunerProps {}

export interface CurrentStringData {
  frequency: number;
  letter: string;
}

export interface TunerState {
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
  timeToCompute: number;
}
export interface AppState {}
export interface AppProps {}
