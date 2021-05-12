const { google } = require('googleapis');
const { writeCsv, deleteFile } = require('node-file');
const fs = require('fs');
const path = require('path');

function getDrive(auth) {
    return google.drive({ version: 'v3', auth });
}
async function list({ auth,
    fields = 'nextPageToken, files(id, name, mimeType, webViewLink)',
    supportsAllDrives = true,
    corpora = 'allDrives',
    includeItemsFromAllDrives = true,
    ...listParams
}) {
    const drive = getDrive(auth);
    const res = await drive.files.list({
        fields,
        corpora,
        supportsAllDrives,
        includeItemsFromAllDrives,

        ...listParams
    });
    return res.data.files;
}

async function find({ auth, name, exact = true, type = 'file', parent = undefined }) {
    let qs = [
        `mimeType ${type === 'folder' ? '' : '!'}= 'application/vnd.google-apps.folder'`,
        `name ${exact ? '=' : 'contains'} '${name}'`,
        'trashed = false'
    ]
    if (parent)
        qs.push(`'${parent}' in parents`)
    const q = qs.join(' and ');
    const files = await list({ auth, q })
    return files[0];
}

async function uploadCsv({ auth, filename, data, name, folderName, removeFile = false, overwrite = false }) {
    if (!data && !filename)
        throw new Error('Either filename or data must be provided');
    if (data) {
        if (filename)
            throw new Error('Both filename and data provided');
        if (!name)
            throw new Error('Name is missing');
        filename = '.temp';
        removeFile = true;
        await writeCsv(data, filename, { separator: ',', verbose: false })
    }
    let folder = undefined;
    let existingFile = undefined;
    if (!name)
        name = path.basename(filename, path.extname(filename));

    const fileMetaData = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.spreadsheet'
    }

    if (folderName) {
        folder = await find({ auth, name: folderName, type: 'folder' })
        if (!folder)
            throw new Error(`Folder not found: "${folderName}"`);
        fileMetaData.parents = [folder.id];
    }
    if (overwrite)
        existingFile = await find({ auth, name, type: 'file', parent: folder?.id })  

    const media = {
        mimeType: 'text/csv',
        body: fs.createReadStream(filename)
    };
    const drive = getDrive(auth);
    const createOrUpdateParams = {
        resource: existingFile ? undefined : fileMetaData,
        media,
        fields: 'id, name, webViewLink, parents',
        supportsAllDrives: true,
        corpora: 'allDrives',
        includeItemsFromAllDrives: true
    }
    let res;
    if (overwrite && existingFile)
        res = await drive.files.update({
            ...createOrUpdateParams,
            fileId: existingFile.id,
        })
    else
        res = await drive.files.create(createOrUpdateParams)

    if (removeFile && filename)
        await deleteFile(filename);

    return {...res.data,folder: folder}
}

async function removeFile({ auth, fileId }) {
    const drive = getDrive(auth);
    await drive.files.delete({ fileId, supportsAllDrives: true })
    return;
}


module.exports = {
    list,
    uploadCsv,
    find,
    removeFile
}