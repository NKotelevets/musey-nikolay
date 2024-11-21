import React from "react";
import PropTypes from "prop-types";

const VideoPlayer = ({ videoSrc, play }) => {
  console.log(play);
  return (
    <div className="video-player">
      {play ? (
        <video
          width="100%"
          height="auto"
          loop
          autoPlay
          poster={"./video/speaker_man.jpg"}
          src={videoSrc}
          muted
        >
          {/* <source src={videoSrc} type="video/mp4" /> */}
          Your browser does not support the video tag.
        </video>
      ) : (
        <img src={"./video/speaker_man.jpg"} />
      )}
    </div>
  );
};

VideoPlayer.propTypes = {
  videoSrc: PropTypes.string.isRequired,
};

export default VideoPlayer;
