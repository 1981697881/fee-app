<template>
	<view class="">
		<view class="a-cell-box" v-if="isReview">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">申请人</view>
				<view class="a-cell-title-right">
					<text>{{ applyPersonFname }}</text>
				</view>
			</view>
		</view>
		<view class="a-cell-box" v-if="isReview">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">待审核人</view>
				<view class="a-cell-title-right">
					<text>{{ nextApprovalFname }}</text>
				</view>
			</view>
		</view>
		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left" :class="{ required: !isReview }">调拨事由</view></view>
			<view class="a-cell-bd"><textarea :disabled="isReview" v-model.trim="transferReason" /></view>
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
			<view class="a-cell-bd"><textarea :disabled="isReview" v-model.trim="reason" /></view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left ">附件</view></view>
			<view class="a-cell-bd">
				<!-- 参考https://ext.dcloud.net.cn/plugin?id=4079 -->
				<uni-file-picker v-model="imageValue" :limit="3" :readonly="isReview ? true : false" file-mediatype="image" mode="grid" file-extname="png,jpg" />
			</view>
		</view>
		<!-- <view class="a-cell-box" v-if="isReview">
			<view class="a-cell-title">
				<view class="a-cell-title-left">抄送人</view>
				<view class="a-cell-title-right"><input type="text" :disabled="isReview" v-model="makeACopy" /></view>
			</view>
		</view> -->
		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">抄送人</view>
				<view class="a-cell-title-right">
					<view class="a-cell-title-right">
						<picker :disabled="isReview" @change="selectChange" :value="userIndex" :range="userList" range-key="fname">
							<view class="uni-input">{{ userList[userIndex].fname }}</view>
						</picker>
					</view>
				</view>
			</view>
		</view>
		<approve ref="approve" :isShne="isShne" :isReview="isReview" :jdData="jinDuList"></approve>
		<view class="flex" v-if="isInvisible != 'false'">
			<button class="u-flex-1" type="default" @tap="jump(-1)">取消</button>
			<button class="u-flex-1" type="primary" :disabled="isClick" v-if="!isReview" @tap="save">保存</button>
			<button class="u-flex-1" type="primary" :disabled="isClick" v-if="isReview" @tap="success">审核</button>
			<!-- <button class="u-flex-1" type="primary" v-if="isReview &&userInfo.fpay == 1" @tap="pay">付款</button> -->
			<button class="u-flex-1" type="primary" :disabled="isClick" v-if="isReview && userInfo.fend == 1" @tap="comif">完成</button>
		</view>
	</view>
</template>

