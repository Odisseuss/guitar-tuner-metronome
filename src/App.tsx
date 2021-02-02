import React, { useState, Suspense, lazy } from "react";
import { IAppProps, IContainerGradientProps } from "./types/Interfaces";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from "./common/components/Header";
import styled from "styled-components";
import Loading from "./common/components/Loading";
const TunerContainer = lazy(() => import("./pages/tuner/TunerContainer"));
const MetronomeContainer = lazy(
  () => import("./pages/metronome/MetronomeContainer")
);

let CenteredAppContainer = styled.div<IContainerGradientProps>`
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

const App: React.FunctionComponent<IAppProps> = () => {
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
          <Suspense fallback={<Loading />}>
            <Switch>
              <Route exact path="/">
                <Header
                  navigateLocation={"/metronome"}
                  setColors={setCurrentColors}
                  menuColor={currentColors.gradient_lighter}
                />
                <TunerContainer
                  setColors={setCurrentColors}
                  currentColors={currentColors}
                />
              </Route>
              <Route path="/metronome">
                <Header
                  navigateLocation={"/"}
                  setColors={setCurrentColors}
                  menuColor={currentColors.gradient_lighter}
                />
                <MetronomeContainer primaryColor={currentColors.primary} />
              </Route>
            </Switch>
          </Suspense>
        </Router>
      </CenteredAppContainer>
    </Container>
  );
};

export default App;
