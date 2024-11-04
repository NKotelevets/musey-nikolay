import React, { useEffect, useState } from 'react';
import { getTokenOrRefresh } from './token_util';
import './custom.css';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { Container, Header, MessageList, Composer, WebchatProvider, getClient } from '@botpress/webchat';
import { buildTheme } from '@botpress/webchat-generator';
import SpeechToTextComponent from './SpeechToTextComponent'; // Adjust the path according to your file structure
import ToggleButton from './ToggleButton';
import VideoPlayer  from './VideoPlayer';
import NameDisplay from './NameDisplay'
import StatusIndicator from './StatusIndicator';
import jQuery from 'jquery';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk');
/*import { useSearchParams } from "react-router-dom";

const [searchParams, setSearchParams] = useSearchParams();
const debug = searchParams.get("debug")*/

var urlParams = new URLSearchParams(window.location.search);
var debug = urlParams.has('debug')
if(debug) {
    jQuery("body").addClass("do-debug");
}

// Build the theme outside the component to prevent unnecessary recalculation on every render
const { theme, style } = buildTheme({
    themeName: 'prism',
    themeColor: '#634433',
});

// Reusable ChatComponent
const ChatComponent = ({ botConfig, botClientId, localisation, voiceName, subscriptionKey, region,desiredDuration }) => {
    const [client] = useState(() => getClient({ clientId: botClientId }));
    const [textareaValue, setTextareaValue] = useState('');

    const [displayText, setDisplayText] = useState('INITIALIZED: ready to test speech...');
    const [statusText, setStatusText] = useState('INITIALIZED: ready to test speech...');
    const [player, updatePlayer] = useState({ p: undefined, muted: false });

    useEffect(() => {
        client.on('customEvent', async (event) => {
            console.log('Received event:', event);
            
            var delayInMilliseconds = 2000;

            setTimeout(function () {
                textToSpeech(event.ttsMessage);
            }, delayInMilliseconds);
        });
    },[]);
    const videoUrl = "./video/dummy.mov";

    const [isOn, setIsOn] = useState(false);

    const toggleStatus = () => {
      setIsOn((prevStatus) => !prevStatus);
    };


    const handleTextareaChange = (event) => {
        setTextareaValue(event.target.value);
      };
    
      // Function that will be called when the button is clicked
      const handleClick = () => {
        // Here you can process the textarea value
        sendToFunction(textareaValue);
      };
    
      // Example function that receives the textarea value
      const sendToFunction = (value) => {
        console.log('Textarea value:', value);
        // Perform any action with the value
        textToSpeech(value);
      };


    const calculateDurationFromText = (textToSpeak) => {
        const words = textToSpeak.split(/\s+/).length; // Split by whitespace to count words
        const wordsPerSecond = 2.5; // Average words spoken per second
        const duration = words / wordsPerSecond;
        return duration; // Duration in seconds
    };

    const textToSpeech = async (textToSpeak) => {
        //const tokenObj = await getTokenOrRefresh();
        
        //const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        const speechConfig = speechsdk.SpeechConfig.fromSubscription(subscriptionKey, region);
        speechConfig.speechSynthesisLanguage = localisation;
        speechConfig.speechSynthesisVoiceName = voiceName;
     
    
        const myPlayer = new speechsdk.SpeakerAudioDestination();
        if (myPlayer) {
            updatePlayer((p) => ({ p: myPlayer }));
        }
        
        const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(player.p);
        let synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
    
        setStatusText(`Speaking text: ${textToSpeak}...`);
    
        const ssmlMessage = `
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${localisation}">
                <voice name="${voiceName}">
                    ${textToSpeak}
                </voice>
            </speak>
        `;
        console.log(ssmlMessage);
        const waitForUpdateEnd = (mediaSource) => {
            return new Promise((resolve) => {
                const sourceBuffer = mediaSource.sourceBuffers[0];
                if (!sourceBuffer.updating) {
                    resolve();
                } else {
                    sourceBuffer.addEventListener('updateend', resolve, { once: true });
                }
            });
        };
        desiredDuration = calculateDurationFromText(textToSpeak);
        
        console.log('desired duration:'+ {desiredDuration});
        synthesizer.speakSsmlAsync(
            ssmlMessage,
            async (result) => {
                if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
                    setStatusText(`Synthesis finished`);
                    // Ensure the MediaSource is ready before setting duration
                    const mediaSource = player.p; // Assuming player.p holds the MediaSource
                    if (mediaSource && mediaSource.sourceBuffers && mediaSource.sourceBuffers.length > 0) {
                        await waitForUpdateEnd(mediaSource);
                        mediaSource.duration = desiredDuration; // Set the correct duration here
                    }
                } else if (result.reason === speechsdk.ResultReason.Canceled) {
                    setStatusText(`Synthesis failed. Error detail: ${result.errorDetails}.`);
                }
                synthesizer.close();
                synthesizer = undefined;
            },
            (err) => {
                setStatusText(`Error: ${err}.`);
                synthesizer.close();
                synthesizer = undefined;
            }
        );
    };
    const handleToggle = (isOn) => {
        console.log(`Toggle is now ${isOn ? 'ON' : 'OFF'}`);
    };

    const toggleSubtitles = (isOn) => {
        console.log(`Subtitles is now ${isOn ? 'ON' : 'OFF'}`);
        jQuery("body").toggleClass("subtitles")
    };

    const toggleKeyboard = (isOn) => {
        console.log(`Subtitles is now ${isOn ? 'ON' : 'OFF'}`);
        jQuery("body").toggleClass("keyboard")
    };

    const toggleDebug = (isOn) => {
        console.log(`Debug is now ${isOn ? 'ON' : 'OFF'}`);
        jQuery("body").toggleClass("do-debug")
    };

    const handleOnAction = () => {
        console.log('Action performed because the toggle is ON');
    };

    const handleMute = () => {
        updatePlayer((p) => {
            if (!p.muted) {
                p.p.pause();
                return { p: p.p, muted: true };
            } else {
                p.p.resume();
                return { p: p.p, muted: false };
            }
        });
    };

    if (!client) {
        return <div>Loading Botpress Client...</div>;
    }

    return (
        <div className="container app-container">


            <div className="row main-container ">
                <div className="col-6 debug">
                    <div>
                        <h1>Status Indicator Example</h1>
                        <StatusIndicator status={isOn} />
                        <button onClick={toggleStatus}>
                            {isOn ? 'Turn Off' : 'Turn On'}
                        </button>
                    </div>
                    <div class="form-group">
                        <label for="exampleFormControlTextarea1">Testen van de speech to tekst</label>
                        <textarea class="form-control" value={textareaValue}
                            onChange={handleTextareaChange}
                            placeholder="Enter your text here..."
                            rows="5"
                            cols="30"></textarea>
                  
                        <div class="btn-group">
                        <button type="button" class="btn btn-primary" onClick={handleClick} >
                            <i class="fas fa-volume-up"></i> Lees text op
                        </button>
                         
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="exampleFormControlTextarea1">Example textarea</label>
                        <textarea class="form-control" id="speechInput" rows="3"></textarea>

                        <div class="btn-group">
                            {/* <button type="button" class="btn btn-primary" onClick={sttFromMic}>
                                <i class="fas fa-volume"></i> Speach to text
                            </button> */}
                            {/* <button type="button" class="btn btn-success" onClick={() => sendEvent('button-pushed', 'React is awesome!')}>
                                <i class="fas fa-letter"></i> Stuur client event
                            </button> */}
                            <SpeechToTextComponent
                            elementId="speechInput"
                            locale={localisation}
                            subscriptionKey={subscriptionKey}
                            region={region}
                            botpressClient={client}
                            statusElement="speechOutput"
                        />
                        </div>
                    </div>

                    </div>
                    <div className="col-6 screen">

                        <div id="screen">
                        <VideoPlayer videoSrc={videoUrl}/>
                  
                    </div>
                </div>

                <div className="col-6 output-display debug">
                    <code id="speechOutput">{statusText}</code>
                    <WebchatProvider theme={theme} client={client} key={JSON.stringify(botConfig)} configuration={botConfig}>
                        <Container>
                            <Header />
                            <MessageList />
                            <Composer />
                        </Container>
                    </WebchatProvider>
                    

                </div>

                <div className='controls'>
                     <ToggleButton 
                        id="toggle-keyboard"
                        onToggle={toggleKeyboard}
                        onAction={handleOnAction}
                        title="Toggle Toetsenbord"
                        indicator
                        stick
                    />
                    <ToggleButton 
                        id="toggle-person"
                        onToggle={handleToggle}
                        onAction={handleOnAction}
                        title="Toggle Persoon"
                         
                    />
                    <ToggleButton 
                        id="toggle-subtitles"
                        onToggle={toggleSubtitles}
                        onAction={handleOnAction}
                        title="Toggle Ondertitels"
                        
                        indicator
                    />

                <ToggleButton 
                        id="toggle-debug"
                        onToggle={toggleDebug}
                        onAction={handleOnAction}
                        title="Toggle debug"
                        
                        indicator
                    />
                    <NameDisplay name={'smurf'} />
                </div>
            
            </div>
            <div style={{ width: '100vw', height: '100vh' }}>
                <style>{style}</style>
            </div>
            <div id="shine"></div>
            <div class="simple-keyboard"></div>
        </div>
    );
};

export default ChatComponent;