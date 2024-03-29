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
		orderData: [],
		indicatorDots: true,
		vertical: false,
		autoplay: true,
		circular: true,
		interval: 2000,
		duration: 500,
		previousMargin: 0,
		nextMargin: 0,
		swiperIndex: 0,
		messageData: [],
		mainData: [],
		chooseId: [],
		tabCurrent: 0,
		isShow: false,
		labelData: [],
		complete_api: [],
		keys: [],
		values: [],
		skuData: {},
		count: 1,
		id: '',
		sku_item: [],
		choose_sku_item: [],
		buttonType: '',
		buttonClicked: true,
		img: "background:url('/images/small.png')",
		hasGroup: false,
		isMember: false,
		skuIdArray: [],
		transport: -1
	},

	onLoad(options) {
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
		});
		console.log(self.data.skuData);
		if (options.category_id && options.category_id != 'undefined') {
			self.data.category_id = options.category_id
		};
		console.log(self.data.category_id)
		self.data.paginate = api.cloneForm(getApp().globalData.paginate);
		wx.showLoading();
		if (!wx.getStorageSync('token')) {
			var token = new Token();
			token.getUserInfo();
		};
		self.setData({
			web_transport: self.data.transport,
			fonts: app.globalData.font,
			web_count: self.data.count,
			web_shareUser: {},
		});
		if (options.id) {
			self.data.id = options.id
		} else if (options.product_id) {
			self.data.id = options.product_id
		};
		if (options.type == 'show') {
			var isShow = !self.data.isShow;
			self.setData({
				isShow: isShow
			})
		}
		self.getMainData();
		self.getUserData();
		self.getUserInfoData();

		self.orderGet();

		if (wx.getStorageSync('collectData')[self.data.id]) {
			self.setData({
				url: '/images/collect_a.png',
			});
		} else {
			self.setData({
				url: '/images/collect.png',
			});
		};

		if (options.scene) {
			var scene = decodeURIComponent(options.scene)
		};
		if (options.group_no) {
			self.data.scene = options.group_no
		};
		if (options.user_no) {
			self.data.user_no = options.user_no;
			var token = new Token({
				parent_no: self.data.user_no
			});
			const callback = (res) => {
				self.getShareUserData();
			};
			token.getUserInfo({
				data: {}
			}, callback);
		};
		console.log(self.data.user_no)
	},

	ZhanTing() {
		const self = this;
		self.data.autoplay = !self.data.autoplay
		self.setData({
			autoplay: self.data.autoplay
		})
	},

	getUserInfoData() {
		const self = this;
		const postData = {};
		postData.token = wx.getStorageSync('token');
		const callback = (res) => {
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
					self.data.userData = res.info.data[0];
					console.log(self.data.userData.level > 0 ? 'pages/detail/detail?id=' + self.data.id +
						'&&user_no=' + wx.getStorageSync('info').user_no : 'pages/detail/detail?id=' +
						self.data.id)
				}
			} else {
				api.showToast('网络故障', 'none')
			}
			wx.hideLoading();
		};
		api.userInfoGet(postData, callback);
	},

	getUserData() {
		const self = this;
		const postData = {};
		postData.token = wx.getStorageSync('token');
		const callback = (res) => {
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
					self.data.userData1 = res.info.data[0];
				}
			} else {
				api.showToast('网络故障', 'none')
			}
			wx.hideLoading();
		};
		api.userGet(postData, callback);
	},

	getAuthSetting(callback) {
		const self = this;
		wx.getUserProfile({
			desc: '巧巧爱家', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
			success: (res) => {
				console.log('-------获取微信用户所有-----');
				callback && callback(res.userInfo);
				console.log('用户信息', res)
			},
			fail: (res) => {
				console.log('用户信息', res)
			}
		})
	},



	getShareUserData() {
		const self = this;
		const postData = {};
		postData.token = wx.getStorageSync('token');
		postData.searchItem = {
			user_no: self.data.user_no,
			//user_type:0
		}
		const callback = (res) => {
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
					self.setData({
						web_shareUser: res.info.data[0],
					});
				}
			} else {
		 	api.showToast('网络故障', 'none')
			}
			wx.hideLoading();
		};
		api.commonUserGet(postData, callback);
	},

	onShareAppMessage(res) {
		const self = this;
		if (self.data.buttonClicked) {
			api.showToast('数据有误请稍等', 'none');
			setTimeout(function() {
				wx.showLoading();
			}, 800)
			return;
		};
		console.log(res)
		if (res.from == 'button') {
			self.data.shareBtn = true;
		} else {
			self.data.shareBtn = false;
		}
		return {
			title: self.data.skuData.title,
			path: self.data.userData.level > 0 ? 'pages/detail/detail?id=' + self.data.id + '&&user_no=' + wx
				.getStorageSync('info').user_no : 'pages/detail/detail?id=' + self.data.id,
			success: function(res) {
				console.log(res);
				console.log(parentNo)
				if (res.errMsg == 'shareAppMessage:ok') {
					console.log('分享成功')
					if (self.data.shareBtn) {
						if (res.hasOwnProperty('shareTickets')) {
							console.log(res.shareTickets[0]);
							self.data.isshare = 1;
						} else {
							self.data.isshare = 0;
						}
					}
				} else {
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

	collect() {
		const self = this;
		if (self.data.buttonClicked) {
			api.showToast('数据有误请稍等', 'none');
			setTimeout(function() {
				wx.showLoading();
			}, 800)
			return;
		};
		const id = self.data.id;
		if (wx.getStorageSync('collectData') && wx.getStorageSync('collectData')[id]) {
			api.deleteFootOne(id, 'collectData');
			self.setData({
				url: '/images/collect.png',
			});
		} else {
			api.footOne(self.data.skuData, 'id', 100, 'collectData');
			self.setData({
				url: '/images/collect_a.png',
			});
		};
	},

	getMainData() {
		const self = this;
		var nowTime = Date.parse(new Date());
		const postData = {};
		postData.searchItem = {
			thirdapp_id: getApp().globalData.thirdapp_id,
		};
		postData.getBefore = {
			sku: {
				tableName: 'sku',
				searchItem: {
					id: ['in', [self.data.id]]
				},
				fixSearchItem: {
					status: 1
				},
				key: 'product_no',
				middleKey: 'product_no',
				condition: 'in',
			}
		};
		postData.getAfter = {
			sku: {
				tableName: 'sku',
				middleKey: 'product_no',
				key: 'product_no',
				condition: '=',
				searchItem: {
					/* deadline:['>',nowTime], */
					status: ['in', [1]]
				},
			},

		};

		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data[0];
				if (self.data.mainData.transport_type != 0) {
					self.data.transport = self.data.mainData.transport_type
				};
				for (var key in self.data.mainData.label) {
					if (self.data.mainData.sku_array.indexOf(parseInt(key)) != -1) {
						self.data.labelData.push(self.data.mainData.label[key])
					};
				};

				for (var i = 0; i < self.data.mainData.sku.length; i++) {
					if (self.data.mainData.sku[i].id == self.data.id) {
						self.data.skuData = api.cloneForm(self.data.mainData.sku[i]);
					};
					self.data.skuIdArray.push(self.data.mainData.sku[i].id); //为了抓所有Sku的评论
					self.data.choose_sku_item.push.apply(self.data.choose_sku_item, self.data.mainData.sku[
						i].sku_item);
				};
				for (var i = 0; i < self.data.mainData.length; i++) {
					var filename = self.data.sliderData[i].bannerImg[0].url;
					var index1 = filename.lastIndexOf(".");
					var index2 = filename.length;
					self.data.mainData[i].bannerImg[0].type = filename.substring(index1, index2)
				}
				self.data.sku_item = self.data.skuData.sku_item;
				self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
				self.data.complete_api.push('getMainData');
				self.data.addYf = parseFloat(parseFloat(self.data.skuData.price) + parseFloat(self.data
					.skuData.postage)).toFixed(2)
			} else {
				api.showToast('商品信息有误', 'none');
			};
			console.log(self.data.skuData)
			self.setData({
				web_addYf: self.data.addYf,
				web_transport: self.data.transport,
				web_nowTiem: nowTime,
				web_skuData: self.data.skuData,
				web_labelData: self.data.labelData,
				web_mainData: self.data.mainData,
				web_sku_item: self.data.sku_item,
				web_choose_sku_item: self.data.choose_sku_item,
				web_category_id: self.data.category_id
			});
			//self.getMessageData();
			console.log('self.data.labelData', self.data.labelData)
			self.checkLoadComplete();
		};
		api.productGet(postData, callback);
	},




	orderGet() {
		const self = this;
		const postData = {};
		postData.token = wx.getStorageSync('token');
		postData.searchItem = {
			user_type: 0,
			type: 1,
			group_leader: 'true',
			order_step: ['in', [4, 5]],
			pay_status: 1
		};
		postData.getBefore = {
			OrderItem: {
				tableName: 'OrderItem',
				searchItem: {
					sku_id: ['=', [self.data.id]],
				},
				key: 'order_no',
				middleKey: 'order_no',
				condition: 'in',
			},
		};
		postData.getAfter = {
			user: {
				tableName: 'user',
				middleKey: 'user_no',
				key: 'user_no',
				searchItem: {
					status: 1
				},
				condition: '='
			},
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.orderData.push.apply(self.data.orderData, res.info.data);
				self.groupData()
			};
			self.setData({
				web_orderData: self.data.orderData
			});
			console.log('orderGet', self.data.orderData)
		}
		api.orderGet(postData, callback)
	},

	groupData(e) {
		const self = this;

		const postData = {};
		postData.token = wx.getStorageSync('token');
		postData.searchItem = {
			user_type: 0,
			id: self.data.orderData[0].id
		};
		postData.getAfter = {
			groupMember: {
				tableName: 'order',
				middleKey: 'group_no',
				key: 'group_no',
				searchItem: {
					status: 1,

				},
				condition: '='
			},
			user: {
				tableName: 'user',
				middleKey: 'user_no',
				key: 'user_no',
				searchItem: {
					status: 1
				},
				condition: '='
			}
		};

		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.groupData = res.info.data[0];
			};
			self.setData({
				web_groupData: self.data.groupData,
				web_lessNum: self.data.groupData.standard - self.data.groupData.groupMember.length
			})
		}
		api.orderGet(postData, callback)
	},


	infoUpdate(user) {
		const self = this;
		const postData = {};
		postData.token = wx.getStorageSync('token');
		postData.data = {
			nickname: user.nickName,
			headImgUrl: user.avatarUrl
		};
		postData.searchItem = {
			user_no: wx.getStorageSync('info').user_no
		};
		postData.refreshToken = true;
		const callback = (res) => {
			if (res.solely_code == 100000) {
				api.showToast('授权成功', 'none');
				self.getUserData()
			}
		};
		api.userUpdate(postData, callback);
	},

	goJoin() {
		const self = this;
		if (self.data.userData1.headImgUrl == '') {
			const callback = (user, res) => {
				self.infoUpdate(user);
			};
			self.getAuthSetting(callback);
		} else {
			const callback = (user, res) => {
				const skuDatas = [];
				skuDatas.push({
					id: self.data.id,
					count: self.data.count
				});
				console.log(skuDatas);
				if (self.data.skuData.id != '' && self.data.skuData.id != undefined) {
					wx.setStorageSync('payPro', skuDatas);

					api.pathTo('/pages/order_confirm/order_confirm?group_no=' + self.data.groupData
						.group_no, 'nav')
				} else {
					api.showToast('请完善信息', 'none')
				}
			};
		}

	},

	addOrder() {
		const self = this;
		if (!self.data.order_id) {

			console.log(777)
			const postData = {
				token: wx.getStorageSync('token'),
				sku: [{
					id: self.data.skuData.id,
					count: 1
				}],
				pay: {
					wxPay: self.data.skuData.price,
					wxPayStatus: 0
				},
				type: 1,

			};
			if (self.data.skuData.is_group == 1) {
				postData.isGroup = true
			};
			if (self.data.group_no1 && self.data.group_no1 != "undefined") {
				postData.group_no = self.data.group_no1
			};
			if (self.data.addressData) {
				postData.snap_address = self.data.addressData;
			};
			const callback = (res) => {
				if (res && res.solely_code == 100000) {
					self.data.order_id = res.info.id
					self.pay(self.data.order_id);
				} else {
					api.showToast(res.msg, 'none')
				}
			};
			api.addOrder(postData, callback);
		} else {
			self.pay(self.data.order_id)
		}
	},

	pay(order_id) {
		const self = this;

		var order_id = self.data.order_id;
		const postData = {
			token: wx.getStorageSync('token'),
			searchItem: {
				id: order_id,
			},
			wxPay: self.data.skuData.price,
			wxPayStatus: 0
		};

		if (self.data.skuData.is_group == 1) {
			postData.searchItem.status = ['in', [0, 1]]
		};
		const callback = (res) => {
			wx.hideLoading();
			if (res.solely_code == 100000) {
				if (res.info) {
					const payCallback = (payData) => {
						if (payData == 1) {
							setTimeout(function() {
								api.pathTo('/pages/user_order/user_order', 'redi');
							}, 800)
						};
					};
					api.realPay(res.info, payCallback);
				}
			} else {
				api.showToast('支付失败', 'none')
			}

		};
		api.pay(postData, callback);
	},


	showGroupMember() {
		const self = this;
		self.data.isShow = !self.data.isShow
		self.setData({
			web_isShow: self.data.isShow
		})
	},

	counter(e) {
		const self = this;
		if (self.data.buttonClicked) {
			api.showToast('数据有误请稍等', 'none');
			setTimeout(function() {
				wx.showLoading();
			}, 800)
			return;
		};
		if (api.getDataSet(e, 'type') == '+') {
			self.data.count++;
		} else if (self.data.skuData.count > '1') {
			self.data.count--;
		}
		self.data.skuData.count = self.data.count
		self.setData({
			web_count: self.data.count,
			web_skuData: self.data.skuData,
		});
		self.countTotalPrice();
	},

	bindManual(e) {
		const self = this;
		var count = e.detail.value;
		self.data.count = count;
		self.setData({
			web_count: count
		});
		self.countTotalPrice()
	},



	countTotalPrice() {
		const self = this;
		var totalPrice = 0;
		totalPrice += self.data.count * parseFloat(self.data.skuData.price);
		self.data.totalPrice = totalPrice;
		self.setData({
			web_totalPrice: self.data.totalPrice.toFixed(2)
		});
	},



	selectModel(e) {
		const self = this;
		if (self.data.buttonClicked) {
			api.showToast('数据有误请稍等', 'none');
			setTimeout(function() {
				wx.showLoading();
			}, 800)
			return;
		};
		self.data.buttonType = api.getDataSet(e, 'type');
		console.log(self.data.buttonType)
		var isShow = !self.data.isShow;
		self.setData({
			web_buttonType: self.data.buttonType,
			isShow: isShow
		})
	},

	changeType(e) {
		const self = this;
		self.data.transport = e.target.dataset.type;
		self.setData({
			web_transport: self.data.transport
		})
	},

	addCart() {
		const self = this;
		if (self.data.userData1.headImgUrl == '') {
			const callback = (user, res) => {
				self.infoUpdate(user);
			};
			self.getAuthSetting(callback);
		} else {
			self.data.skuData.count = self.data.count;
			self.data.skuData.isSelect = true;
			console.log(self.data.skuData);
			if (self.data.skuData.id != '' && self.data.skuData.id != undefined) {
				if (self.data.transport == -1) {
					wx.showModal({
						title: '提示',
						content: '请选择收货方式',
						showCancel: false,
						confirmColor: '#e50112'
					})
					return
				} else {
					self.data.skuData.transport = self.data.transport;
					api.footOne(self.data.skuData, 'id', 100, 'cartData');
					api.showToast('已加入购物车啦', 'none')
					var cartTotalCounts = 0;
					self.data.cartData = api.jsonToArray(wx.getStorageSync('cartData'), 'unshift');
					console.log('self.data.cartData ', self.data.cartData)
					for (var i = 0; i < self.data.cartData.length; i++) {
						if (self.data.cartData[i].isSelect) {
							cartTotalCounts += self.data.cartData[i].count;
						}
					};
					self.setData({
						web_cartTotalCounts: cartTotalCounts,
					});
				}
			} else {
				api.showToast('请完善信息', 'none')
			}
			this.setData({
				isShow: false,
			})
		}

	},

	goBuy() {
		const self = this;
		if (self.data.userData1.headImgUrl == '') {
			const callback = (user, res) => {
				self.infoUpdate(user);
			};
			self.getAuthSetting(callback);
		} else {
			const skuDatas = [];
			skuDatas.push({
				id: self.data.id,
				count: self.data.count
			});
			console.log(skuDatas);
			if (self.data.skuData.id != '' && self.data.skuData.id != undefined) {
				wx.setStorageSync('payPro', skuDatas);
				if (self.data.transport == -1) {
					wx.showModal({
						title: '提示',
						content: '请选择收货方式',
						showCancel: false,
						confirmColor: '#e50112'
					})
				} else if (self.data.transport == 1) {
					api.pathTo('/pages/order_delivery/order_delivery?group_no=' + self.data.scene +
						'&&user_no=' + self.data.user_no,
						'nav')
				} else if (self.data.transport == 2) {
					api.pathTo('/pages/order_get/order_get?group_no=' + self.data.scene + '&&user_no=' + self
						.data.user_no,
						'nav')
				}

			} else {
				api.showToast('请完善信息', 'none')
			}
		}
	},



	chooseSku(e) {
		const self = this;
		if (self.data.userData1.headImgUrl == '') {
			const callback = (user, res) => {
				self.infoUpdate(user);
			};
			self.getAuthSetting(callback);
		} else {
			if (self.data.buttonClicked) {
				api.showToast('数据有误请稍等', 'none');
				setTimeout(function() {
					wx.showLoading();
				}, 800)
				return;
			};
			self.data.skuData = {};
			self.data.id = '';

			self.data.count = 1;
			delete self.data.totalPrice;
			var id = api.getDataSet(e, 'id');

			if (self.data.choose_sku_item.indexOf(id) == -1) {
				return;
			};
			self.data.choose_sku_item = [];
			var parentid = api.getDataSet(e, 'parentid');
			var sku = self.data.mainData.label[parentid];

			for (var i = 0; i < sku.child.length; i++) {
				if (self.data.sku_item.indexOf(sku.child[i].id) != -1) {
					self.data.sku_item.splice(self.data.sku_item.indexOf(sku.child[i].id), 1);
				};
				self.data.choose_sku_item.push(sku.child[i].id);
			};


			for (var i = 0; i < self.data.mainData.sku.length; i++) {
				if (self.data.mainData.sku[i].sku_item.indexOf(parseInt(id)) != -1) {
					self.data.choose_sku_item.push.apply(self.data.choose_sku_item, self.data.mainData.sku[i]
						.sku_item);
				};
			};

			for (var i = 0; i < self.data.sku_item.length; i++) {
				if (self.data.choose_sku_item.indexOf(parseInt(self.data.sku_item[i])) == -1) {
					self.data.sku_item.splice(i, 1);
				};
			};
			self.data.sku_item.push(id);

			for (var i = 0; i < self.data.mainData.sku.length; i++) {
				if (JSON.stringify(self.data.mainData.sku[i].sku_item.sort()) == JSON.stringify(self.data
						.sku_item.sort())) {
					self.data.id = self.data.mainData.sku[i].id;
					self.data.skuData = api.cloneForm(self.data.mainData.sku[i]);
				};
			};
			self.data.addYf = parseFloat(parseFloat(self.data.skuData.price) + parseFloat(self.data.skuData
				.postage)).toFixed(2)
			self.setData({
				web_addYf: self.data.addYf,
				web_totalPrice: '',
				web_count: self.data.count,
				web_sku_item: self.data.sku_item,
				web_skuData: self.data.skuData,
				web_choose_sku_item: self.data.choose_sku_item,
			});
		};

	},

	swiperChange(e) {
		const that = this;
		that.setData({
			swiperIndex: e.detail.current,
		})
	},



	/* getMessageData(isNew){
    const self = this;
	
    if(isNew){
      api.clearPageIndex(self); 
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.token = wx.getStorageSync('token');
    postData.searchItem = {
      relation_id:['in',self.data.skuIdArray],
      type:1,
      user_type:0
    };
    postData.order = {
      create_time:'desc'
    };
    postData.getAfter = {
      user:{
        tableName:'user',
        middleKey:'user_no',
        key:'user_no',
        searchItem:{
          status:1
        },
        condition:'='
      }
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.messageData.push.apply(self.data.messageData,res.info.data);
				self.data.totalMessage = res.info.total
      }else{
        self.data.isLoadAll = true;
				self.data.totalMessage = res.info.total
      };
      wx.hideLoading();
      self.setData({
				web_totalMessage:self.data.totalMessage,
       
        web_messageData:self.data.messageData,
      });  
    };
    api.messageGet(postData,callback);
  }, */

	/* onReachBottom() {
	  const self = this;
	  if(!self.data.isLoadAll){
	    self.data.paginate.currentPage++;
	    self.getMainData();
	  };
	}, */



	checkLoadComplete() {
		const self = this;
		var complete = api.checkArrayEqual(self.data.complete_api, ['getMainData']);
		if (complete) {
			wx.hideLoading();
			self.data.buttonClicked = false;
		};
	},

	select_this(e) {
		const self = this;
		self.data.tabCurrent = api.getDataSet(e, 'current');
		self.setData({
			tabCurrent: self.data.tabCurrent
		})
	},

	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},

	intoPathRedi(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	},

	close() {
		const self = this;
		self.setData({
			isShow: false
		})
	},

})
