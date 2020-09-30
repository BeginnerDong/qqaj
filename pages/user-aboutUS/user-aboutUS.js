//logs.js
import {
	Api
} from '../../utils/api.js';
var api = new Api();
const app = getApp()


Page({

	data: {
		mainData:{}
	},

	onLoad() {
		const self = this;
		self.getMainData()
	},

	getMainData() {
		const self = this;
		const postData = {};
		postData.searchItem = {
			thirdapp_id: '2',
		};
		postData.getBefore = {
		  aboutData:{
		    tableName:'label',
		    searchItem:{
		      title:['=',['联系我们']],
		    },
		    middleKey:'parentid',
		    key:'id',
		    condition:'in',
		  },
		};
		const callback = (res) => {
			if (res.info.data.length > 0) {
				self.data.mainData = res.info.data
			};
			console.log('self.data.mainData',self.data.mainData)
			self.setData({
				web_mainData: self.data.mainData,
			});
		};
		api.labelGet(postData, callback);
	},
	
	phoneCall(e){
		const self = this;
		console.log(e)
		wx.makePhoneCall({
			phoneNumber:e.target.dataset.phone
		})
	},
	
	wxCopy(e){
		const self = this;
		console.log(e)
		wx.setClipboardData({
			data:e.target.dataset.wx
		})
	},
	
	previewImg(e){
		const self = this;
		
		wx.previewImage({
			urls:[e.target.dataset.url]
		})
	},

})
