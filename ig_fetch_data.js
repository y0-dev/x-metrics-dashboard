require('dotenv').config();
const fs = require('fs');
const randomUseragent = require('random-useragent');

const fetchIGFollowerCount = async () => {
  const response = await fetch(
      'https://instagram-profile1.p.rapidapi.com/getprofile/'+process.env.USERNAME//50calls/month
      //'https://instagram120.p.rapidapi.com/api/instagram/profile'//based on public logged out data so fake followers number, same as instagram-looter2
      //'https://i.instagram.com/api/v1/users/web_profile_info/?username='+process.env.USERNAME
      , {
    // headers: {
    //   'Accept': '*/*',
    //   'Accept-Encoding': 'gzip, deflate, br',
    //   'Accept-Language': 'en-US,en;q=0.9',
    //   'Connection': 'keep-alive',
    //   'User-Agent': "Instagram 76.0.0.15.395 Android (24/7.0; 640dpi; 1440x2560; samsung; SM-G930F; herolte; samsungexynos8890; en_US; 138226743)",
    //   'Origin': 'https://www.instagram.com',
    //   'Referer': 'https://www.instagram.com',
    //   "X-IG-App-ID": "936619743392459",
    //   'Cookies': 'sessionid=value; csrftoken=value;',
    // },
        //method: 'POST',
        headers: {
          'x-rapidapi-key': process.env.API_KEY,
          'x-rapidapi-host': 'instagram-profile1.p.rapidapi.com',
          'Content-Type': 'application/json'
        }//,
        //body: JSON.stringify({ username: process.env.USERNAME })
      });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);//TODO 429 Too Many Requests
  }
  console.log(await response.text());

  const data = await response.json();

    // Extract the metrics
    const metrics = {
        followers_count: data.followers,//data.result.edge_followed_by.count,//data.data.user.edge_followed_by.count,
        following_count: data.following,//data.result.edge_follow.count,//data.data.user.edge_follow.count,
        posts_count: data.media_count,//data.result.edge_owner_to_timeline_media.count//data.data.user.edge_owner_to_timeline_media.count
    };

    // Write the metrics to the environment file
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);
};

fetchIGFollowerCount().catch(err => console.error(err));
