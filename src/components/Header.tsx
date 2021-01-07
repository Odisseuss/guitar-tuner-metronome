import * as React from "react";
import styled from "styled-components";
import { ReactComponent as Metronome } from "../Metronome.svg";
import { Link, useLocation } from "react-router-dom";
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
  setColors: React.Dispatch<
    React.SetStateAction<{
      primary: string;
      gradient_darker: string;
      gradient_lighter: string;
    }>
  >;
}

const Header: React.FunctionComponent<HeaderProps> = ({
  setColors,
  navigateLocation,
}) => {
  let location = useLocation();
  React.useEffect(() => {
    let colors =
      location.pathname === "/"
        ? {
            primary: "#F72640",
            gradient_darker: "#0F0910",
            gradient_lighter: "#1F0E18",
          }
        : {
            primary: "#FFFFFF",
            gradient_darker: "#0F0F0F",
            gradient_lighter: "#282828",
          };
    setColors(colors);
  }, [location.pathname, setColors]);
  return (
    <HeaderContainer>
      <Link
        to={navigateLocation}
        style={{ height: "100%", display: "flex", alignItems: "center" }}
      >
        <StyledMetronomeSVG
          fill={navigateLocation === "/" ? "#FFFFFF" : "#969696"}
        />
      </Link>
      <Branding>Guitune</Branding>
    </HeaderContainer>
  );
};

export default Header;
