import React from "react";

const ChoiceComponent = ({ selectOptionForChoice, title, options }) => {
  return (
    <div className="select-person-container">
      <p className="title">{title}</p>
      <div className="buttons-container ">
        {options.map((option) => (
          <button
            onClick={() => selectOptionForChoice(option)}
            className="select-person-button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChoiceComponent;
