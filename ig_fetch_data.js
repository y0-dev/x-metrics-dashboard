require('dotenv').config();
const fs = require('fs');
const randomUseragent = require('random-useragent');

const fetchRedditFollowerCount = async () => {
  const response = await fetch('https://i.instagram.com/api/v1/users/web_profile_info/?username='+process.env.USERNAME, {
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'User-Agent': "Instagram 76.0.0.15.395 Android (24/7.0; 640dpi; 1440x2560; samsung; SM-G930F; herolte; samsungexynos8890; en_US; 138226743)",
      'Origin': 'https://www.instagram.com',
      'Referer': 'https://www.instagram.com',
    },
    cookies: {
        "sessionid": "value",
        "csrftoken": "value"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);//TODO 429 Too Many Requests
  }

  const html = await response.text();
  if (!html.startsWith('<!DOCTYPE')) {
  const data = await response.json();

    // Extract the metrics
    const metrics = {
        followers_count: data.data.user.edge_followed_by.count,
        following_count: data.data.user.edge_follow.count,
        posts_count: data.data.user.edge_owner_to_timeline_media.count
    };

    // Write the metrics to the environment file
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);
  } else console.log(html);//TODO login requirement=>quoi faire??
};

fetchRedditFollowerCount().catch(err => console.error(err));
