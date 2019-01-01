let Alexa = require('alexa-remote2');
let alexa = new Alexa();

/***************************************************************/
// see: https://www.gehrig.info/alexa/Alexa.html
// cookie starts with x-amzn-dat and ends with =" csrf=12345780
let cookie = 'session-id=.../ /...=" csrf=12345780';

alexa.init({
        cookie: cookie,  // cookie if already known, else can be generated using email/password
//        email: '...',    // optional, amazon email for login to get new cookie
//        password: '...', // optional, amazon password for login to get new cookie
        bluetooth: false,
        logger: console.log, // optional
        alexaServiceHost: 'pitangui.amazon.com', // optional, e.g. "pitangui.amazon.com" for amazon.com, default is "layla.amazon.de"
//        userAgent: '...', // optional, override used user-Agent for all Requests and Cookie determination
        acceptLanguage: 'en-US', // optional, override Accept-Language-Header for cookie determination
        amazonPage: 'amazon.com', // optional, override Amazon-Login-Page for cookie determination and referer for requests
        useWsMqtt: true // optional, true to use the Websocket/MQTT direct push connection
    },
    function (err) {
        if (err) {
            console.log (err);
            return;
        }
        // for (let device in this.names) {
        //     console.log (device);
        // }

        alexa.sendCommand("RZ", "goodmorning", null, function (err, payload) {

          if (err) {
            console.log(err);
            return;
          }

            console.log(payload);

        });

    }
);
