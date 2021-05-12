const { google } = require('googleapis');
const { readFile, writeFile } = require('fs/promises');

const readline = require('readline');
const os = require('os');
const path = require('path');
const SCOPES = process.env['GOOGLE_DRIVE_SCOPES'] || ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = process.env['GOOGLE_DRIVE_TOKEN_PATH'] || path.resolve(os.homedir(), '.gdrive-token');
const CLIENT_ID = process.env['GOOGLE_CLIENT_ID'];
const CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'];
const REDIRECT_URI = process.env['GOOGLE_REDIRECT_URI'];

function getOAuthClient({ client_id, client_secret, redirect_uris = [], redirect_uri = null }) {
    return new google.auth.OAuth2(
        client_id, client_secret, redirect_uri || redirect_uris[0]
    );
}
async function prompt(text) {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(text, (value) => {
            rl.close();
            resolve(value)
        });
    })
}

async function tryReadToken(tokenPath) {
    try {
        return JSON.parse(await readFile(tokenPath));
    } catch (e) {
        return null;
    }
}
async function getAccessTokens(oAuthClient, tokenPath) {
    const cachedToken = await tryReadToken(tokenPath);
    if (cachedToken)
        return cachedToken;

    const authUrl = oAuthClient.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('Authorize this app by visiting this url:', authUrl);
    const code = await prompt('Enter the code from that page here: ');

    const { tokens } = await oAuthClient.getToken(code);
    await writeFile(tokenPath, JSON.stringify(tokens));
    return tokens;
}

async function setAccessTokens(oAuthClient, tokenPath) {
    const tokens = await getAccessTokens(oAuthClient, tokenPath);
    await oAuthClient.setCredentials(tokens);
}

async function authorize({file, clientId,clientSecret,redirectUri,tokenPath}={}) {    
    let auth;
    if (file) {
        auth = getOAuthClient(JSON.parse(await readFile(file)).installed);
    } else {
        const client_id = clientId || CLIENT_ID;
        const client_secret = clientSecret || CLIENT_SECRET;
        const redirect_uri = redirectUri || REDIRECT_URI;
        auth = getOAuthClient({ client_id, client_secret, redirect_uri });
    }
    await setAccessTokens(auth, tokenPath || TOKEN_PATH);
    return auth;
}


module.exports = authorize;