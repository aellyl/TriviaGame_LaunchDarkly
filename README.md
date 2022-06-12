# TriviaGame_LaunchDarkly

## Set up instruction

1. Download the entire folder 
2. unzip and do not change any of the file structure
3. Edit `app.js` in assets/javascript folder and set the value of `clientId` to your LaunchDarkly client-side ID.  Set `flagKey` to an boolean feature flag.

```
const clientSideID = 'yourclientId';
const flagKey = 'yourflagkey';
```
4. Open `index.html` in a browser

When the feature flag is on, the `start` button is disabled. `short game` and `long game` buttons are enabled.
Refresh `index.html` when you toggle the feature flag.
