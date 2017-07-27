## BD Plugin Support
Userscript that allows you to use BetterDiscord plugins in your browser, without installing BetterDiscord. This userscript comes bundled with an example plugin called Replace and Highlight, which only highlights greentexts by default.

## Usage Instructions
1. Install [Tampermonkey](https://tampermonkey.net/) extension
2. [Click here](https://raw.githubusercontent.com/LoveEevee/BD-Plugin-Support/master/bd-plugin-support.user.js) to install the userscript
3. Go to Tampermonkey dashboard and click on "BD Plugin Support" userscript to edit it
4. Paste a BetterDiscord plugin at the end
5. At the start of the plugin:

| If the plugin starts with        | Replace the code with                  |
| -------------------------------- | -------------------------------------- |
| `//META{"name":"pluginname"}*//` | `META({"name":"pluginname"})`          |
| `class pluginname{`              | `window.pluginname=class pluginname{`  |
| `var pluginname = function() {}` | `window.pluginname = function() {}`    |

## Limitations
* This userscript currently lacks support for plugin settings
* Some BD APIs are unimplemented

## License
The author of this work hereby waives all claim of copyright (economic and moral) in this work and immediately places it in the public domain; it may be used, distorted or destroyed in any manner whatsoever without further attribution or notice to the creator.
