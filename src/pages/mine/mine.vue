<template>
  <scroll-view class="mine-page" scroll-y>
    <view class="hero-card">
      <image class="avatar" src="https://picsum.photos/120/120" mode="aspectFill" />
      <view class="user-info">
        <text class="name">{{ userProfile.name }}</text>
        <text class="tip">{{ userProfile.phone }}</text>
        <text class="member-tag">{{ userProfile.level }}</text>
      </view>
      <view class="action-link" @click="showPopup = true">账户</view>
    </view>

    <view class="summary-card">
      <view class="summary-item">
        <text class="summary-value">{{ totalCount }}</text>
        <text class="summary-label">购物车商品</text>
      </view>
      <view class="summary-item">
        <text class="summary-value">{{ selectedCount }}</text>
        <text class="summary-label">待结算</text>
      </view>
      <view class="summary-item">
        <text class="summary-value">¥{{ selectedTotalPrice.toFixed(2) }}</text>
        <text class="summary-label">待支付金额</text>
      </view>
    </view>

    <view class="card">
      <view class="card-header">
        <text class="card-title">我的订单</text>
        <text class="card-link" @click="openTodo('全部订单')">查看全部订单</text>
      </view>
      <view class="order-grid">
        <view
          v-for="item in orderTabList"
          :key="item.name"
          class="order-item"
          @click="openTodo(item.name)"
        >
          <uni-icons :type="item.icon" size="22" color="#5a6930" />
          <text class="order-text">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 最近订单 -->
    <view class="card" v-if="myOrders.length > 0">
      <view class="card-header">
        <text class="card-title">最近订单</text>
      </view>
      <view v-for="order in myOrders" :key="order.orderId" class="recent-order">
        <view class="recent-order-header">
          <text class="recent-order-id">订单号：{{ order.orderId }}</text>
          <text class="recent-order-status">{{ order.status }}</text>
        </view>
        <view class="recent-order-goods">
          <view
            v-for="item in order.items.slice(0, 3)"
            :key="item.id"
            class="recent-order-item"
          >
            <image class="recent-order-img" :src="item.pic" mode="aspectFill" />
            <view class="recent-order-info">
              <text class="recent-order-name">{{ item.name }}</text>
              <text class="recent-order-detail">¥{{ item.price }} x{{ item.num }}</text>
            </view>
          </view>
        </view>
        <view
          v-if="order.items.length > 3"
          class="expand-btn"
          @click="goOrderDetail(order.orderId)"
        >
          <text class="expand-text">查看更多（共{{ order.items.length }}件商品）</text>
          <uni-icons type="right" size="14" color="#8eb765" />
        </view>
        <view class="recent-order-footer">
          <text class="recent-order-time">{{ order.createTime }}</text>
          <text class="recent-order-total">合计：¥{{ order.totalPrice.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card-header">
        <text class="card-title">常用服务</text>
        <text class="card-link" @click="switchTab('/pages/menu/menu')">去逛逛</text>
      </view>
      <view class="service-grid">
        <view
          v-for="item in serviceList"
          :key="item.name"
          class="service-item"
          @click="handleServiceClick(item.type)"
        >
          <view class="service-icon">
            <uni-icons :type="item.icon" size="28" color="#5c6a31" />
          </view>
          <text class="service-name">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <page-container
      :show="showPopup"
      :close-on-click-overlay="true"
      position="bottom"
      @close="showPopup = false"
    >
      <view class="popup-box">
        <text class="popup-title">账户中心</text>
        <text class="popup-desc">
          当前演示版先保留基础信息展示，后续可以继续接登录、会员和地址管理。
        </text>
        <view class="popup-action" @click="switchTab('/pages/cart/cart')">查看购物车</view>
        <view class="popup-action secondary" @click="showPopup = false">关闭</view>
      </view>
    </page-container>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/store/cart'
import { useOrderStore } from '@/store/order'

type ServiceType =
  | 'cart'
  | 'menu'
  | 'address'
  | 'gift'
  | 'contact'
  | 'profile'
  | 'coupon'
  | 'security'

const showPopup = ref(false)

const { totalCount, selectedCount, selectedTotalPrice } = useCartStore()
const { orderList: myOrders } = useOrderStore()

const goOrderDetail = (orderId: string) => {
  uni.navigateTo({ url: `/pages/order-detail/order-detail?id=${orderId}` })
}

const userProfile = ref({
  name: 'lidou',
  phone: '18889252696',
  level: '春日银卡会员',
})

const orderTabList = ref([
  { name: '待付款', icon: 'wallet' },
  { name: '待发货', icon: 'gift' },
  { name: '待收货', icon: 'paperplane' },
  { name: '待评价', icon: 'compose' },
  { name: '退款售后', icon: 'headphones' },
])

const serviceList = ref([
  { name: '购物车', icon: 'cart', type: 'cart' as ServiceType },
  { name: '继续点单', icon: 'list', type: 'menu' as ServiceType },
  { name: '收货地址', icon: 'location', type: 'address' as ServiceType },
  { name: '我的赠品', icon: 'gift', type: 'gift' as ServiceType },
  { name: '联系商家', icon: 'phone', type: 'contact' as ServiceType },
  { name: '个人信息', icon: 'person', type: 'profile' as ServiceType },
  { name: '卡券兑换', icon: 'wallet', type: 'coupon' as ServiceType },
  { name: '账号安全', icon: 'locked', type: 'security' as ServiceType },
])

const switchTab = (url: string) => {
  uni.switchTab({ url })
}

const openTodo = (name: string) => {
  uni.showToast({
    title: `${name}功能待接入`,
    icon: 'none',
  })
}

const handleServiceClick = (type: ServiceType) => {
  if (type === 'cart') {
    switchTab('/pages/cart/cart')
    return
  }

  if (type === 'menu') {
    switchTab('/pages/menu/menu')
    return
  }

  if (type === 'address') {
    uni.navigateTo({ url: '/pages/address/address' })
    return
  }

  openTodo(serviceList.value.find((item) => item.type === type)?.name || '该服务')
}
</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fffdf0 0%, #f1f8dd 100%);
}

.hero-card {
  margin: 24rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #f7e79b 0%, #dff0b5 60%, #bfe19e 100%);
  color: #536229;
  display: flex;
  align-items: center;
  box-shadow: 0 18rpx 40rpx rgba(177, 198, 111, 0.18);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.45);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 36rpx;
  font-weight: 700;
}

