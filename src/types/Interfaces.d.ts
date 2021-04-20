import { Dispatch, SetStateAction } from 'react';
import {
	IAnalyserNode,
	IAudioContext,
	IMediaStreamAudioSourceNode,
	IOscillatorNode,
} from 'standardized-audio-context';
import { ColorScheme } from './colors';

// Tuner interfaces
export interface ITunerProps {
	handleTuningSelection: (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
		tuning: string
	) => void;
	toggleLiveInput: (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => void;
	currentStringBeingTuned: ICurrentStringData;
	currentColors: ColorScheme;
	frequency: number;
	tuningIndication: string;
	rulerDivs: JSX.Element[];
	timeToCompute: number;
	rulerTranslate: number;
	isChromaticMode: boolean;
	currentNote: string;
	isManualStringSelectionMode: boolean;
	cycleCurrentStringIndex: (type: 'up' | 'down') => void;
}
export interface ITunerContainerState {
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
	sameFrequencyCounter: number;
	isChromatic: boolean;
	isManualStringSelectionMode: boolean;
	currentStringBeingTunedIndex: number;
	shouldPlaySound: boolean;
	tutorialEnabled: boolean;
}
export interface ITunerContainerProps {
	setColors: Dispatch<
		SetStateAction<{
			primary: string;
			gradient_darker: string;
			gradient_lighter: string;
		}>
	>;
	currentColors: ColorScheme;
}

// Metronome interfaces

export interface IMetronomeContainerProps {
	primaryColor: string;
	setColors: Dispatch<
		SetStateAction<{
			primary: string;
			gradient_darker: string;
			gradient_lighter: string;
		}>
	>;
	currentColors: ColorScheme;
}

export interface IMetronomeContainerState {
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
	tutorialEnabled: boolean;
}
export interface IMetronomeProps {
	primaryColor: string;
	tempo: number;
	handleSliderInputChange: (value: number) => void;
	beatsPerMeasure: number;
	setBeatsPerMeasure: (beatsPerMeasure: number) => void;
	play: () => 'stop' | 'play';
	setNoteType: (noteType: 0 | 1 | 2) => void;
	handleTapTempo: (action: string) => void;
	isPlaying: boolean;
	tapTempoActive: boolean;
}
// App interfaces

export interface IAppState {}
export interface IAppProps {}

// Misc
export interface IContainerGradientProps {
	color_1: string;
	color_2: string;
}
export interface ISVGProps {
	color_1: string;
	color_2: string;
}

export interface ICurrentStringData {
	frequency: number;
	letter: string;
}
