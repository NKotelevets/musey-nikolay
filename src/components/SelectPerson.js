import React from "react";
import { BotsENLanguages, BotsNLLanguages, Languages } from "../Constants";
import { getClient } from "@botpress/webchat";

const SelectPerson = ({
  setTemporarySelectionPerson,
  temporarySelectionPerson,
  handleTogglePerson,
  setBotpressConfigs,
  client,
  setClient,
}) => {
  const handleSelectLanguage = (language) => {
    setTemporarySelectionPerson((prev) => ({
      ...prev,
      localisation: language.localisation,
    }));
  };

  const handleSelectSpeaker = async (speaker) => {
    setTemporarySelectionPerson((prev) => ({
      ...prev,
      speaker: speaker,
    }));

    setBotpressConfigs((prev) => ({
      ...prev,
      botConfig: {
        ...prev.botConfig,
        botName: speaker.name,
        composerPlaceholder: `Speak with ${speaker.name}`,
      },
      botClientId: speaker.botPressId,
      localisation: temporarySelectionPerson.localisation,
      voiceName: speaker.voice,
    }));
    client.disconnect();
    const newClient = await getClient({ clientId: speaker.botPressId });
    setClient(newClient);
    handleTogglePerson(false);
    setTemporarySelectionPerson({
      speaker: "",
      localisation: "",
    });
  };

  return (
    <div className="select-person-container">
      <p className="title">MET WIE WIL JE SPREKEN?</p>
      <p className="sub-title">DRUK OP HET SCHERM OM TE KIEZEN</p>
      {!temporarySelectionPerson.localisation.length ? (
        <div className="buttons-container ">
          {Languages.map((lan) => (
            <button
              onClick={() => handleSelectLanguage(lan)}
              className="select-person-button"
            >
              {lan.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="buttons-container ">
          {temporarySelectionPerson.localisation === "nl-NL"
            ? BotsNLLanguages.map((bot) => (
                <button
                  onClick={() => handleSelectSpeaker(bot)}
                  className="select-person-button"
                  key={bot.botPressId}
                >
                  {bot.name}
                </button>
              ))
            : BotsENLanguages.map((bot) => (
                <button
                  onClick={() => handleSelectSpeaker(bot)}
                  className="select-person-button"
                  key={bot.botPressId}
                >
                  {bot.name}
                </button>
              ))}

          <button
            onClick={() =>
              setTemporarySelectionPerson((prev) => ({
                ...prev,
                localisation: "",
              }))
            }
            className="select-person-button"
          >
            select language
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectPerson;
