# node-gdrive

## Usage ##
```javascript
const {authorize} = require('node-gdrive');
const auth = authorize({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: REDIRECT_URI
})
```
### Authorize - use environment variables ###
```javascript
const auth = await authorize();  
```

### Authorize - use credentials file ###
```javascript
const auth = await authorize({file: 'path_to_credential_file'}); 
```



## Links ##
About: https://developers.google.com/drive/api/v3/about-sdk

Searching: https://developers.google.com/drive/api/v3/search-files
