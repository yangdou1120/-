<template>
  <view class="order-page">
    <!-- 顶部导航 -->
    <view class="navbar">
      <view class="nav-back" @click="goBack">
        <uni-icons type="left" size="22" color="#333" />
      </view>
      <text class="nav-title">订单确认</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 配送方式 Tab（卡片嵌合型） -->
    <view class="delivery-tabs">
      <view
        class="tab-item tab-left"
        :class="{ active: deliveryType === 0 }"
        @click="switchDelivery(0)"
      >
        到店自提
      </view>
      <view
        class="tab-item tab-right"
        :class="{ active: deliveryType === 1 }"
        @click="switchDelivery(1)"
      >
        送货到家
      </view>
    </view>

    <scroll-view class="order-body" scroll-y :scroll-top="0">
      <!-- ===== 到店自提 ===== -->
      <template v-if="deliveryType === 0">
        <view class="card address-card first-card" @click="selectShop">
          <view class="addr-row">
            <text class="addr-tag pickup-tag">店</text>
            <text class="addr-main">琼西路店</text>
            <uni-icons type="right" size="16" color="#ccc" />
          </view>
          <view class="addr-sub">琼西路九巷一号毛豆工坊</view>
        </view>

        <view class="card">
          <view class="form-row" @click="selectPicker">
            <text class="form-label">提货人</text>
            <view class="form-right">
              <text class="form-value">{{ pickerName }} {{ pickerPhone }}</text>
              <uni-icons type="right" size="14" color="#ccc" />
            </view>
          </view>
          <picker mode="time" :value="pickTime" start="08:00" end="21:00" @change="onTimeChange">
            <view class="form-row">
              <text class="form-label">自提时间</text>
              <view class="form-right">
                <text class="form-value" :class="{ placeholder: !pickTime }">
                  {{ pickTime || '请选择自提时间' }}
                </text>
                <uni-icons type="right" size="14" color="#ccc" />
              </view>
            </view>
          </picker>
        </view>
      </template>

      <!-- ===== 送货到家 ===== -->
      <template v-else>
        <view class="card address-card first-card" @click="selectAddress">
          <view class="addr-row">
            <text class="addr-tag home-tag">家</text>
            <view class="addr-detail">
              <text class="addr-main">{{ userAddress }}</text>
              <text class="addr-contact">{{ pickerName }} {{ pickerPhone }}</text>
            </view>
            <uni-icons type="right" size="16" color="#ccc" />
          </view>
        </view>

        <view class="map-tip-bar" @click="openMap">
          <text class="map-tip-text">为提高配送准确性，请进行地图定位选点 ›</text>
        </view>

        <view class="card">
          <view class="form-row">
            <view class="form-label" style="display:flex;align-items:center;gap:8rpx;">
              <uni-icons type="car" size="18" color="#333" />
              <text>同城配送</text>
            </view>
            <view class="form-right">
              <text class="form-value delivery-fee">运费 ¥{{ deliveryFee }}.00</text>
            </view>
          </view>
          <picker mode="time" :value="deliverTime" start="08:00" end="21:00" @change="onDeliverTimeChange">
            <view class="form-row">
              <text class="form-label">送达时间</text>
              <view class="form-right">
                <text class="form-value" :class="{ placeholder: !deliverTime }">
                  {{ deliverTime ? '预计 ' + deliverTime + ' 送达' : '请选择期望送达时间' }}
                </text>
                <uni-icons type="right" size="14" color="#2db550" />
              </view>
            </view>
          </picker>
        </view>
      </template>

      <!-- 商品列表 -->
      <view class="card goods-card">
        <view v-for="item in selectedItems" :key="item.id" class="goods-item">
          <image class="goods-img" :src="item.pic" mode="aspectFill"></image>
          <view class="goods-body">
            <text class="goods-name">{{ item.name }}</text>
            <text class="goods-desc">{{ item.desc }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ item.price.toFixed(2) }}</text>
              <view class="goods-num">
                <text class="num-btn" @click="changeNum(item.id, item.num - 1)">－</text>
                <text class="num-val">{{ item.num }}</text>
                <text class="num-btn" @click="changeNum(item.id, item.num + 1)">＋</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 金额汇总 -->
      <view class="card price-card">
        <view class="price-row">
          <view class="price-label-group">
            <text class="price-label">商品总价</text>
            <text class="price-extra">共{{ goodsTotalNum }}件商品</text>
          </view>
          <text class="price-amount">¥{{ totalPrice }}</text>
        </view>
        <view class="price-row" v-if="deliveryType === 1">
          <text class="price-label">配送费</text>
          <text class="price-amount">¥{{ deliveryFee }}.00</text>
        </view>
        <view class="price-row">
          <text class="price-label">优惠券</text>
          <view class="coupon-right" @click="selectCoupon">
            <text class="coupon-none">暂无可用</text>
            <uni-icons type="right" size="14" color="#ccc" />
          </view>
        </view>
        <view class="price-row total-row">
          <text class="price-label total-label">合计：</text>
          <text class="total-amount">¥{{ finalPrice }}</text>
        </view>
      </view>

      <!-- 订单备注 -->
      <view class="card remark-card">
        <text class="form-label">订单备注</text>
        <input
          class="remark-input"
          v-model="orderRemark"
          placeholder="备注建议提前协商（250字以内）"
          maxlength="250"
        />
      </view>

      <!-- 占位，防止被底部栏遮挡 -->
      <view style="height: 140rpx;"></view>
    </scroll-view>

    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <view class="pay-info">
        <text class="pay-label">应付：</text>
        <text class="pay-amount">¥{{ finalPrice }}</text>
        <text class="pay-fee" v-if="deliveryType === 1">含运费¥{{ deliveryFee }}.00</text>
      </view>
      <view class="settle-btn" @click="submitOrder">提交订单</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '@/store/cart'
