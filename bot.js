// FILE: bot.js
// NAME: ftb
// AUTHOR(s): Josiah Fox
// DATE: 2024-02-29
// PURPOSE: post a fractal tree according to the tutorial by The Coding Train

require('dotenv').config();
const mastodon = require('mastodon-api');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

console.log('mastodon bot starting...');

const M = new mastodon({
    client_key: process.env.CLIENT_KEY,
    client_secret: process.env.CLIENT_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    api_url: 'https://botsin.space/api/v1/', // optional, defaults to https://mastodon.social/api/v1/
})

setInterval(() => {
    toot()
        .then(response => console.log(response))
        .catch(error => console.error(error));
}, 60000);

async function toot() {
    //builds tree
    const response1 = await exec('processing-java --sketch="' + __dirname + '/treegen" --run');
    const angle = response1.stdout.split('\n')[0].trimEnd();
    console.log(angle)
    
    //uploads image
    const params1 = {
        file: fs.createReadStream('treegen/tree.png'),
        description: `an RNG fractal tree with ${angle}`
    }
    const response2 = await M.post('media', params1);
    const id = response2.data.id;

    //toots image
    const params2 = {
        status: `a tree tho (angle: ${angle})`,
        media_ids: [id]
    }
    const response3 = await M.post('statuses', params2)
    return response3;
}