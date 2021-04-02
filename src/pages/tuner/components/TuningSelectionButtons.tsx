import * as React from 'react';
import styled from 'styled-components';
import Button from './Button';
import tunings from '../../../types/tunings.d';
import { useHorizontalScroll } from '../../../utils/hooks/useHorizontalScroll';

let StyledContainer = styled.div`
	width: calc(100% - 30px);
	overflow-x: auto;
	padding-left: 15px;
	padding-top: 30px;
	display: flex;
	align-items: center;
	white-space: nowrap;
	::-webkit-scrollbar {
		width: 0px;
	}
`;
export interface ButtonsProps {
	onClick: (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
		tuning: string
	) => void;
	isChromaticMode: boolean;
}
let Tunings = Object.keys(tunings);
const TuningSelectionButtons: React.FunctionComponent<ButtonsProps> = React.memo(
	props => {
		const scrollRef = useHorizontalScroll()
		let [selected, setSelected] = React.useState(0);
		let buttons = Tunings.map((tuning, index) => {
			let isSelected = index === selected;
			return (
				<Button
					key={index}
					selected={isSelected}
					onClick={event => {
						props.onClick(event, tuning);
						setSelected(index);
					}}
				>
					{tuning}
				</Button>
			);
		});
		return (
			<StyledContainer
			//@ts-ignore
			    ref={scrollRef}
				style={{
					visibility: props.isChromaticMode ? 'hidden' : 'visible',
				}}
			>
				{buttons}
			</StyledContainer>
		);
	}
);

export default TuningSelectionButtons;
