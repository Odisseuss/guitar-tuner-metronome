import React, { useState } from "react";
import Tuner from "./components/Tuner";
import { AppProps, ContainerGradientProps } from "./Interfaces";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Metronome from "./components/Metronome";
import Header from "./components/Header";
import styled from "styled-components";
import colors from "./colors";

let CenteredAppContainer = styled.div<ContainerGradientProps>`
  max-width: 650px;
  max-height: 850px;
  width: 100%;
  height: 100%;
  position: relative;
  background: radial-gradient(
    72.19% 72.19% at 49.92% 27.81%,
    ${(props) => props.color_1} 0%,
    ${(props) => props.color_1} 0.01%,
    ${(props) => props.color_2} 100%
  );
`;
let Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #111;
`;

const App: React.FunctionComponent<AppProps> = () => {
  let [currentColors, setCurrentColors] = useState({
    primary: "#F72640",
    gradient_darker: "#0F0910",
    gradient_lighter: "#1F0E18",
  });

  return (
    <Container>
      <CenteredAppContainer
        color_1={currentColors.gradient_lighter}
        color_2={currentColors.gradient_darker}
      >
        <Router>
          <Switch>
            <Route exact path="/">
              <Header
                navigateLocation={"/metronome"}
                setColors={setCurrentColors}
              />
              <Tuner
                setColors={setCurrentColors}
                currentColors={currentColors}
              />
            </Route>
            <Route path="/metronome">
              <Header navigateLocation={"/"} setColors={setCurrentColors} />
              <Metronome primaryColor={currentColors.primary} />
            </Route>
          </Switch>
        </Router>
      </CenteredAppContainer>
    </Container>
  );
};

export default App;
