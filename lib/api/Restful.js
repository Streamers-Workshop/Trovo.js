const https = require('https');

module.exports = class RestfulAPI {
  constructor(clientID) {
    if (!clientID)
      throw new Error(
        'Client ID Required for this Class to Properly Function. Please Visit: https://trovo.live/policy/apis-developer-doc.html',
      );
    this.clientID = clientID;
  }

  post(path, headers, data) {
    return new Promise((resolve, reject) => {
      headers['Content-Type'] = 'application/json';
      const req = https.request(
        {
          method: 'POST',
          hostname: 'open-api.trovo.live',
          port: 8080,
          path: `/openplatform/${path}`,
          headers,
        },
        (res) => {
          const chunks = [];
          res.on('data', (resData) => chunks.push(resData));
          res.on('end', () => {
            let body = Buffer.concat(chunks);
            switch (res.headers['content-type']) {
              case 'application/json':
                body = JSON.parse(body);
                break;
              default:
                break;
            }
            resolve(body);
          });
        },
      );
      req.on('error', reject);
      req.write(JSON.stringify(data));
      req.end();
    });
  }

  get(path, headers) {
    return new Promise((resolve, reject) => {
      headers['Content-Type'] = 'application/json';
      const req = https.request(
        {
          method: 'GET',
          hostname: 'open-api.trovo.live',
          port: 8080,
          path: `/openplatform/${path}`,
          headers,
        },
        (res) => {
          const chunks = [];
          res.on('data', (data) => chunks.push(data));
          res.on('end', () => {
            let body = Buffer.concat(chunks);
            switch (res.headers['content-type']) {
              case 'application/json':
                body = JSON.parse(body);
                break;
              default:
                break;
            }
            resolve(body);
          });
        },
      );
      req.on('error', reject);
      req.end();
    });
  }

  ValidateAccessToken(oauth) {
    return new Promise((resolve, reject) => {
      const headers = {
        'Client-ID': this.clientID,
        Authorization: `OAuth ${oauth}`,
      };
      this.get('validate', headers)
        .then((data) => {
          if (data.error) {
            reject(data);
          } else {
            resolve(data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  RevokeAccessToken(oauth, token) {
    return new Promise((resolve, reject) => {
      const headers = {
        'Client-ID': this.clientID,
        Authorization: `OAuth ${oauth}`,
      };
      const input = {
        access_token: token,
      };
      this.post('revoke', headers, input)
        .then((data) => {
          if (data.error) {
            reject(data);
          } else {
            resolve(data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  GetGameCategory() {
    return new Promise((resolve, reject) => {
      const headers = {
        'Client-ID': this.clientID,
      };
      this.get('categorys/top', headers)
        .then((data) => {
          if (data.error) {
            reject(data);
          } else {
            resolve(data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  GetChannelInfoByID(channelID) {
    return new Promise((resolve, reject) => {
      const headers = {
        'Client-ID': this.clientID,
      };
      const input = {
        channel_id: channelID,
      };
      this.post('channels/id', headers, input)
        .then((data) => {
          if (data.error) {
            reject(data);
          } else {
            resolve(data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  ReadChannelInfo(oauth) {
    return new Promise((resolve, reject) => {
      const headers = {
        'Client-ID': this.clientID,
        Authorization: `OAuth ${oauth}`,
      };
      this.get('channel', headers)
        .then((data) => {
          if (data.error) {
            reject(data);
          } else {
            resolve(data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  EditChannelInformation(channelID, title, languageCode, audiType, oauth) {
    return new Promise((resolve, reject) => {
      const headers = {
        'Client-ID': this.clientID,
        Authorization: `OAuth ${oauth}`,
      };
      const input = {
        channel_id: channelID,
        live_title: title,
        language_code: languageCode,
        audi_type: audiType,
      };
      this.post('channels/update', headers, input)
        .then((data) => {
          if (data.error) {
            reject(data);
          } else {
            resolve(data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  GetUserInfo(oauth) {
    return new Promise((resolve, reject) => {
      const headers = {
        'Client-ID': this.clientID,
        Authorization: `OAuth ${oauth}`,
      };
      this.get('getuserinfo', headers)
        .then((data) => {
          if (data.error) {
            reject(data);
          } else {
            resolve(data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  GetTopChannels(limit, categoryID, token, cursor) {
    if ((limit && limit > 100) || limit < 0)
      throw new Error('Maximum number of objects to return. Maximum: 100. Default: 20.');
    return new Promise((resolve, reject) => {
      const headers = {
        'Client-ID': this.clientID,
      };
      const input = {
        limit: limit || 20,
      };
      if (categoryID) input.category_id = categoryID;
      if (token) input.token = token;
      if (cursor) input.cursor = cursor;

      this.post('gettopchannels', headers, input)
        .then((data) => {
          if (data.error) {
            reject(data);
          } else {
            resolve(data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
