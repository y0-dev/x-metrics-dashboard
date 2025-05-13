require('dotenv').config();
const fs = require('fs');

const REDDIT_USERNAME = process.env.REDDIT_USERNAME;
const REDDIT_PASSWORD = process.env.REDDIT_PASSWORD;
const client_id = process.env.REDDIT_CLIENT_ID;
const client_secret = process.env.REDDIT_CLIENT_SECRET;

const getToken = async () => {
	const response = await fetch('https://www.reddit.com/api/v1/access_token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': 'Basic ' + btoa(client_id+':'+client_secret)
				},
				body: new URLSearchParams({
					grant_type: 'password',
					username: REDDIT_USERNAME,
					password: REDDIT_PASSWORD,
					scope: 'identity'
				})
			});
	const data = await response.json();
	if(data.access_token) {
		return data.access_token;
	} else
		throw new Error(`access_token error!` + data.error);
};

const fetchRedditPostsCount = async () => {
	const response = await fetch('https://www.reddit.com/user/'+REDDIT_USERNAME+'/submitted/new.json');

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	console.log(data);

	// Extract the metrics
	const metrics = data?.data?.children.length;

	return metrics;
};

const fetchRedditFollowerCount = async () => {
	let token = await getToken();
  const response = await fetch('https://oauth.reddit.com/api/v1/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);

  // Extract the metrics
  const metrics = {subscribers: data?.subreddit?.subscribers, posts_count: await fetchRedditPostsCount()};

  // Write the metrics to the environment file
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);
};

fetchRedditFollowerCount().catch(err => console.error(err));
