require('dotenv').config();
const fs = require('fs');

const fetchRedditFollowerCount = async () => {
  const response = await fetch('https://www.instagram.com/'+process.env.USERNAME+'/');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const html = await response.text();
  const des = html.match(/<meta property="og:description" content="(.*?)"/)[1].replace(/&[#A-Za-z0-9]+;/gi, '');
  const numbers = des.match(/\d+/g);

  // Extract the metrics
  const metrics = {followers_count: parseInt(numbers[0]), following_count: parseInt(numbers[1]), posts_count: parseInt(numbers[2])};

  // Write the metrics to the environment file
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);
};

fetchRedditFollowerCount().catch(err => console.error(err));
