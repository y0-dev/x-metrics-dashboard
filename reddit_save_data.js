const fs = require('fs');

// Parse the JSON string from the environment variable
const metrics = JSON.parse(process.env.METRICS);
const path = './data/reddit.json';
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

let data = [];
if (fs.existsSync(path)) {
    data = JSON.parse(fs.readFileSync(path));
}

const todayIndex = data.findIndex(entry => entry.date === today);
if (todayIndex > -1) {
    data[todayIndex] = { date: today, ...metrics };
} else {
    data.push({ date: today, ...metrics });
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
