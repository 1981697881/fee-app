<template>
	<view class="">
		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left" :class="{ required: !isReview }">调拨事由</view></view>
			<view class="a-cell-bd"><textarea :disabled="isReview" v-model="transferReason" /></view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">调拨金额</view>
				<view class="a-cell-title-right">
					<input :disabled="isReview" type="number" :placeholder="!isReview ? '输入数字自动转换大写小数2位' : ''" v-model="transferMoney" @input="handleMoney" />
				</view>
			</view>
			<view class="a-cell-bd placeholder">{{ transferCurrency || '' }}</view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">调拨日期</view>
				<view class="a-cell-title-right">
					<picker :disabled="isReview" mode="date" :value="transferDate" :start="startDate" :end="endDate" @change="handleTransferDate">
						<view class="uni-input">{{ transferDate }}</view>
					</picker>
				</view>
			</view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">付款账号</view>
				<view class="a-cell-title-right"><input type="text" :disabled="isReview" v-model="payAccount" /></view>
			</view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">收款账户</view>
				<view class="a-cell-title-right"><input type="text" :disabled="isReview" v-model="repayAccount" /></view>
			</view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left">备注说明</view></view>
			<view class="a-cell-bd"><textarea :disabled="isReview" v-model="reason" /></view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left ">附件</view></view>
			<view class="a-cell-bd">
				<!-- 参考https://ext.dcloud.net.cn/plugin?id=4079 -->
				<uni-file-picker v-model="imageValue" :readonly="isReview ? true : false" file-mediatype="image" mode="grid" file-extname="png,jpg" />
			</view>
		</view>

		<!-- <view class="flex" v-if="!isReview">
			<button class="u-flex-1" type="default" @tap="jump(-1)">取消</button>
			<button class="u-flex-1" type="primary" @tap="save">保存</button>
		</view> -->
		<view class="a-cell-box" v-if="!isReview">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">审核人</view>
				<view class="a-cell-title-right">
					<picker :disabled="isReview" @change="handleUserPicker" :value="userIndex" :range="userList" range-key="name">
						<view class="uni-input">{{ userList[userIndex].name }}</view>
					</picker>
				</view>
			</view>
		</view>
		<template v-if="isReview">
			<approve ref="approve" :jdData="jinDuList"></approve>
		</template>
		<view class="flex">
			<button class="u-flex-1" type="default" @tap="jump(-1)">取消</button>
			<button class="u-flex-1" type="primary" @tap="save">保存</button>
			<button class="u-flex-1" type="primary" @tap="pay">付款</button>
			<button class="u-flex-1" type="primary" @tap="comif">完成</button>
		</view>
	</view>
</template>

