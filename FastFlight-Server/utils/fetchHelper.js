import Logger from './logger';
import fetch from 'node-fetch';

export async function requestGet(url, header) {
  const option = {
    method: 'GET',
    headers: {
      ...header,
      'content-Type': 'application/json;Charset=UTF-8',
    },
  };
  return executeFetch(url, option);
}

export async function requestPost(url, body, header) {
  body = JSON.stringify(body);
  const option = {
    method: 'POST',
    body,
    headers: {
      ...header,
      'content-Type': 'application/json;Charset=UTF-8',
    },
  };
  return executeFetch(url, option);
}

export async function requestPut(url, body, header) {
  body = JSON.stringify(body);
  const option = {
    method: 'PUT',
    body,
    headers: {
      ...header,
      'content-Type': 'application/json;Charset=UTF-8',
    },
  };
  return executeFetch(url, option);
}

export async function requestDelete(url, body, header) {
  body = JSON.stringify(body);
  const option =
    body !== null
      ? {
          method: 'DELETE',
          body,
          headers: {
            ...header,
            'content-Type': 'application/json;Charset=UTF-8',
          },
        }
      : {
          method: 'DELETE',
          headers: {
            ...header,
          },
        };
  return executeFetch(url, option);
}

export async function executeFetch(url, option) {
  Logger.log(url);
  return fetch(url, option)
    .then(async res => {
      const response = {
        statusCode: res.status,
        body: await res.json(),
      };
      Logger.log(response);
      return response;
    })
    .catch(err => {
      Logger.log(err);
      throw 'Network Error';
    });
}
