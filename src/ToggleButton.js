import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const ToggleButton = ({
  onIcon,
  offIcon,
  onToggle,
  onAction,
  title,
  id,
  stick,
  indicator,
  extraClass = "",
  label = "",
  dismiss = false,
}) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);

    if (onToggle) onToggle(newState);
    if (newState && onAction) onAction();
  };

  useEffect(() => {
    dismiss && setIsOn(false);
  }, [dismiss]);

  return (
    <span>
      <div class="label">{label}</div>
      <button
        onClick={handleToggle}
        class={`btn btn-primary toggle-button ${isOn ? " on" : " off"} ${
          stick && " stick"
        } ${indicator && " indicator"} ${extraClass && extraClass}`}
        id={id}
      >
        {isOn ? onIcon : offIcon}
        {title}
      </button>
    </span>
  );
};

ToggleButton.propTypes = {
  onIcon: PropTypes.node.isRequired,
  offIcon: PropTypes.node.isRequired,
  onToggle: PropTypes.func,
  onAction: PropTypes.func,
  title: PropTypes.string,
  id: PropTypes.string,
  stick: PropTypes.bool,
  indicator: PropTypes.bool,
  extraClass: PropTypes.string,
};

ToggleButton.defaultProps = {
  title: "",
};

export default ToggleButton;
