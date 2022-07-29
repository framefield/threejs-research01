import styled from 'styled-components'

interface IProps {
  initialized: boolean
}

export default styled.div<IProps>`
  height: 100vh;
  width: 100vw;

  canvas {
    width: 100vw !important;
    height: 100vh !important;
    opacity: 1;
  }

  .css3dRenderer {
    border: 1px solid red;
    position: fixed;
    top: 0;
    pointer-events: none;

    .sprite {
      pointer-events: none;
      width: 200px;
      height: 100px;
      font-size: 50px;
      // box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.5);
      border: 1px solid rgba(127, 255, 255, 0.25);
      font-family: Helvetica, sans-serif;
      text-align: center;
      line-height: normal;
      cursor: default;
      text-transform: uppercase;
      font-weight: bold;
      opacity: 0.2;
    }
  }
`