import { useOrderStore } from '@/store/order'

const { cartList, selectedTotalPrice, updateCartItemNum, removeCheckedItems } = useCartStore()
const { addOrder, generateOrderId } = useOrderStore()

const selectedItems = computed(() => cartList.value.filter(item => item.checked))

function getCurrentTime(): string {
  const now = new Date()
  return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
}

// -------- 数据 --------
const deliveryType = ref(0)
const pickerName = ref('杨豆')
const pickerPhone = ref('18889252696')
const pickTime = ref(getCurrentTime())
const deliverTime = ref(getCurrentTime())
const userAddress = ref('春漫里60幢60-1-316')
const orderRemark = ref('')
const deliveryFee = ref(47)

// -------- 计算 --------
const totalPrice = computed(() => selectedTotalPrice.value.toFixed(2))
const goodsTotalNum = computed(() => selectedItems.value.reduce((s: number, i: any) => s + i.num, 0))
const finalPrice = computed(() => {
  const fee = deliveryType.value === 1 ? deliveryFee.value : 0
  return (selectedTotalPrice.value + fee).toFixed(2)
})

// -------- 方法 --------
const switchDelivery = (type: number) => {
  deliveryType.value = type
}

const changeNum = (id: number, num: number) => {
  if (num < 1) return
  updateCartItemNum(id, num)
}

const selectShop = () => uni.showToast({ title: '选择店铺', icon: 'none' })
const selectPicker = () => uni.showToast({ title: '选择提货人', icon: 'none' })

const selectAddress = () => {
  uni.chooseLocation({
    success: (res) => { userAddress.value = res.address || userAddress.value },
    fail: () => {}
  })
}

const openMap = () => {
  uni.chooseLocation({
    success: (res) => { userAddress.value = res.address || userAddress.value },
    fail: () => {}
  })
}

