import React, { useEffect, useRef, useState } from "react";
import "./custom.css";
import {
  Container,
  Header,
  MessageList,
  Composer,
  WebchatProvider,
  getClient,
} from "@botpress/webchat";
import { buildTheme } from "@botpress/webchat-generator";
import SpeechToTextComponent from "./SpeechToTextComponent"; // Adjust the path according to your file structure

const speechsdk = require("microsoft-cognitiveservices-speech-sdk");

// Build the theme outside the component to prevent unnecessary recalculation on every render
const { theme, style } = buildTheme({
  themeName: "prism",
  themeColor: "#634433",
});

// Reusable ChatComponent
const ChatComponent = ({
  botConfig,
  botClientId,
  localisation,
  voiceName,
  subscriptionKey,
  region,
  desiredDuration,
}) => {
  const audioRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [activeListener, setActiveListener] = useState(false);
  const [client] = useState(() => getClient({ clientId: botClientId }));
  const [textareaValue, setTextareaValue] = useState("");
  const [confPlaybackQueue, setConfPlaybackQueue] = useState({
    audioSrc: null,
    playbackQueue: [],
    active: false,
  });

  const [displayText, setDisplayText] = useState(
    "INITIALIZED: ready to test speech..."
  );
  const [statusText, setStatusText] = useState(
    "INITIALIZED: ready to test speech..."
  );
  const [player, updatePlayer] = useState({ p: undefined, muted: false });

  useEffect(() => {
    client.on("customEvent", async (event) => {
      console.log("Received event:", event);
      setConfPlaybackQueue((prev) => ({
        ...prev,
        playbackQueue: [...prev.playbackQueue, event],
      }));
    });
  }, []);

  useEffect(() => {
    if (confPlaybackQueue.playbackQueue?.length) {
      setIsListening(false);
    }

    if (!confPlaybackQueue.active && confPlaybackQueue.playbackQueue?.length) {
      textToSpeech(confPlaybackQueue.playbackQueue[0].ttsMessage);
    }

    if (!confPlaybackQueue.playbackQueue?.length && activeListener) {
      setIsListening(true);
    }
  }, [
    confPlaybackQueue.playbackQueue,
    confPlaybackQueue.active,
    confPlaybackQueue,
  ]);

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
    console.log("Textarea value:", value);
    // Perform any action with the value
    textToSpeech(value);
  };

  const calculateDurationFromText = (textToSpeak) => {
    const words = textToSpeak.split(/\s+/).length; // Split by whitespace to count words
    const wordsPerSecond = 2.5; // Average words spoken per second
    const duration = words / wordsPerSecond;
    return duration; // Duration in seconds
  };

  const generateSSMLMessage = (textToSpeak) => {
    return `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${localisation}">
            <voice name="${voiceName}">
                ${textToSpeak}
            </voice>
        </speak>
        `;
  };

  const handleAudioEnded = () => {
    setConfPlaybackQueue((prev) => ({
      playbackQueue: prev.playbackQueue > 1 ? prev.playbackQueue.shift() : [],
      audioSrc: null,
      active: false,
    }));
  };

  const textToSpeech = async (textToSpeak) => {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(
      subscriptionKey,
      region
    );
    speechConfig.speechSynthesisLanguage = localisation;
    speechConfig.speechSynthesisVoiceName = voiceName;

    const myPlayer = new speechsdk.SpeakerAudioDestination();
    if (myPlayer) {
      updatePlayer((p) => ({ p: myPlayer }));
    }

    const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(player.p);
    let synthesizer = new speechsdk.SpeechSynthesizer(
      speechConfig,
      audioConfig
    );

    setStatusText(`Speaking text: ${textToSpeak}...`);

    const waitForUpdateEnd = (mediaSource) => {
      return new Promise((resolve) => {
        const sourceBuffer = mediaSource.sourceBuffers[0];
        if (!sourceBuffer.updating) {
          resolve();
        } else {
          sourceBuffer.addEventListener("updateend", resolve, { once: true });
        }
      });
    };
    desiredDuration = calculateDurationFromText(textToSpeak);

    console.log("desired duration:" + { desiredDuration });
    synthesizer.speakSsmlAsync(
      generateSSMLMessage(textToSpeak),
      async (result) => {
        if (
          result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted
        ) {
          const audioData = result.audioData;
          const audioBlob = new Blob([audioData], { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(audioBlob);
          setConfPlaybackQueue((prev) => ({
            ...prev,
            audioSrc: audioUrl,
            active: true,
          }));

          setStatusText(`Synthesis finished`);
          // Ensure the MediaSource is ready before setting duration
          const mediaSource = player.p; // Assuming player.p holds the MediaSource
          if (
            mediaSource &&
            mediaSource.sourceBuffers &&
            mediaSource.sourceBuffers.length > 0
          ) {
            await waitForUpdateEnd(mediaSource);
            mediaSource.duration = desiredDuration; // Set the correct duration here
          }
        } else if (result.reason === speechsdk.ResultReason.Canceled) {
          setStatusText(
            `Synthesis failed. Error detail: ${result.errorDetails}.`
          );
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
            <label for="exampleFormControlTextarea1">
              Testen van de speech to tekst
            </label>
            <textarea
              class="form-control"
              value={textareaValue}
              onChange={handleTextareaChange}
              placeholder="Enter your text here..."
              rows="5"
              cols="30"
            ></textarea>

            <div class="btn-group">
              <button
                type="button"
                class="btn btn-primary"
                onClick={handleClick}
              >
                <i class="fas fa-volume-up"></i> Lees text op
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="exampleFormControlTextarea1">
              Example textarea {confPlaybackQueue.playbackQueue?.length}
            </label>
            <div
              className={`box ${
                ((confPlaybackQueue.playbackQueue?.length && isListening) ||
                  !isListening) &&
                "pauseSpeech"
              }`}
            >
              <textarea
                class="form-control "
                id="speechInput"
                rows="3"
              ></textarea>
            </div>

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
                setIsListening={setIsListening}
                isListening={isListening}
                setActiveListener={setActiveListener}
                activeListener={activeListener}
              />
            </div>
          </div>

          <div></div>
        </div>

        <div className="col-6 output-display rounded">
          <code id="speechOutput">{statusText}</code>
          <WebchatProvider
            theme={theme}
            client={client}
            key={JSON.stringify(botConfig)}
            configuration={botConfig}
          >
            <Container>
              <Header />
              <MessageList />
              <Composer />
            </Container>
          </WebchatProvider>
        </div>
      </div>
      <div style={{ width: "100vw", height: "100vh" }}>
        <style>{style}</style>
      </div>

      {confPlaybackQueue.audioSrc && (
        <audio
          ref={audioRef}
          src={confPlaybackQueue.audioSrc}
          autoPlay
          onEnded={handleAudioEnded} // Событие завершения воспроизведения
          controls
          muted
          hidden
        />
      )}
    </div>
  );
};

export default ChatComponent;
