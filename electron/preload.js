const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // No native APIs exposed for now.
    // Can add things like 'saveFile', etc. later.
});
