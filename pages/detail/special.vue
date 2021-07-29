<template>
	<view class="">
		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left" :class="{ required: !isReview }">申请事项</view>
				<view class="a-cell-title-right to-right">
					<input type="text" v-model="subMatter" />
				</view>
			</view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title"><view class="a-cell-title-left">情况说明</view></view>
			<view class="a-cell-bd"><textarea :disabled="isReview" v-model="desc"  /></view>
		</view>

		<view class="a-cell-box">
			<view class="a-cell-title">
				<view class="a-cell-title-left">发生日期</view>
				<view class="a-cell-title-right">
					<picker :disabled="isReview" mode="date" :value="happenDate" :start="startDate" :end="endDate" @change="handleDate">
						<view class="uni-input">{{ happenDate }}</view>
					</picker>
				</view>
			</view>
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
			// 申请事项
			subMatter: '',
			// 附件，目前只能上传图片，还不知道为什么上传后没file
			imageValue: [
				{
					// 三个属性必填，否则影响组件显示
					name: 'file.txt',
					extname: 'txt',
					url: 'https://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/gh_33446d7f7a26_430.jpg'
				}
			],
			// 申请事由
			desc: '',
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
	created() {},
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
				if (!this.subMatter) {
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
