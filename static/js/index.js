/**
 * Created by 涳涳嘚慌 on 2017/2/10.
 */
//字体根据窗口自适应
!(function (doc, win) {
  var docEl = doc.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
    recalc = function () {
      var clientWidth = docEl.clientWidth;
      if (!clientWidth) return;
      if (clientWidth < 750) {
        docEl.style.fontSize = 100 * (clientWidth / 750) + 'px';
      } else {
        docEl.style.fontSize = '100px';
      }
    };
  if (!doc.addEventListener) return;
  win.addEventListener(resizeEvt, recalc, false);
  doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);


// 友盟统计
var cnzz_s_tag = document.createElement('script');
var cnzz_protocol = (("https:" == document.location.protocol) ? " https://" : " http://");
var ymUrl = '';
cnzz_s_tag.type = 'text/javascript';
cnzz_s_tag.async = true;
cnzz_s_tag.charset = 'utf-8';
var url = window.location.href;
if (url.indexOf('mp.baoyitech.com.cn/h5') > -1) {
  ymUrl = 's4.cnzz.com/z_stat.php?id=1261550600&web_id=1261550600';
} else if (url.indexOf('wetest.baoyitech.com.cn/h5') > -1) {
  ymUrl = 's19.cnzz.com/z_stat.php?id=1262660870&web_id=1262660870';
}
cnzz_s_tag.src = cnzz_protocol + ymUrl + '&async=1';
var root_s = document.getElementsByTagName('script')[0];
root_s.parentNode.insertBefore(cnzz_s_tag, root_s);

//环境接口自动切换
if (document.domain == 'wetest.baoyitech.com.cn') { //阿里云测试服务器
  var srv = 'https://test.baoyitech.com.cn/car_server/';
} else if (document.domain == 'mp.baoyitech.com.cn') { //正式服
  var srv = 'http://app.baoyitech.com.cn:7777/car_server/';
} else {
  // var srv = 'http://192.168.1.110:9099/pingan/';
  var srv = 'http://192.168.1.35:9090/car_server/'; ///杨衡
  // var srv = 'https://test.baoyitech.com.cn/car_server/';
  // // 获取活动参数----本地调试作用
  // queryAvailablePromotion();
}

// wxLogin();

/*
 * 微信自动登录
 */
function wxLogin() {
  weuiShow('off');
  weuiShow('on', 'loading', '加载中～');
  //判断是否为微信浏览器
  var ua = window.navigator.userAgent.toLowerCase();
  //  if (ua.match(/MicroMessenger/i) != 'micromessenger') return;
  if (document.domain == 'wetest.baoyitech.com.cn') { //阿里云测试服务器
    var appid = 'wx51427e73dc14ac70';
  } else if (document.domain == 'mp.baoyitech.com.cn') { //正式服
    var appid = 'wxbc615258558f9058';
  }
  /*获取code*/
  var code = getUrlParam('code'); //获取链接参数code
  if (code != undefined || code == '') { //如果code存在，则请求api获取openid
    getOpenid(code);
  } else { //如果code不存在，则重定向获取code
    var urlStr = window.location.href;
    var redirect_uri = encodeURIComponent(urlStr);
    var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_base&state=STATE';
    window.location.href = url;
  }
}

/*
 * 获取opeinid，拿到openid调用登录
 */
function getOpenid(code) {
  $.ajax({
    type: "POST", //提交方式 
    url: srv + 'weichatApi/WxPay/getAccessToken', //路径 
    async: false,
    headers: {
      "device": "H5"
    },
    data: { //请求数据接口的参数
      code: code
    },
    success: function (result) { //返回数据根据结果进行相应的处理 
      if (result.data) {
        var openid = result.data.openId;
        localStorage.setItem('openId', openid);
      }
      loginByOpenid2();
    }
  });
}

function loginByOpenid2() {
  $.ajax({
    type: "POST", //提交方式 
    url: srv + 'weichatApi/H5/loginByOpenId', //路径 
    async: false,
    headers: {
      "device": "H5"
    },
    data: { //请求数据接口的参数
      openId: localStorage.getItem('openId'),
      recommenderChannelCode: getUrlParam('c')
    },
    success: function (result) { //返回数据根据结果进行相应的处理 
      if (result.data) {
        localStorage.setItem('userId', result.data.userId);
        localStorage.setItem('user_token', result.data.token);
        localStorage.setItem('user_phone', result.data.userPhone);
        localStorage.setItem('channel', getUrlParam('c')); //来自哪个渠道（渠道来源）
        localStorage.setItem('myChannel', result.data.channel); ///我的渠道号
      }
      if (localStorage.getItem('user_token') && localStorage.getItem('userId')) {
        var title = '双十一抽奖活动开始啦！';
        var desc = '【我是车主】为回馈广大新老客户，双十一抽奖活动开始啦了，价值上千元礼品等您来拿！';
        var link = location.href.split('?')[0] + '?c=' + localStorage.getItem('channel') + '&shareUserId=' + result.data.userId + '&f=share';
        var imgUrl = 'http://' + document.domain + '/h5/double11/static/img/wheel_1/share.png';
        var imgUrlCircle = 'http://' + document.domain + '/h5/double11/static/img/wheel_1/share.png';
        // 获取活动参数
        queryAvailablePromotion();
        share(title, desc, link, imgUrl, imgUrlCircle);
      } else {
        weuiShow('off');
        weuiShow('on', 'warn', '信息错误～');
      }

    }
  });
}
/**获取第三方url中的参数 */
function getUrlParam(key) {
  // 获取参数
  var url = window.location.search;
  // 正则筛选地址栏
  var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
  // 匹配目标参数
  var result = url.substr(1).match(reg);
  //返回参数值
  return result ? decodeURIComponent(result[2]) : null;
}

var expired = 0;
var notBegun = 0;

function queryAvailablePromotion() {
  $.ajax({
    type: "GET", //提交方式 
    url: srv + 'weichatApi/promotion/queryAvailablePromotion', //路径 
    headers: {
      "device": "H5"
    },
    success: function (result) { //返回数据根据结果进行相应的处理 
      var code = null;
      if (result.status == '10000') {
        console.log(result);
        result.data.forEach(function (value, i, array) {
          if (value.code == 'double11') code = value.code;
          if (value.code == 'double11' && value.isStart == 2) {
            weuiShow('off');
            weuiShow('on', 'warn', '活动未开始');
            notBegun = 1;
          }
        });
        if (!code) {
          expired = 1;
          weuiShow('off');
          weuiShow('on', 'warn', '活动已关闭～');
          return;
        }
        if (notBegun == 1) return;
        getGiftResurt();
      }
    }
  });
}


// 分享
function share(title, desc, link, imgUrl, imgUrlCircle) {
  //判断是否为微信浏览器
  var ua = window.navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) != 'micromessenger') { //微信浏览器
    console.log('不是微信浏览器');
  }
  // 这里的作用是把分享的链接后微信添加的参数去掉，否则会影响jsapi签名
  if (window.location.search != "") {
    //单纯把微信分享添加参数?from replace掉 保留原有的附加参数,ng中的#后面对应hash部分，不计入location.search中
    //      var Url = window.location.href;
    //      window.location.href = Url.replace(window.location.search, '');
  }

  var hostname = 'http://test.baoyitech.com.cn/car_server/';
  if (document.domain == 'mp.baoyitech.com.cn') var hostname = 'http://app.baoyitech.com.cn:7777/car_server/';
  $.ajax({
    type: "POST",
    url: hostname + "weichatApi/index/getIndex",
    data: ({
      "path": location.href,
      "token": localStorage.getItem('user_token')
    }),

    dataType: "json",
    async: true,
    success: function (result) {
      wx.checkJsApi({
        success: function (res) {
          if (res.checkResult.getLocation == false) {
            alert('你的微信版本太低，不支持微信JS接口，请升级到最新的微信版本！');
            return;
          }
        }
      });
      wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: result.data.appId,
        timestamp: result.data.timestamp,
        nonceStr: result.data.noncestr,
        signature: result.data.signature,
        jsApiList: [ // 所有要调用的 API 都要加到这个列表中
          'onMenuShareTimeline', // 分享到朋友圈
          'onMenuShareAppMessage', // 分享给朋友
          'onMenuShareQQ' // 分享到QQ
        ]
      });
      wx.ready(function () {
        wx.hideOptionMenu(); //隐藏右上角按钮ul
        shareset(title, desc, link, imgUrl, imgUrlCircle); // 设置监听右上角菜单按钮事件
        wx.showOptionMenu(); // 显示按钮
      });

      wx.error(function (res) {
        console.log('微信初始化有点小问题，请重新访问.' + JSON.stringify(res));
      });
    },
    error: function (request, error) {
      console.log(error);
    }
  });

}

