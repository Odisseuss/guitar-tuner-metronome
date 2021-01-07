import * as React from "react";
import styled from "styled-components";
import { ReactComponent as Metronome } from "../Metronome.svg";
import { Link } from "react-router-dom";
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
let StyledMetronomeSVG = styled(Metronome)`
  position: absolute;
  left: 30px;
`;
export interface HeaderProps {
  navigateLocation: string;
}

const Header: React.FunctionComponent<HeaderProps> = (props) => {
  return (
    <HeaderContainer>
      <Link to={props.navigateLocation}>
        <StyledMetronomeSVG fill={"#969696"} />
      </Link>
      <Branding>Guitune</Branding>
    </HeaderContainer>
  );
};

export default Header;
