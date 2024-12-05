import React, { useEffect, useState, useRef } from "react";
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
// import SpeechToTextComponent from "./SpeechToTextComponent"; // Adjust the path according to your file structure
import ToggleButton from "./ToggleButton";
import VideoPlayer from "./VideoPlayer";
import NameDisplay from "./NameDisplay";
import StatusIndicator from "./StatusIndicator";
import jQuery from "jquery";
import Keyboard from "simple-keyboard";
import SelectPerson from "./components/SelectPerson";
import "simple-keyboard/build/css/index.css";
import * as test from "@botpress/webchat";
const speechsdk = require("microsoft-cognitiveservices-speech-sdk");

var urlParams = new URLSearchParams(window.location.search);
var debug = urlParams.has("debug");
if (debug) {
  jQuery("body").addClass("do-debug");
}

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
  setBotpressConfigs,
}) => {
  const audioRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [activeListener, setActiveListener] = useState(false);
  const [client, setClient] = useState(() =>
    getClient({ clientId: botClientId })
  );

  const [textareaValue, setTextareaValue] = useState("");
  const [selectPerson, setSelectPerson] = useState(false);
  const [temporarySelectionPerson, setTemporarySelectionPerson] = useState({
    localisation: "",
    speaker: "",
  });
  const [recognizer, setRecognizer] = useState(null);
  const silenceTimer = useRef(null); // Ref for the silence timer
  const [confPlaybackQueue, setConfPlaybackQueue] = useState({
    audioSrc: null,
    playbackQueue: [],
    active: false,
  });

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
        lastQuestion: event.lastAnswer,
      }));
    });
    return () => client?.disconnect && client?.disconnect();
  }, [client]);

  useEffect(() => {
    if (confPlaybackQueue.playbackQueue?.length) {
      setIsListening(false);
    }
    if (!confPlaybackQueue.active && confPlaybackQueue.playbackQueue?.length) {
      const localisationEvent =
        confPlaybackQueue.playbackQueue[0]?.language === "nl"
          ? "nl-NL"
          : "en-EN";

      textToSpeech(
        confPlaybackQueue.playbackQueue[0].ttsMessage,
        localisationEvent,
        confPlaybackQueue.playbackQueue[0]?.ttsVoice
      );
    }
    if (
      activeListener &&
      confPlaybackQueue?.lastQuestion &&
      !confPlaybackQueue.playbackQueue?.length
    ) {
      setIsListening(true);
    }
  }, [
    confPlaybackQueue.playbackQueue,
    confPlaybackQueue.active,
    confPlaybackQueue?.lastQuestion,
    confPlaybackQueue,
  ]);

  const onChange = (input) => {
    jQuery(".bpComposerInput").val(input);
    jQuery("#input-keyboard").val(input);
  };

  const onKeyPress = (button) => {
    if (button == "{enter}") {
      console.log("Button pressed", button);

      client.sendMessage(jQuery(".bpComposerInput").val());
      jQuery("#input-keyboard").val("");
    }
  };

  useEffect(() => {
    const keyboard = new Keyboard({
      onChange: (input) => onChange(input),
      onKeyPress: (button) => onKeyPress(button),
      layout: {
        default: [
          "1 2 3 4 5 6 7 8 9 0 {bksp}",
          "Q W E R T Y U I O P",
          "A S D F G H J K L {enter}",
          "Z X C V B N M ?",
          "{space}",
        ],
      },
      display: {
        "{bksp}": "backspace",
        "{enter}": "versturen",
        "{space}": " ",
      },
    });
    return () => keyboard.destroy();
  }, []);

  const videoUrl = "./video/dummy.mp4";

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

  const handleAudioEnded = () => {
    setConfPlaybackQueue((prev) => ({
      playbackQueue: prev.playbackQueue > 1 ? prev.playbackQueue.shift() : [],
      audioSrc: null,
      active: false,
      lastQuestion: prev.playbackQueue[0].lastAnswer,
    }));
  };

  const textToSpeech = async (
    textToSpeak,
    localisationEvent,
    voiceNameEvent
  ) => {
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(
      subscriptionKey,
      region
    );
    speechConfig.speechSynthesisLanguage = localisationEvent
      ? localisationEvent
      : localisation;
    speechConfig.speechSynthesisVoiceName = voiceNameEvent
      ? voiceNameEvent
      : voiceName;

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
          sourceBuffer.addEventListener("updateend", resolve, { once: true });
        }
      });
    };
    desiredDuration = calculateDurationFromText(textToSpeak);

    console.log("desired duration:" + { desiredDuration });
    synthesizer.speakSsmlAsync(
      ssmlMessage,
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
  const handleTogglePerson = (isOn) => {
    setSelectPerson(isOn);
  };

  const toggleSubtitles = (isOn) => {
    console.log(`Subtitles is now ${isOn ? "ON" : "OFF"}`);
    jQuery("body").toggleClass("subtitles");
  };

  const toggleKeyboard = (isOn) => {
    console.log(`Subtitles is now ${isOn ? "ON" : "OFF"}`);
    jQuery("body").toggleClass("keyboard");
  };

  const toggleDebug = (isOn) => {
    console.log(`Debug is now ${isOn ? "ON" : "OFF"}`);
    jQuery("body").toggleClass("do-debug");
  };

  const toggleScreen = (isOn) => {
    console.log(`Screen is now ${isOn ? "OFF" : "ON"}`);
    jQuery("body").toggleClass("off");
  };

  const handleOnAction = () => {
    console.log("Action performed because the toggle is ON");
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

  const startListening = async () => {
    if (!subscriptionKey || !region) {
      console.error("Azure subscription key and region are required.");
      return;
    }

    if (recognizer) {
      console.log("Recognizer already exists.");
      recognizer.startContinuousRecognitionAsync();
      return;
    }

    // Azure Speech SDK Configuration
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(
      subscriptionKey,
      region
    );
    speechConfig.speechRecognitionLanguage = localisation;

    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();

    const speechRecognizer = new speechsdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

    speechRecognizer.recognizing = (sender, event) => {
      // Optionally update live as the speech is recognized
      updateHtmlElement(`${event.result.text}`);
    };

    speechRecognizer.recognized = async (sender, event) => {
      if (event.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
        resetSilenceTimer(event.result.text); // Reset timer on recognized speech
      } else if (event.result.reason === speechsdk.ResultReason.NoMatch) {
        updateHtmlElement("No speech could be recognized.");
      }
    };

    speechRecognizer.canceled = (sender, event) => {
      console.error(`Canceled: ${event.errorDetails}`);
      speechRecognizer.stopContinuousRecognitionAsync();
    };

    speechRecognizer.sessionStopped = (sender, event) => {
      console.log("Session stopped.");
      speechRecognizer.stopContinuousRecognitionAsync();
    };

    speechRecognizer.startContinuousRecognitionAsync();
    setRecognizer(speechRecognizer);
  };

  const stopListening = () => {
    if (recognizer) {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          console.log("Recognition stopped.");
        },
        (error) => {
          console.error("Error stopping recognition:", error);
        }
      );
    }
    clearSilenceTimer(); // Clear timer when stopping
  };

  // Reset the silence timer
  const resetSilenceTimer = (currentText) => {
    clearSilenceTimer();
    silenceTimer.current = setTimeout(async () => {
      await handleSilence(currentText); // Handle silence after 2 seconds
    }, 2000); // 2 seconds of silence
  };

  // Clear the silence timer
  const clearSilenceTimer = () => {
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
    }
  };

  // Handle what happens after 2 seconds of silence
  const handleSilence = async (finalText) => {
    if (finalText) {
      updateHtmlElement(`Final recognized text: ${finalText}`);
      await client.sendMessage(finalText); // Send to botpress or other service
      updateHtmlElement(`Sent to botpress`);
    }
  };

  const updateHtmlElement = (text) => {
    const element = document.getElementById("speechInput");
    if (element) {
      element.innerText = text;
    } else {
      console.error(`Element with ID speechInput not found.`);
    }
  };

  const handleSpeaker = () => {
    if (!isListening) {
      setIsListening(true);
      setActiveListener(true);
      startListening();
    } else {
      setIsListening(false);
      setActiveListener(false);
      stopListening();
    }
  };

  return (
    <div className="container app-container">
      <div className="row main-container ">
        <div className="col-6 screen">
          <div id="screen">
            <VideoPlayer
              videoSrc={videoUrl}
              play={!!confPlaybackQueue.audioSrc}
            />
            <div id="subtitles">
              {confPlaybackQueue?.playbackQueue?.length
                ? confPlaybackQueue?.playbackQueue[0]?.ttsMessage?.replace(
                    /<[^>]*>/g,
                    ""
                  )
                : ""}
            </div>
            {selectPerson && (
              <SelectPerson
                setTemporarySelectionPerson={setTemporarySelectionPerson}
                temporarySelectionPerson={temporarySelectionPerson}
                handleTogglePerson={handleTogglePerson}
                setBotpressConfigs={setBotpressConfigs}
                client={client}
                setClient={setClient}
              />
            )}
          </div>
        </div>

        <div className="controls">
          <ToggleButton
            id="toggle-person"
            onToggle={handleTogglePerson}
            title="Toggle Persoon"
            extraClass="big-icon"
            stick
            label="Kies een persoon"
            dismiss={!selectPerson}
          />

          <div id="lbl-instructions" class="label">
            <h1>Welkom</h1>
            <p>Je voert nu een gesprek met:</p>
            <NameDisplay name={"smurf"} />
            <p class="icon icon-mic">Als dit lampje groen is kun je spreken</p>
            <p class="icon icon-wait">
              Als dit lampje brandt moet je even wachten
            </p>
          </div>

          <div id="frm-talk" class="frame">
            <StatusIndicator
              status={isListening && activeListener}
              color="green"
            />
            <p class="icon icon-mic">spreken</p>
          </div>

          <div id="frm-wait" class="frame">
            <StatusIndicator status={!isListening && activeListener} />
            <p class="icon icon-wait">wachten</p>
          </div>

          <ToggleButton
            id="toggle-subtitles"
            onToggle={toggleSubtitles}
            onAction={handleOnAction}
            title="Toggle Ondertitels"
            extraClass="big-icon"
            indicator
            stick
            label="ondertitels"
          />

          <ToggleButton
            id="toggle-keyboard"
            onToggle={toggleKeyboard}
            onAction={handleOnAction}
            title="Toggle Toetsenbord"
            extraClass="big-icon"
            indicator
            stick
            label="toetsenbord"
          />

          <figure class="speaker"></figure>

          <ToggleButton
            id="toggle-screen"
            onToggle={toggleScreen}
            onAction={handleOnAction}
            title="Screen off"
            indicator
          />

          <ToggleButton
            id="toggle-debug"
            onToggle={toggleDebug}
            onAction={handleOnAction}
            title="Toggle debug"
            indicator
          />

          <ToggleButton
            id="toggle-speaker"
            onToggle={handleSpeaker}
            // onAction={handleOnAction}
            title={activeListener ? "Stop Listening" : "Start Listening"}
            indicator
          />
        </div>

        <div className="col-6 debug">
          <div>
            <h1>Status Indicator Example</h1>

            <button onClick={toggleStatus}>
              {isOn ? "Turn Off" : "Turn On"}
            </button>
          </div>
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
            <label for="exampleFormControlTextarea1">Example textarea</label>
            <textarea class="form-control" id="speechInput" rows="3"></textarea>

            <div class="btn-group">
              {/* <button type="button" class="btn btn-primary" onClick={sttFromMic}>
                                <i class="fas fa-volume"></i> Speach to text
                            </button> */}
              {/* <button type="button" class="btn btn-success" onClick={() => sendEvent('button-pushed', 'React is awesome!')}>
                                <i class="fas fa-letter"></i> Stuur client event
                            </button> */}
              {/* <SpeechToTextComponent
                elementId="speechInput"
                locale={localisation}
                subscriptionKey={subscriptionKey}
                region={region}
                botpressClient={client}
                statusElement="speechOutput"
              /> */}
            </div>
          </div>
        </div>

        <div className="col-6 output-display debug">
          <code id="speechOutput" className="debug">
            {statusText}
          </code>
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

      <div id="shine"></div>
      <div class="simple-keyboard">
        <span>
          <textarea id="input-keyboard"></textarea>
        </span>
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
