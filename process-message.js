const Dialogflow = require('dialogflow');
const Pusher = require('pusher');
const getSpecialsInfo = require('./specials');

const projectId = 'bakery-bot-6dc44';
const sessionId = '123456';
const languageCode = 'en-US';

const config = {
  credentials: {
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
  },
};

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  encrypted: true,
});

const sessionClient = new Dialogflow.SessionsClient(config);

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

let firstInquery = true;
let todaySpecial = "";

const processMessage = message => {
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode,
      },
    },
  };

  sessionClient
    .detectIntent(request)
    .then(responses => {
      const result = responses[0].queryResult;
      if (result.intent) {
        if (firstInquery && result.intent.displayName === "getSpecials"
          && result.parameters.fields['specials'].stringValue.includes("special")) {
          firstInquery = false;
          // fetch the special of the day from api
          return getSpecialsInfo().then(response => {
            todaySpecial = response;
            return pusher.trigger('bot', 'bot-response', {
              message: `Today's special is ${response}`,
            });
          });
        } else if (result.intent.displayName === "getSpecials"
          && result.parameters.fields['specials'].stringValue.includes("special")) {
          //if it's not first inquery, return the same value
          return pusher.trigger('bot', 'bot-response', {
            message: `Today's special is ${todaySpecial}`,
          });
        }
      }

      return pusher.trigger('bot', 'bot-response', {
        message: result.fulfillmentText,
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
};

module.exports = processMessage;
