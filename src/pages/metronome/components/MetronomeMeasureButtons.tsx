import * as React from 'react';
import styled from 'styled-components';

let ColumnContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;
let RowContainer = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;
let MeasureIndicator = styled.div`
	font-weight: 500;
	font-size: 18px;
	color: #fff;
	border-radius: 66px;
	outline: none;
	border: none;
	padding: 10px 60px;
	background-color: rgba(150, 150, 150, 0.2);
	margin: 0px 10px;
`;
let StyledButton = styled.button`
	font-weight: 900;
	width: 10%;
	font-size: 48px;
	line-height: 48px;
	color: #fff;
	outline: none;
	border: none;
	background-color: transparent;
	margin: 0px 10px;
`;
export interface MetronomeMeasureButtonsProps {
	beatsPerMeasure: number;
	setBeatsPerMeasure: (beatsPerMeasure: number) => void;
	playMetronome: () => 'stop' | 'play';
	isPlaying: boolean;
}

const MetronomeMeasureButtons: React.FunctionComponent<MetronomeMeasureButtonsProps> = ({
	beatsPerMeasure,
	setBeatsPerMeasure,
	playMetronome,
	isPlaying,
}) => {
	return (
		<ColumnContainer className='metronome-controls-container'>
			<h2 style={{ textAlign: 'center' }}>Beats</h2>
			<RowContainer>
				<StyledButton
					style={{ marginTop: -10 }}
					onClick={() => {
						if (beatsPerMeasure > 1)
							setBeatsPerMeasure(beatsPerMeasure - 1);
					}}
				>
					-
				</StyledButton>
				<MeasureIndicator>{beatsPerMeasure}</MeasureIndicator>
				<StyledButton
					onClick={() => {
						if (beatsPerMeasure < 12)
							setBeatsPerMeasure(beatsPerMeasure + 1);
					}}
				>
					+
				</StyledButton>
			</RowContainer>
			<StyledButton
				style={{
					fontSize: 24,
					marginBottom: '-50px',
					width: 'auto',
					borderRadius: 66,
					outline: 'none',
					padding: '10px 60px',
					textAlign: 'center',
				}}
				onClick={() => {
					playMetronome();
				}}
			>
				{isPlaying === true ? 'Stop' : 'Start'}
			</StyledButton>
		</ColumnContainer>
	);
};

export default MetronomeMeasureButtons;
