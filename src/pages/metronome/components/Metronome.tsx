import * as React from 'react';
import CircularSlider from '../../../common/containers/CircularSlider';
import styled, { css, keyframes } from 'styled-components';
import MetronomeMeasureButton from './MetronomeMeasureButtons';
import { IMetronomeProps } from '../../../types/Interfaces';
import { ReactComponent as TapIcon } from '../../../assets/icons/Tap.svg';
//@ts-ignore
import { Steps, Hints } from 'intro.js-react';
let Container = styled.div`
	width: 100%;
	height: 90%;
	display: flex;
	flex-direction: column;
	padding-top: 18%;
	justify-content: space-around;
	align-items: center;
	margin-top: -120px;

	@media (max-width: 500px) {
		padding-top: 25%;
	}
`;
const hvrBackPulseKeyframes = keyframes`
    10% {
        transform: scale(0.9) translateY(-10px)
    }
	100%{
		transform: scale(1)
	}
`;
const hvrBackPulseAnimation = css`
	-webkit-animation: ${hvrBackPulseKeyframes} 0.8s linear infinite;
	animation: ${hvrBackPulseKeyframes} 0.8s linear infinite;
`;
let StyledTapIcon = styled(TapIcon)`
	${hvrBackPulseAnimation}
`;
const Metronome: React.FunctionComponent<IMetronomeProps> = ({
	beatsPerMeasure,
	handleSliderInputChange,
	primaryColor,
	setBeatsPerMeasure,
	tempo,
	play,
	setNoteType,
	handleTapTempo,
	isPlaying,
	tapTempoActive,
}) => {
	return (
		<Container
			onMouseDown={() => handleTapTempo('press')}
			onMouseUp={() => handleTapTempo('release')}
			onTouchStart={() => handleTapTempo('press')}
			onTouchEnd={() => handleTapTempo('release')}
		>
			<CircularSlider
				label='Tempo'
				labelColor={primaryColor}
				labelFontSize='0px'
				valueFontSize={'100px'}
				verticalOffset={'2rem'}
				progressColorFrom={primaryColor}
				progressColorTo={primaryColor}
				progressSize={35}
				knobColor='#777777'
				knobSize={85}
				trackColor='#96969633'
				trackSize={35}
				width={320}
				data={[...Array(261).keys()].slice(30)}
				dataIndex={tempo - 30}
				onChange={(value: string) => {
					handleSliderInputChange(parseInt(value));
				}}
			/>
			{tapTempoActive ? (
				<StyledTapIcon style={{ height: '80px' }} />
			) : (
				<MetronomeMeasureButton
					isPlaying={isPlaying}
					beatsPerMeasure={beatsPerMeasure}
					setBeatsPerMeasure={setBeatsPerMeasure}
					playMetronome={play}
				/>
			)}
		</Container>
	);
};

export default Metronome;