const onTimeChange = (e: { detail: { value: string } }) => { pickTime.value = e.detail.value }
const onDeliverTimeChange = (e: { detail: { value: string } }) => { deliverTime.value = e.detail.value }
const selectCoupon = () => uni.showToast({ title: '暂无可用优惠券', icon: 'none' })

const submitOrder = () => {
  if (deliveryType.value === 0 && !pickTime.value) {
    return uni.showToast({ title: '请选择自提时间', icon: 'none' })
  }
  if (deliveryType.value === 1 && !userAddress.value) {
    return uni.showToast({ title: '请选择收货地址', icon: 'none' })
  }
  if (selectedItems.value.length === 0) {
    return uni.showToast({ title: '请选择商品', icon: 'none' })
  }

  uni.showLoading({ title: '正在生成订单...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showModal({
      title: '确认支付',
      content: `订单金额：¥${finalPrice.value}`,
      confirmText: '立即支付',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          addOrder({
            orderId: generateOrderId(),
            items: selectedItems.value.map((item: any) => ({
              id: item.id, name: item.name, price: item.price,
              pic: item.pic, num: item.num, desc: item.desc,
            })),
            totalPrice: Number(finalPrice.value),
            deliveryType: deliveryType.value,
            pickTime: deliveryType.value === 0 ? pickTime.value : deliverTime.value,
            address: deliveryType.value === 1 ? userAddress.value : '到店自提',
            remark: orderRemark.value,
            status: '已付款',
            createTime: new Date().toLocaleString(),
          })
          removeCheckedItems()
          uni.showToast({ title: '支付成功', icon: 'success' })
          setTimeout(() => uni.switchTab({ url: '/pages/mine/mine' }), 1500)
        } else {
          uni.showToast({ title: '已取消支付', icon: 'none' })
        }
      },
    })
  }, 500)
}

