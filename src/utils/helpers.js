export const toBeautifulJSONString = (obj) => JSON.stringify(obj, null, 4);

export const extractPrices = (text, priceRegExp) => {
  return [...text.matchAll(priceRegExp)].map(match => match[0]).join('; ');
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const isValidUsername = (username) => {
  return typeof username === 'string' && username.length > 0;
};