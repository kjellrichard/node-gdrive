# node-gdrive

## Usage ##
```javascript
const {authorize} = require('node-gdrive');
const auth = authorize({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: REDIRECT_URI
})

const fileInfo = await uploadCsv({                        
    auth,
    data: [
        {colA: 'val1A', colB: 'value1B'},
        {colA: 'val2A', colB: 'value2B'}
    ],
    name: 'name_of_file'
});

```

### Possible options ###
- `auth`: Google authorizer
- `filename` (string?): name of file to upload
- `data` (any[]): data to upload. Should be an array of objects
- `name` (string?): name of target file in Google Drive
- `folderName` (string?): name of target folder in Google Drive
- `removeFile` (boolean=false): if true, remove file `filename` after upload 
- `overwrite` (boolean=false): if true, overwrite file specified by `fileId` or `name` and `folderName`
- `fileId` (string?): id of file to ovewrite

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
