const url = process.env.OO_URL;
const user = process.env.OO_USER;
const password = process.env.OO_PASSWORD;
const stream = process.env.OO_STREAM || 'cicd';

if (!url || !user || !password) {
  console.log('OpenObserve secrets ausentes; se omite la notificación.');
  process.exit(0);
}

const payload = [{
  _timestamp: Date.now() * 1000,
  event: process.env.EVENT || 'ci_test',
  status: process.env.STATUS || 'unknown',
  sha: process.env.SHA || '',
  ref: process.env.REF || '',
  actor: process.env.ACTOR || '',
  run_id: process.env.RUN_ID || '',
  repository: process.env.GITHUB_REPOSITORY || '',
  service: 'uteqgram'
}];

const endpoint = `${url.replace(/\/$/, '')}/api/default/${stream}/_json`;
const auth = Buffer.from(`${user}:${password}`).toString('base64');

const res = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Basic ${auth}`
  },
  body: JSON.stringify(payload)
});

const text = await res.text();
if (!res.ok) {
  console.error(`OpenObserve respondió ${res.status}: ${text}`);
  process.exit(1);
}
console.log(`Evento ${payload[0].event}/${payload[0].status} enviado a ${stream}`);
