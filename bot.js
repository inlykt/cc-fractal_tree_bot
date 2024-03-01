// FILE: bot.js
// NAME: ftb
// AUTHOR(s): Josiah Fox
// DATE: 2024-02-29
// PURPOSE: post a fractal tree according to the tutorial by The Coding Train

require('dotenv').config();
const mastodon = require('mastodon-api');
const fs = require('fs');
const util = require('util');
const { devNull } = require('os');
const exec = util.promisify(require('child_process').exec);

console.log('mastodon bot starting...');

const M = new mastodon({
    client_key: process.env.CLIENT_KEY,
    client_secret: process.env.CLIENT_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    api_url: 'https://botsin.space/api/v1/', // optional, defaults to https://mastodon.social/api/v1/
})

const listener = M.stream('streaming/user');

listener.on('message', response => {
    if (response.event === 'notification' && response.data.type === 'mention') {
        const content = response.data.status.content;
        const cangle = content.replace(/FTB_36/g, '').match(/\d+/)
        const acct = response.data.account.acct;
        const reply_id = response.data.status.id;
        if (cangle) {
            angle = cangle[0]
            grow(angle)
                .then(() => upload('treegen/tree.png', `a fractal tree of ${angle}`))
                .then(img_id => toot(`here is your tree, @${acct}, with angle ${angle}`, reply_id, img_id))
                .catch(error => console.error(error))
        } else {
            toot(`@${acct}, please message me with a number!`, reply_id)
        }  
    }
})

async function grow(angle) {
    //builds tree returns nothing
    const response = await exec(`processing-java --sketch="${__dirname}/treegen" --run ${angle}`);
    console.log(angle)
}

async function upload(imgPath, imgDesc) { 
    //uploads image returns image id
    const params = {
        file: fs.createReadStream(imgPath),
        description: imgDesc
    }
    const response = await M.post('media', params);
    const id = response.data.id;
    console.log('uploaded')
    return id
}

async function toot(message, reply_id, media) {
    //toots image
    let params = {}
    if (media) {
        params = {
            status: message,
            in_reply_to_id: reply_id,
            media_ids: [media]
        }
    } else {
        params = {
            status: message,
            in_reply_to_id: reply_id
        }
    }
    const response = await M.post('statuses', params)
    console.log(response)
    return response;
}