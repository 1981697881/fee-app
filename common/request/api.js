/**
 * 接口列表文件
 */
export default {
	/** 初始化 ↓ **/
	init: {
		url: 'baoxiao/index/init',
		auth: false,
		method: 'GET',
		// desc: '初始化数据',
	},
	/** 审批 ↓ **/
	approve:{
		applyOrderList:{
			url: 'baoxiao/applyApprovalRecord/applyApprovalOrderList',
			auth: true,
			method: 'POST',
			// desc: '获取申请列表',
		},
		approvalOrderList:{
			url: 'baoxiao/applyApprovalRecord/waitApplyApprovalOrderList',
			auth: true,
			method: 'POST',
			// desc: '获取审批列表',
		}, applyCcPerson:{
			url: 'baoxiao/applyCcPerson/applyOrder',
			auth: true,
			method: 'POST',
			// desc: '获取抄送列表',
		}, applyApprovalOrders:{
			url: 'baoxiao/applyApprovalRecord/applyApprovalOrders',
			auth: true,
			method: 'POST',
			// desc: '获取已完成列表',
		}, 
		applyOrder:{
			url: 'baoxiao/applyApprovalRecord/addApplyApprovalOrder',
			auth: true,
			method: 'POST',
			// desc: '保存',
		},
		/* approvalOrder:{
			url: 'baoxiao/approval/approvalOrder',
			auth: true,
			method: 'POST',
			// desc: '提交',
		}, */
		orderApproval:{
			url: 'baoxiao/applyApprovalRecord/approvalOrder',
			auth: true,
			method: 'POST',
			// desc: '审核',
		},
		jinDu:{
			url: 'baoxiao/applyApprovalRecord/approvalOrderJinDu',
			auth: true,
			method: 'POST',
			// desc: '审核进度',
		},
		updateOrderApproval:{
			url: 'baoxiao/approval/updateOrderApproval',
			auth: true,
			method: 'POST',
			// desc: '审核完成',
		},approvalOrderAgain:{
			url: 'baoxiao/applyApprovalRecord/approvalOrderAgain',
			auth: true,
			method: 'POST',
			// desc: '重新申请',
		},
		reimbursementType: {
			url: 'baoxiao/applyApprovalRecord/reimbursementType',
			auth: true,
			method: 'POST',
			// desc: '报销类型',
		},costType: {
			url: 'baoxiao/applyApprovalRecord/costType',
			auth: true,
			method: 'POST',
			// desc: '费用类型',
		},
	},
	/** 聊天 ↓ **/
	chat: {
		init: {
			url: 'baoxiao/chat.index/init',
			auth: false,
			method: 'GET',
			// desc: '初始化聊天配置',
		}

	},

	/** 上传图片 ↓ **/
	upload: {
		url: 'baoxiao/file/imgUpload',
		auth: true,
		method: 'POST',
		// desc: '上传',
	},

	/** 上传Base64图片 ↓ **/
	uploadBase64: {
		url: 'baoxiao/index/uploadBase64',
		auth: false,
		method: 'POST',
		// desc: '上传Base64位图片',
	},

	/** 消息订阅模板 ↓ **/
	messageIds: {
		url: 'baoxiao/notification/template',
		auth: true,
		method: 'GET',
		// desc: '订阅消息模板ids',
	},

	
	

	/** 微信Jssdk ↓ **/
	wechat: {
		jssdk: {
			url: 'baoxiao/wechat/jssdk',
			auth: false,
			method: 'POST',
			// desc: '微信Jssdk',
		},
	},

	

	/** 富文本  ↓ **/
	richtext: {
		url: 'baoxiao/index/richtext',
		auth: false,
		method: 'GET',
		// desc: '富文本数据',
	},

	
	/** 用户 ↓ **/
	user: {
		member: {
			url: 'baoxiao/member/loginMember',
			auth: true,
			method: 'POST',
			// desc: '用户信息',
		},findUserAuthority: {
			url: 'baoxiao/member/findUserAuthority',
			auth: true,
			method: 'POST',
			// desc: ' 查询当前用户是否绑定权限职员',
		},setUserAuthority: {
			url: 'baoxiao/member/setUserAuthority',
			auth: true,
			method: 'POST',
			// desc: ' 当前用户绑定权限职员',
		},approvalPerson: {
			url: 'baoxiao/applyApprovalRecord/approvalPerson',
			auth: true,
			method: 'POST',
			// desc: '查询职员',
		},
		info: {
			url: 'baoxiao/user',
			auth: true,
			method: 'GET',
			// desc: '用户信息',
		},
		register: {
			url: 'baoxiao/user/register',
			auth: false,
			method: 'POST',
			// desc: '用户注册',
		},
		getWxMiniProgramSessionKey: {
			url: 'baoxiao/weChat/memberAuthorize',
			auth: false,
			method: 'POST',
			// desc: '获取用户session_key',
		},
		wxMiniProgramLogin: {
			url: 'baoxiao/weChat/memberLogin',
			auth: false,
			method: 'POST',
			// desc: '微信小程序登录',
		},
		getWxMiniPhoneNumber: {
			url: 'baoxiao/phone/phoneNumber',
			auth: false,
			method: 'POST',
			// desc: '获取用户手机号码',
		},
		forgot: {
			url: 'baoxiao/user/forgot',
			auth: false,
			method: 'POST',
			// desc: '忘记密码',
		},
	},

	/** 分享 ↓ **/
	share: {
		add: {
			url: 'baoxiao/share/add',
			auth: false,
			method: 'POST',
			// desc: '添加分享记录',
		}
	},

	/** 位置 ↓ **/
	address: {
		area: {
			url: 'baoxiao/address/area',
			auth: false,
			method: 'GET',
			// desc: '省市区',
		},
		list: {
			url: 'baoxiao/address',
			auth: true,
			method: 'GET',
			// desc: '地址列表',
		},
		edit: {
			url: 'baoxiao/address/edit',
			auth: true,
			method: 'POST',
			// desc: '修改地址',
		},
		defaults: {
			url: 'baoxiao/address/defaults',
			auth: true,
			method: 'GET',
			// desc: '默认地址',
		},
		info: {
			url: 'baoxiao/address/info',
			auth: true,
			method: 'GET',
			// desc: '地址详情',
		},
		del: {
			url: 'baoxiao/address/del',
			auth: true,
			method: 'POST',
			// desc: '删除',
		},
	},

	/** 短信 ↓ **/
	sms: {
		send: {
			url: 'baoxiao/sms/send',
			auth: false,
			method: 'POST',
			// desc: '发送短信',
		},
	},

	/** 常见问题 ↓ **/
	faq: {
		list: {
			url: 'baoxiao/faq',
			auth: false,
			method: 'GET',
			// desc: '常见问题列表',
		},
	},

	/** 意见反馈 ↓ **/
	feedback: {
		type: {
			url: 'baoxiao/feedback/type',
			auth: true,
			method: 'GET',
			// desc: '意见反馈类型',
		},
		add: {
			url: 'baoxiao/feedback/add',
			auth: true,
			method: 'POST',
			// desc: '提交意见',
		},
	},
	/** 支付 ↓ **/
	pay: {
		prepay: {
			url: 'baoxiao/pay/prepay',
			auth: true,
			method: 'POST',
			// desc: '发起支付',
		},
	},
};
