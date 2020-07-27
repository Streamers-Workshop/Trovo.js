const fetch = require('node-fetch')

const { ApolloClient } = require('apollo-client')
const { ApolloLink } = require("apollo-link")
const { createHttpLink } = require('apollo-link-http')
const { createPersistedQueryLink } = require('apollo-link-persisted-queries')
const { InMemoryCache } = require('apollo-cache-inmemory')
const { gql } = require('@apollo/client')
const msdk = require('./msdk')


class TrovoApollo {
  constructor () {
    this.link = ApolloLink.from([
      createPersistedQueryLink({ useGETForHashedQueries: true }),
      createHttpLink({
        uri: 'https://gql.trovo.live/',
        fetch: fetch
      })
    ])
    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: this.link,
    });
    this.comminfo = ''
    this.uid = null
  }

  getCommInfo () {
    return this.comminfo
  }

  async login (email, password) {
    try {
      const msdkLogin = await msdk(email, password)
      const loginData = await this._query(gql`
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
      `, {
        loginType: "ELoginTypeMSDK",
        token: JSON.stringify({
          device_info :{},
          "channel_dis":"xxx",
          "channel_info": {
            "openid": msdkLogin.uid,
            "token": msdkLogin.token,
            "account_plat_type":1,
            "lang_type": "en-US"
          }
        }),
        tokenChannel: 2,
      })
      this.comminfo = JSON.stringify({
        session: {
          uid: loginData.login.uid,
          openid: loginData.login.openID
        },
        session_ext: {
          token_type: 2,
          token_channel: 2,
          token: loginData.login.token
        }
      })
      this.uid = loginData.login.uid
    } catch (err) {
      console.log(err.graphQLErrors)
      return { ok: 0 }
    }
  }


  async _query(query, params = {}) {
    const queryResult = await this.client.query({
      query,
      prefetch: !1,
      fetchPolicy: "no-cache",
      variables: { params },
      context: {
        headers: {
          comminfo: this.comminfo
        }
      }
    })
    if (queryResult.errors) {
      throw new Error(queryResult)
    }
    return queryResult.data
  }

  async GetToken (params = {}) {
    return this._query(gql`
      query getToken($params: WSGetTokenReqInput) {
        getToken(params: $params) {
          token
        }
      }`, params)
  }

  async GetLiveInfo (userName) {
    return this._query(gql`
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
      }`, {
      userName,
      requireDecorations: true
    })
  }

  async GetFollowers (uid, start = 0, count = 100, sort = 'TimeDesc') {
    return this._query(gql`
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
    `, { uid, start, count, sort })
  }

  async SetLiveChannelInfo (params = {}) {
    return this._query(gql`
      mutation setLiveChannelInfo($params: SetLiveChannelInfoReqInput) {
        setLiveChannelInfo(params: $params) {
          empty
        }
      }
  `, {
      channelID: this.uid,
      ...params
    })
  }

  async SendMessage (message, channelID = this.channelID) {
    // channelID = channelID || this.uid
    return this._query(gql`
      mutation bulletChat($params: BulletChatReqInput) {
        bulletChat(params: $params) {
          speakInterval
          uid
          }
      }
    `, {
      bulletChatInfo: {
        bulletChatType: 0,
        content: message,
        scenesFlag: 2,
        uid: this.uid,
        ext: {
          webmsgid: (1e8 * Math.random()) + "", 
          at: "[]"
        }
      },
      channelID: channelID,
      programID: ''
    })
  }

  async getPcBrowsePage (params = {
    pageSize: 1000,
    currPage: 0
  }) {
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
    return this._query(gql`query getPcBrowsePage($params: GetPcBrowsePageReqInput) {
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
    }`, params)
  }



  async SetTitle (title) {
    return this.SetLiveChannelInfo({ title })
  }

}

module.exports = TrovoApollo
