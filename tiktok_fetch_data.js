require('dotenv').config();
const fs = require('fs');
import _sodium from 'libsodium-wrappers';

const accessToken = process.env.TIKTOKTOKEN;
const client_id = process.env.TIKTOK_CLIENT_ID;
const client_secret = process.env.TIKTOK_CLIENT_SECRET;

const git_token = process.env.GIT_TOKEN;
const git_user = 'y0-dev';
const git_repo = 'x-metrics-dashboard';

const refreshToken = async () => {
//https://developers.tiktok.com/doc/oauth-user-access-token-management#2._refresh_an_access_token_using_a_refresh_token
	const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					grant_type: 'refresh_token',
					refresh_token: accessToken,
					client_key: client_id,
					client_secret: client_secret
				})
			});
	const data = await response.json();
	if(data.access_token) {
		await saveToken(data.access_token);
		return data.access_token;
	} else
		throw new Error(`access_token error!` + data.error_description);
};

const saveToken = async (token) => {
	
	const gitresponse = await fetch(' https://api.github.com/repos/'+git_user+'/'+git_repo+'/actions/secrets/public-key', {
				method: 'GET',
				headers: {
					'Accept': 'application/vnd.github+json',
					'Authorization': 'Bearer ' + git_token,
					'X-GitHub-Api-Version': '2022-11-28',
				}
			});
	const gitdata = await gitresponse.json();
	
	//https://docs.github.com/fr/rest/actions/secrets?apiVersion=2022-11-28#create-or-update-a-repository-secret
	//https://docs.github.com/fr/rest/guides/encrypting-secrets-for-the-rest-api?apiVersion=2022-11-28
	await _sodium.ready;
  const sodium = _sodium;
	// Convert the secret and key to a Uint8Array.
	let binkey = sodium.from_base64(gitdata.key, sodium.base64_variants.ORIGINAL)
	let binsec = sodium.from_string(token)

	// Encrypt the secret using libsodium
	let encBytes = sodium.crypto_box_seal(binsec, binkey)

	// Convert the encrypted Uint8Array to Base64
	let output = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL)
	
	const response = await fetch('https://api.github.com/repos/'+git_user+'/'+git_repo+'/actions/secrets/TIKTOKTOKEN', {
		method: 'PUT',
		headers: {
			'Accept': 'application/vnd.github+json',
			'Authorization': 'Bearer ' + git_token,
			'X-GitHub-Api-Version': '2022-11-28',
		},
		body: JSON.stringify({encrypted_value: output, key_id: gitdata.key_id})
	});
};

const fetchTiktokFollowerCount = async () => {
	let raccessToken = await refreshToken();
  const response = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=follower_count,likes_count,video_count', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${raccessToken}`,
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);

  // Extract the metrics
  const metrics = data?.data?.user;

  // Write the metrics to the environment file
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `METRICS=${JSON.stringify(metrics)}\n`);
};

fetchTiktokFollowerCount().catch(err => console.error(err));
