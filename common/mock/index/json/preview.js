// 我的待审核
export default [
	{
		// 待审单据
		pendingOrder: '费用报销',
		// 发起人
		initiator: '张三',
		// 上一级审批人
		preApprover: '张三老大',
		// 滞留
		currentStopTime: '30',
		// 调整地址
		// TODO 需要根据接口设计对应前端的申请入口的地址保持一直
		// 这里只做测试
		path: '/pages/detail/cost',
	},
	{
		// 待审单据
		pendingOrder: '预算费用申请',
		// 发起人
		initiator: '张三',
		// 上一级审批人
		preApprover: '张三老大',
		// 滞留
		currentStopTime: '0',
		path: '/pages/detail/budget',
	},
	{
		// 待审单据
		pendingOrder: '付款申请',
		// 发起人
		initiator: '畖畖畖',
		// 上一级审批人
		preApprover: 'jusitos',
		// 滞留
		currentStopTime: '90',
		path: '/pages/detail/payment',
	},
	{
		// 待审单据
		pendingOrder: '特殊事项申请',
		// 发起人
		initiator: '畖畖畖',
		// 上一级审批人
		preApprover: 'jusitos',
		// 滞留
		currentStopTime: '90',
		path: '/pages/detail/special',
	},
	{
		// 待审单据
		pendingOrder: '资金调拨单',
		// 发起人
		initiator: '畖畖畖',
		// 上一级审批人
		preApprover: 'jusitos',
		// 滞留
		currentStopTime: '90',
		path: '/pages/detail/transfer',
	}
]