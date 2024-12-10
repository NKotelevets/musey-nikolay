import React, { useState } from "react";
import ChatComponent from "./ChatComponent"; // Adjust the path based on your file structure

const avatarSettings = { avatars : [
  {
    fullName : "Lt. Ray Lanterman",
    title : "D-Day veteraan",
    id : "ray"
  },
  {
    fullName : "Lena",
    title : "kind in oorlog",
    id : "lena"
  },
  {
    fullName : "Lisa",
    title : "agent",
    id : "lisa"
  },
  {
    fullName : "Hanneke Kompaan",
    title : "verzetstrijder",
    id : "hanneke"
  },
  {
    fullName : "Abdelfattah",
    title : "vluchteling",
    id : "abdelfattah"
  }
]
}

var selectedAvatarId = 0;
var selectedAvatar = avatarSettings.avatars[selectedAvatarId];

const botConfig = {
  
  botName: selectedAvatar.fullName,
  composerPlaceholder: "Speak with "+selectedAvatar.fullName,
  showPoweredBy: false,
  botAvatar:
    "https://files.bpcontent.cloud/2024/09/09/15/20240909151533-394Z5SY7.jpeg",
  botDescription: "Praat met " + selectedAvatar.title + " " + selectedAvatar.fullName,
  email: {
    title: "randomEmail@boptress.com",
    link: "mailto:randomEmail@boptress.com",
  },
  phone: {
    title: "555-555-5555",
    link: "tel:555-555-5555",
  },
  website: {
    title: "https://botpress.com",
    link: "https://botpress.com",
  },
  termsOfService: {
    title: "Terms of Service",
    link: "https://botpress.com/terms",
  },
  privacyPolicy: {
    title: "Privacy Policy",
    link: "https://botpress.com/privacy",
  },
  theme: { themeName: "Midnight" },
};

const botClientId = "819aeef3-bd6c-46ed-9437-29c0430ab254";
const localisation = "nl-NL"; // Dutch for localization
const voiceName = "en-US-AndrewMultilingualNeural";
const subscriptionKey = "e48f41ab6410444bb4388f148f47da3b"; //"9759ac1e676e48979e69322ab3840add"

const region = "westeurope"; //"northeurope"

const App = () => {
  const desiredDuration = 20000;

  const [botpressConfigs, setBotpressConfigs] = useState({
    botConfig: botConfig,
    botClientId: botClientId,
    localisation: localisation,
    voiceName: voiceName,
    subscriptionKey: subscriptionKey,
    region: region
  });



  return (
    <div>
      <ChatComponent
        botConfig={botpressConfigs.botConfig}
        botClientId={botpressConfigs.botClientId}
        localisation={botpressConfigs.localisation}
        voiceName={botpressConfigs.voiceName}
        subscriptionKey={botpressConfigs.subscriptionKey}
        region={botpressConfigs.region}
        desiredDuration={desiredDuration}
        setBotpressConfigs={setBotpressConfigs}
        selectedAvatar={selectedAvatar}
      />
    </div>
  );
};

export default App;
