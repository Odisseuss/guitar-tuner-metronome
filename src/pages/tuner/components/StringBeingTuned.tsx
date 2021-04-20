import * as React from 'react';
import styled from 'styled-components';

export interface StringBeingTunedProps {
	note: string;
	frequency: number;
	noteProps: NoteProps;
	toggleLiveInput: (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => void;
	isChromaticMode: boolean;
}
export interface NoteProps {
	color?: string;
}
let StyledContainer = styled.div`
	margin-top: 3rem;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;
let Superscript = styled.sup`
	font-size: 40px;
	line-height: 144px;
	font-weight: 400;
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
const StringBeingTuned: React.FunctionComponent<StringBeingTunedProps> = React.memo(
	props => {
		let note = props.note.split('');
		let renderedNote = (
			<Note color={props.noteProps.color}>{props.note}</Note>
		);
		if (note.length !== 1) {
			renderedNote = (
				<Note color={props.noteProps.color}>
					{note[0]}
					<Superscript>{note[1]}</Superscript>
				</Note>
			);
		}
		return (
			<StyledContainer
				className='string-being-tuned-container'
				onClick={props.toggleLiveInput}
			>
				{renderedNote}
				{!props.isChromaticMode && (
					<Frequency>{props.frequency}Hz</Frequency>
				)}
			</StyledContainer>
		);
	}
);

export default StringBeingTuned;
