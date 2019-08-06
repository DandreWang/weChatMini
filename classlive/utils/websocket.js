//'wss://api.vipboluo.com/';//服务器地址
import {SocketUrl} from "./require";

function connect(api,user, func) {

  //接受服务器消息
  wx.onSocketMessage(func);//func回调可以拿到服务器返回的数据

  wx.connectSocket({

    url: SocketUrl+api,

    header: { 'content-type': 'application/json' },
    method: "GET",
    success () {
      console.log('信道连接成功~');
    },
    fail () {
      console.log('信道连接失败~');
    }
  });

  // wx.onSocketError(res => {
  //
  //   wx.showToast({
  //     title: '信道连接失败，请检查！',
  //     icon: "none",
  //   });
  //
  // });

}
//接收消息


//发送消息
const send = msg => {

  wx.sendSocketMessage({
    data: msg
  });

}

module.exports = {
  connect: connect,
  send: send
}