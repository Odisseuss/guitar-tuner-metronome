import * as React from "react";
import styled from "styled-components";
import { ReactComponent as Metronome } from "../Metronome.svg";

let HeaderContainer = styled.div`
  width: 100%;
  padding-top: 30px;
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
export interface HeaderProps {}

const Header: React.FunctionComponent<HeaderProps> = () => {
  return (
    <HeaderContainer>
      <StyledMetronomeSVG fill={"#969696"} />
      <Branding>Guitune</Branding>
    </HeaderContainer>
  );
};

export default Header;
