import { Dispatch, SetStateAction } from "react";
import { ColorScheme } from "./colors";
export interface ContainerGradientProps {
  color_1: string;
  color_2: string;
}
export interface SVGProps {
  color_1: string;
  color_2: string;
}
export interface TunerProps {
  setColors: Dispatch<
    SetStateAction<{
      primary: string;
      gradient_darker: string;
      gradient_lighter: string;
    }>
  >;
  currentColors: ColorScheme;
}

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
  timeToCompute: number;
}
export interface AppState {}
export interface AppProps {}
