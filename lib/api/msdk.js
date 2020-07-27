const crypto = require('crypto')
const fetch = require('node-fetch')

const md5Hash = function (data) {
  return crypto.createHash('md5').update(data).digest('hex')
}

const appId = '8b0db5b2a40694f0ac1a0931549ba259'
const msdkSigKey = 'c658db93c7a5626b9980e54adb3dd24d'
const host = 'https://web-us.msdkpass.com'
const uri = '/account/login'


function GetSigKey (e = {}) {
  // console.log('GetSigKey', e)
  t = e.payload,
  n = void 0 === t ? {} : t,
  r = e.uri,
  o = void 0 === r ? "" : r,
  c = e.query,
  d = void 0 === c ? {} : c,
  l = e.sigKey,
  f = void 0 === l ? "" : l,
  h = o + "?" + Object.keys(d).sort().map((function(e) {
      return [e, d[e]].join("=")
  })).join("&") + (n ? JSON.stringify(n) : "") + f;
  return md5Hash(h)
}

async function login(email, password) {

  const query = {
    appid: appId,
    os: "3",
    account_plat_type: 1,
    lang_type: 'en-US',
    sig_by_os: 1
  }

  const payload = {
    account: email,
    account_type: 1,
    area_code: '',
    password: md5Hash(password)
  }

  const key = GetSigKey({
    uri: '/account/login',
    payload,
    query,
    sigKey: msdkSigKey
  })

  query.sig = key

  let url =  host + uri
  url += '?' + Object.keys(query).map(k => `${k}=${query[k]}`).join('&')

  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(e => e.json())

}

module.exports = login
