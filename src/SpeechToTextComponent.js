import React, { useState, useEffect, useRef } from "react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const SpeechToTextComponent = ({
  elementId,
  locale = "en-US",
  subscriptionKey,
  region,
  botpressClient,
  setIsListening,
  isListening,
  setActiveListener,
  activeListener,
}) => {
  const [recognizer, setRecognizer] = useState(null);
  const [recognizedText, setRecognizedText] = useState(""); // Store recognized text
  const silenceTimer = useRef(null); // Ref for the silence timer

  useEffect(() => {
    isListening ? startListening() : stopListening();
    return () => stopListening();
  }, [isListening]);

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
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      subscriptionKey,
      region
    );
    speechConfig.speechRecognitionLanguage = locale;

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

    const speechRecognizer = new sdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

    speechRecognizer.recognizing = (sender, event) => {
      // Optionally update live as the speech is recognized
      updateHtmlElement(`${event.result.text}`);
    };

    speechRecognizer.recognized = async (sender, event) => {
      if (event.result.reason === sdk.ResultReason.RecognizedSpeech) {
        setRecognizedText(event.result.text); // Store recognized text
        resetSilenceTimer(event.result.text); // Reset timer on recognized speech
      } else if (event.result.reason === sdk.ResultReason.NoMatch) {
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
      setIsListening(false);
      await botpressClient.sendMessage(finalText); // Send to botpress or other service
      updateHtmlElement(`Sent to botpress`);
    }
  };

  const updateHtmlElement = (text) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerText = text;
    } else {
      console.error(`Element with ID '${elementId}' not found.`);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="btn btn-success"
        onClick={() => {
          setIsListening((prev) => !prev);
          setActiveListener((prev) => !prev);
        }}
      >
        {activeListener ? "Stop Listening" : "Start Listening"}
      </button>
    </div>
  );
};

export default SpeechToTextComponent;
