import React from 'react';
import {
	determineStringBeingTuned,
	getColorFromNote,
	getCurrentStringBeingTuned,
	noteFromPitch,
} from '../../utils/functions';
import { autocorellation, YIN } from '../../utils/detectors';
import {
	ITunerContainerState,
	ITunerContainerProps,
} from '../../types/Interfaces';
import { AudioContext } from 'standardized-audio-context';
import Tuner from './components/Tuner';
import Header from '../../common/components/Header';
import { context } from '../../utils/context';
import colors from '../../types/colors.d';
import { Howl } from 'howler';
//@ts-ignore
import { Steps } from 'intro.js-react';
import { tunerSteps } from '../../utils/introSteps';

class TunerContainer extends React.Component<
	ITunerContainerProps,
	ITunerContainerState
> {
	yinDetector: any;
	dingSound: Howl;
	constructor(props: ITunerContainerProps) {
		super(props);
		this.state = {
			analyser: undefined,
			audioContext: undefined,
			buffer: new Float32Array(4096),
			frequency: 0,
			note: '-',
			mediaStreamSource: undefined,
			isPlaying: false,
			requestAnimationFrameID: undefined,
			currentTuning: 'Standard',
			currentStringBeingTuned: { frequency: 0, letter: '-' },
			windowWidth: 650,
			rulerDistanceBetweenGradings: 27.083333333333332,
			sameFrequencyCounter: 0,
			isChromatic: false,
			isManualStringSelectionMode: false,
			currentStringBeingTunedIndex: 1,
			shouldPlaySound: true,
			tutorialEnabled: false,
		};
		this.gotStream = this.gotStream.bind(this);
		this.findPitch = this.findPitch.bind(this);
		this.findPitchWithYIN = this.findPitchWithYIN.bind(this);
		this.liveInput = this.liveInput.bind(this);
		this.handleTuningSelection = this.handleTuningSelection.bind(this);
		this.toggleChromaticMode = this.toggleChromaticMode.bind(this);
		this.chromaticMode = this.chromaticMode.bind(this);
		this.liveInputModePicker = this.liveInputModePicker.bind(this);
		this.toggleManualStringSelectionMode = this.toggleManualStringSelectionMode.bind(
			this
		);
		this.cycleCurrentStringIndex = this.cycleCurrentStringIndex.bind(this);
		this.dingSound = new Howl({
			src: ['/Ding.mp3'],
			volume: 0.5,
		});
		this.setTutorialEnabled = this.setTutorialEnabled.bind(this);
	}
	// Resize the ruler spacing on window resize
	componentDidMount() {
		window.addEventListener('resize', event => {
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
	toggleChromaticMode() {
		if (this.state.requestAnimationFrameID)
			cancelAnimationFrame(this.state.requestAnimationFrameID);
		this.setState(prevState => ({
			isPlaying: false,
			isChromatic: !prevState.isChromatic,
			isManualStringSelectionMode: false,
		}));
	}
	toggleManualStringSelectionMode() {
		this.setState(prevState => ({
			isManualStringSelectionMode: !prevState.isManualStringSelectionMode,
			isChromatic: false,
		}));
	}
	// Callback for initializing the stream source and running the find pitch algorithm
	gotStream(stream: MediaStream, liveInputModeCallback: () => void) {
		let volume;
		let mediaStreamSource;
		let newAnalyser = this.state.analyser;
		if (newAnalyser) newAnalyser.fftSize = 16384;
		if (this.state.audioContext) {
			volume = this.state.audioContext.createGain();
			volume.gain.value = 4;
			mediaStreamSource = this.state.audioContext.createMediaStreamSource(
				stream
			);

			mediaStreamSource.connect(volume);
			if (newAnalyser) volume.connect(newAnalyser);
		}
		this.setState({
			mediaStreamSource: mediaStreamSource,
			analyser: newAnalyser,
			isPlaying: true,
		});
		liveInputModeCallback();
	}

	async findPitchWithYIN() {
		if (this.state.isPlaying) {
			if (this.state.analyser) {
				let buffer = new Float32Array(4096);
				this.state.analyser.getFloatTimeDomainData(buffer);
				this.setState({ buffer: buffer });
			}

			let ac = 0;
			if (this.state.audioContext) {
				let yin = await YIN();
				if (yin)
					ac = yin(
						this.state.buffer,
						0.5,
						this.state.audioContext.sampleRate,
						0.9
					);
			}
			if (ac > 30 && ac < 1048) {
				let pitch = Math.round(ac);
				let absoluteDiffOfFreq = Math.abs(
					this.state.currentStringBeingTuned.frequency - pitch
				);
				if (absoluteDiffOfFreq >= 1 && absoluteDiffOfFreq < 2) {
					pitch = this.state.frequency;
				}
				this.setState({
					frequency: pitch,
					note: noteFromPitch(pitch),
				});
				if (pitch === this.state.currentStringBeingTuned.frequency) {
					this.setState(prevState => {
						if (prevState.sameFrequencyCounter + 1 === 10) {
							let shouldPlaySound = prevState.shouldPlaySound;
							if (shouldPlaySound) {
								shouldPlaySound = false;
								this.dingSound.play();
							}
							return {
								sameFrequencyCounter: 0,
								shouldPlaySound,
							};
						}
						return {
							sameFrequencyCounter:
								prevState.sameFrequencyCounter + 1,
							shouldPlaySound: prevState.shouldPlaySound,
						};
					});
				} else {
					this.setState({
						sameFrequencyCounter: 0,
					});
				}
			} else if (ac !== -1) {
				this.setState({ frequency: 0, note: '-' });
			}
			let rafID = window.requestAnimationFrame(() =>
				this.setStringCurrentlyBeingTuned(
					this.state.currentTuning,
					this.findPitchWithYIN
				)
			);
			this.setState(prevState => ({
				requestAnimationFrameID:
					prevState.requestAnimationFrameID !== undefined
						? prevState.requestAnimationFrameID
						: rafID,
			}));
		}
	}
	findPitch() {
		if (this.state.analyser) {
			let buffer = new Float32Array(2048);
			this.state.analyser.getFloatTimeDomainData(buffer);
			this.setState({ buffer: buffer });
		}

		let ac = 0;
		if (this.state.audioContext)
			ac = autocorellation(
				this.state.buffer,
				this.state.audioContext.sampleRate
			);

		if (ac !== -1) {
			let pitch = ac;
			this.setState({
				frequency: Math.floor(pitch),
				note: noteFromPitch(pitch),
			});
		} else {
			this.setState({ frequency: 0, note: '-' });
		}
		let rafID = window.requestAnimationFrame(() =>
			this.setStringCurrentlyBeingTuned(
				this.state.currentTuning,
				this.findPitch
			)
		);
		this.setState(prevState => ({
			requestAnimationFrameID:
				prevState.requestAnimationFrameID !== undefined
					? prevState.requestAnimationFrameID
					: rafID,
		}));
	}
	liveInputModePicker() {
		if (this.state.isChromatic) {
			this.liveInput(this.chromaticMode);
		} else {
			this.liveInput(this.findPitchWithYIN);
		}
	}
	async chromaticMode() {
		if (this.state.isPlaying) {
			if (this.state.analyser) {
				let buffer = new Float32Array(2048);
				this.state.analyser.getFloatTimeDomainData(buffer);
				this.setState({ buffer: buffer });
			}

			let ac = 0;
			if (this.state.audioContext) {
				let yin = await YIN();
				if (yin)
					ac = yin(
						this.state.buffer,
						0.5,
						this.state.audioContext.sampleRate,
						0.9
					);
			}
			if (ac !== -1 && ac > 30 && ac < 2000) {
				let pitch = Math.round(ac);
				this.setState({
					frequency: pitch,
					note: noteFromPitch(pitch),
				});
			} else {
				this.setState({ frequency: 0, note: '-' });
			}
			let rafID = window.requestAnimationFrame(() =>
				this.setColorsFromNote(
					noteFromPitch(Math.round(ac)),
					this.chromaticMode
				)
			);
			this.setState(prevState => ({
				requestAnimationFrameID:
					prevState.requestAnimationFrameID !== undefined
						? prevState.requestAnimationFrameID
						: rafID,
			}));
		}
	}
	setColorsFromNote(note: string, callback: FrameRequestCallback) {
		if (this.state.frequency !== 0 && this.state.audioContext) {
			let colors = getColorFromNote(note);
			this.props.setColors(colors.currentColors);
		}
		setTimeout(() => {
			requestAnimationFrame(callback);
		}, 25);
	}
	setStringCurrentlyBeingTuned(
		tuning: string,
		callback: FrameRequestCallback
	) {
		if (this.state.isManualStringSelectionMode) {
			let result = getCurrentStringBeingTuned(
				this.state.currentStringBeingTunedIndex,
				tuning
			);
			this.props.setColors(result.currentColors);
			this.setState({
				currentStringBeingTuned: result.currentStringBeingTuned,
			});
		} else {
			if (this.state.frequency !== 0 && this.state.audioContext) {
				let result = determineStringBeingTuned(
					tuning,
					this.state.frequency
				);

				this.props.setColors(result.currentColors);
				let shouldPlaySound = this.state.shouldPlaySound;
				if (
					result.currentStringBeingTuned.letter !==
					this.state.currentStringBeingTuned.letter
				) {
					shouldPlaySound = true;
				}
				this.setState({
					currentStringBeingTuned: result.currentStringBeingTuned,
					shouldPlaySound,
				});
			}
		}
		setTimeout(() => {
			requestAnimationFrame(callback);
		}, 25);
	}
	liveInput(liveInputMode: () => void) {
		if (this.state.isPlaying) {
			//stop playing and return
			if (this.state.requestAnimationFrameID) {
				window.cancelAnimationFrame(this.state.requestAnimationFrameID);
			}
			this.props.setColors({
				primary: colors.A.primary,
				gradient_lighter: colors.A.gradient_lighter,
				gradient_darker: colors.A.gradient_darker,
			});
			this.setState({
				isPlaying: false,
				analyser: undefined,
				frequency: 0,
				note: '-',
			});
		} else {
			let context = new AudioContext({ sampleRate: 44100 });
			this.setState({
				audioContext: context,
				analyser: context.createAnalyser(),
				isPlaying: true,
			});
			navigator.mediaDevices
				.getUserMedia({
					audio: {
						autoGainControl: false,
						noiseSuppression: false,
					},
				})
				.then(stream => this.gotStream(stream, liveInputMode))
				.catch(err => {
					console.log('Getusermedia threw error: ' + err);
				});
		}
	}
	handleTuningSelection(
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
		tuning: string
	) {
		this.setState({ currentTuning: tuning });
	}
	cycleCurrentStringIndex(type: 'up' | 'down') {
		switch (type) {
			case 'up':
				this.setState(prevState => {
					return {
						currentStringBeingTunedIndex:
							(prevState.currentStringBeingTunedIndex % 6) + 1,
					};
				});
				break;
			case 'down':
				this.setState(prevState => {
					let wrapAround =
						prevState.currentStringBeingTunedIndex === 1
							? 6
							: prevState.currentStringBeingTunedIndex - 1;
					return {
						currentStringBeingTunedIndex: wrapAround,
					};
				});
				break;
			default:
				break;
		}
	}
	setTutorialEnabled() {
		this.setState({ tutorialEnabled: true });
	}
	renderRulerDivs() {
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
						width: '3px',
						height: height + 'px',
						backgroundColor: 'rgba(51, 51, 51, 70)',
					}}
				></div>
			);
		});
		let translationDistanceToLastLine =
			this.state.windowWidth / 2 -
			this.state.rulerDistanceBetweenGradings;
		let clampRulerToWindowCondition =
			(Math.abs(
				this.state.frequency -
					this.state.currentStringBeingTuned.frequency
			) /
				5) *
				this.state.rulerDistanceBetweenGradings >
			translationDistanceToLastLine;
		let signOfDifference =
			this.state.frequency -
				this.state.currentStringBeingTuned.frequency <
			0
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

		return { rulerDivs: rulerDivs, rulerTranslate: rulerTranslate };
	}
	renderTuningIndication() {
		if (this.state.frequency !== 0) {
			if (
				this.state.frequency <
				this.state.currentStringBeingTuned.frequency
			) {
				return 'Tune Higher';
			} else if (
				this.state.frequency >
				this.state.currentStringBeingTuned.frequency
			) {
				return 'Tune Lower';
			} else {
				return 'In Tune';
			}
		} else {
			return '';
		}
	}
	render() {
		let { rulerDivs, rulerTranslate } = this.renderRulerDivs();
		let tuningIndication = this.renderTuningIndication();

		let tutorialEnabled =
			this.state.tutorialEnabled ||
			localStorage.getItem('TUNER_TUTORIAL_COMPLETE') !== 'true';
		return (
			<context.Provider value={this.state.isChromatic}>
				<React.Fragment>
					<Steps
						enabled={tutorialEnabled}
						steps={tunerSteps}
						initialStep={0}
						onExit={() => {
							localStorage.setItem(
								'TUNER_TUTORIAL_COMPLETE',
								'true'
							);
							this.setState({ tutorialEnabled: false });
						}}
					/>
					<Header
						navigateLocation={'/metronome'}
						setColors={this.props.setColors}
						menuColor={this.props.currentColors.gradient_lighter}
						toggleChromaticMode={this.toggleChromaticMode}
						toggleManualStringSelectionMode={
							this.toggleManualStringSelectionMode
						}
						setTutorialEnabled={this.setTutorialEnabled}
					/>
					<Tuner
						currentColors={this.props.currentColors}
						currentStringBeingTuned={
							this.state.currentStringBeingTuned
						}
						currentNote={this.state.note}
						frequency={this.state.frequency}
						handleTuningSelection={this.handleTuningSelection}
						rulerDivs={rulerDivs}
						rulerTranslate={rulerTranslate}
						toggleLiveInput={this.liveInputModePicker}
						tuningIndication={tuningIndication}
						isChromaticMode={this.state.isChromatic}
						isManualStringSelectionMode={
							this.state.isManualStringSelectionMode
						}
						cycleCurrentStringIndex={this.cycleCurrentStringIndex}
					/>
				</React.Fragment>
			</context.Provider>
		);
	}
}
TunerContainer.contextType = context;

export default TunerContainer;