.tip {
  margin-top: 10rpx;
  font-size: 24rpx;
  opacity: 0.84;
}

.member-tag {
  margin-top: 16rpx;
  align-self: flex-start;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.35);
  font-size: 22rpx;
}

.action-link {
  min-width: 104rpx;
  height: 60rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.summary-card {
  margin: 0 24rpx 24rpx;
  padding: 26rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.88);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  box-shadow: 0 12rpx 28rpx rgba(177, 198, 111, 0.1);
}

.summary-item {
  padding: 18rpx 12rpx;
  border-radius: 22rpx;
  background: #f7fadf;
  text-align: center;
}

.summary-value {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #536129;
}

.summary-label {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #8d9760;
}

.card {
  margin: 0 24rpx 24rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 12rpx 28rpx rgba(177, 198, 111, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #4e5c27;
}

.card-link {
  font-size: 24rpx;
  color: #96a061;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10rpx;
}

.order-item {
  padding: 20rpx 6rpx;
  border-radius: 22rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f7fadf;
}

.order-icon {
  font-size: 36rpx;
}

.order-text {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #5a6930;
  text-align: center;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22rpx 0;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.service-icon {
  width: 74rpx;
  height: 74rpx;
  border-radius: 22rpx;
  /* background: #fbf2ba; */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
}

.service-name {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #5c6a31;
  text-align: center;
}

.popup-box {
  padding: 36rpx 30rpx 48rpx;
  border-radius: 32rpx 32rpx 0 0;
  background: #fffef6;
}

.popup-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #495727;
}

.popup-desc {
  display: block;
  margin-top: 18rpx;
  font-size: 25rpx;
  line-height: 1.7;
  color: #7e8856;
}

.popup-action {
  margin-top: 28rpx;
  height: 82rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #f7e98f 0%, #8eb765 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
}

.popup-action.secondary {
  margin-top: 18rpx;
  background: #f3f7d6;
  color: #607036;
}

.recent-order {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f4d8;
}

.recent-order:last-child {
  border-bottom: none;
}

.recent-order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.recent-order-id {
  font-size: 24rpx;
  color: #8d9760;
}

.recent-order-status {
  font-size: 24rpx;
  color: #8eb765;
  font-weight: 600;
}

.recent-order-goods {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.recent-order-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.recent-order-img {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.recent-order-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-order-name {
  font-size: 28rpx;
  color: #4e5c27;
}

.recent-order-detail {
  font-size: 24rpx;
  color: #8d9760;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 0 8rpx;
}
.expand-text {
  font-size: 24rpx;
  color: #8eb765;
}
.expand-arrow {
  font-size: 24rpx;
  color: #8eb765;
  display: inline-block;
  transform: rotate(90deg);
  transition: transform 0.25s;
}
.expand-arrow.up {
  transform: rotate(-90deg);
}

.recent-order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
}

.recent-order-time {
  font-size: 22rpx;
  color: #aab36a;
}

.recent-order-total {
  font-size: 28rpx;
  color: #7eb05a;
  font-weight: 600;
}
</style>
