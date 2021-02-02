import React from "react";
import PropTypes from "prop-types";

const Knob = ({
  isDragging,
  knobPosition,
  knobColor,
  knobSize,
  hideKnob,
  onMouseDown,
  trackSize,
  children,
}) => {
  const styles = {
    knob: {
      position: "absolute",
      left: `-${knobSize / 2 - trackSize / 2}px`,
      top: `-${knobSize / 2 - trackSize / 2}px`,
      cursor: "grab",
      zIndex: 3,
    },

    dragging: {
      cursor: "grabbing",
    },

    pause: {
      animationPlayState: "paused",
    },

    hide: {
      opacity: 0,
    },
  };

  const defaultKnobIcon = () => {
    return (
      <svg
        width={`${knobSize}px`}
        height={`${knobSize}px`}
        viewBox={`0 0 36 36`}
      ></svg>
    );
  };

  const customKnobIcon = () => children;

  return (
    <div
      style={{
        transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
        ...styles.knob,
        ...(isDragging && styles.dragging),
        ...(hideKnob && styles.hide),
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
    >
      <svg
        width={`${knobSize}px`}
        height={`${knobSize}px`}
        viewBox={`0 0 ${knobSize} ${knobSize}`}
      >
        <circle
          fill={knobColor}
          stroke="none"
          cx={knobSize / 2}
          cy={knobSize / 2}
          r={(knobSize * 2) / 3 / 2}
        />
        {children ? customKnobIcon() : defaultKnobIcon()}
      </svg>
    </div>
  );
};

Knob.propTypes = {
  isDragging: PropTypes.bool,
  knobPosition: PropTypes.object,
  knobColor: PropTypes.string,
  knobRadius: PropTypes.number,
  knobSize: PropTypes.number,
  trackSize: PropTypes.number,
  children: PropTypes.element,
  onMouseDown: PropTypes.func,
};

export default Knob;
