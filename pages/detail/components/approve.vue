<template>
	<view class="">
		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left text-bold ">当前待审批</view></view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left">审批意见</view>
				<view class="a-cell-title-right to-right">
					<picker @change="handleIdeaPicker" :value="ideaIndex" :range="ideaList" range-key="name">
						<view class="uni-input">{{ ideaList[ideaIndex].name }}</view>
					</picker>
				</view>
			</view>
			<view class="a-cell-bd"><textarea :value="revirwReason" placeholder="选择性填写意见" /></view>
		</view>

		<!-- 跳转新页面选择人员信息回调选中，多选 -->
		<!-- 跳转给个新页面，类似选择联系人，多选后确认回调回来，展示头像出来（具体参考企业微信的审批流程） -->
		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left ">下一级审批人</view>
				<view class="a-cell-title-right to-right" @tap="jump('/pages/contact/index', {list:contactList,type:'approver'})">{{ approver || '点击选择' }}</view>
			</view>
		</view>
		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left ">抄送人</view>
				<view class="a-cell-title-right to-right" @tap="jump('/pages/contact/index', {list:conperList,type:'copyer'})">{{ copyer || '点击选择' }}</view>
			</view>
		</view>

		<!-- 采用流式布局展示，从上往下的流 -->
		<!-- <text>审批流程：1-发起申请\n2-张三同意\n3李四同意</text> -->
		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left ">审批流程</view></view>
			<view class="a-cell-bd">
				<view class="example-body"><uni-steps :options="stepList" active-color="#007AFF" :active="stepActive" direction="column" /></view>
				<!-- <view class="word-btn" hover-class="word-btn--hover" :hover-start-time="20" :hover-stay-time="70" @click="handleStep">
					<button class="word-btn-white">改变状态</button>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script>
import mock from '@/common/mock/contact';
import tools from '@/common/utils/tools';
export default {
	props: {
		jdData: {
			type: Array,
			default: []
		}
	},
	data() {
		return {
			// 审批人
			approver: '',
			// 抄送
			copyer: '',
			// 瀑布式流程的当前进度
			stepActive: 1,
			// 瀑布式流程的数据
			stepList: [],
			// 审批意见下拉框
			ideaIndex: 0,
			// 审批意见下拉框数据
			ideaList: [
				{
					name: '同意'
				},
				{
					name: '不同意打回'
				},
				{
					name: '不同意终止'
				},
				{
					name: '同意并终止'
				},
				{
					name: '支付完成'
				}
			],
			// 人员列表名单数据
			contactList: [],
			conperList: [],
			// 审批意见
			revirwReason: '',
		};
	},
	created() {
		// 接口请求等一系列操作....
		const { contactList, steps } = mock;
		this.contactList = contactList;
		this.conperList = contactList;
		this.stepList = this.jdData;
		console.log(this.stepList)
		// 根据选中人员数据去拼接人名
		// this.getApprover();
	},
	methods: {
		// 流程改变
		handleStep() {
			if (this.stepActive < this.stepList.length - 1) {
				this.stepActive += 1;
			} else {
				this.stepActive = 0;
			}
		},
		handleIdeaPicker: function(e) {
			console.log('picker发送选择改变，携带值为：' + e.detail.value);
			this.ideaIndex = e.detail.value;
		},
		getApprover: function() {
			// 清空展示名字的字段
			this.approver = '';
			// 获取选中的审批人
			for (let i in this.contactList) {
				const { checked, name } = this.contactList[i];
				if (checked) {
					// 拼接审批人/抄送人的名字
					this.approver += `${name}, `;
				}
			}
		},
		getCopyer: function() {
			// 清空展示名字的字段
			this.copyer = '';
			// 获取选中的抄送人
			for (let i in this.conperList) {
				const { checked, name } = this.conperList[i];
				if (checked) {
					// 拼接审批人/抄送人的名字
					this.copyer += `${name}, `;
				}
			}
		},
		jump(path, parmas) {
			console.log('跳到选人员')
			// 返回上一页
			if (path == -1) {
				uni.navigateBack({ delta: 1 });
			} else {
				this.$Router.push({
					path,
					query: {
						// query传Object/Array，不进行JSON化就会变成另外一个鬼东西
						list: JSON.stringify(parmas.list),
						type: parmas.type
					}
				})
				// 不用了，不能传参数，垃圾，用vue的0v0
				// uni.navigateTo({
				// 	url: path,
				// 	parmas: this.contactList // 用不了
				// });
			}
		}
	}
};
</script>

<style lang="scss">
</style>
