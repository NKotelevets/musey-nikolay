import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ToggleButton = ({ onIcon, offIcon, onToggle, onAction, title, id, stick, indicator }) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);

    if (onToggle) onToggle(newState);
    if (newState && onAction) onAction();
  };

  
  var cssClasses;
  const cssBaseClasses = "btn btn-primary toggle-button" ;

  if(isOn) {
    cssClasses = cssBaseClasses +  " on";
  } else {
    cssClasses = cssBaseClasses + " off";
  }

  if(stick) {
    cssClasses = cssClasses + " stick";
  } 

  if(indicator) {
    cssClasses = cssClasses + " indicator";
  } 

  return (
    
    <button onClick={handleToggle} class={cssClasses} id={id}>
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
  id: PropTypes.string,
  stick: PropTypes.bool,
  indicator: PropTypes.bool
};

ToggleButton.defaultProps = {
  title: '',
};

export default ToggleButton;