//logs.js
import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_show:false,
    mainData:[],
    idData:[],
    messageData:[],
    relationData:[],
    isLoadAll:false,
    buttonClicked:false,
	messageOneData:[]
  },
    

  onLoad(options){
    const self = this;
    wx.showLoading();
    if(!wx.getStorageSync('token')){
      var token = new Token();
      token.getUserInfo();
    };
    self.setData({
      buttonClicked:self.data.buttonClicked
    });
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.data.id = options.id;
    self.getMessageData();
 
  },





  getMessageData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.token=wx.getStorageSync('token');
  /*  postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:6,
      user_no:wx.getStorageSync('info').user_no,
	  status:1
    };
    postData.searchItemOr = {
      type:5,
    };
    postData.getAfter = {
      relation:{
        tableName:'relation',
        middleKey:'id',
        key:'relation_one',
        searchItem:{
          status:1,
          relation_two:wx.getStorageSync('info').user_no 
        },
        condition:'='
      }
    }; */
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.messageData.push.apply(self.data.messageData,res.info.data)
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none')
      };
      console.log(self.data.messageData);
      wx.hideLoading();
      self.setData({
        web_messageData:self.data.messageData,
      });   
    };
    api.getMessage(postData,callback);
  },


  getMessageOne(){
    const self = this;
    const postData = {};
    postData.token=wx.getStorageSync('token');
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      id:self.data.id,
      user_type:['in',[0,2]]
    };
 
    postData.getAfter = {
      relation:{
        tableName:'relation',
        middleKey:'id',
        key:'relation_one',
        searchItem:{
          status:1,
          relation_two:wx.getStorageSync('info').user_no 
        },
        condition:'='
      }
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.messageOneData = res.info.data[0];
        self.data.messageOneData.content = api.wxParseReturn(res.info.data[0].content).nodes;
      };
      console.log(self.data.messageOneData);
      if(self.data.messageOneData.relation.length==0){
        self.relationAdd()
      }else{
        self.data.buttonClicked = false;
        self.setData({
          buttonClicked:self.data.buttonClicked
        });  
      };
      wx.hideLoading();
     
      self.setData({
        web_messageOneData:self.data.messageOneData,
        is_show:true,
      });   
    };
    api.messageGet(postData,callback);
  },

  relationAdd(){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
    postData.data = {
      relation_one:self.data.messageData[self.data.index].id,
      relation_two:wx.getStorageSync('info').user_no,
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:self.data.messageData[self.data.index].type
    };
    const callback = (res)=>{
      self.data.buttonClicked = false;
      self.setData({
        buttonClicked:self.data.buttonClicked
      });
    };
    api.relationAdd(postData,callback);
  },

  mask:function(e){
    const self = this;
    self.data.messageData = [];
    self.getMessageData(true);
    self.setData({
      is_show:false,
    });
    
  },


  show:function(e){
    const self = this;
    wx.showLoading();
    self.data.buttonClicked = true;
    self.setData({
      buttonClicked:self.data.buttonClicked
    });
    var index = api.getDataSet(e,'index');
    self.data.index = index;
	console.log('self.data.index',self.data.index)
   // self.getMessageOne();
    if(self.data.messageData[self.data.index].relation.length==0){
      self.relationAdd()
    }else{
      self.data.buttonClicked = false;
      self.setData({
        buttonClicked:self.data.buttonClicked
      });  
    };
	self.data.messageData[self.data.index].content = api.wxParseReturn(self.data.messageData[self.data.index].content).nodes;
    wx.hideLoading();
         
    self.setData({
		web_messageData:self.data.messageData,
		web_index:self.data.index,
		is_show:true,
    });   
    
  },

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMessageData();
    };
  },
  

})

