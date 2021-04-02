import React from 'react';
import styled from 'styled-components';
import { ISVGProps, ITunerProps } from '../../../types/Interfaces';
import { ReactComponent as Wave } from '../../../assets/icons/Wave.svg';
import Ruler from './Ruler';
import StringBeingTuned from './StringBeingTuned';
import TuningSelectionButtons from './TuningSelectionButtons';
import { ReactComponent as Play } from '../../../assets/icons/play.svg';
import StringBeingTunedSelector from './StringBeingTunedSelector';
let SVGContainer = styled.div`
	width: 100%;
	height: 45%;
	position: absolute;
	bottom: 0;
`;
let StyledWaveSvg = styled(Wave)<ISVGProps>`
	width: 100%;
	height: 100%;
	position: absolute;
	max-height: 373px;
	--color-1: ${props => props.color_1};
	--color-2: ${props => props.color_2};
	filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.15));
`;

const Tuner: React.FunctionComponent<ITunerProps> = ({
	handleTuningSelection,
	toggleLiveInput,
	startOscillator,
	currentStringBeingTuned,
	currentColors,
	frequency,
	rulerDivs,
	rulerTranslate,
	tuningIndication,
	timeToCompute,
	isChromaticMode,
	currentNote,
	isManualStringSelectionMode,
	cycleCurrentStringIndex,
}: ITunerProps) => {
	return (
		<div style={{ height: '90%', width: '100%', position: 'relative' }}>
			<TuningSelectionButtons
				onClick={handleTuningSelection}
				isChromaticMode={isChromaticMode}
			/>
			{/* <button onClick={startOscillator}>Oscillator</button> */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'column',
				}}
			>
				{isManualStringSelectionMode ? (
					<StringBeingTunedSelector
						note={
							isChromaticMode
								? currentNote
								: currentStringBeingTuned.letter
						}
						frequency={currentStringBeingTuned.frequency}
						noteProps={{ color: currentColors.primary }}
						toggleLiveInput={toggleLiveInput}
						cycleCurrentStringIndex={cycleCurrentStringIndex}
					/>
				) : (
					<StringBeingTuned
						note={
							isChromaticMode
								? currentNote
								: currentStringBeingTuned.letter
						}
						frequency={currentStringBeingTuned.frequency}
						noteProps={{ color: currentColors.primary }}
						toggleLiveInput={toggleLiveInput}
					/>
				)}
			</div>

			<SVGContainer>
				<h1
					style={{
						position: 'absolute',
						width: '100%',
						top: '45%',
						fontWeight: 400,
						fontSize: 18,
						textAlign: 'center',
						zIndex: 100,
						color: currentColors.primary,
					}}
				>
					{frequency}Hz
				</h1>
				<h1
					style={{
						position: 'absolute',
						width: '100%',
						top: '55%',
						fontWeight: 400,
						fontSize: 18,
						textAlign: 'center',
						zIndex: 100,
						color: currentColors.primary,
					}}
				>
					{tuningIndication}
				</h1>
				{/* <h1
					style={{
						position: 'absolute',
						width: '100%',
						top: '55%',
						fontWeight: 400,
						fontSize: 18,
						textAlign: 'center',
						zIndex: 100,
						color: currentColors.primary,
					}}
				>
					{timeToCompute}
				</h1> */}
				{!isChromaticMode && (
					<Ruler
						rulerGradings={rulerDivs}
						gradingColors={currentColors.primary}
						rulerTranslate={rulerTranslate}
					/>
				)}
				<StyledWaveSvg
					color_1={currentColors.gradient_lighter}
					color_2={currentColors.gradient_darker}
					style={{ position: 'absolute', bottom: 0, left: 0 }}
				/>
			</SVGContainer>
		</div>
	);
};

export default Tuner;
