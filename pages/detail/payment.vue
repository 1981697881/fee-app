<template>
	<view class="">
		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left" :class="{ required: !isReview }">申请事由</view></view>
			<view class="a-cell-bd"><textarea :disabled="isReview" :value="reason"  /></view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">付款金额</view>
				<view class="a-cell-title-right">
					<input :disabled="isReview" type="number" :placeholder="!isReview ? '输入数字自动转换大写小数2位' : ''" v-model="money" @input="handleMoney" />
				</view>
			</view>
			<view class="a-cell-bd placeholder">{{ currency || '' }}</view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">付款日期</view>
				<view class="a-cell-title-right">
					<picker :disabled="isReview" mode="date" :value="happenDate" :start="startDate" :end="endDate" @change="handleDate">
						<view class="uni-input">{{ happenDate }}</view>
					</picker>
				</view>
			</view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">收款人全称</view>
				<view class="a-cell-title-right"><input :disabled="isReview" placeholder="输入名字" v-model="payee" /></view>
			</view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left">备注说明</view></view>
			<view class="a-cell-bd"><textarea :disabled="isReview" :value="remark"  /></view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left ">附件</view></view>
			<view class="a-cell-bd">
				<!-- 参考https://ext.dcloud.net.cn/plugin?id=4079 -->
				<uni-file-picker v-model="imageValue" :readonly="isReview ? true : false" file-mediatype="image" mode="grid" file-extname="png,jpg" />
			</view>
		</view>

		<template v-if="isReview">
			<approve ref="approve"></approve>
		</template>
		<view class="flex">
			<button class="u-flex-1" type="default" @tap="jump(-1)">取消</button>
			<button class="u-flex-1" type="primary" @tap="save">保存</button>
		</view>
	</view>
</template>

<script>
import mock from '@/common/mock/contact';
import tools from '@/common/utils/tools';
import approve from './components/approve';
export default {
	components: {
		approve
	},
	data() {
		const currentDate = this.getDate({
			format: true
		});
		return {
			// 收款人全称
			payee: '',
			// 备注
			remark: '',
			// 费用金额
			money: null,
			// 附件，目前只能上传图片，还不知道为什么上传后没file
			imageValue: [
				{
					// 三个属性必填，否则影响组件显示
					name: 'file.txt',
					extname: 'txt',
					url: 'https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/gh_33446d7f7a26_430.jpg'
				}
			],
			// 金额的中文大写
			currency: null,
			// 申请事由
			reason: '',
			// 发生日期 - 默认当天
			happenDate: currentDate,
			// 判断进来是从填写入口进还是查看详情进来
			isReview: false
		};
	},
	computed: {
		startDate() {
			return this.getDate('start');
		},
		endDate() {
			return this.getDate('end');
		}
	},
	onShow: function() {
		console.log('显示审批模块')
		// 拿出路由
		const { query } = this.$Route;
		// 判断入口是从 主页的默认入口进入还是 我的待审 - 点击进去详情审批
		this.isReview = query.isReview;
		
		uni.$on('handleCheckbox', res => {
			if(res.type == "approver"){
				// 处理选择完人员后更新input显示
				// 处理完后mock.contactList就是最新的选择人员数据
				this.$refs['approve'].$set(this.$refs['approve'], 'contactList', res.item)
				this.$refs['approve'].getApprover()
			}else{
				// 处理选择完人员后更新input显示
				// 处理完后mock.contactList就是最新的选择人员数据
				this.$refs['approve'].$set(this.$refs['approve'], 'conperList', res.item)
				this.$refs['approve'].getCopyer()
			}
		});
	},
	created() {
		// 接口请求等一系列操作....
		const { contactList, steps } = mock;
		this.contactList = contactList;
		this.stepList = steps;
		// 根据选中人员数据去拼接人名
		this.getApprover();
	},
	methods: {
		save() {
			const duration = 1500,
				{ jump, success, isReview } = this;
			// 先判断是填写审批单/审批单据
			if (isReview) {
				// 审批单据接口......
				success({
					msg: '审核成功'
				});
			} else {
				if (!this.reason || !this.money > 0 || !this.payee) {
					uni.showToast({
						title: '请填写必填项',
						mask: true,
						icon: 'none',
						duration
					});
				} else {
					this.$api('approve.orderApproval',{
						applyName: '',
						status: '',
					}).then(res => {
						if (res.flag) {
							uni.showLoading({
								title: '提交中'
							});
							setTimeout(function() {
								uni.hideLoading();
								success({
									msg: '提交成功'
								});
							}, duration);
						}
					});
				}
			}
		},
		// 成功后的提示框以及跳转
		success(options) {
			const duration = 1500,
				{ jump } = this;
			this.$api('approve.applyOrder',{
				applyName: '',
				status: '',
			}).then(res => {
				if (res.flag) {
					uni.showToast({
						title: options.msg || '提交成功',
						mask: true,
						duration
					});
					setTimeout(() => {
						jump(-1);
					}, 2000);
				}
			});
		},
		getDate(type) {
			const date = new Date();
			let year = date.getFullYear();
			let month = date.getMonth() + 1;
			let day = date.getDate();

			if (type === 'start') {
				year = year - 60;
			} else if (type === 'end') {
				year = year + 2;
			}
			month = month > 9 ? month : '0' + month;
			day = day > 9 ? day : '0' + day;
			return `${year}-${month}-${day}`;
		},
		handleMoney(options) {
			const { value } = options.detail;
			// 限制小数点只有2位
			const splitValue = value.split('.');
			// 如果有小数点
			if (!!splitValue['1']) {
				if (splitValue['1'].length > 2) {
					//正则表达试
					options.detail.value = options.detail.value.match(/^\d*(\.?\d{0,2})/g)[0] || null;
					// 渲染新的字符串上去
					this.$nextTick(() => {
						this.money = options.detail.value;
					});
					// 仅微信小程序支持，改变输入的内容
					// return value.substr(0, value.length - 1);
				} else {
				}
			}
			// 获取金额的大写
			this.currency = tools.convertCurrency(value);
			// console.log(currency)
			// this.currency = currency
		},
		handleDate: function(e) {
			this.happenDate = e.target.value;
		},
		jump(path, parmas) {
			// 返回上一页
			if (path == -1) {
				uni.navigateBack({ delta: 1 });
			} else {
				uni.navigateTo({
					url: path
				});
			}
		}
	}
};
</script>

<style lang="scss">
uni-button, button {
	border-radius: 0;
	margin: 20rpx 20rpx;
}
</style>
