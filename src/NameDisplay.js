import React from 'react';
import PropTypes from 'prop-types';

const NameDisplay = ({ name }) => {
  return <label className="label-name">{name}</label>;
};

NameDisplay.propTypes = {
  name: PropTypes.string.isRequired,
};

export default NameDisplay;