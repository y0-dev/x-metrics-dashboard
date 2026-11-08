require('dotenv').config();
const fs = require('fs');

const REDDIT_USERNAME = process.env.REDDIT_USERNAME;
const REDDIT_PASSWORD = process.env.REDDIT_PASSWORD;
const client_id = process.env.REDDIT_CLIENT_ID;
const client_secret = process.env.REDDIT_CLIENT_SECRET;

const fetchReddit = async () => {
	const response = await fetch('https://www.reddit.com/r/u_'+process.env.REDDIT_USERNAME+'/about.json');

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	if (data.error) {
		throw new Error(`HTTP error! status: ${data.status} message: ${data.message}`);
	}

	// Extract the metrics
	const metrics = {subscribers: data.data.subscribers, posts_count: 5};

	// Write the metrics to the environment file
	fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);
};

fetchReddit().catch(err => {
	console.log(err);
	fetchReddit();//try again
});
