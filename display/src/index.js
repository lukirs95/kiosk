import './less/main.less';
import Flavor from './flavor.js';

const DATA_ENDPOINT = '/resources/flavors.json';
let flavors = [];
let lastModified = '';

// function fetchHead() {
//   return fetch(DATA_ENDPOINT, {
//     headers: {
//       method: 'HEAD',
//       'If-Modified-Since': lastModified
//     }
//   }).then((response) => {
//     if (response.status !== 304) {
//       return true;
//     }
//     if (!response.ok && response.status !== 304) {
//       throw new Error(`${response.status}: ${response.statusText}`);
//     }
//     return false;
//   });
// }

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

fetchJson().then((data) => {
  data.forEach((flavor) => {
    flavors.push(new Flavor(flavor).init(holder));
  });
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
