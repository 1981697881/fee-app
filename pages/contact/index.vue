<template>
	<view class="">
		<!-- 补搜索 -->
		<view class="a-cell-box" style="margin-bottom: 100rpx;">
			<checkbox-group ref="checkbox" @change="checkboxChange">
				<label class="a-cell-title" v-for="item in items" :key="item.value">
					<view class="a-cell-title-left"><checkbox :value="item.value" :checked="item.checked" style="transform:scale(0.7)" /></view>
					<view class="a-cell-title-right">{{ item.name }}</view>
				</label>
			</checkbox-group>
		</view>

		<view class="a-basket">
			<view class="a-cell-box">
				<view class="a-cell-title">
					<view class="a-cell-title-left text-bold">已选中人员：{{ count }}</view>
					<view class="a-cell-title-right to-right"><button type="primary" @tap="handleEmit">确认</button></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import mock from '@/common/mock/contact';
export default {
	data() {
		return {
			items: [],
			// 如果选择完不点击确定返回到上一个页面的话会修改掉
			// 上一个页面的vm.data，解决一下原型链的bug
			localItems: null,
			count: 0
		};
	},
	onReady: function(option) {
		let pages = getCurrentPages();
		console.log(this.$Route.query)
		// 如果直接当前页面触发了页面刷新则回到首页
		// 真实场景在小程序不存在
		if (pages.length <= 1) {
			uni.navigateTo({
				// url: '/pages/index/index',
				// 开发测试便利用的
				url: '/pages/index/cost'
			});
		} else {
			console.log('加载人员列表');
			// 接受页面传过来在data.list，由于传过来在是JSON后的data，所以需要在这里转换回来
			this.items =JSON.parse(this.$Route.query.list)
			for (let i = 0; i<this.items.length;i++) {
			// console.log(this.items[i].name)
				if (this.items[i].checked) {
					this.count += 1;
				}
			}
		}
		
	},
	created() {
		// 接口请求等一系列操作....
		// this.items = mock.contactList;
		// console.log(uni)
	},
	methods: {
		handleEmit: function() {
			// 触发上个页面的on(handleCheckbox)
			uni.$emit('handleCheckbox', {item: this.items, type: this.$Route.query.type});
			uni.navigateBack({ delta: 1 });
		},
		checkboxChange: function(e) {
			// 深拷贝
			var items = this.items,
				values = e.detail.value;
			// 选中的值是自动添加进数组的，checked要后面自己判断修改的
			let count = 0;
			for (var i = 0, lenI = items.length; i < lenI; ++i) {
				const item = items[i];
				if (values.indexOf(item.value) != -1) {
					count++;
					this.$set(item, 'checked', true);
				} else {
					this.$set(item, 'checked', false);
				}
			}
			this.count = count;
		}
	}
};
</script>

<style lang="scss">
.a-cell-box {
	margin-bottom: 0;
	background-color: #ffffff;
	position: relative;
	width: 100%;
	display: flex;
	flex-direction: column;
	padding: 20rpx 30rpx;

	// 下边框 -- 参考uni-app项目演示
	&:after {
		position: absolute;
		z-index: 10;
		right: 0;
		bottom: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(0.5);
		transform: scaleY(0.5);
		background-color: #c8c7cc;
	}

	// 上边框
	&::before {
		position: absolute;
		z-index: 10;
		right: 0;
		top: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(0.5);
		transform: scaleY(0.5);
		background-color: #c8c7cc;
	}
}

.a-cell {
	&-title {
		&:last-child {
			border: none;
		}
		display: flex;
		padding: 20rpx 0;
		border-bottom: 2rpx #f0eff3 solid;

		&-left {
			margin-right: 30rpx;
		}
		&-right {
			display: flex;
			align-items: center;
			&.to-right {
				text-align: right;
				position: absolute;
				right: 20rpx;
			}
		}
	}
}

.a-basket {
	position: fixed;
	width: 100%;
	display: flex;
	justify-content: center;
	bottom: 0;
}
uni-button {
	font-size: inherit;
	border-radius: 0;
	line-height: 50rpx;
	margin: 0rpx;
}
</style>
