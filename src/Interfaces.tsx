import { Dispatch, SetStateAction } from "react";
import {
  IAnalyserNode,
  IAudioContext,
  IMediaStreamAudioSourceNode,
  IOscillatorNode,
} from "standardized-audio-context";
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
  audioContext: IAudioContext | undefined;
  analyser: IAnalyserNode<IAudioContext> | undefined;
  buffer: Float32Array;
  mediaStreamSource: IMediaStreamAudioSourceNode<IAudioContext> | undefined;
  oscillatorNode: IOscillatorNode<IAudioContext> | undefined;
  isPlaying: boolean;
  requestAnimationFrameID: number | undefined;
  currentTuning: string;
  currentStringBeingTuned: CurrentStringData;
  timeToCompute: number;
}
export interface AppState {}
export interface AppProps {}
