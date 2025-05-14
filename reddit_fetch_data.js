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
					scope: 'identity,history'
				})
			});
	const data = await response.json();
	if(data.access_token) {
		return data.access_token;
	} else
		throw new Error(`access_token error!` + data.error);
};

//https://www.reddit.com/dev/api/#GET_user_{username}_submitted
const fetchRedditPostsCount = async (token) => {
	const response = await fetch('https://oauth.reddit.com/user/'+REDDIT_USERNAME+'/submitted/new.json', {
		headers: {
			//"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
			'Authorization': `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		console.log(await response.text());
		throw new Error(`HTTP error! status: ${response.status} for ${response.url}`);
	}

	const data = await response.json();
	//console.log(data);

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
  //console.log(data);

  // Extract the metrics
  const metrics = {subscribers: data?.subreddit?.subscribers, posts_count: await fetchRedditPostsCount(token)};

  // Write the metrics to the environment file
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);
};

fetchRedditFollowerCount().catch(err => console.error(err));
