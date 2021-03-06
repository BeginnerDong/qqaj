import {
	Api
} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {
	Token
} from '../../utils/token.js';
const token = new Token();


Page({
	data: {
		sliderData: [],
		groupData: [],
		mainData: [],
		labelData: [],
		indicatorDots: true,
		vertical: false,
		autoplay: true,
		circular: true,
		interval: 5000,
		duration: 500,
		previousMargin: 0,
		nextMargin: 0,
		swiperIndex: 0,
		img1: 0,
		size: 14, //宽度即文字大小
		marqueeW: 0,
		moveTimes: 8, //一屏内容滚动时间为8s
		allT: "0s",
		noteData: {},
		couponData:{}
	},

	//事件处理函数
	swiperChange(e) {
		const that = this;
		that.setData({
			swiperIndex: e.detail.current,
		})
	},

	onShow() {

		const self = this;
		var cartTotalCounts = 0;
		self.data.cartData = api.jsonToArray(wx.getStorageSync('cartData'), 'unshift');
		for (var i = 0; i < self.data.cartData.length; i++) {
			if (self.data.cartData[i].isSelect) {
				cartTotalCounts += self.data.cartData[i].count;
			}
		};
		self.setData({
			web_cartTotalCounts: cartTotalCounts,
		})
		self.getSliderData();
		self.checkRead();
		/*  const callback = (res)=>{
		    self.checkRead();
		  };
		  if(!wx.getStorageSync('token')){
		    var token = new Token();
		    token.getUserInfo({data:{}},callback);
		  }else{
		    self.checkRead();
		  }; */

	},

	onLoad(options) {
		const self = this;
		/* self.data.text = self.data.text.replace(/(\d+)(?=元)/g, function(match, p) {
			return parseInt(p) + 5
		}); */
		self.data.paginate = api.cloneForm(getApp().globalData.paginate);
		console.log(self.data.img1);
		self.setData({
			/* text:self.data.text, */
			img1: self.data.img1,
		});
		self.getGroupData();
		self.getMainData();
		self.getLabelData();
		self.getNoteData();
		self.getCouponData();
		if (options.scene) {
			var scene = decodeURIComponent(options.scene)
		};
		if (options.parent_no) {
			var scene = options.parent_no
		};




		if (scene) {
			var token = new Token({
				parent_no: scene
			});
			const callback = (res) => {
				self.getMessageData();
				self.getUserInfoData()
				self.getShareUserData(scene)
			};
			token.getUserInfo({
				data: {}
			}, callback);
		} else {
			var token = new Token();
			const callback = (res) => {
				self.getMessageData();
				self.getUserInfoData()
			};
			token.getUserInfo({
				data: {}
			}, callback);
		}

		self.data.scene = scene;
	},

	onUnload: function() {
		const self = this;
		clearInterval(self.data.intervalOne);
	},
	
	ZhanTing() {
		const self = this;
		self.data.autoplay = !self.data.autoplay
		self.setData({
			autoplay:self.data.autoplay
		})
	},
	
	getShareUserData(parent_no){
	  const self = this;
	  const postData = {};
	  postData.token = wx.getStorageSync('token');
	  postData.searchItem = {
		  user_no:parent_no,
		  //user_type:0
	  }
	  const callback = (res)=>{
	    if(res.solely_code==100000){
	      if(res.info.data.length>0){
			self.setData({
				web_shareUser:res.info.data[0],
			});
	      }
	    }else{
	      api.showToast('网络故障','none')
	    }
	    wx.hideLoading();
	  };
	  api.commonUserGet(postData,callback);   
	},
	
	getUserInfoData(){
	  const self = this;
	  const postData = {};
	  postData.token = wx.getStorageSync('token');
	  const callback = (res)=>{
	    if(res.solely_code==100000){
	      if(res.info.data.length>0){
	        self.data.userData = res.info.data[0]; 
			console.log(self.data.userData.level>0?'pages/detail/detail?id=' + self.data.id + '&&user_no=' + wx.getStorageSync('info').user_no:'pages/detail/detail?id=' + self.data.id)
	      }
	    }else{
	      api.showToast('网络故障','none')
	    }
	    wx.hideLoading();
	  };
	  api.userInfoGet(postData,callback);   
	},
	
	onShareAppMessage(res){
	  const self = this;
	   console.log(res)
	    if(res.from == 'button'){
	      self.data.shareBtn = true;
	    }else{   
	      self.data.shareBtn = false;
	    }
	    return {
	      title: self.data.userData.level>0?'巧巧爱家 - '+ wx.getStorageSync('info').nickname:'巧巧爱家',
	       path: self.data.userData.level>0?'pages/index/index?parent_no='+wx.getStorageSync('info').user_no:'pages/index/index',
	      success: function (res){
	        console.log(res);
	        console.log(parentNo)
	        if(res.errMsg == 'shareAppMessage:ok'){
	          console.log('分享成功')
	          if (self.data.shareBtn){
	            if(res.hasOwnProperty('shareTickets')){
	            console.log(res.shareTickets[0]);
	              self.data.isshare = 1;
	            }else{
	              self.data.isshare = 0;
	            }
	          }
	        }else{
	          wx.showToast({
	            title: '分享失败',
	          })
	          self.data.isshare = 0;
	        }
	      },
	      fail: function(res) {
	        console.log(res)
	      }
	    }
	},

	getNoteData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: '2',
			title: '本周福利'
		};
		postData.getAfter = {
			sku:{
				tableName:'Sku',
				middleKey:'description',
				key:'id',
				searchItem:{
					status:1
				},
				condition:'='
			}
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.noteData = res.info.data[0]
			};
			self.setData({
				web_noteData: self.data.noteData,
			});
	
		};
		api.labelGet(postData, callback);
	},
	
	getCouponData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: '2',
			title: '首页优惠券'
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.couponData = res.info.data[0]
			};
			self.setData({
				web_couponData: self.data.couponData,
			});
	
		};
		api.labelGet(postData, callback);
	},
	
	getMessageData() {
		const self = this;

		const postData = {};

		postData.token = wx.getStorageSync('token');
		postData.searchItem = {
			user_type: 2,
			type: 5,
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.messageData = res.info.data[0]
				self.data.text = self.data.messageData.title
			}
			var screenW = wx.getSystemInfoSync().windowWidth; //获取屏幕宽度
			var contentW = self.data.text.length * self.data.size; //获取文本宽度（大概宽度）
			var allT = (contentW / screenW) * self.data.moveTimes; //文字很长时计算有几屏
			allT = allT < 8 ? 8 : allT; //不够一平-----最小滚动一平时间
			console.log(self.data.messageData);
			self.setData({
				marqueeW: -contentW + "px",
				allT: allT + "s",
				web_messageData: self.data.messageData,
			});
		};
		api.messageGet(postData, callback);
	},

	getSliderData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: '2'
		};
		postData.getBefore = {
			aboutData: {
				tableName: 'label',
				searchItem: {
					title: ['=', ['首页轮播图']],
				},
				middleKey: 'parentid',
				key: 'id',
				condition: 'in',
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.sliderData.push.apply(self.data.sliderData, res.info.data)
				for (var i = 0; i < self.data.sliderData.length; i++) {
					var filename=self.data.sliderData[i].mainImg[0].url;
					var index1=filename.lastIndexOf(".");
					var index2=filename.length;
					self.data.sliderData[i].type = filename.substring(index1,index2)
				}
			};
			console.log(self.data.sliderData)
			self.setData({
				web_sliderData: self.data.sliderData,
			});

		};
		api.labelGet(postData, callback);
	},



	getLabelData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			type: 3
		};
		postData.order = {
			create_time: 'normal'
		};
		postData.getBefore = {
			label: {
				tableName: 'label',
				searchItem: {
					title: ['=', ['商品类别']],
				},
				middleKey: 'parentid',
				key: 'id',
				condition: 'in'
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.labelData.push.apply(self.data.labelData, res.info.data);
			}
			console.log(self.data.labelData)
			wx.hideLoading();
			self.setData({
				web_labelData: self.data.labelData,
			});
		};
		api.labelGet(postData, callback);
	},

	getMainData(isNew, currentId) {
		const self = this;
		var nowTime = Date.parse(new Date());
		if (isNew) {
			api.clearPageIndex(self);
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
			/* category_id:['NOT IN',[38]], */
			deadline: ['>', nowTime],
			onShelf: 1
		};
		/*    postData.getAfter={
		      sku:{
		        tableName:'sku',
		        middleKey:'product_no',
		        searchItem:{
		          
		          status:1,
		          onShelf:1
		        },
		        key:'product_no',
		        condition:'=',
		      } 
		    };*/
		postData.order = {
			listorder: 'desc'
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {

				self.data.mainData.push.apply(self.data.mainData, res.info.data);


			} else {
				self.data.isLoadAll = true;

			};
			wx.hideLoading();

			self.setData({

				web_mainData: self.data.mainData,
			});

		};
		api.skuGet(postData, callback);
	},





	getNoticeData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id
		};
		postData.getBefore = {
			aboutData: {
				tableName: 'label',
				searchItem: {
					title: ['=', ['通知']],
				},
				middleKey: 'menu_id',
				key: 'id',
				condition: 'in',
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.noticeData = res.info.data[0];
			};
			self.setData({
				web_noticeData: self.data.noticeData,
			});
		};
		api.articleGet(postData, callback);
	},

	getGroupData() {
		const self = this;
		var nowTime = Date.parse(new Date());
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,

			deadline: ['>', nowTime],
			status: 1,
			onShelf: 1
		};
		postData.getBefore = {
			label: {
				tableName: 'label',
				searchItem: {
					title: ['=', ['今日团购']],
				},
				middleKey: 'category_id',
				key: 'id',
				condition: 'in'
			},
		};
		/* postData.getAfter={
		  sku:{
		    tableName:'sku',
		    middleKey:'product_no',
		    searchItem:{
		      deadline:['>',nowTime],
		      status:1,
		      onShelf:1
		    },
		    key:'product_no',
		    condition:'=',
		  } 
		}; */
		postData.order = {
			listorder: 'desc'
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {

				self.data.groupData.push.apply(self.data.groupData, res.info.data);


				/* for (var j = 0; j < self.data.groupData[j].length; j++) {
				 	self.data.groupData[j].pdtSale = res.info.data[i].saleNum
				 } */
			};
			/* if(self.data.groupData.length>0){
			   self.countDown();
			 };
			 wx.hideLoading();
			 if(self.data.groupData.length>1){
			   self.countDownTwo();
			 };
			 if(self.data.groupData.length>2){
			   self.countDownThree();
			 }; */
			console.log('self.data.groupData', self.data.groupData)
			self.setData({
				web_groupData: self.data.groupData,
			});

		};
		api.skuGet(postData, callback);
	},



	countDown() {
		const self = this;

		self.data.timer = null;

		var times = (parseInt(self.data.groupData[0].deadline) - parseInt(Date.parse(new Date()))) / 1000;
		self.data.timer = setInterval(function() {
			var day = 0,
				hour = 0,
				minute = 0,
				second = 0; //时间默认值       
			if (times > 0) {
				day = Math.floor(times / (60 * 60 * 24));
				hour = Math.floor(times / (60 * 60)) - (day * 24);
				minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
				second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
			}
			if (day <= 9) day = '0' + day;
			if (hour <= 9) hour = '0' + hour;
			if (minute <= 9) minute = '0' + minute;
			if (second <= 9) second = '0' + second;
			times--;

			self.setData({
				web_day: day,
				web_hour: hour,
				web_minute: minute,
				web_second: second
			})
		}, 1000);
		if (times <= 0) {
			clearInterval(self.data.timer);
		}

	},

	countDownTwo() {
		const self = this;

		self.data.timer = null;

		var times = (parseInt(self.data.groupData[1].deadline) - parseInt(Date.parse(new Date()))) / 1000;
		self.data.timer1 = setInterval(function() {
			var day = 0,
				hour = 0,
				minute = 0,
				second = 0; //时间默认值       
			if (times > 0) {
				day = Math.floor(times / (60 * 60 * 24));
				hour = Math.floor(times / (60 * 60)) - (day * 24);
				minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
				second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
			}
			if (day <= 9) day = '0' + day;
			if (hour <= 9) hour = '0' + hour;
			if (minute <= 9) minute = '0' + minute;
			if (second <= 9) second = '0' + second;
			times--;

			self.setData({
				web_day1: day,
				web_hour1: hour,
				web_minute1: minute,
				web_second1: second
			})
		}, 1000);
		if (times <= 0) {
			clearInterval(self.data.timer);
		}

	},

	countDownThree() {
		const self = this;

		self.data.timer = null;

		var times = (parseInt(self.data.groupData[2].deadline) - parseInt(Date.parse(new Date()))) / 1000;
		self.data.timer2 = setInterval(function() {
			var day = 0,
				hour = 0,
				minute = 0,
				second = 0; //时间默认值       
			if (times > 0) {
				day = Math.floor(times / (60 * 60 * 24));
				hour = Math.floor(times / (60 * 60)) - (day * 24);
				minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
				second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
			}
			if (day <= 9) day = '0' + day;
			if (hour <= 9) hour = '0' + hour;
			if (minute <= 9) minute = '0' + minute;
			if (second <= 9) second = '0' + second;
			times--;

			self.setData({
				web_day2: day,
				web_hour2: hour,
				web_minute2: minute,
				web_second2: second
			})
		}, 1000);
		if (times <= 0) {
			clearInterval(self.data.timer);
		}

	},

	checkRead() {
		const self = this;
		const postData = {
			token: wx.getStorageSync('token')
		};
		const callback = (res) => {
			console.log(res)
			if (res.solely_code == 100000) {
				self.data.readData = res.info
			};
			self.setData({
				web_readData: self.data.readData
			});
		};
		api.readCheck(postData, callback)
	},

	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll) {
			self.data.paginate.currentPage++;
			self.getMainData();
		};
	},

	onHide() {
		const self = this;
		clearInterval(self.data.timer);
	},


	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},
	intoPathRedirect(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	},
})