<script>
import mock from '@/common/mock/contact';
import tools from '@/common/utils/tools';
import approve from './components/approve';
import ldSelect from '@/components/ld-select/ld-select';
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	components: {
		approve,
		ldSelect
	},
	data() {
		const currentDate = this.getDate({
			format: true
		});
		return {
			// 附件，目前只能上传图片，还不知道为什么上传后没file
			imageValue: [],
			orderType: 4,
			// 费用类型
			userIndex: 0,
			jinDuList: [],
			// 费用类型数据
			userList: [],
			// 调拨金额
			transferMoney: null,
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
			applyPersonFname: '',
			nextApprovalFname: '',
			makeACopy: '',
			// 判断进来是从填写入口进还是查看详情进来
			isReview: false,
			isShne: false,
			isClick: false,
			isInvisible: true
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
		this.isShne = query.isShne;
		this.isInvisible = query.isInvisible;
		this.params = { ...query };
		this.getUserList();
		if (this.isReview) {
			this.getJinDu();
			this.imageValue = JSON.parse(query.stringMaps);
			if (query.applyCcPersonList) {
				let markc = JSON.parse(query.applyCcPersonList);
				this.params.applyCcPersonList = markc;
				/* markc.forEach((item, index) => {
					if (index == 0) {
						this.makeACopy = item.ccName;
					} else {
						this.makeACopy = this.makeACopy + ',' + item.ccName;
					}
				}); */
			}
			this.imageValue.forEach(item => {
				item.url = decodeURIComponent(item.url);
			});
			this.$refs['approve'].revirwReason = query.approvalComments;
			this.currency = tools.convertCurrency(query.cost);
			this.transferReason = query.applySituation;
			this.applyPersonFname = query.applyPersonFname;
			this.nextApprovalFname = query.nextApprovalFname;
			this.transferMoney = query.cost;
			this.transferDate = query.happenDate;
			this.payAccount = query.paymentAccount;
			this.repayAccount = query.collectionAccount;
			this.reason = query.remark;
			this.userList.forEach((item, index) => {
				if (markc[0].ccNumber == item.fnumber) {
					this.userIndex = index;
				}
			});
			/* if (query.status == '2') {
				this.isReview = false;
			} */
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
			uni.$off('handleCheckbox')
		});
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo
		})
	},
	created() {},
	methods: {
		selectChange(val) {
			this.userIndex = val.detail.value;
		},
		getUrlVars(url) {
			var hash;
			var myJson = {};
			var hashes = url.slice(url.indexOf('?') + 1).split('&');
			for (var i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				myJson[hash[0]] = hash[1];
			}
			return myJson;
		},
		getUserList() {
			this.$api('user.approvalPerson', {}).then(res => {
				if (res.flag) {
					this.userList = res.data;
				}
			});
		},
		handleUserPicker(e) {
			this.userIndex = e.detail.value;
		},
		save() {
			console.log(this.imageValue);
			const duration = 1500,
				{ jump, success, isReview } = this;
			// 先判断是填写审批单/审批单据

			if (!this.transferReason || !this.transferMoney > 0 || !this.payAccount || !this.repayAccount ) {
				uni.showToast({
					title: '请填写必填项',
					mask: true,
					icon: 'none',
					duration
				});
			} else {
				let params = [];
				let approverNumber = [];
				let approver = [];
				let applyCcPersonList = [];
				let obj = {
					ccName: this.userList[this.userIndex].fname,
					ccNumber: this.userList[this.userIndex].fnumber
				};
				applyCcPersonList.push(obj);
				if (this.$refs['approve'].approverNumber.length != undefined) {
					approverNumber = this.$refs['approve'].approverNumber.split(',').filter(function(s) {
						return s && s.trim();
					});
				}
				if (this.$refs['approve'].approver.length != undefined) {
					approver = this.$refs['approve'].approver.split(',').filter(function(s) {
						return s && s.trim();
					});
				}
				approverNumber.forEach((item, index) => {
					let obj = {
						applySituation: this.transferReason,
						cost: this.transferMoney,
						happenDate: this.transferDate,
						remark: this.reason,
						enclosure: '',
						stringMaps: JSON.stringify(this.imageValue),
						paymentAccount: this.payAccount,
						collectionAccount: this.repayAccount,
						nextApprovalFnumber: item,
						nextApprovalFname: approver[index],
						orderType: this.orderType,
						applyCcPersonList: applyCcPersonList,
						applyPersonFnumber: this.userInfo.applyPersonFnumber,
						applyPersonFname: this.userInfo.applyPersonFname
					};
					params.push(obj);
				});
				if (this.userInfo.freq == 1) {
					if (this.params.status == '2') {
						params.forEach(item => {
							item.id = this.params.id;
						});
						this.$api('approve.approvalOrderAgain', params).then(res => {
							if (res.flag) {
								this.isClick = true;
								uni.showToast({
									title: res.msg || '提交成功',
									mask: true,
									duration
								});
								setTimeout(() => {
									jump(-1);
								}, 1000);
							}
						});
					} else {
						this.$api('approve.applyOrder', params).then(res => {
							if (res.flag) {
								uni.showToast({
									title: res.msg || '提交成功',
									mask: true,
									duration
								});
								setTimeout(() => {
									jump(-1);
								}, 1000);
							}
						});
					}
				} else {
					uni.showToast({
						title: '无申请权限~',
						mask: true,
						duration
					});
				}
			}
		},
		// 审核
		success(options) {
			const duration = 1500,
				{ jump } = this;

			this.params.status = this.$refs['approve'].ideaList[this.$refs['approve'].ideaIndex].value;
			if (this.$refs['approve'].approverNumber != undefined) {
				this.params.nextYuFnumber = this.$refs['approve'].approverNumber.split(',').filter(function(s) {
					return s && s.trim();
				});
			}
			if (this.$refs['approve'].approver.length != undefined) {
				this.params.nextYuFname = this.$refs['approve'].approver.split(',').filter(function(s) {
					return s && s.trim();
				});
			}
			this.params.approvalComments = this.$refs['approve'].revirwReason;
			/* this.params.copyPeople = this.$refs['approve'].copyer; */
			if (this.userInfo.faudit == 1) {
				this.$api('approve.orderApproval', this.params).then(res => {
					if (res.flag) {
						this.isClick = true;
						uni.showToast({
							title: res.msg || '提交成功',
							mask: true,
							duration
						});
						setTimeout(() => {
							jump(-1);
						}, 2000);
					}
				});
			} else {
				uni.showToast({
					title: '无审核权限~',
					mask: true,
					duration
				});
			}
		},
		pay(options) {
			const duration = 1500,
				{ jump } = this;
			this.$api('approve.updateOrderApproval', {
				storyDescribe: this.transferReason,
				amount: this.transferMoney,
				id: this.params.id,
				parentId: this.params.parentId,
				flittingDate: this.transferDate,
				payAccount: this.payAccount,
				getAccount: this.repayAccount,
				remark: this.reason,
				photo: '',
				status: 3,
				approvalOpinion: this.$refs['approve'].ideaList[this.$refs['approve'].ideaIndex].name,
				nextApprovalPeople: this.$refs['approve'].approver
				/* ccPerson: this.$refs['approve'].copyer */
			}).then(res => {
				if (res.flag) {
					this.isClick = true;
					uni.showToast({
						title: res.msg || '提交成功',
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
			this.params.status = this.$refs['approve'].ideaList[this.$refs['approve'].ideaIndex].value;
			if (this.$refs['approve'].approverNumber != undefined) {
				this.params.nextYuFnumber = this.$refs['approve'].approverNumber.split(',').filter(function(s) {
					return s && s.trim();
				});
			}
			if (this.$refs['approve'].approver.length != undefined) {
				this.params.nextYuFname = this.$refs['approve'].approver.split(',').filter(function(s) {
					return s && s.trim();
				});
			}
			this.params.approvalComments = this.$refs['approve'].revirwReason;
			if (this.params.status == 1) {
				this.params.status = 3;
				this.$api('approve.orderApproval', this.params).then(res => {
					if (res.flag) {
						this.isClick = true;
						uni.showToast({
							title: res.msg || '提交成功',
							mask: true,
							duration
						});
						setTimeout(() => {
							jump(-1);
						}, 2000);
					}
				});
			} else {
				uni.showToast({
					icon: 'none',
					title: '审核意见请选择“同意”',
					duration
				});
			}
		},
		getJinDu() {
			this.$api('approve.jinDu', {
				parentId: this.isInvisible == 'false' ? this.params.id : this.params.parentId
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
			console.log();
			// 返回上一页
			if (path == -1) {
				this.$Router.back();
			} else {
				this.$Router.push({
					path: path,
					query: parmas
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
