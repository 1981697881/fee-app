<!-- 首页 -->
<template>
	<view class="">
		<u-notice-bar v-if="notices.length" :mode="'vertical'" :list="notices" :close-icon="false" :more-icon="true" @click="handleNotice" @getMore="handleNotice"></u-notice-bar>
		<view class="container">
			<view class="margin-box">
				<u-grid :col="3">
					<!--  -->
					<u-grid-item v-for="(item, index) in meau" :custom-style="{ padding: '30px 0', textAlign: 'center' }" @tap="jump(item.path)" :key="index">
						<!-- <uni-icons :type="item.icon"></uni-icons> -->
						<text class="lg text-gray" :class="'cuIcon-' + item.icon"></text>
						<view class="grid-text">{{ item.name }}</view>
					</u-grid-item>
				</u-grid>
			</view>
			<view class="margin-box">
				<u-tabs :list="tabList" :is-scroll="false" :current="current" @change="handleTab" :show-bar="false"></u-tabs>
				<view v-if="current == 0">
					<uni-card
						v-for="(item, index) in preview"
						:title="getOrderType(item.orderType)"
						:extra="item.applyPersonFname"
						:key="index"
						note="一定要有这个属性才可以用插槽..."
						@tap="clickCart({ isReview: true, order: item })"
					>
						<view class="flex">
							<view class="u-flex-1 text-cut">上一级审批人: {{ item.sapprovalPersons || '暂无' }}</view>
							<view class="">滞留: {{ item.currentStopTime || 0 }}/分钟</view>
						</view>
						<template v-slot:footer>
							<text>点击查看详情</text>
						</template>
					</uni-card>
				</view>
				<view v-else-if="current == 1">
					<uni-card
						v-for="(item, index) in inreview"
						@tap="clickInv({ isReview: true, isInvisible: false, order: item })"
						:title="getOrderType(item.orderType)"
						:extra="item.createDate"
						:key="index"
						note="一定要有这个属性才可以用插槽..."
					>
						<view class="flex">
							<view class="u-flex-1 text-cut">审批人: {{ item.nextApprovalFname || '暂无' }}</view>
							<view class="">滞留: {{ item.currentStopTime || 0 }}/分钟</view>
						</view>
						<template v-slot:footer>
							<view class="flex justify-between">
								<!-- <view v-if="item.status == '0'" class="primary text-align-right" @tap="handleSave(item)">提交</view> -->
								<view class="text-cyan text-align-right">{{ getStatus(item.status) }}</view>
							</view>
						</template>
					</uni-card>
				</view>
				<view v-else-if="current == 2">
					<uni-card
						v-for="(item, index) in review"
						@tap="clickCartT({ isReview: true, order: item })"
						:title="getOrderType(item.orderType)"
						:extra="item.createDate"
						:key="index"
						note="一定要有这个属性才可以用插槽..."
					>
						<view class="flex">
							<view class="u-flex-1 text-cut">待审批人: {{ item.nextApprovalFname || '暂无' }}</view>
							<view class="">滞留: {{ item.currentStopTime || 0 }}/分钟</view>
						</view>
						<template v-slot:footer>
							<view class="flex justify-between">
								<!-- <view v-if="item.status == '0'" class="primary text-align-right" @tap="handleSave(item)">提交</view> -->
								<view class="text-cyan text-align-right">{{ getStatus(item.status) }}</view>
								<view class="primary text-align-right" @tap="handleUrge">催审</view>
							</view>
						</template>
					</uni-card>
				</view>
				<view v-else>
					<uni-card
						v-for="(item, index) in csreview"
						@tap="clickInv({ isReview: true, isInvisible: false, order: item })"
						:title="getOrderType(item.orderType)"
						:extra="item.createDate"
						:key="index"
						note="一定要有这个属性才可以用插槽..."
					>
						<view class="flex">
							<view class="u-flex-1 text-cut">待审批人: {{ item.nextApprovalFname || '暂无' }}</view>
							<view class="">滞留: {{ item.currentStopTime || 0 }}/分钟</view>
						</view>
						<template v-slot:footer>
							<view class="flex justify-between">
								<!-- <view v-if="item.status == '0'" class="primary text-align-right" @tap="handleSave(item)">提交</view> -->
								<view class="text-cyan text-align-right">{{ getStatus(item.status) }}</view>
							</view>
						</template>
					</uni-card>
				</view>
			</view>
		</view>
		<!-- 登录提示 -->
		<app-login-modal></app-login-modal>
	</view>
