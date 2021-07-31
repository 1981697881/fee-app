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
				<uni-file-picker v-model="imageValue" :limit="3" :readonly="isReview ? true : false" file-mediatype="image" mode="grid" file-extname="png,jpg" />
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
					<ld-select
						:multiple="true"
						:list="userList"
						label-key="fname"
						value-key="fnumber"
						placeholder="请选择"
						clearable
						v-model="userIndex"
						@change="selectChange"
					></ld-select>
				</view>
			</view>
		</view>
		<template v-if="isReview">
			<approve ref="approve" :jdData="jinDuList"></approve>
		</template>
		<view class="flex">
			<button class="u-flex-1" type="default" @tap="jump(-1)">取消</button>
			<button class="u-flex-1" type="primary" @tap="save">保存</button>
			<button class="u-flex-1" type="primary" v-if="isReview && this.userInfo.fpay" @tap="pay">付款</button>
			<button class="u-flex-1" type="primary" v-if="isReview && this.userInfo.fend" @tap="comif">完成</button>
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
		approve,ldSelect
	},
	data() {
		const currentDate = this.getDate({
			format: true
		});
		return {
			orderType: 3,
			
			// 附件，目前只能上传图片，还不知道为什么上传后没file
			imageValue: [
				
			],
			userIndex: [],
			userList: [
				
			],
			// 申请事项
			subMatter: '',
			// 申请事由
			desc: '',
			// 发生日期 - 默认当天
			happenDate: currentDate,
			// 判断进来是从填写入口进还是查看详情进来
			isReview: false
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
		console.log('显示审批模块')
		// 拿出路由
		const { query } = this.$Route;
		this.params = { ...query };
		// 判断入口是从 主页的默认入口进入还是 我的待审 - 点击进去详情审批
		this.isReview = query.isReview;
		if(this.isReview){
			this.getJinDu();
		}
		this.getUserList();
		if (this.isReview) {
			this.imageValue = JSON.parse(query.stringMaps)
			this.imageValue.forEach((item)=>{
				item.url = decodeURIComponent(item.url)
			})
			console.log(this.imageValue)
			this.subMatter = query.applySituation;
			this.happenDate = query.happenDate;
			this.desc = query.remark;
			if(query.status == '2'){
				this.isReview = false
			}
		}
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
		selectChange(val) {
			this.userIndex = val;
		},
		getUserList(){
			this.$api('user.approvalPerson', {
			}).then(res => {
				if (res.flag) {
					this.userList = res.data;
				}
			});
		},
		getJinDu() {
			this.$api('approve.jinDu', {
				parentId: this.params.parentId
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
			if (isReview) {
				// 审批单据接口......
				success({
					msg: '审核成功'
				});
			} else {
				if (!this.subMatter|| !this.userIndex.length > 0) {
					uni.showToast({
						title: '请填写必填项',
						mask: true,
						icon: 'none',
						duration
					});
				} else {
					let params = []
					/* this.imageValue.forEach((item)=>{
						item.url = encodeURIComponent(item.url)
					}) */
					this.userIndex.forEach((item)=>{
						this.userList.forEach((user)=>{
							if(user.fnumber == item){
								let obj = {
									applySituation: this.subMatter,
									happenDate: this.happenDate,
									remark: this.desc,
									enclosure: '',
									stringMaps: JSON.stringify(this.imageValue),
									nextApprovalFnumber: item,
									nextApprovalFname: user.fname,
									orderType: this.orderType,
									applyPersonFnumber: this.userInfo.applyPersonFnumber,
									applyPersonFname: this.userInfo.applyPersonFname
								}
								params.push(obj)
							}
						})
					})
					if(this.userInfo.freq==1){
						if(this.params.status == '2'){
							params.forEach((item)=>{
								item.id = this.params.id
							})
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
						}else{
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
					}else{
						uni.showToast({
							title: '无申请权限~',
							mask: true,
							duration
						});
					}
				}
			}
		},
		// 成功后的提示框以及跳转
		success(options) {
			const duration = 1500,
				{ jump } = this;
				this.params.status=this.$refs['approve'].ideaList[this.$refs['approve'].ideaIndex].value
				if(this.$refs['approve'].approverNumber!=undefined){
					this.params.nextYuFnumber=this.$refs['approve'].approverNumber.split(',').filter(function(s) {
						return s && s.trim();
					})
				}
				if(this.$refs['approve'].approver.length!=undefined){
					this.params.nextYuFname=this.$refs['approve'].approver.split(',').filter(function(s) {
						return s && s.trim();
					})
				}
				this.params.copyPeople = this.$refs['approve'].copyer
				if(this.userInfo.faudit==1){
					this.$api('approve.orderApproval',this.params).then(res => {
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
				}else{
					uni.showToast({
						title: '无审核权限~',
						mask: true,
						duration
					});
				}
		},
		handleUserPicker(e) {
			this.userIndex =  e.detail.value;
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
uni-button, button {
	border-radius: 0;
	margin: 20rpx 20rpx;
}
</style>
