import * as React from "react";
import styled from "styled-components";
import { ReactComponent as Metronome } from "../../icons/Metronome.svg";
import { ReactComponent as Settings } from "../../icons/settings.svg";
import { Link, useLocation } from "react-router-dom";
import useOutsideAlerter from "../../utils/hooks/useOutsideClickAlert";
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
  width: 150px;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.2s;
`;
let DropDownItem = styled.div`
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 400;
  padding: 10px 15px;
  position: relative;
  color: #333;
  cursor: pointer;
  margin: 0;
  display: flex;
  align-items: center;

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
}

const Header: React.FunctionComponent<HeaderProps> = ({
  setColors,
  navigateLocation,
  menuColor,
}) => {
  let [showMenu, setShowMenu] = React.useState(false);
  let dropDownRef = React.useRef(null);

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
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  const hideMenu = () => {
    setShowMenu(false);
  };
  useOutsideAlerter(dropDownRef, hideMenu);
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
      <div style={{ position: "absolute", right: "30px" }} ref={dropDownRef}>
        <button
          style={{
            outline: "none",
            border: "none",
            background: "transparent",
          }}
          onClick={toggleMenu}
        >
          <StyledSettingsSvg fill={showMenu ? "#FFFFFF" : "#969696"} />
        </button>
        <DropDown
          className="dropdown"
          style={{
            background: menuColor,
            opacity: showMenu ? 1 : 0,
            zIndex: showMenu ? 9999 : -100,
          }}
        >
          <DropDownItem>
            <button>Item 1</button>
          </DropDownItem>
          <DropDownItem>
            <button>Item 2</button>
          </DropDownItem>
          <DropDownItem>
            <button>Item 3</button>
          </DropDownItem>
        </DropDown>
      </div>
    </HeaderContainer>
  );
};

export default Header;
