import * as React from 'react';
import styled from 'styled-components';
import { ReactComponent as ArrowIcon } from '../../../assets/icons/play.svg';
export interface StringBeingTunedSelectorProps {
	note: string;
	frequency: number;
	noteProps: NoteProps;
	toggleLiveInput: (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => void;
	cycleCurrentStringIndex: (type: 'up' | 'down') => void;
}
export interface NoteProps {
	color?: string;
}
let StyledContainer = styled.div`
	display: flex;
	align-items: center;
	margin-top: 3rem;
`;
let NoteDisplayContaier = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;
let Note = styled.h1<NoteProps>`
	margin: 0;
	color: ${props => props.color};
	font-size: 144px;
	line-height: 144px;
	font-weight: 400;
`;
let Frequency = styled.p`
	margin: 0;
	margin-top: 20px;
	color: #777777;
	font-size: 18px;
	font-weight: 400;
`;
let LeftArrow = styled(ArrowIcon)`
	transform: rotate(180deg);
	margin: 0 20px;
`;
let StyledButton = styled.button`
	outline: none;
	background-color: transparent;
	border: none;
	cursor: pointer;
`;
let RightArrow = styled(ArrowIcon)`
	margin: 0 20px;
`;
const StringBeingTunedSelector: React.FunctionComponent<StringBeingTunedSelectorProps> = React.memo(
	props => {
		let renderedNote = (
			<Note color={props.noteProps.color}>{props.note}</Note>
		);
		return (
			<StyledContainer>
				<StyledButton
					onClick={() => props.cycleCurrentStringIndex('down')}
				>
					<LeftArrow fill={props.noteProps.color} />
				</StyledButton>
				<NoteDisplayContaier onClick={props.toggleLiveInput}>
					{renderedNote}
					<Frequency>{props.frequency}Hz</Frequency>
				</NoteDisplayContaier>
				<StyledButton
					onClick={() => props.cycleCurrentStringIndex('up')}
				>
					<RightArrow fill={props.noteProps.color} />
				</StyledButton>
			</StyledContainer>
		);
	}
);

export default StringBeingTunedSelector;
