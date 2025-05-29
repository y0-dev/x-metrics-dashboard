import instaloader
import os
import json

# Create an Instaloader instance
L = instaloader.Instaloader()

# Log in to Instagram
username = os.environ['USERNAME']
#password = os.environ['PASSWORD']
#L.context.log("Logging in...")
#L.context.session_id = None  # Force new session
#L.interactive_login(username)

# Get the current followers
profile = instaloader.Profile.from_username(L.context, username)
L.context.log("Getting followers...")
current_followers = set(profile.get_followers())

#TODO Need to be logged in to use get_followers? https://instaloader.github.io/module/structures.html#instaloader.Profile.get_followers

metrics = {subscribers: current_followers}

# Write the metrics to the environment file
with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
    fh.write('METRICS='+json.dumps(metrics)+'\n')