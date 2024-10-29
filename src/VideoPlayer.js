import React from 'react';
import PropTypes from 'prop-types';

const VideoPlayer = ({ videoSrc }) => {
  return (
    <div className="video-player">
      <video controls width="100%" height="auto">
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

VideoPlayer.propTypes = {
  videoSrc: PropTypes.string.isRequired,
};

export default VideoPlayer;