// 页面初始化时，添加右上角按钮监听
function shareset(title, desc, link, imgUrl, imgUrlCircle) {
  // 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
  wx.onMenuShareAppMessage({
    title: title,
    desc: desc,
    link: link,
    imgUrl: imgUrl
  });
  // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
  wx.onMenuShareTimeline({
    title: title + desc,
    link: link,
    imgUrl: imgUrlCircle
  });
  // 2.3 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
  wx.onMenuShareQQ({
    title: title,
    desc: desc,
    link: link,
    imgUrl: imgUrl
  });
  console.log(title);
}

function showRule() {
  $('#rule').css('display', 'block');
  $('#mask').css('display', 'block')
}

function closeRule() {
  $('#rule').css('display', 'none');
  $('#mask').css('display', 'none')
}
// getGiftResurt();
function getGiftResurt() {
  $.ajax({
    type: "POST", //提交方式 
    url: srv + 'weichatApi/promotion/getFinalGiftFromPromotionPidAndUserId', //路径 
    // async:false, 
    headers: {
      "device": "H5"
    },
    data: { //请求数据接口的参数
      code: 'double11',
      userId: localStorage.getItem('userId'),
      token: localStorage.getItem('user_token')
    },
    success: function (result) { //返回数据根据结果进行相应的处理 
      // console.log(result);
      if (result.status == 10000 && result.data.status == 10000) {
        localStorage.setItem('giftcode', result.data.code);
        localStorage.setItem('hasGetGift', 0);
        weuiShow('off');
      } else if (result.status == 10000 && result.data.status == 20000) {
        localStorage.setItem('giftcode', result.data.code);
        console.log('已经抽取过奖品！');
        localStorage.setItem('hasGetGift', 1);
        getGift('show');
      } else {
        console.log('数据错误，请稍后再试！');
      }
    }
  });
}

