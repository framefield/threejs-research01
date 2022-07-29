import React from "react";
import StyledThreeComponent from "./style";
import ThreeCanvas from "classes/ThreeCanvas";
import AppState from "stores/App";
import { getCombinedNodeFlags } from "typescript";

interface IState {
  initialized: boolean;
}

class ThreeComponent extends React.Component<{}, IState> {
  private threeCanvasEl: React.RefObject<HTMLDivElement>;
  static contextType = AppState;

  threeCanvas: ThreeCanvas;

  constructor(props: any) {
    super(props);

    this.state = {
      initialized: false,
    };

    this.threeCanvasEl = React.createRef();
  }

  componentDidUpdate() {}

  componentDidMount() {
    if (!this.state.initialized) {
      this.init();
    }
  }

  componentWillUnmount() {
    this.threeCanvas.stopAnimationLoop();
  }

  init = () => {
    // const appState = this.context; // access to the React Context store1

    this.threeCanvas = new ThreeCanvas({
      mountPoint: this.threeCanvasEl.current,
      width: this.threeCanvasEl.current.clientWidth,
      height: this.threeCanvasEl.current.clientHeight,
    });

    this.threeCanvas.startAnimationLoop();
    this.setState({ initialized: true });
  };

  render() {
    return (
      <StyledThreeComponent
        className="threeComponent"
        initialized={this.state.initialized}
      >
        <div className="visualizationMount" ref={this.threeCanvasEl}></div>
      </StyledThreeComponent>
    );
  }
}

export default ThreeComponent;
