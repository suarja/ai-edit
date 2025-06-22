const { ApifyClient } = require('apify-client');
// dotenv
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

const token = "";
if (!token) {
    throw new Error('APIFY_API_TOKEN is not set');
}
// Initialize the ApifyClient with API token
const client = new ApifyClient({ token });

const actorId = 'GdWCkxBtKWOsKjdch'; // Tiktok scraper actor



// Prepare Actor input
const input = {

    "profiles": [
        "swarecito"
    ],
    "profileSorting": "latest",
    "excludePinnedPosts": false,
    "resultsPerPage": 50,
    "maxProfilesPerQuery": 10,
    "shouldDownloadVideos": false,
    "shouldDownloadCovers": false,
    "shouldDownloadSubtitles": false,
    "shouldDownloadSlideshowImages": false,
    "shouldDownloadAvatars": false,
    "shouldDownloadMusicCovers": false,
    "proxyCountryCode": "None",
  
  
};

function addRunToFile(run) {
    const fileName = 'run.json';
    if (!fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, JSON.stringify(run, null, 2));
    } else {
        const runs = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        runs.push(run); 
        fs.writeFileSync(fileName, JSON.stringify(runs, null, 2));
    }
}

function addItemsToDataset(items, runId) { 
    const fileName = `dataset-${runId}.json`;
    if (!fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, JSON.stringify(items, null, 2));
    } else {
        const dataset = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        dataset.push(...items);
        fs.writeFileSync(fileName, JSON.stringify(dataset, null, 2));
    }
}     

async function makeRun(input) {
    const run = await client
    .actor(actorId)
    .start(input);
    return run; 
}

async function getRunResult(id){
    const run = await client.run(id).get();
    return run;
}
function getRunId() {
    const fileName = 'run.json';
    const run = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    const runId = run[run.length - 1].id;
    return runId;
}

function getDefaultDatasetId() {    
    const fileName = 'run.json';
    const runs = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    const run = runs[runs.length - 1];
    return run.defaultDatasetId;
}

async function getItemsFromDataset(datasetId) {
    const {items} = await client.dataset(datasetId).listItems();
    return items;
}

function addRunResultToFile(run) {
    // make a file name with the date and time and the run id
    const fileName = `run-result-${run.id}.json`;
    if (!fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, JSON.stringify(run, null, 2));
    } else {
        const runs = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        runs.push(run);
        fs.writeFileSync(fileName, JSON.stringify(runs, null, 2));
    }
}

    
(async () => {
//     const webhooksClient = client.webhooks();

// await webhooksClient.create({
//     description: 'Tiktok scraper actor',
//     condition: { actorId: actorId }, // Actor ID of apify/instagram-hashtag-scraper
//     // Request URL can be generated using https://webhook.site. Any REST server can be used
//     requestUrl: 'https://webhook.site/e723954e-5053-4cb8-9e7b-fee5e1366aa5',
//     eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED', 'ACTOR.RUN.TIMED_OUT', 'ACTOR.RUN.ABORTED'],
// });

    // Make run
    // const run = await makeRun(input);

    // console.log(run);
    // addRunToFile(run);

    // Fetch and print Actor results from the run's dataset (if any)
    // console.log('Results from dataset');
    // const runId = getRunId();
    // console.log(runId);
    // const run = await getRunResult(runId);
    // console.log(run);
    // addRunResultToFile(run);


    // Get items from dataset
    const datasetId = getDefaultDatasetId();
    console.log(datasetId);
    const runId = getRunId();
    const items = await getItemsFromDataset(datasetId, runId);
    console.log(JSON.stringify(items, null, 2));
    addItemsToDataset(items, runId);


})();