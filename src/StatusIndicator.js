import React from 'react';
import PropTypes from 'prop-types';

const StatusIndicator = ({ status }) => {
  const lightStyle = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: status ? 'green' : 'red',
  };

  return <div style={lightStyle} />;
};

StatusIndicator.propTypes = {
  status: PropTypes.bool.isRequired,
};

export default StatusIndicator;