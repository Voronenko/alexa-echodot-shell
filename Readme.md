
## Inspiration

Originally I was inspired by possibility to spell custom phrases on Amazon Echo by reading following article
https://www.gehrig.info/alexa/Alexa.html 

Unfortunately, example did not work for myself out of the box - shell login never worked for me w/o captcha, 
thus next three points are on getting right session cookies.


## Cookies needed to work with "API"

To work with Echodot api via curl or wget, the easiest would be to store necessary session cookies in cookies.txt file.
Format:  the layout of Netscape's cookies.txt file is such that each line contains one name-value pair. 

An entry that looks like this:

```
.netscape.com   TRUE   /   FALSE   946684799   NETSCAPE_ID   100103
```

Each line represents a single piece of stored information. A tab is inserted between each of the fields.

From left-to-right, here is what each field represents:

domain - The domain that created AND that can read the variable.

flag - A TRUE/FALSE value indicating if all machines within a given domain can access the variable. This value is set automatically by the browser, depending on the value you set for domain.

path - The path within the domain that the variable is valid for.

secure - A TRUE/FALSE value indicating if a secure connection with the domain is needed to access the variable.

expiration - The UNIX time that the variable will expire on. UNIX time is defined as the number of seconds since Jan 1, 1970 00:00:00 GMT.

name - The name of the variable.

value - The value of the variable.


For working with Amazon Alexa API following minimal set of cookies are used:

```
.amazon.com	TRUE	/	FALSE	<expiration>	ubid-main	<censored>
.amazon.com	TRUE	/	FALSE	<expiration>	csrf	<censored>
.amazon.com	TRUE	/	FALSE	<expiration>	session-id	<censored>
.amazon.com	TRUE	/	FALSE	<expiration>	x-main	"<censored>"
.amazon.com	TRUE	/	FALSE	<expiration>	session-token	"<censored>"
.amazon.com	TRUE	/	TRUE	<expiration>	at-main	<censored>
```

Expiration can be set to some distant time in the future, like 2038 `2177406671` , but it is not clear, if it really prolonges session,
even if api is pinged from time to time.


## Manual way to retrieve alexa session cookies

Open anonymous tab, saying in Firefox browser. Use extension kind of  https://github.com/rotemdan/ExportCookies to export cookies for amazon.com domain.  Filter only cookies related to above.

Haven't compared, but other browsers should allow exporting cookies more or less easily too.


## More or less automated way to retrieve alexa session cookies

Approach found on  https://github.com/Apollon77/alexa-cookie can be used. It returns mostly cookie that plays well with 
https://github.com/Apollon77/alexa-remote

thus I had to modify slightly as `alexa-node-cookie-helper` to return also cookie.txt compatible output

```shell

node ./get-cookies-txt.js
```

What is good with that approach, is that if you get captcha (very often for USA amazon.com domain) - you have possibility to still login interactively and get necessary cookies

## Invoking alexa commands from the shell

Now you are able to place retrieved session cookies into `/tmp/.alexa.cookie` and use she

Here still the best is  shell script  https://github.com/thorsten-gehrig/alexa-remote-control by Thorsten Gehrig.
Which provides few useful options

```shell

alexa.sh [-d <device>|ALL] -e <pause|play|next|prev|fwd|rwd|shuffle|vol:<0-100>> |
          -b [list|<"AA:BB:CC:DD:EE:FF">] | -q | -r <"station name"|stationid> |
          -s <trackID|'Artist' 'Album'> | -t <ASIN> | -u <seedID> | -v <queueID> | -w <playlistId> |
          -i | -p | -P | -S | -a | -m <multiroom_device> [device_1 .. device_X] | -lastalexa | -l | -h

   -e : run command, additional SEQUENCECMDs:
        weather,traffic,flashbriefing,goodmorning,singasong,tellstory,speak:'<text>',automation:'<routine name>'
   -b : connect/disconnect/list bluetooth device
   -q : query queue
   -r : play tunein radio
   -s : play library track/library album
   -t : play Prime playlist
   -u : play Prime station
   -v : play Prime historical queue
   -w : play library playlist
   -i : list imported library tracks
   -p : list purchased library tracks
   -P : list Prime playlists
   -S : list Prime stations
   -a : list available devices
   -m : delete multiroom and/or create new multiroom containing devices
   -lastalexa : print device that received the last voice command
```

I am using alexa for some custom notifications, thus TTS option is expecially kind of interest for me

```shell

alexa.sh -d RZ -e "speak: 'meow'"
```

other automations are covered by openhab.


## Programming interface for nodeJS

Here again npm library  https://github.com/Apollon77/alexa-remote  is kind of interest, as contains few fresh commits.

Dirty example w/o promises below:

```js

let Alexa = require('alexa-remote2');
let alexa = new Alexa();

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


```


## Security

Current approaches involve storing sensitive session information on a disk, including in some cases login and password.
You definitely don't want to do that with your primary account - so you might create technical Amazon account, and add it
to your amazon household  as per  https://www.amazon.com/gp/help/customer/display.html?nodeId=201628040

Althouth it is said, that payment information is shared, by default payment sharing is NOT enabled, but with session made
with that shared account - you see devices and can call some api methods = which is promising.

Treat security with necessary importance. Proper way would be using alexa skill SDK. 

## Integration with SmartHome

Openhab has working binding https://www.openhab.org/addons/bindings/amazonechocontrol/ ; I am pretty sure, that other systems, like Domoticz have integrations already too.


## Summary

Even with limited set of commands, and a bit hakish way to work with device (will work until alexa.amazon.com logic remains unchanged) you can automate few additional things in your home. For more serious solutions you would need to implement your own Alexa skills.

 