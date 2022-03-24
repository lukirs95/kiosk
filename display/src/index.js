import './less/main.less';
import Flavor from './flavor.js';

const DATA_ENDPOINT = '/resources/flavors.json';
let flavors = [];
let lastModified = '';

function supEnum(sup) {
  switch (sup) {
    case 'L':
      return 'laktose';
    case 'V':
      return 'vegan';
    case 'E':
      return 'ei';
    case 'G':
      return 'gluten';
    case 'A':
      return 'alkohol';
    case 'N':
      return 'nüsse';
    default:
      return sup;
  }
}

function suplements(sups = []) {
  return document.createTextNode(
    sups.map(([sup]) => `${sup}: ${supEnum(sup)}`).join(', ')
  );
}

function fetchJson() {
  return fetch(DATA_ENDPOINT, {
    headers: {
      'If-Modified-Since': lastModified
    }
  })
    .then((response) => {
      if (response.status !== 304) {
        lastModified = response.headers.get('last-modified');
      }
      if (!response.ok && response.status !== 304) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response;
    })
    .then((response) => (response.ok ? response.json() : Promise.resolve()));
}

const holder = document.createElement('div');
holder.classList.add('flavor-container');

const sups = document.createElement('div');
sups.classList.add('additives');

fetchJson().then((data) => {
  data.forEach((flavor) => {
    flavors.push(new Flavor(flavor).init(holder));
  });
  sups.appendChild(suplements(Object.entries(data[0].additives)));
});

setInterval(() => {
  fetchJson().then((data) => {
    if (data) {
      flavors.forEach((flavor) => flavor.destroy(holder));
      flavors = [];
      data.forEach((flavor) => {
        flavors.push(new Flavor(flavor).init(holder));
      });
    }
  });
}, 1000);

document.body.appendChild(holder);
document.body.appendChild(sups);
