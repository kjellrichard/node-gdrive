require('./bootstrap');

const {expect} = require('chai');
const {authorize,find,list,uploadCsv, removeFile} = require('../src/index')
describe('Drive',()=>{
    it('should list files', async ()=>{
        const auth = await authorize();
        const files = await list({auth});
        expect(files).to.be.an('array');
        expect(files.length).to.be.greaterThan(0);
    })

    it('should find a file',async ()=>{
        const auth = await authorize();
        const file = await find({auth, name:'a', exact:false});
        expect(file).to.have.all.keys('id','name','webViewLink','mimeType' )
    })

    it('should find a folder',async ()=>{
        const auth = await authorize();
        const file = await find({auth, type:'folder', name: 'a', exact: false });
        expect(file).to.have.all.keys('id','name','webViewLink','mimeType' )
        expect(file.mimeType).to.contain('folder');
    })

    it('should upload some data', async ()=>{
        const auth = await authorize();        
        const file = await uploadCsv({
            auth,
            data: [
                {colA: 'val1A', colB: 'value1B'},
                {colA: 'val2A', colB: 'value2B'}
            ],
            name: 'test'            
        })  
        expect(file).to.be.a('object')
        expect(file).to.have.property('id');
        const removeResult = await removeFile({auth,fileId: file.id})     
        expect(removeResult).to.be.undefined;
    }).timeout(1000 * 10)

    it('should override existing file based on name', async ()=>{
        const name = `test-${Date.now()}`;
        const auth = await authorize();
        const file1 = await uploadCsv({
            auth,
            data: [
                {colA: 'val1A', colB: 'value1B'},
                {colA: 'val2A', colB: 'value2B'}
            ],
            name
        });
        
        const file2 = await uploadCsv({
            auth,
            data: [
                {newColA: 'val1A', newColB: 'value1B'},
                {newColA: 'val2A', newColB: 'value2B'}
            ],
            name,
            overwrite: true
        })
        expect(file1.id).to.be.equal(file2.id);
        await removeFile({auth, fileId: file1.id})
    }).timeout(Infinity)

    it('should overwrite existing file based on id', async ()=>{
        const name = `test-${Date.now()}`;
        const name2 = `name2`;
        const auth = await authorize();
        const file1 = await uploadCsv({
            auth,
            data: [
                {colA: 'val1A', colB: 'value1B'},
                {colA: 'val2A', colB: 'value2B'}
            ],
            name
        });
        
        const file2 = await uploadCsv({
            auth,
            data: [
                {newColA: 'val1A', newColB: 'value1B'},
                {newColA: 'val2A', newColB: 'value2B'}
            ],
            fileId: file1.id,
            name: name2,
            overwrite: true
        })
        expect(file1.id).to.be.equal(file2.id);
        expect(file2.name).to.be.equal(name2);
        await removeFile({auth, fileId: file1.id})
    }).timeout(Infinity)
})