function getGift(type) {
  if (type == 'get') {
    weuiShow('off');
    weuiShow('on', 'loading', '领取中～');
  }
  var shareUserId = '';
  if (getUrlParam('shareUserId')) shareUserId = getUrlParam('shareUserId');
  $.ajax({
    type: "POST", //提交方式 
    url: srv + 'weichatApi/promotion/giftGiving', //路径 
    // async:false, 
    headers: {
      "device": "H5"
    },
    data: { //请求数据接口的参数
      code: localStorage.getItem('giftcode'),
      currentUserId: localStorage.getItem('userId'),
      token: localStorage.getItem('user_token'),
      type: 5,
      shareUserId: shareUserId,
      agentChannelCode: localStorage.getItem('channel')
    },
    success: function (result) { //返回数据根据结果进行相应的处理 
      console.log(result);
      if (result.status == 10000) {
        if (result.data.status == '10000' || result.data.status == '10001') {
          console.log(localStorage.getItem('giftcode'));
          $('#giftName').html(result.data.data[0].codeName);
          $('#nogift').css('display', 'none');
          $('#mygift').css('display', 'block');
          $('#checkbtn').css('display', 'block');
          if (getUrlParam('c') == '1003' && getUrlParam('f') == 's') { //  顺德人保入口
            $('#checkbtn').css('display', 'none');
          } else {
            $('#checkbtn').css('display', 'block');
            $('#tips').css('display', 'none');
          }
          localStorage.setItem('hasGetGift', 1);
          weuiShow('off');
        } else if (result.data.status == '20000') {
          weuiShow('off');
          weuiShow('on', 'warn', '抱歉，当前抽奖人数太多，请重试～');
          setTimeout(function () {
            location.reload();
          }, 2000)
        } else {
          weuiShow('off');
          weuiShow('on', 'warn', result.data.msg);
        }
        if (type == 'get') { //点击立即领取后操作
          $('#wheelok').css('display', 'none');
          $('#mask').css('display', 'none');
          var div = document.getElementById('root');
          div.scrollTop = div.scrollHeight;
        }
      } else {
        weuiShow('off');
        weuiShow('on', 'warn', '抱歉，获取抽奖结果错误，请稍后再试～');
      }

    }
  });
}

function checkGift() {
  localStorage.setItem('tabS', 'coupon');
  window.location.href = 'http://' + document.domain + '/h5/BYVAS/api_index/5/1';
}

function weuiShow(status, type, text) {
  if (status == 'on') {
    if (type == 'warn') {
      $('#toastwarn').css('display', 'block');
      $('#toastwarntext').html(text);
    } else if (type == 'success') {
      $('#toastsuccess').css('display', 'block');
      $('#toastsuccesstext').html(text);
    } else if (type == 'loading') {
      $('#loadingToast').css('display', 'block');
      $('#loadingToasttext').html(text);
    }
  } else if (status == 'off') {
    if (type == 'warn') {
      $('#toastwarn').css('display', 'none');
    } else if (type == 'success') {
      $('#toastsuccess').css('display', 'none');
    } else if (type == 'loading') {
      $('#loadingToast').css('display', 'none');
    } else {
      $('#toastwarn').css('display', 'none');
      $('#toastsuccess').css('display', 'none');
      $('#loadingToast').css('display', 'none');
    }
  }
}
