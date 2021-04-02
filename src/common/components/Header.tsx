import * as React from 'react';
import styled from 'styled-components';
import { ReactComponent as Metronome } from '../../assets/icons/Metronome.svg';
import { ReactComponent as Settings } from '../../assets/icons/settings.svg';
import { Link, useLocation } from 'react-router-dom';
import useOutsideAlerter from '../../utils/hooks/useOutsideClickAlert';
let HeaderContainer = styled.div`
	height: 10%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;
let Branding = styled.h1`
	font-size: 18px;
	font-weight: 500;
	text-transform: uppercase;
	display: inline-block;
`;
let DropDown = styled.div`
	background-color: #202124;
	border-width: 0;
	box-shadow: 0 1px 2px 0 rgb(0 0 0 / 30%), 0 2px 6px 2px rgb(0 0 0 / 15%);
	position: absolute;
	top: 100%;
	right: 0;
	z-index: 9999;
	opacity: 0;
	transition: opacity 0.2s;
`;
let DropDownItem = styled.span`
	border: 1px solid transparent;
	font-size: 0.875rem;
	font-weight: 400;
	padding-left: 15px;
	padding: 10px;
	min-width: 110px;
	position: relative;
	color: #fff;
	cursor: pointer;
	margin: 0;
	display: flex;
	align-items: center;
	white-space: nowrap;

	& button {
		cursor: pointer;
		background: transparent;
		color: white;
		border: none;
		outline: none;
	}
	&:hover {
		border: 1px solid white;
	}
`;
let StyledMetronomeSVG = styled(Metronome)`
	position: absolute;
	left: 30px;
	transition: fill 0.2s;
`;
let StyledSettingsSvg = styled(Settings)`
	transition: all 0.2s;
`;
export interface HeaderProps {
	navigateLocation: string;
	menuColor: string;
	setColors: React.Dispatch<
		React.SetStateAction<{
			primary: string;
			gradient_darker: string;
			gradient_lighter: string;
		}>
	>;
	handleStartTapTempo?: (action: string) => void;
	cycleNoteType?: () => void;
	tapTempoActive?: boolean;
	toggleChromaticMode?: () => void;
	chromaticMode?: () => void;
	toggleManualStringSelectionMode?: () => void;
}

const Header: React.FunctionComponent<HeaderProps> = ({
	setColors,
	navigateLocation,
	menuColor,
	handleStartTapTempo,
	cycleNoteType,
	tapTempoActive,
	toggleChromaticMode,
	chromaticMode,
	toggleManualStringSelectionMode,
}) => {
	let [showMenu, setShowMenu] = React.useState(false);
	let dropDownRef = React.useRef(null);

	let location = useLocation();
	React.useEffect(() => {
		let colors =
			location.pathname === '/'
				? {
						primary: '#F72640',
						gradient_darker: '#0F0910',
						gradient_lighter: '#1F0E18',
				  }
				: {
						primary: '#FFFFFF',
						gradient_darker: '#0F0F0F',
						gradient_lighter: '#282828',
				  };
		setColors(colors);
	}, [location.pathname, setColors]);
	const toggleMenu = () => {
		setShowMenu(!showMenu);
	};
	const hideMenu = () => {
		setShowMenu(false);
	};
	const renderDropdownItems = () => {
		return location.pathname === '/' ? (
			<>
				<DropDownItem>Tutorial</DropDownItem>
				<DropDownItem
					onClick={() => {
						if (toggleChromaticMode && chromaticMode) {
							toggleChromaticMode();
						}
					}}
				>
					Chromatic Mode
				</DropDownItem>
				<DropDownItem
					onClick={() => {
						if (toggleManualStringSelectionMode) {
							toggleManualStringSelectionMode();
						}
					}}
				>
					Manual String Selection
				</DropDownItem>
			</>
		) : (
			<>
				<DropDownItem
					onClick={() => {
						if (handleStartTapTempo && tapTempoActive != undefined)
							!tapTempoActive
								? handleStartTapTempo('start')
								: handleStartTapTempo('stop');
					}}
				>
					Tap Tempo
				</DropDownItem>
				<DropDownItem
					onClick={() => {
						if (cycleNoteType) cycleNoteType();
					}}
				>
					Note Type
				</DropDownItem>
			</>
		);
	};
	useOutsideAlerter(dropDownRef, hideMenu);
	return (
		<HeaderContainer>
			<Link
				to={navigateLocation}
				style={{
					height: '100%',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<StyledMetronomeSVG
					fill={navigateLocation === '/' ? '#FFFFFF' : '#969696'}
				/>
			</Link>

			<Branding>Guitune</Branding>
			<div
				style={{ position: 'absolute', right: '30px' }}
				ref={dropDownRef}
			>
				<button
					style={{
						outline: 'none',
						border: 'none',
						background: 'transparent',
						padding: 0,
					}}
					onClick={toggleMenu}
				>
					<StyledSettingsSvg
						fill={showMenu ? '#FFFFFF' : '#969696'}
					/>
				</button>
				<DropDown
					className='dropdown'
					style={{
						background: menuColor,
						opacity: showMenu ? 1 : 0,
						zIndex: showMenu ? 9999 : -100,
					}}
				>
					{renderDropdownItems()}
				</DropDown>
			</div>
		</HeaderContainer>
	);
};

export default Header;
