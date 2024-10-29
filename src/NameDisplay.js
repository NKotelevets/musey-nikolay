import React from 'react';
import PropTypes from 'prop-types';

const NameDisplay = ({ name }) => {
  return <h1>{name}</h1>;
};

NameDisplay.propTypes = {
  name: PropTypes.string.isRequired,
};

export default NameDisplay;