import {getAddress} from './api'
const regeneratorRuntime = require('./runtime');

class Http {
  checkStatus(response) {
    const {statusCode, statusText, data, data: {success} = {success: false}} = response;
    if (statusCode >= 200 && statusCode < 300) {//响应成功
      if (success) {
        return data;
      } else {
        throw {...new Error(statusText), res: data};
      }
    } else {
      wx.showToast({
        title: `网络错误${statusCode}，请联系管理员`,
        icon: 'none'
      });
    }
  }

  async _request(url, init, config = {}) {
    const {errMsgHid, loadingHid} = config;
    !loadingHid && wx.showLoading({title: '加载中', mask: true});
    try {
      let response = await new Promise((success, fail) => {
        wx.request( {
          url,
          success,
          fail,
          dataType: 'json',
          ...init,
          ...config
        });
      });
      !loadingHid && wx.hideLoading();
      return this.checkStatus(response);//这里是对结果进行处理。
    } catch (error) {
      const {msg} = error.res;
      msg && !errMsgHid && wx.showToast({
        title: msg,
        icon: 'none'
      });
      throw error;
      return null;
    }
  }

  async get(api, data, config, headers = {}, flg) {
    const query = !data ? '' : `json=${encodeURIComponent(JSON.stringify(data))}`;
    return await this._request(`${flg ? api : getAddress(api)}?${query}`, {headers, data}, config);
  }

  async post(api, data = {}, config, headers = {}, flg) {
    const _headers = {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Type': 'application/json',
      ...headers,
    };
    return await this._request(flg ? api : getAddress(api), {
        method: 'POST',
        headers: _headers,
        data,
      }, config)
  }
  // 注册用户
  async register(param) {
    const {code, userData, phoneData = {}, success, error} = param
    try {
      const {encryptedData, iv, userInfo} = userData;
      const markRes = await this.post(`${getAddress('mark')}${code}/MARKET`, '', {}, {}, true);
      const {sessionKey} = markRes.data;
      const {encryptedData: phoneEncrypted, iv: phoneIv} = phoneData
      const decRes = await this.post('decoding', {
        encrypted: encryptedData,
        iv,
        sessionKey,
        phoneEncrypted,
        phoneIv
      });
      const {id, type, mobile} = decRes.data
      wx.setStorageSync('userData', {userInfo, id, type, mobile})
      typeof success === 'function' && success(decRes)
    } catch (e) {
      typeof error === 'function' && error(e)
    }
  }

}

export default new Http();