document.body.innerHTML = `
    <div id="chatContainer"></div>
    <input id="userInput" />
    <button id="sendBtn"></button>
    <button id="themeToggleBtn"></button>
    <i id="themeIcon"></i>
    <button id="clearChatBtn"></button>
    <div id="welcomeMessage"></div>
    <input id="fileUpload" />
    <button id="uploadBtn"></button>
`;
global.marked = { setOptions: jest.fn() };