<script>
import mock from '@/common/mock/contact';
import tools from '@/common/utils/tools';
import approve from './components/approve';
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	components: {
		approve
	},
	data() {
		const currentDate = this.getDate({
			format: true
		});
		return {
			// 调拨金额
			transferMoney: null,
			// 附件，目前只能上传图片，还不知道为什么上传后没file
			imageValue: [
				{
					// 三个属性必填，否则影响组件显示
					name: 'file.txt',
					extname: 'txt',
					url: 'https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/gh_33446d7f7a26_430.jpg'
				}
			],
			// 费用类型
			userIndex: 0,
			jinDuList: [],
			// 费用类型数据
			userList: [
				{
					value: '1',
					name: '张三'
				},
				{
					value: '2',
					name: '李四'
				},
				{
					value: '3',
					name: '王五'
				},
				{
					value: '4',
					name: 'boss'
				}
			],
			// 金额的中文大写
			transferCurrency: null,
			// 调拨事由
			transferReason: '',
			// 调拨日期 - 默认当天
			transferDate: currentDate,
			// 付款账号
			payAccount: '',
			// 收款账户
			repayAccount: '',
			// 备注说明
			reason: '',
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
	onShow() {
		// 拿出路由
		const { query } = this.$Route;
		// 判断入口是从 主页的默认入口进入还是 我的待审 - 点击进去详情审批
		this.isReview = query.isReview;
		this.params = { ...query };
		this.getJinDu();
		if (this.isReview) {
			this.transferReason = query.storyDescribe;
			this.transferMoney = query.amount;
			this.transferDate = query.flittingDate;
			this.payAccount = query.payAccount;
			this.repayAccount = query.getAccount;
			this.reason = query.remark;
			this.userInfo.levels = query.applyName;
			this.userIndex = this.userList.indexOf(query.nextApprovalPeople);
		}
		uni.$on('handleCheckbox', res => {
			if (res.type == 'approver') {
				// 处理选择完人员后更新input显示
				// 处理完后mock.contactList就是最新的选择人员数据
				this.$refs['approve'].$set(this.$refs['approve'], 'contactList', res.item);
				this.$refs['approve'].getApprover();
			} else {
				// 处理选择完人员后更新input显示
				// 处理完后mock.contactList就是最新的选择人员数据
				this.$refs['approve'].$set(this.$refs['approve'], 'conperList', res.item);
				this.$refs['approve'].getCopyer();
			}
		});
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo
		})
	},
	created() {},
	methods: {
		handleUserPicker(e) {
			this.userIndex = e.detail.value;
		},
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
				if (!this.transferReason || !this.transferMoney > 0 || !this.payAccount || !this.repayAccount) {
					uni.showToast({
						title: '请填写必填项',
						mask: true,
						icon: 'none',
						duration
					});
				} else {
					this.$api('approve.applyOrder', {
						storyDescribe: this.transferReason,
						amount: this.transferMoney,
						flittingDate: this.transferDate,
						payAccount: this.payAccount,
						getAccount: this.repayAccount,
						remark: this.reason,
						photo: '',
						status: 0,
						orderType: '资金调拨',
						applyName: this.userInfo.levels,
						nextApprovalPeople: this.userList[this.userIndex].name
					}).then(res => {
						if (res.flag) {
							uni.showLoading({
								title: '提交中'
							});
							setTimeout(function() {
								uni.hideLoading();
								setTimeout(() => {
									jump(-1);
								}, 2000);
							}, duration);
						}
					});
				}
			}
		},
		// 审核
		success(options) {
			const duration = 1500,
				{ jump } = this;
			this.$api('approve.orderApproval', {
				storyDescribe: this.transferReason,
				amount: this.transferMoney,
				id: this.params.id,
				aid: this.params.aid,
				flittingDate: this.transferDate,
				payAccount: this.payAccount,
				getAccount: this.repayAccount,
				remark: this.reason,
				photo: '',
				status: this.params.status,
				approvalOpinion: this.$refs['approve'].ideaList[this.$refs['approve'].ideaIndex].name,
				nextApprovalPeople: this.$refs['approve'].approver,
				copyPeople: this.$refs['approve'].copyer
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
		pay(options) {
			const duration = 1500,
				{ jump } = this;
			this.$api('approve.updateOrderApproval', {
				storyDescribe: this.transferReason,
				amount: this.transferMoney,
				id: this.params.id,
				aid: this.params.aid,
				flittingDate: this.transferDate,
				payAccount: this.payAccount,
				getAccount: this.repayAccount,
				remark: this.reason,
				photo: '',
				status: 3,
				approvalOpinion: this.$refs['approve'].ideaList[this.$refs['approve'].ideaIndex].name,
				nextApprovalPeople: this.$refs['approve'].approver,
				copyPeople: this.$refs['approve'].copyer
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
		comif(options) {
			const duration = 1500,
				{ jump } = this;
			this.$api('approve.updateOrderApproval', {
				storyDescribe: this.transferReason,
				amount: this.transferMoney,
				id: this.params.id,
				aid: this.params.aid,
				flittingDate: this.transferDate,
				payAccount: this.payAccount,
				getAccount: this.repayAccount,
				remark: this.reason,
				photo: '',
				status: 2,
				approvalOpinion: this.$refs['approve'].ideaList[this.$refs['approve'].ideaIndex].name,
				nextApprovalPeople: this.$refs['approve'].approver,
				copyPeople: this.$refs['approve'].copyer
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
		getJinDu() {
			this.$api('approve.jinDu', {
				id: this.params.aid
			}).then(res => {
				if (res.flag) {
					this.$refs['approve'].stepList = res.data;
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
						this.transferMoney = options.detail.value;
					});
					// 仅微信小程序支持，改变输入的内容
					// return value.substr(0, value.length - 1);
				} else {
				}
			}
			// 获取金额的大写
			this.transferCurrency = tools.convertCurrency(value);
		},
		handleTransferDate: function(e) {
			this.transferDate = e.target.value;
		},
		handleTypePicker: function(e) {
			console.log('picker发送选择改变，携带值为：' + e.detail.value);
			this.typeIndex = e.detail.value;
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
uni-button,
button {
	border-radius: 0;
	margin: 20rpx 20rpx;
}
</style>
