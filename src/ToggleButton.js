import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ToggleButton = ({ onIcon, offIcon, onToggle, onAction, title }) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);

    if (onToggle) onToggle(newState);
    if (newState && onAction) onAction();
  };

  return (
    <button onClick={handleToggle} class="btn btn-primary toggle-button">
      {isOn ? onIcon : offIcon}
      {title}
    </button>
  );
};

ToggleButton.propTypes = {
  onIcon: PropTypes.node.isRequired,
  offIcon: PropTypes.node.isRequired,
  onToggle: PropTypes.func,
  onAction: PropTypes.func,
  title: PropTypes.string,
};

ToggleButton.defaultProps = {
  title: '',
};

export default ToggleButton;