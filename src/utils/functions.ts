import * as React from 'react';
import Tunings, { Letters, Frequencies } from '../types/tunings.d';
import colors, { ColorSchemes } from '../types/colors.d';

export function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
	return o[propertyName];
}
export function noteFromPitch(frequency: number) {
	let noteStrings = [
		'C',
		'C#',
		'D',
		'D#',
		'E',
		'F',
		'F#',
		'G',
		'G#',
		'A',
		'A#',
		'B',
	];
	let noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
	return noteStrings[(Math.round(noteNum) + 69) % 12];
}
export function useAsyncEffect(
	fn: () => Promise<void | (() => void)>,
	dependencies?: React.DependencyList
) {
	return React.useEffect(() => {
		const destructorPromise = fn();
		return () => {
			destructorPromise.then(destructor => destructor && destructor());
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies);
}

export function determineStringBeingTuned2(
	tuning: string,
	frequency: number,
	buffer: Float32Array,
	sampleRate: number
) {
	// Get the frequencies and letters for the specific tuning
	let tuningFrequencies = getProperty(
		getProperty(
			Tunings,
			tuning as
				| 'Standard'
				| 'Drop D'
				| 'Double Drop D'
				| 'DADGAD'
				| 'Open D'
				| 'Open E'
				| 'Open G'
		),
		'frequencies'
	);
	let tuningLetters = getProperty(
		getProperty(
			Tunings,
			tuning as
				| 'Standard'
				| 'Drop D'
				| 'Double Drop D'
				| 'DADGAD'
				| 'Open D'
				| 'Open E'
				| 'Open G'
		),
		'letters'
	);
	let detectedFreq = frequency;
	let closestFreq = 0;
	let closestLetter = '-';
	let minIndex = 0;
	let minDifference = 9999;

	// This way makes the ui change very often, but still needs to be improved.
	// It seems that when a sound seems to be the same note, but a different octave, the program will consider it to be the string being tuned,
	// instead of the next note
	Object.values(tuningFrequencies).map((stringFreq, index) => {
		let offset = Math.round(sampleRate / stringFreq);

		let difference = 0;
		for (let i = 0; i < buffer.length / 2; i++) {
			difference += Math.abs(buffer[i] - buffer[i + offset]);
		}
		difference /= buffer.length / 2;
		if (
			difference < minDifference &&
			detectedFreq !== 0 &&
			Math.abs(detectedFreq - stringFreq) < 70
		) {
			minDifference = difference;
			minIndex = index;
		}
		return null;
	});
	// Get the letter note closest to the one being tuned
	closestLetter = getProperty(
		tuningLetters,
		`string_${minIndex + 1}` as keyof Letters
	);
	// Get the expected frequency of the string being tuned
	closestFreq = getProperty(
		tuningFrequencies,
		`string_${minIndex + 1}` as keyof Frequencies
	);
	// Get the current color scheme based on the note letter
	let currentColors = getProperty(
		colors,
		closestLetter as keyof ColorSchemes
	);
	return {
		currentStringBeingTuned: {
			letter: closestLetter,
			frequency: closestFreq,
		},
		currentColors: currentColors,
	};
}
export function getColorFromNote(note: string) {
	let currentColors = getProperty(colors, note as keyof ColorSchemes);
	return {
		currentColors: currentColors,
	};
}
export function determineStringBeingTuned(tuning: string, frequency: number) {
	// Get the frequencies and letters for the specific tuning
	let tuningFrequencies = getProperty(
		getProperty(
			Tunings,
			tuning as
				| 'Standard'
				| 'Drop D'
				| 'Double Drop D'
				| 'DADGAD'
				| 'Open D'
				| 'Open E'
				| 'Open G'
		),
		'frequencies'
	);
	let tuningLetters = getProperty(
		getProperty(
			Tunings,
			tuning as
				| 'Standard'
				| 'Drop D'
				| 'Double Drop D'
				| 'DADGAD'
				| 'Open D'
				| 'Open E'
				| 'Open G'
		),
		'letters'
	);
	let detectedFreq = frequency;
	let closestFreq = 0;
	let closestLetter = '-';
	let maxDifference = 9999;
	let maxVariance = 2;
	let minIndex = 0;
	console.log(detectedFreq);
	// Compute the absolute differences and figure out the minimum
	// Map over the list of string frequencies
	Object.values(tuningFrequencies).map((stringFreq, index) => {
		// Compute the difference between the one detected, and the one known
		let diff = Math.abs(detectedFreq - stringFreq);
		// If the diffrence is smaller
		if (diff < maxDifference + maxVariance && detectedFreq !== 0) {
			// We found the new minimum
			maxDifference = diff;
			// Get the index of the minimum
			minIndex = index;
			// Update the closest letter and freq
		}
		return null;
	});
	// Get the letter note closest to the one being tuned
	closestLetter = getProperty(
		tuningLetters,
		`string_${minIndex + 1}` as keyof Letters
	);
	// Get the expected frequency of the string being tuned
	closestFreq = getProperty(
		tuningFrequencies,
		`string_${minIndex + 1}` as keyof Frequencies
	);
	// Get the current color scheme based on the note letter
	let currentColors = getProperty(
		colors,
		closestLetter as keyof ColorSchemes
	);
	return {
		currentStringBeingTuned: {
			letter: closestLetter,
			frequency: closestFreq,
		},
		currentColors: currentColors,
	};
}
// export function createRulerDivs(){
// 	let rulerDivs = new Array(23).fill(0).map((line, index) => {
// 		let height;
// 		if (index === 0 || (index - 1) % 5 !== 0) {
// 			height = 60;
// 		} else {
// 			height = 110;
// 		}
// 		return (
// 			<div
// 				key={index}
// 				style={{
// 					width: '3px',
// 					height: height + 'px',
// 					backgroundColor: 'rgba(51, 51, 51, 70)',
// 				}}
// 			></div>
// 		);
// 	});
// 	let translationDistanceToLastLine =
// 		this.state.windowWidth / 2 -
// 		this.state.rulerDistanceBetweenGradings;
// 	let clampRulerToWindowCondition =
// 		(Math.abs(
// 			this.state.frequency -
// 				this.state.currentStringBeingTuned.frequency
// 		) /
// 			5) *
// 			this.state.rulerDistanceBetweenGradings >
// 		translationDistanceToLastLine;
// 	let signOfDifference =
// 		this.state.frequency -
// 			this.state.currentStringBeingTuned.frequency <
// 		0
// 			? -1
// 			: 1;
// 	let rulerTranslate =
// 		this.state.frequency !== 0
// 			? clampRulerToWindowCondition
// 				? signOfDifference * translationDistanceToLastLine
// 				: ((this.state.frequency -
// 						this.state.currentStringBeingTuned.frequency) /
// 						5) *
// 				  this.state.rulerDistanceBetweenGradings
// 			: 0;

// 	let tuningIndication;
// 	if (this.state.frequency !== 0) {
// 		if (
// 			this.state.frequency <
// 			this.state.currentStringBeingTuned.frequency
// 		) {
// 			tuningIndication = 'Tune Higher';
// 		} else if (
// 			this.state.frequency >
// 			this.state.currentStringBeingTuned.frequency
// 		) {
// 			tuningIndication = 'Tune Lower';
// 		} else {
// 			tuningIndication = 'In Tune';
// 		}
// 	} else {
// 		tuningIndication = '';
// 	}
// }
