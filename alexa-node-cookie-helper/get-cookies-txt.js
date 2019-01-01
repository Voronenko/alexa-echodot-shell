/* jshint -W097 */
/* jshint -W030 */
/* jshint strict: false */
/* jslint node: true */
/* jslint esversion: 6 */

alexaCookie = require('./alexa-cookie');
cookieFile = require('cookiefile');
cookie = require('cookie');
Cookie = cookieFile.Cookie;
CookieMap = cookieFile.CookieMap;

const config = {
    logger: console.log,
    setupProxy: true,           // optional: should the library setup a proxy to get cookie when automatic way did not worked? Default false!
    proxyOwnIp: 'localhost',          // required if proxy enabled: provide own IP or hostname to later access the proxy. needed to setup all rewriting and proxy stuff internally
    proxyPort: 3001,            // optional: use this port for the proxy, default is 0 means random port is selected
    proxyListenBind: '0.0.0.0', // optional: set this to bind the proxy to a special IP, default is '0.0.0.0'
    proxyLogLevel: 'info',

    amazonPage: 'amazon.com',  // optional: possible to use with different countries, default is 'amazon.de'
    acceptLanguage: 'en-US',   // optional: webpage language, should match to amazon-Page, default is 'de-DE'
//    userAgent: '...',          // optional: own userAgent to use for all request, overwrites default one, should not be needed
    proxyOnly: true,           // optional: should only the proxy method be used? WHen no email/passwort are provided this will set to true automatically, default: false
    setupProxy: true,          // optional: should the library setup a proxy to get cookie when automatic way did not worked? Default false!
    amazonPageProxyLanguage: 'en_US' // optional: language to be used for the Amazon Signin page the proxy calls. default is "de_DE")
//    formerRegistrationData: { ... } // option/preferred: provide the result object from subsequent proxy usages here and some generated data will be reused for next proxy call too

};

alexaCookie.generateAlexaCookie('EMAIL', 'PASS', config, (err, result) => {
    console.log('RESULT: ' + err + ' / ' + JSON.stringify(result));
    if (result && result.csrf) {
        alexaCookie.stopProxyServer();
        var localCookies = cookie.parse(result.localCookie);
        var loginCookies = cookie.parse(result.loginCookie);

        var alexaCookiePack = [
            new Cookie({
                domain: ".amazon.com",
                name: "ubid-main",
                value: loginCookies["ubid-main"],
                https: false, // default
                httpOnly: false, //default
                crossDomain: true, // default
                expire: Date.now() + 360000 // default: 0
            }),
            new Cookie({
                domain: ".amazon.com",
                name: "csrf",
                value: localCookies["csrf"],
                https: false, // default
                httpOnly: false, //default
                crossDomain: true, // default
                expire: new Date(2038, 12, 27, 16, 34, 30, 0) // default: 0
            }),
            new Cookie({
                domain: ".amazon.com",
                name: "session-id",
                value: loginCookies["session-id"],
                https: false, // default
                httpOnly: false, //default
                crossDomain: true, // default
                expire: new Date(2038, 12, 27, 16, 34, 30, 0) // default: 0
            }),
            new Cookie({
                domain: ".amazon.com",
                name: "x-main",
                value: loginCookies["x-main"],
                https: false, // default
                httpOnly: false, //default
                crossDomain: true, // default
                expire: new Date(2038, 12, 27, 16, 34, 30, 0) // default: 0
            }),
            new Cookie({
                domain: ".amazon.com",
                name: "session-token",
                value: loginCookies["session-token"],
                https: false, // default
                httpOnly: false, //default
                crossDomain: true, // default
                expire: new Date(2038, 12, 27, 16, 34, 30, 0) // default: 0
            }),
            new Cookie({
                domain: ".amazon.com",
                name: "at-main",
                value: loginCookies["at-main"],
                https: true, // default
                httpOnly: false, //default
                crossDomain: true, // default
                expire: new Date(2038, 12, 27, 16, 34, 30, 0) // default: 0
            })                                      
        ];
        cookieFile = new CookieMap(alexaCookiePack);
        const fs = require('fs');
        fs.writeFile("/tmp/.alexa.cookie", cookieFile.toString(), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file /tmp/.alexa.cookie was saved!");
        });
        fs.writeFile("/tmp/.alexa.json", JSON.stringify(result, null, 2), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file /tmp/.alexa.json was saved!");
        });        
    }
});
