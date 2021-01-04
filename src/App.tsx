import React from "react";
import Tuner from "./components/Tuner";
import { AppProps, AppState } from "./Interfaces";
class App extends React.Component<AppProps, AppState> {
  render() {
    return <Tuner></Tuner>;
  }
}

export default App;
