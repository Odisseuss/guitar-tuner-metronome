import { Dispatch, SetStateAction } from "react";
import {
  IAnalyserNode,
  IAudioContext,
  IMediaStreamAudioSourceNode,
  IOscillatorNode,
} from "standardized-audio-context";
import { ColorScheme } from "./colors";
export interface IContainerGradientProps {
  color_1: string;
  color_2: string;
}
export interface ISVGProps {
  color_1: string;
  color_2: string;
}
export interface ITunerProps {
  setColors: Dispatch<
    SetStateAction<{
      primary: string;
      gradient_darker: string;
      gradient_lighter: string;
    }>
  >;
  currentColors: ColorScheme;
}

export interface ICurrentStringData {
  frequency: number;
  letter: string;
}

export interface ITunerState {
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
  rulerDistanceBetweenGradings: number;
  windowWidth: number;
}
export interface IMetronomeProps {
  primaryColor: string;
}

export interface IMetronomeState {
  beatsPerMeasure: number;
  tempo: number;
  isPlaying: boolean;
  startTime: number | null;
  current16thNote: number;
  lookahead: number;
  scheduleAheadTime: number;
  audioContext: IAudioContext;
  nextNoteTime: number;
  noteResolution: number;
  noteLength: number;
  notesInQueue: Array<{ note: any; time: any }>;
  timerWorker: Worker;
  tapTempoActive: boolean;
}
export interface IAppState {}
export interface IAppProps {}
