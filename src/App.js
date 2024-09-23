import React from 'react';
import ChatComponent from './ChatComponent'; // Adjust the path based on your file structure

const App = () => {

    const botConfig = {
        composerPlaceholder: "Speak with Lieutenant Ray",
        botName: "Lieutenant Ray",
        showPoweredBy: false,
        botAvatar: "https://files.bpcontent.cloud/2024/09/09/15/20240909151533-394Z5SY7.jpeg",
        botDescription: "Note: Ray speaks old Dutch from 1945",
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
        theme: {themeName :"Midnight"}
    };

    const botClientId = '819aeef3-bd6c-46ed-9437-29c0430ab254';
    const localisation = 'nl-NL';  // Dutch for localization
    const voiceName = 'en-US-AndrewMultilingualNeural';
    const subscriptionKey = "9759ac1e676e48979e69322ab3840add"
    const region="northeurope"
    const desiredDuration = 20000;

    return (
        <div>
         
            <ChatComponent 
                botConfig={botConfig} 
                botClientId={botClientId} 
                localisation={localisation} 
                voiceName={voiceName}
                subscriptionKey={subscriptionKey}
                region={region}
                desiredDuration={desiredDuration}
            />
        </div>
    );
};

export default App;