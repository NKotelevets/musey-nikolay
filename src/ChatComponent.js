import React, { useEffect, useState } from 'react';
import { getTokenOrRefresh } from './token_util';
import './custom.css';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { Container, Header, MessageList, Composer, WebchatProvider, getClient } from '@botpress/webchat';
import { buildTheme } from '@botpress/webchat-generator';
import SpeechToTextComponent from './SpeechToTextComponent'; // Adjust the path according to your file structure

const speechsdk = require('microsoft-cognitiveservices-speech-sdk');

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
            console.log('Received event:', event.id);
            
           
            var delayInMilliseconds = 4000; //1 second

            setTimeout(function () {
                //your code to be executed after 1 second
                textToSpeech(event.ttsMessage);
            }, delayInMilliseconds);
        });
    },[]);

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

    // const sendEvent = async (eventName, message) => {
    //     try {
    //         const event = {
    //             type: eventName,
    //             body: message, // Arbitrary event type
    //         };

    //         textToSpeech(message);
    //         await client.sendEvent(event);
    //     } catch (error) {
    //         console.error('Error sending event to Botpress:', error);
    //     }
    // };

    // const sttFromMic = async () => {
    //     const tokenObj = await getTokenOrRefresh();
    //     const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    //     speechConfig.speechRecognitionLanguage = localisation;

    //     const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    //     const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    //     setStatusText('Speak into your microphone...');

    //     recognizer.recognizeOnceAsync(async (result) => {
    //         if (result.reason === ResultReason.RecognizedSpeech) {
    //             await client.sendMessage(result.text);
    //             setStatusText(`RECOGNIZED: Text=${result.text}`);
    //         } else {
    //             setStatusText('ERROR: Speech was cancelled or could not be recognized.');
    //         }
    //     });
    // };

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
//     const textToSpeech = async (textToSpeak) => {
//         const tokenObj = await getTokenOrRefresh();
//         const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
//         speechConfig.speechSynthesisLanguage = localisation;
//         speechConfig.speechSynthesisVoiceName = voiceName;

//         const myPlayer = new speechsdk.SpeakerAudioDestination();
//         if (myPlayer) {
//             updatePlayer((p) => ({ p: myPlayer }));
//         }
//         const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(player.p);

//         let synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);

//         setStatusText(`Speaking text: ${textToSpeak}...`);

//         const ssmlMessage = `
//             <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${localisation}">
//               <voice name="${voiceName}">
//                 ${textToSpeak}
//               </voice>
//             </speak>
//         `;
// console.log(ssmlMessage);
//         synthesizer.speakSsmlAsync(
//             ssmlMessage,
//             (result) => {
//                 if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
                   
//                     setStatusText(`Synthesis finished`);
//                 } else if (result.reason === speechsdk.ResultReason.Canceled) {
//                     setStatusText(`Synthesis failed. Error detail: ${result.errorDetails}.`);
//                 }
//                 synthesizer.close();
//                 synthesizer = undefined;
//             },
//             (err) => {
//                 setStatusText(`Error: ${err}.`);
//                 synthesizer.close();
//                 synthesizer = undefined;
//             }
//         );
//     };

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


            <div className="row main-container">
                <div className="col-6">
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


          
                    <div>
                       
                      
                       
                       

                
                    </div>
                </div>

                <div className="col-6 output-display rounded">
                    <code id="speechOutput">{statusText}</code>
                    <WebchatProvider theme={theme} client={client} key={JSON.stringify(botConfig)} configuration={botConfig}>
                        <Container>
                            <Header />
                            <MessageList />
                            <Composer />
                        </Container>
                    </WebchatProvider>
                </div>
            </div>
            <div style={{ width: '100vw', height: '100vh' }}>
                <style>{style}</style>
            </div>
        </div>
    );
};

export default ChatComponent;