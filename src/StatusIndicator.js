import React from "react";
import PropTypes from "prop-types";

const StatusIndicator = ({ status, color = "red" }) => {
  const cssClasses = "status " + (status ? "on" : "off") + " " + color;

  return <figure class={cssClasses} />;
};

StatusIndicator.propTypes = {
  status: PropTypes.bool.isRequired,
};

export default StatusIndicator;
