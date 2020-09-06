const fetch = require('node-fetch');

const { ApolloClient } = require('apollo-client');
const { ApolloLink } = require('apollo-link');
const { createHttpLink } = require('apollo-link-http');
const { createPersistedQueryLink } = require('apollo-link-persisted-queries');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { gql } = require('@apollo/client');
const msdk = require('./msdk');

class TrovoApollo {
  constructor() {
    this.link = ApolloLink.from([
      createPersistedQueryLink({ useGETForHashedQueries: true }),
      createHttpLink({
        uri: 'https://gql.trovo.live/',
        fetch,
      }),
    ]);
    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: this.link,
    });
    this.tid = Date.now() + "" + parseInt(9e3 * Math.random() + 1e3, 10)
    this.comminfo = JSON.stringify({
      session: {
        uid: 0,
        openid: '',
      },
      session_ext: {
        token_type: 2,
        token_channel: 0,
        token: '',
      },
      client_info: {
        device_info: {
          tid: this.tid
        }
      }
    })
    this.uid = null;
  }

  getCommInfo() {
    return this.comminfo;
  }

  async login(email, password) {
    try {
      const msdkLogin = await msdk(email, password);
      const loginData = await this._query(
        gql`
          query login($params: LoginReqInput) {
            login(params: $params) {
              uid
              openID
              token
              tokenType
              userName
              nickName
              faceUrl
              tokenExpireTime
            }
          }
        `,
        {
          loginType: 'ELoginTypeMSDK',
          token: JSON.stringify({
            device_info: {},
            channel_dis: 'xxx',
            channel_info: {
              openid: msdkLogin.uid,
              token: msdkLogin.token,
              account_plat_type: 1,
              lang_type: 'en-US',
            },
          }),
          tokenChannel: 2,
          uid: 0,
          userName: ""
        },
      );
      this.comminfo = JSON.stringify({
        session: {
          uid: loginData.login.uid,
          openid: loginData.login.openID,
        },
        session_ext: {
          token_type: 2,
          token_channel: 2,
          token: loginData.login.token,
        },
        app_info:{
          version_code: 0,
          version_name: '',
          platform: 4,
          terminal_type: 2,
          language: 'en-US',
          client_type: 4
        },
        client_info: {
          device_info: JSON.stringify({
            tid: this.tid
          })
        }
      });
      this.uid = loginData.login.uid;
      return { ok: 1 };
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async _query(query, params = {}) {
    const queryResult = await this.client.query({
      query,
      prefetch: !1,
      fetchPolicy: 'no-cache',
      variables: { params },
      context: {
        headers: {
          comminfo: this.comminfo,
        },
      },
    });
    if (queryResult.errors) {
      throw new Error(queryResult);
    }
    return queryResult.data;
  }

  async GetToken(params = {}) {
    return this._query(
      gql`
        query getToken($params: WSGetTokenReqInput) {
          getToken(params: $params) {
            token
          }
        }
      `,
      params,
    );
  }

  async GetLiveInfo(userName) {
    return this._query(
      gql`
        query getLiveInfo($params: GetLiveInfoReqInput) {
          getLiveInfo(params: $params) {
            categoryInfo {
              shortName
            }
            channelInfo {
              audiType
              id
              languageName
              title
              viewers
            }
            streamerInfo {
              faceUrl
              gender
              info
              nickName
              subscribeable
              uid
              userName
            }
          }
        }
      `,
      {
        userName,
        requireDecorations: true,
      },
    );
  }

  async GetFollowers(uid, start = 0, count = 100, sort = 'TimeDesc') {
    return this._query(
      gql`
        query getFollowers($params: GetFollowersReqInput) {
          getFollowers(params: $params) {
            list {
              users {
                uid
                nickName
                userName
                faceURL
                followedByMe {
                  followed
                  notification
                }
                followerCount
                liveState
              }
              hasMore
              totalCount
            }
          }
        }
      `,
      { uid, start, count, sort },
    );
  }

  async SetLiveChannelInfo(params = {}) {
    return this._query(
      gql`
        mutation setLiveChannelInfo($params: SetLiveChannelInfoReqInput) {
          setLiveChannelInfo(params: $params) {
            empty
          }
        }
      `,
      {
        channelID: this.uid,
        ...params,
      },
    );
  }

  async SendMessage(message, channelID = this.channelID) {
    // channelID = channelID || this.uid
    return this._query(
      gql`
        mutation bulletChat($params: BulletChatReqInput) {
          bulletChat(params: $params) {
            speakInterval
            uid
          }
        }
      `,
      {
        bulletChatInfo: {
          bulletChatType: 0,
          content: message,
          scenesFlag: 2,
          uid: this.uid,
          ext: {
            webmsgid: `${1e8 * Math.random()}`,
            at: '[]',
          },
        },
        channelID,
        programID: '',
      },
    );
  }

  async getPcBrowsePage(
    params = {
      pageSize: 1000,
      currPage: 0,
    },
  ) {
    /*
      allCategory {
        categoryInfo {
          id
          name
          shortName
          icon
          coverImg
          description
          tagInfos {
            id
            name
          }
          webBanner
          appBanner
        }
        viewers
      }
    */
    return this._query(
      gql`
        query getPcBrowsePage($params: GetPcBrowsePageReqInput) {
          getPcBrowsePage(params: $params) {
            total
            currPage
            pageSize
            nodes {
              categoryInfo {
                id
                name
                shortName
                icon
                coverImg
                description
                tagInfos {
                  id
                  name
                }
                webBanner
                appBanner
              }
              viewers
            }
          }
        }
      `,
      params,
    );
  }

  async SetTitle(title) {
    return this.SetLiveChannelInfo({ title });
  }


  async GetRank (params = {}) {
    const _params = {
      rankType : 1,
      channelID : this.uid,
      offset : 0,
      count : 20,
      ...params
    }
    return this._query(
      gql`
      # Write your query or mutation here
      # $params: {
      #	rankType : Int
      #	channelID : Int64
      #	offset : Int
      #	count : Int
      #}
      query getRank($params: GetRankReqInput) {
          getRank(params: $params) {
          rankInfo {
            uid
            userName
            nickName
            avatar
            badgeLevel
            medals {
              resourceName
            }
            spellPoint
            displayRank
            roleMask
            userType
            decorations {
              resourceName
            }
          }
          userRank {
            uid
            userName
            nickName
            avatar
            badgeLevel
            medals {
              resourceName
            }
            spellPoint
            displayRank
            roleMask
            userType
            decorations {
              resourceName
            }
          }
          hasMore
          }
      }
      `, _params)
  }


  async GetAllUser (channelID) {
    let hasMore
    let users = []
    let offset = 0
    const count = 200
    do {
      const data = await this.GetRank({
        offset,
        channelID,
        count
      })
      users.push(...data.getRank.rankInfo)
      hasMore = data.getRank.hasMore
      offset += count
    } while (hasMore === true)
    return users
  }


  async GetSubscribers (params = {}) {
    return this._query(
      gql`
        #$params: {
        #	start : Int
        #	count : Int
        #}
        query getSubscribers($params: GetSubscribersReqInput) {
          getSubscribers(params: $params) {
            list {
              uid
              userName
              nickName
              faceURL
              subscriptionTS
              totalSubscribedDays
              followedByMe {
                followed
                notification
              }
              liveState  #EM_CHANNEL_STATE_STOP  EM_CHANNEL_STATE_LIVE
            }
            hasMore
            totalCount
          }
        }
      `, {
        start: 0,
        count: 30,
        ...params
      }
    )
  }

  async GetAllSubscribers () {
    let hasMore
    let subscribers = []
    let start = 0
    const count = 30
    do {
      const data = await this.GetSubscribers({
        start,
        count
      })
      subscribers.push(...data.getSubscribers.list)
      hasMore = data.getSubscribers.hasMore
      start += count
    } while (hasMore === true)
    return subscribers
  }
}

module.exports = TrovoApollo;