const goBack = () => uni.navigateBack()
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}
.nav-back { width: 60rpx; }
.back-icon { font-size: 44rpx; color: #333; font-weight: bold; }
.nav-title { font-size: 34rpx; font-weight: 600; color: #333; }
.nav-placeholder { width: 60rpx; }

/* Tab 卡片嵌合切换 */
.delivery-tabs {
  display: flex;
  margin-top: 20rpx;
  padding: 0 24rpx;
  background: #f5f5f5;
  position: relative;
}
.tab-item {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #999;
  padding: 24rpx 0;
  background: #e8e8e8;
  position: relative;
  border-radius: 16rpx 16rpx 0 0;
}
.tab-item.active {
  color: #333;
  font-weight: 600;
  background: #fff;
  z-index: 2;
}
/* 反向圆角：选中tab左外侧 */
.tab-left.active::before {
  content: '';
  position: absolute;
  left: -16rpx;
  bottom: 0;
  width: 16rpx;
  height: 16rpx;
  background: transparent;
  border-bottom-right-radius: 16rpx;
  box-shadow: 8rpx 0 0 0 #fff;
}
/* 反向圆角：左tab右侧与右tab嵌合 */
.tab-left.active::after {
  content: '';
  position: absolute;
  right: -16rpx;
  bottom: 0;
  width: 16rpx;
  height: 16rpx;
  background: transparent;
  border-bottom-left-radius: 16rpx;
  box-shadow: -8rpx 0 0 0 #fff;
  z-index: 3;
}
/* 反向圆角：右tab左侧与左tab嵌合 */
.tab-right.active::before {
  content: '';
  position: absolute;
  left: -16rpx;
  bottom: 0;
  width: 16rpx;
  height: 16rpx;
  background: transparent;
  border-bottom-right-radius: 16rpx;
  box-shadow: 8rpx 0 0 0 #fff;
  z-index: 3;
}
/* 反向圆角：选中tab右外侧 */
.tab-right.active::after {
  content: '';
  position: absolute;
  right: -16rpx;
  bottom: 0;
  width: 16rpx;
  height: 16rpx;
  background: transparent;
  border-bottom-left-radius: 16rpx;
  box-shadow: -8rpx 0 0 0 #fff;
}

/* 滚动区域 */
.order-body {
  flex: 1;
  overflow: hidden;
}

/* 卡片 */
.card {
  background: #fff;
  margin: 20rpx 24rpx 0;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
}
/* 第一张卡片与 tab 无缝连接 */
.card.first-card {
  margin-top: 0;
  border-radius: 0 0 16rpx 16rpx;
  padding: 24rpx 24rpx 28rpx;
}

/* 地址卡片 */
.address-card { padding: 28rpx 24rpx; }
.addr-row {
  display: flex;
  align-items: center;
}
.addr-tag {
  font-size: 22rpx;
  color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}
.pickup-tag { background: #2db550; }
.home-tag { background: #2db550; }
.addr-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.addr-main {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}
.addr-contact {
  font-size: 26rpx;
  color: #666;
}
.addr-arrow {
  font-size: 36rpx;
  color: #ccc;
  margin-left: 12rpx;
  flex-shrink: 0;
}
.addr-sub {
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
  padding-left: 50rpx;
}

/* 地图提示 */
.map-tip-bar {
  margin: 0 24rpx;
  padding: 8rpx 24rpx 0;
}
.map-tip-text {
  font-size: 22rpx;
  color: #999;
}

/* 表单行 */
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.form-row:last-child { border-bottom: none; }
.form-label {
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
}
.form-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.form-value {
  font-size: 28rpx;
  color: #333;
}
.form-value.placeholder {
  color: #2db550;
}
.form-arrow {
  font-size: 28rpx;
  color: #ccc;
}
.link-color { color: #2db550; }
.delivery-fee { color: #333; }

/* 商品列表 */
.goods-card { padding: 16rpx 24rpx; }
.goods-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.goods-item:last-child { border-bottom: none; }
.goods-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
}
.goods-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}
.goods-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-desc {
  font-size: 22rpx;
  color: #999;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 6rpx;
}
.goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}
.goods-price {
  font-size: 30rpx;
  color: #e64340;
  font-weight: 600;
}
.goods-num {
  display: flex;
  align-items: center;
  gap: 4rpx;
}
.num-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
  background: #f5f5f5;
  border-radius: 8rpx;
}
.num-val {
  width: 56rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

/* 金额汇总 */
.price-card { padding: 20rpx 24rpx; }
.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.price-row:last-child { border-bottom: none; }
.price-label {
  font-size: 28rpx;
  color: #333;
}
.price-label-group {
  display: flex;
  align-items: center;
  gap: 4rpx;
}
.price-extra {
  font-size: 24rpx;
  color: #999;
}
.price-amount {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
.coupon-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.coupon-none {
  font-size: 28rpx;
  color: #999;
}
.total-row {
  padding-top: 24rpx;
}
.total-label {
  font-size: 28rpx;
  color: #333;
  font-style: italic;
}
.total-amount {
  font-size: 34rpx;
  color: #e64340;
  font-weight: 700;
}

/* 备注 */
.remark-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.remark-input {
  font-size: 26rpx;
  color: #666;
  padding: 16rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
}

/* 底部栏（与购物车 bottom-bar 统一） */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
  padding: 12rpx 30rpx;
  background: rgba(255, 254, 245, 0.98);
  border-top: 1rpx solid #ebf0ca;
  z-index: 9999;
}
.pay-info {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}
.pay-label {
  font-size: 24rpx;
  color: #7a8554;
}
.pay-amount {
  font-size: 32rpx;
  color: #506027;
  font-weight: 600;
}
.pay-fee {
  font-size: 22rpx;
  color: #7a8554;
  margin-left: 8rpx;
}
.settle-btn {
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #f7e98f 0%, #8eb765 100%);
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 60rpx;
  font-weight: 600;
}
</style>
