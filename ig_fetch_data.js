require('dotenv').config();
const fs = require('fs');
const randomUseragent = require('random-useragent');

const fetchRedditFollowerCount = async () => {
  const response = await fetch('https://www.instagram.com/'+process.env.USERNAME+'/', {
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'User-Agent': "Instagram 76.0.0.15.395 Android (24/7.0; 640dpi; 1440x2560; samsung; SM-G930F; herolte; samsungexynos8890; en_US; 138226743)",
      'Origin': 'https://www.instagram.com',
      'Referer': 'https://www.instagram.com',
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);//TODO 429 Too Many Requests
  }

  const data = await response.json();

    // Extract the metrics
    const metrics = {
        followers_count: data.data.user.edge_followed_by.count,
        following_count: data.data.user.edge_follow.count,
        posts_count: data.data.user.edge_owner_to_timeline_media.count
    };

    // Write the metrics to the environment file
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);
};

fetchRedditFollowerCount().catch(err => console.error(err));
