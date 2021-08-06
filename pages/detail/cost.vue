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
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">费用类型</view>
				<view class="a-cell-title-right">
					<picker :disabled="isReview" @change="handleTypePicker" :value="typeIndex" :range="typeList" range-key="name">
						<view class="uni-input">{{ typeList[typeIndex].name }}</view>
					</picker>
				</view>
			</view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left" :class="{ required: !isReview }">申请事由</view></view>
			<view class="a-cell-bd"><textarea :disabled="isReview" v-model.trim="reason" /></view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">发生日期</view>
				<view class="a-cell-title-right">
					<picker :disabled="isReview" mode="date" :value="happenDate" :start="startDate" :end="endDate" @change="handleDate">
						<view class="uni-input">{{ happenDate }}</view>
					</picker>
				</view>
			</view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">费用金额</view>
				<view class="a-cell-title-right">
					<input :disabled="isReview" type="number" :placeholder="!isReview ? '输入数字自动转换大写小数2位' : ''" v-model="money" @input="handleMoney" />
				</view>
			</view>
			<view class="a-cell-bd placeholder">{{ currency || '' }}</view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left ">附件</view></view>
			<view class="a-cell-bd">
				<!-- 参考https://ext.dcloud.net.cn/plugin?id=4079 -->
				<uni-file-picker v-model="imageValue" :limit="3" :readonly="isReview ? true : false" file-mediatype="image" mode="grid" file-extname="png,jpg" />
			</view>
		</view>
		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left">备注说明</view></view>
			<view class="a-cell-bd"><textarea :disabled="isReview" v-model.trim="remark" /></view>
		</view>
		<!-- <view class="flex" v-if="!isReview">
			<button class="u-flex-1" type="default" @tap="jump(-1)">取消</button>
			<button class="u-flex-1" type="primary" @tap="save">保存</button>
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
		<!-- <view class="a-cell-box" v-if="isReview">
			<view class="a-cell-title">
				<view class="a-cell-title-left">抄送人</view>
				<view class="a-cell-title-right"><input type="text" :disabled="isReview" v-model="makeACopy" /></view>
			</view>
		</view> -->
		<template>
			<approve  ref="approve" :isShne="isShne" :isReview="isReview" :jdData="jinDuList"></approve>
		</template>
		<view class="flex" v-if="isInvisible != 'false'">
			<button class="u-flex-1" type="default" @tap="jump(-1)">取消</button>
			<button class="u-flex-1" type="primary" :disabled="isClick" v-if="!isReview" @tap="save">保存</button>
			<button class="u-flex-1" type="primary" :disabled="isClick" v-if="isReview" @tap="success">审核</button>
			<!-- <button class="u-flex-1" type="primary" v-if="isReview && userInfo.fpay == 1 == 1" @tap="pay">付款</button> -->
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
			orderType: 0,

			// 附件，目前只能上传图片，还不知道为什么上传后没file
			imageValue: [],
			// 金额的中文大写
			currency: null,
			// 费用类型
			typeIndex: 0,
			// 费用类型数据
			typeList: [
				{
					name: '车费报销'
				},
				{
					name: '伙食报销'
				},
				{
					name: '住宿的费用'
				}
			],
			userIndex: 0,
			userList: [],
			// 费用金额
			money: null,
			// 申请事由
			reason: '',
			makeACopy: '',
			remark: '',
			applyPersonFname: '',
			nextApprovalFname: '',
			// 发生日期 - 默认当天
			happenDate: currentDate,
			// 判断进来是从填写入口进还是查看详情进来
			isReview: false,
			isShne: false,
			isClick: false,
			isInvisible: true
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo
		}),
		startDate() {
			return this.getDate('start');
		},
		endDate() {
			return this.getDate('end');
		}
	},
	onShow: function() {
		console.log('显示审批模块');
		// 拿出路由
		const { query } = this.$Route;
		this.params = { ...query };
		console.log(query);
		// 判断入口是从 主页的默认入口进入还是 我的待审 - 点击进去详情审批
		this.isReview = query.isReview;
		this.isShne = query.isShne;
		this.isInvisible = query.isInvisible;
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
			this.currency = tools.convertCurrency(query.cost);
			this.reason = query.applySituation;
			this.$refs['approve'].revirwReason = query.approvalComments;
			this.applyPersonFname = query.applyPersonFname;
			this.nextApprovalFname = query.nextApprovalFname;
			this.money = query.cost;
			this.happenDate = query.happenDate;
			this.remark = query.remark;
			this.typeList.forEach((item, index) => {
				if (query.fnumber == item.fnumber) {
					this.typeIndex = index;
				}
			});
			this.userList.forEach((item, index) => {
				if (markc[0].ccNumber == item.fnumber) {
					this.userIndex = index;
				}
			});
			/* if (query.status == '2') {
				this.isReview = false;
			} */
		}
		this.getUserList();
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
	created() {},
	methods: {
		selectChange(val) {
			this.userIndex = val.detail.value;
		},
		getUserList() {
			this.$api('user.approvalPerson', {}).then(res => {
				if (res.flag) {
					this.userList = res.data;
				}
			});
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
		save() {
			const duration = 1500,
				{ jump, success, isReview } = this;
			// 先判断是填写审批单/审批单据

			// 填写提交审批单
			// 页面设计的必填项中，下拉框与日期选择的选项默认有值的
			// 清空不了，可以少判断这2个必填（typeIndex，happenDate）
			// 检查必填项
			// 提交接口，成功.....
			// 金额0也可以被视为有值
			if (!this.reason || !this.money > 0 ) {
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
				/* copyerNumber.forEach((item, index) => {
					let obj = {
						ccName: copyer[index],
						ccNumber: item
					};
					applyCcPersonList.push(obj);
				}); */
				approverNumber.forEach((item, index) => {
					let obj = {
						applySituation: this.reason,
						cost: this.money,
						remark: this.remark,
						happenDate: this.happenDate,
						fnumber: this.typeList[this.typeIndex].fnumber,
						enclosure: '',
						stringMaps: JSON.stringify(this.imageValue),
						applyCcPersonList: applyCcPersonList,
						nextApprovalFnumber: item,
						nextApprovalFname: approver[index],
						orderType: this.orderType,
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
		// 成功后的提示框以及跳转
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
		handleUserPicker(e) {
			this.userIndex = e.detail.value;
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
