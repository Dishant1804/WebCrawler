import { JSDOM } from 'jsdom';

/**
 * Normalizes a given URL by extracting and formatting its hostname and pathname.
 * Normalizing the url for a consistent format of url
 * 
 * @param {string} url - The URL to normalize.
 * @returns {string} The normalized URL string.
 */
export const normalizeURL = (url) => {
  const urlObj = new URL(url);
  let fullPath = `${urlObj.hostname}${urlObj.pathname}`;

  // Remove trailing slash if present
  if (fullPath.slice(-1) === '/') {
    fullPath = fullPath.slice(0, -1).toLowerCase();
  }

  return fullPath;
};

/**
 * getURLsFromHTML finds the backlinks from the given HTML string
 * 
 * @param {string} htmlBody - The HTML content to parse for links
 * @param {string} baseURL - The base URL to resolve relative links
 * @returns {string[]} The array with all the backlinks
 */
export const getURLsFromHTML = (htmlBody, baseURL) => {
  const urls = [];
  const dom = new JSDOM(htmlBody);
  const linkElements = dom.window.document.querySelectorAll('a');

  // Looping over every link element
  for (let i = 0; i < linkElements.length; i++) {
    if (linkElements[i].href.slice(0, 1) === '/') {
      // Relative URL (starts with '/')
      try {
        const urlObj = new URL(`${baseURL}${linkElements[i].href}`);
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`Error with relative url: ${err.message}`);
      }
    } else {
      // Absolute URL (complete URL)
      try {
        const urlObj = new URL(linkElements[i].href);
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`Error with absolute url: ${err.message}`);
      }
    }
  }
  console.log(urls);

  return urls;
};

/**
 * fetchWithTimeout fetches the URL with a specified timeout.
 * 
 * @param {string} url URL to fetch
 * @param {number} timeout Timeout duration in milliseconds
 * @returns {Promise<Response>} The fetch response
 * @throws {Error} If the fetch operation times out
 */
const fetchWithTimeout = (url, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const signal = controller.signal;

    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Fetch timeout after ${timeout}ms`));
    }, timeout);

    fetch(url, { signal })
      .then(response => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

/**
 * crawlPage fetches the page and extracts the HTML body
 * 
 * @param {string} url URL to extract the content of the page
 * @returns {Promise<string>} The HTML body of the page
 * @throws {Error} If the fetch fails or returns a non-OK status
 */
export const crawlPage = async (url) => {
  console.log(`Crawling ${url}...`);

  try {
    const response = await fetchWithTimeout(url, 10000); // 10 seconds timeout

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type'); // checking the right set of content-type
    if (!contentType || !contentType.includes('text/html')) {
      console.log(`Got non-HTML response: ${contentType}`);
      return;
    }
    
    const htmlBody = await response.text();
    console.log(htmlBody)
    getURLsFromHTML(htmlBody , url)
    return htmlBody;
  } catch (error) {
    console.error(`Failed to crawl ${url}: ${error.message}`);
    throw error;
  }
};
