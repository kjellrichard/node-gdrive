require('./bootstrap');
const {expect} = require('chai');
const {authorize} = require('../src/index')

const { GOOGLE_CLIENT_SECRET,GOOGLE_CLIENT_ID, GOOGLE_TOKEN_PATH, GOOGLE_REDIRECT_URI } = process.env;

describe('Authorize',()=>{
    it('should create authorizer by using environment variables', async ()=>{
        const auth = await authorize();
        expect(auth).to.be.an('object');
        expect(auth._clientId).to.equal(GOOGLE_CLIENT_ID);
        expect(auth._clientSecret).to.equal(GOOGLE_CLIENT_SECRET);
        expect(auth.redirectUri).to.equal(GOOGLE_REDIRECT_URI);
    })

    it('should create authorizer by using parameters', async ()=>{
        const auth = await authorize({clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, redirectUri: GOOGLE_REDIRECT_URI});
        expect(auth).to.be.an('object');
        expect(auth._clientId).to.equal(GOOGLE_CLIENT_ID);
        expect(auth._clientSecret).to.equal(GOOGLE_CLIENT_SECRET);
        expect(auth.redirectUri).to.equal(GOOGLE_REDIRECT_URI);
    })
})