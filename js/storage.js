const STORAGE_TOKEN = 'D157N0KFKIOTG15LP98R8MIPKMF6MPSMUBMF3SRT';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';


/**
 * Saves a key-value pair into the backend storage
 *
 * @param {string} key - The key for the item
 * @param {*} value - The value to be stored
 * @returns {Promise} A promise that resolves when the item is successfully stored
 */
async function setItem(key, value) {
  const payload = { key, value, token: STORAGE_TOKEN };
  return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload)})
  .then(res => res.json());
}


/**
 * Loads a value from the backend storage based on the provided key
 *
 * @param {string} key - The key to retrieve the value
 * @returns {Promise} A promise that resolves with the retrieved value
 * @throws {Error} If the value cannot be found for the given key
 */
async function getItem(key) {
  const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
  return fetch(url).then(res => res.json()).then(res => {
      if (res.data) { 
          return res.data.value;
      } throw `Could not find data with key "${key}".`;
  });
}

  