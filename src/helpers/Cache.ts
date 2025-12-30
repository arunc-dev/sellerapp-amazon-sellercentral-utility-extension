export const IS_WELCOME_PAGE_SHOWN = "IS_WELCOME_PAGE_SHOWN";

export const get = (key: string) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (results) => {
      if (results[key]) {
        resolve(results[key]);
      } else {
        reject(new Error(`key ${key} not found.`));
      }
    });
  });
};

export const set = (key: string, value: any) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve(true);
    });
  });
};

export const remove = (key: string) => {
  chrome.storage.local.remove(key, () => {
    console.log("removed");
  });
};
