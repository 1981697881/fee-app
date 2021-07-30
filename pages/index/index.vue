<!-- 首页 -->
<template>
	<view class="">
		<u-notice-bar v-if="notices.length" :mode="'vertical'" :list="notices" :close-icon="false" :more-icon="true" @click="handleNotice" @getMore="handleNotice"></u-notice-bar>
		<view class="container">
			<view class="margin-box">
				<u-grid :col="3">
					<u-grid-item v-for="(item, index) in meau" :custom-style="{ padding: '30px 0', textAlign: 'center' }" @tap="jump(item.path)" :key="index">
						<uni-icons :type="item.icon"></uni-icons>
						<view class="grid-text">{{ item.name }}</view>
					</u-grid-item>
				</u-grid>
			</view>
			<view class="margin-box">
				<u-tabs :list="tabList" :is-scroll="false" :current="current" @change="handleTab" :show-bar="false"></u-tabs>
				<view v-if="current == 0">
					<uni-card v-for="(item, index) in preview" :title="item.orderType" :extra="item.applyName" :key="index" note="一定要有这个属性才可以用插槽..." @tap="jump('/pages/detail/transfer', {isReview:true,order: item})">
						<view class="flex">
							<view class="u-flex-1">上一级审批人: {{ item.preApprover || '暂无' }}</view>
							<view class="">滞留: {{ item.currentStopTime || 0 }}/分钟</view>
						</view>
						<template v-slot:footer>
							<text>点击查看详情</text>
						</template>
					</uni-card>
				</view>
				<view v-else>
					<uni-card v-for="(item, index) in review" :title="item.orderType" :extra="item.flittingDate" :key="index" note="一定要有这个属性才可以用插槽..." >
						<view class="flex">
							<view class="u-flex-1">待审批人: {{ item.nextApprovalPeople || '暂无'}}</view>
							<view class="">滞留: {{ item.currentStopTime || 0}}/分钟</view>
						</view>
						<template v-slot:footer>
							<view class="flex justify-between">
								<!-- <view v-if="item.status == '0'" class="primary text-align-right" @tap="handleSave(item)">提交</view> -->
								<view  class="text-cyan text-align-right">{{item.status == '1'?'已通过':'已提交'}} </view>
								<view class="primary text-align-right" @tap="handleUrge">催审</view>
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
			tabList: [
				{
					name: '我的待审',
					count: 0
				},
				{
					name: '我的申请',
					count: 0
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
	onShow() {
		this.getApproveList();
		this.getApprovalList();
		this.getUserDetails();
	},
	created() {
		let that = this
		this.$api('user.findUserAuthority',{
			openId: uni.getStorageSync('openid'),
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
								query: {
								}
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
		getApproveList(){
			let that = this;
			that.$api('approve.applyOrderList',{
				applyName: this.userInfo.levels,
			}).then(res => {
				if (res.flag) {
					this.review = res.data;
					this.tabList[1].count = res.data.length;
				}
			});
		},
		getApprovalList(){
			let that = this;
			that.$api('approve.approvalOrderList',{
				nextApprovalPeople: this.userInfo.levels,
			}).then(res => {
				if (res.flag) {
					this.preview = res.data;
					this.tabList[0].count = res.data.length;
				}
			});
		},
		// 监听我的申请 - 操作 - 催审
		handleUrge(){
			uni.showToast({
				title: '催审成功',
				duration: 2000
			});
		},
		handleSave(item){
			let params = {...item}
			this.$api('approve.approvalOrder',{
				aStoryDescribe: params.storyDescribe,
				aAmount: params.amount,
				aid: params.id,
				aFlittingDate: params.flittingDate,
				aPayAccount: params.payAccount,
				aGetAccount: params.getAccount,
				aRemark: params.remark,
				aPhoto: params.photo,
				status: params.status,
				nextApprovalPeople: params.nextApprovalPeople,
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
			console.log(this.current)
			if(this.current == 0){
				this.getApprovalList();
			}else{
				this.getApproveList();
			}
		},
		// 手动滑动tab页
		// TODO 停用 - swiper自适应高度的问题没有解决
		// testChange({ detail: { current } }) {
		// 	this.current = current;
		// }
		// 路由跳转
		jump(path, parmas) {
			this.$Router.replace({
				path: path,
				query: parmas
			});
		},
		// 初始化
		init() {
			// 停止当前页面下拉刷新。
			uni.stopPullDownRefresh();
		},
	}
};
</script>

<style lang="scss">
.margin-box {
	margin: 10px 0;
}
</style>
