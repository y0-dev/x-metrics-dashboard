require('dotenv').config();
const fs = require('fs');

const REDDIT_USERNAME = process.env.REDDIT_USERNAME;
const REDDIT_PASSWORD = process.env.REDDIT_PASSWORD;
const client_id = process.env.REDDIT_CLIENT_ID;
const client_secret = process.env.REDDIT_CLIENT_SECRET;

const fetchReddit = async () => {
	const response = await fetch('https://www.reddit.com/r/u_'+process.env.REDDIT_USERNAME+'/about.json'
		, {
			headers: {
				   'Accept': '*/*',
				   'Accept-Encoding': 'gzip, deflate, br',
				   'Accept-Language': 'en-US,en;q=0.9',
				   'Connection': 'keep-alive',
				   'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
				   'Origin': 'https://www.reddit.com',
				   'Referer': 'https://www.reddit.com',
			}
		});

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
