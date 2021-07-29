<template>
	<view class="container">
		<!-- 背景图 -->
		<view class="x-c"><image class="logo-bg" src="https://cfzx.gzfzdev.com/movie/uploadFiles/image/logo_bg.png" mode=""></image></view>
		<!-- titleview -->
		<view class="head-box"><cu-custom :isBack="true"></cu-custom></view>
		<view class="wrapper">
			<!-- logo -->
			<!-- 表单 -->
			<view class="login-box y-f">
				<view class="input-item x-c">
					<text class="inp-title">编&emsp;码</text>
					<input class="inp" v-model="number" type="number" placeholder="请输入编码" placeholder-class="pl" />
				</view>
				<view class="input-item x-c">
					<text class="inp-title">密&emsp;码</text>
					<input class="inp" password v-model="password" type="text" placeholder="请输入6-14位密码" placeholder-class="pl" />
				</view>
			</view>
			<!-- 登录按钮 -->
			<view class="x-c y-f"><button class="cu-btn login-btn" @tap="register">立即注册</button></view>
		</view>
	</view>
</template>
<script>
import { mapMutations, mapActions, mapState } from 'vuex';

export default {
	data() {
		return {
			number: '',
			password: '',
			sysInfo: uni.getStorageSync('sysInfo')
		};
	},
	computed: {
		...mapState({
			userInfo: state => state.user.userInfo
		})
	},
	onLoad() {},
	methods: {
		...mapActions(['setTokenAndBack']),
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		},
		getUserProfile(){
			return new Promise((resolve, reject) => {
			        uni.getUserProfile({
			        	desc: 'Wexin', // 这个参数是必须的
			        	success: res => {
			        		 resolve(res);
			        	}
			        });
			 })
		},
		// 小程序，获取用户信息登录
		async getuserinfo(e) {
			let that = this
			var wechat = new Wechat();
			let res = await that.getUserProfile()
			let token = await wechat.wxMiniProgramLogin(res);
			that.$store.commit('FORCE_OAUTH', false);
			that.$store.commit('LOGIN_TIP', false);
			uni.setStorageSync('fromLogin', that.$Route);
			that.setTokenAndBack(token);
		},
		register() {
			let that = this;
			if (this.userInfo) {
				this.$api('user.setUserAuthority', {
					number: this.number,
					password: this.password
				}).then(res => {
					if (res.code === 1) {
						uni.showToast({
							title: res.msg || '注册成功,请前往登录',
							icon: 'success',
							duration: 1000,
							mask: true,
							success: function() {
								that.setTokenAndBack(res.data.userinfo.token);
							}
						});
					}
				});
			} else {
				this.getuserinfo();
			}
		},

		
	}
};
</script>

<style lang="scss">
.container {
	position: relative;
	width: 100vw;
	height: 100vh;
	// overflow: hidden;
	// titleview
	.head-box {
		.cuIcon-back {
			font-size: 50rpx !important;
			font-weight: 500;
		}
	}

	// logo
	.logo {
		width: 410rpx;
		height: 120rpx;
	}

	.logo-bg {
		width: 640rpx;
		height: 300rpx;
	}
}

.wrapper {
	position: absolute;
	z-index: 90;
	padding-bottom: 40upx;
	padding-top: 115px;
	width: 100vw;
	height: 100vh;
	top: 0;

	// 输入
	.login-box {
		margin-top: 10rpx;

		.input-item {
			height: 108rpx;
			border-bottom: 1rpx solid rgba(#d0b17b, 0.3);
			width: 608rpx;

			.inp-title {
				font-size: 30rpx;
				color: #845708;
				padding-right: 30rpx;
			}

			.inp {
				flex: 1;
				height: 100%;
				font-size: 28rpx;
			}

			

			.code-btn {
				background: none;
				font-size: 28rpx;
				color: #845708;
				border-left: 1rpx solid #d0b17b;
				border-radius: 0;
				height: 42rpx;
				width: 190rpx;
				padding: 0;
			}
		}
	}

	// 登录
	.login-btn {
		width: 630upx;
		height: 80upx;
		border-radius: 40rpx;
		margin-top: 70upx;
		background: linear-gradient(90deg, #b941fb, #5849fc);
		box-shadow: 0px 7rpx 6rpx 0px rgba(229, 138, 0, 0.22);
		color: #fff;
	}

	.tip-box {
		width: 630rpx;
		line-height: 108rpx;
		font-size: 24rpx;
		font-weight: 400;
		color: rgba(200, 150, 61, 1);

		.tcp-radio {
			transform: scale(0.5);
		}

		.tcp {
			text-decoration: underline;
		}
	}
}
</style>
