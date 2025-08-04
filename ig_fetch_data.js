require('dotenv').config();
const fs = require('fs');
const randomUseragent = require('random-useragent');

const fetchRedditFollowerCount = async () => {
  const response = await fetch('https://www.instagram.com/'+process.env.USERNAME+'/', {
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'User-Agent': randomUseragent.getRandom(),
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);//TODO 429 Too Many Requests
  }

  const html = await response.text();
  var des = html.match(/<meta property="og:description" content="(.*?)"/);
  if(des){
    des = [1].replace(/&[#A-Za-z0-9]+;/gi, '');
    const numbers = des.match(/\d+/g);

    // Extract the metrics
    const metrics = {followers_count: parseInt(numbers[0]), following_count: parseInt(numbers[1]), posts_count: parseInt(numbers[2])};

    // Write the metrics to the environment file
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);
  } else console.log(html);
};

fetchRedditFollowerCount().catch(err => console.error(err));
