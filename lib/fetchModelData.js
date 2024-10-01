var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/

function fetchModel(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';  // Expecting a JSON response

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Successfully fetched data
        resolve({ data: xhr.response });
      } else {
        // If the status is not in the success range, reject the promise
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      }
    };

    xhr.onerror = function () {
      // Handle network errors
      reject({
        status: xhr.status,
        statusText: xhr.statusText
      });
    };

    xhr.send();  // Send the request
  });
}

export default fetchModel;
