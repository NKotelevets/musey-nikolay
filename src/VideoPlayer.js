import React from 'react';
import PropTypes from 'prop-types';


const VideoPlayer = ({ avatar, state = "idle", language}) => {

  console.log("VideoPlayer:" ,state, language);

  var paramMuted = false
  var paramLoop = false
  
  if(state == "talk") {
      state = "outro";
      paramMuted = true
      
  } else if (state == "idle") {
    paramLoop = true
  }
  

  var strLanguage = "";
  if(language) {
    strLanguage = "_"+language;
  }

  var videoSrc = "./video/ddex_"+ avatar + "_" + state +strLanguage+".mp4"
  return (
    <div className="video-player">
      
        <video
        

          width="100%"
          height="auto"
          
          autoPlay
          poster={"./video/ddex_"+ avatar + ".jpg"}
          src={videoSrc}
          muted={(paramMuted ? " muted" : "")}
          loop={(paramLoop ? " loop" : "")}
        >  
          Your browser does not support the video tag.
        </video>
     

    </div>
  );
};

VideoPlayer.propTypes = {
  avatar: PropTypes.string.isRequired,
  state: PropTypes.string
};

export default VideoPlayer;