</template>
<script>
import mock from '@/common/mock/index';
import { mapMutations, mapActions, mapState } from 'vuex';
export default {
	data() {
		return {
			// 消息通知
			notices: mock.notices,
			// 菜单
			meau: mock.meau,
			// 我的待审列表数据
			preview: [],
			// 我的申请列表数据
			review: [],
			// 我的已完成列表数据
			inreview: [],
			// 我的抄送列表数据
			csreview: [],
			tabList: [
				{
					name: '我的待审',
					count: 0,
					current: 0
				},
				{
					name: '已完成',
					count: 0,
					current: 1
				},
				{
					name: '我的申请',
					count: 0,
					current: 2
				},
				{
					name: '抄送',
					count: 0,
					current: 3
				}
			],
			current: 0
		};
	},
	// 下拉顶部刷新
	// 方法留着对接口的时候供参考
	onPullDownRefresh() {
		this.init();
	},
	// 监听页面加载，其参数为上个页面传递的数据
	onLoad(options) {},
	// 监听页面显示。页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面
	async onShow() {
		await this.getUserDetails();
		this.getApproveList();
		this.getApplyApprovalOrdersList();
		this.getApplyOrderList();
		this.getApprovalList();
	},
	created() {
		let that = this;
		this.$api('user.findUserAuthority', {
			openId: uni.getStorageSync('openid')
		}).then(res => {
			if (!res.flag) {
				uni.showToast({
					title: res.msg || '注册成功',
					icon: 'success',
					duration: 2000,
					mask: true,
					success: function() {
						setTimeout(function() {
							that.$Router.replace({
								path: '/pages/index/register',
								query: {}
							});
						}, 1000);
					}
				});
			}
		});
		// 接口哒哒哒哒哒.........
		// get 我的待审
		// get 我的申请
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo
		})
	},
	methods: {
		...mapActions(['getUserDetails']),
		getStatus(val) {
			let status = '';
			switch (val) {
				case '1':
					status = '已通过';
					break;
				case '2':
					status = '已驳回，需重新申请';
					break;
				default:
					status = '已提交';
			}
			return status;
		},
		clickCart(value) {
			switch (value.order.orderType) {
				case '0':
					this.jump('/pages/detail/cost', value);
					break;
				case '1':
					this.jump('/pages/detail/payment', value);
					break;
				case '2':
					this.jump('/pages/detail/budget', value);
					break;
				case '3':
					this.jump('/pages/detail/special', value);
					break;
				default:
					this.jump('/pages/detail/transfer', value);
			}
		},
		clickCartT(value) {
			if (value.order.status == '2') {
				value.isInvisible = true
			}else{
				value.isInvisible = false
			}
			switch (value.order.orderType) {
				case '0':
					this.jump('/pages/detail/cost', value);
					break;
				case '1':
					this.jump('/pages/detail/payment', value);
					break;
				case '2':
					this.jump('/pages/detail/budget', value);
					break;
				case '3':
					this.jump('/pages/detail/special', value);
					break;
				default:
					this.jump('/pages/detail/transfer', value);
			}
		},
		clickInv(value) {
			switch (value.order.orderType) {
				case '0':
					this.jump('/pages/detail/cost', value);
					break;
				case '1':
					this.jump('/pages/detail/payment', value);
					break;
				case '2':
					this.jump('/pages/detail/budget', value);
					break;
				case '3':
					this.jump('/pages/detail/special', value);
					break;
				default:
					this.jump('/pages/detail/transfer', value);
			}
		},
		getOrderType(val) {
			let orderType = '';
			switch (val) {
				case '0':
					orderType = '费用报销';
					break;
				case '1':
					orderType = '付款申请';
					break;
				case '2':
					orderType = '预算外费用申请';
					break;
				case '3':
					orderType = '特殊事项申请';
					break;
				default:
					orderType = '资金调拨申请';
			}
			return orderType;
		},
		getApproveList() {
			let that = this;
			that.$api('approve.applyOrderList', {
				applyPersonFnumber: this.userInfo.applyPersonFnumber,
				status: '0'
			}).then(res => {
				if (res.flag) {
					this.review = res.data;
					this.tabList[2].count = res.data.length;
				}
			});
		},
		getApplyApprovalOrdersList() {
			let that = this;
			that.$api('approve.applyApprovalOrders', {
				applyPersonFnumber: this.userInfo.applyPersonFnumber,
				status: '1'
			}).then(res => {
				if (res.flag) {
					this.inreview = res.data;
					this.tabList[1].count = res.data.length;
				}
			});
		},
		getApprovalList() {
			let that = this;
			that.$api('approve.approvalOrderList', {
				nextApprovalFnumber: this.userInfo.applyPersonFnumber
			}).then(res => {
				if (res.flag) {
					this.preview = res.data;
					this.tabList[0].count = res.data.length;
				}
			});
		},
		getApplyOrderList() {
			let that = this;
			that.$api('approve.applyCcPerson', {
				ccNumber: this.userInfo.applyPersonFnumber
			}).then(res => {
				if (res.flag) {
					this.csreview = res.data;
					this.tabList[3].count = res.data.length;
				}
			});
		},
		// 监听我的申请 - 操作 - 催审
		handleUrge() {
			uni.showToast({
				title: '催审成功',
				duration: 2000
			});
		},
		handleSave(item) {
			let params = { ...item };
			this.$api('approve.approvalOrder', {
				aStoryDescribe: params.storyDescribe,
				aAmount: params.amount,
				aid: params.id,
				aFlittingDate: params.flittingDate,
				aPayAccount: params.payAccount,
				aGetAccount: params.getAccount,
				aRemark: params.remark,
				aPhoto: params.photo,
				status: params.status,
				nextApprovalPeople: params.nextApprovalPeople
			}).then(res => {
				if (res.flag) {
					uni.showToast({
						title: res.msg,
						duration: 2000
					});
					this.getApproveList();
				}
			});
		},
		// 点击通知栏（包括通知栏箭头）
		handleNotice() {},
		// 点击tab切换页
		handleTab(index) {
			this.current = index;
			if (this.current == 0) {
				this.getApprovalList();
			} else if (this.current == 1) {
				this.getApplyApprovalOrdersList();
			} else if (this.current == 2) {
				this.getApproveList();
			} else {
				this.getApplyOrderList();
			}
		},
		// 手动滑动tab页
		// TODO 停用 - swiper自适应高度的问题没有解决
		// testChange({ detail: { current } }) {
		// 	this.current = current;
		// }
		// 路由跳转
		jump(path, params) {
			let obj = { ...params };
			if(params){
				if(params.order.applyCcPersonList){
					params.order.applyCcPersonList = JSON.stringify(params.order.applyCcPersonList)
				}
			}
			for (let i in obj.order) {
				if (obj.order[i] == null) {
					obj.order[i] = '';
				}
			}
			this.$Router.push({
				path: path,
				query: obj
			});
		},
		// 初始化
		init() {
			// 停止当前页面下拉刷新。
			uni.stopPullDownRefresh();
		}
	}
};
</script>

<style lang="scss">
.margin-box {
	margin: 10px 0;
}
</style>
