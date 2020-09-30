import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
  data: {

    userData:[],

  },

  
  onLoad(options){
    const self = this;
    wx.showLoading();
    if(!wx.getStorageSync('token')){
      var token = new Token();
      token.getUserInfo();
    };
    self.setData({
     fonts:app.globalData.font
    });
      
  },

  onShow(){
    const self = this;
    self.getUserInfoData();
    self.data.mainData = api.jsonToArray(wx.getStorageSync('collectData'),'unshift');
    console.log(self.data.mainData.length)
	var cartTotalCounts = 0;
	self.data.cartData = api.jsonToArray(wx.getStorageSync('cartData'),'unshift');
	for(var i=0;i<self.data.cartData.length;i++){
	  if(self.data.cartData[i].isSelect){
	    cartTotalCounts += self.data.cartData[i].count;
	  }
	};
	self.setData({
		web_collectData:self.data.mainData.length,
	  web_cartTotalCounts:cartTotalCounts,
	})
  },

  getUserInfoData(){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
    const callback = (res)=>{
      if(res.solely_code==100000){
        if(res.info.data.length>0){
          self.data.userData = res.info.data[0]; 
        }
        self.setData({
          web_userData:self.data.userData,
        });  
      }else{
        api.showToast('网络故障','none')
      }
      self.checkRead();
     
      wx.hideLoading();
    };
    api.userInfoGet(postData,callback);   
  },


  checkRead(){
    const self = this;
    const postData = {
      token:wx.getStorageSync('token')
    };
    const callback = (res)=>{
      console.log(res)
      if(res.solely_code==100000){
        self.data.readData = res.info
      };
      self.setData({
        web_readData:self.data.readData
      });
    };
    api.readCheck(postData,callback)
  },
 
	checkLogin(e){
		const self = this;
		if(wx.getStorageSync('threeInfo')&&wx.getStorageSync('threeToken')){
		    wx.navigateTo({
		      url: '/pages/user_order_code/user_order_code'
		    })
		}else{
			wx.navigateTo({
			  url: '/pages/login/login'
			})
		}	
	},

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedi(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },
})

  