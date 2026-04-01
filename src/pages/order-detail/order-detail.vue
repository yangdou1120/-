<template>
  <view class="detail-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-back" @click="goBack">
        <uni-icons type="left" size="22" color="#4e5c27" />
      </view>
      <text class="nav-title">订单详情</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view class="detail-body" scroll-y v-if="order">
      <!-- 订单状态 -->
      <view class="status-bar">
        <uni-icons type="checkbox" size="22" color="#fff" />
        <text class="status-text">{{ order.status }}</text>
      </view>

      <!-- 配送/自提信息 -->
      <view class="card">
        <view class="info-row">
          <text class="info-label">{{ order.deliveryType === 0 ? '自提地址' : '收货地址' }}</text>
          <text class="info-value">{{ order.address }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">{{ order.deliveryType === 0 ? '自提时间' : '送达时间' }}</text>
          <text class="info-value">{{ order.pickTime }}</text>
        </view>
        <view class="info-row" v-if="order.remark">
          <text class="info-label">订单备注</text>
          <text class="info-value">{{ order.remark }}</text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="card">
        <view class="section-title">商品信息（共{{ order.items.length }}件）</view>
        <view v-for="item in order.items" :key="item.id" class="goods-item">
          <image class="goods-img" :src="item.pic" mode="aspectFill" />
          <view class="goods-body">
            <text class="goods-name">{{ item.name }}</text>
            <text class="goods-desc" v-if="item.desc">{{ item.desc }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ item.price.toFixed(2) }}</text>
              <text class="goods-num">x{{ item.num }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 金额信息 -->
      <view class="card">
        <view class="price-row">
          <text class="price-label">商品总价</text>
          <text class="price-value">¥{{ goodsTotal.toFixed(2) }}</text>
        </view>
        <view class="price-row" v-if="order.deliveryType === 1">
          <text class="price-label">配送费</text>
          <text class="price-value">¥{{ deliveryFee.toFixed(2) }}</text>
        </view>
        <view class="price-row total-row">
          <text class="price-label">实付金额</text>
          <text class="total-value">¥{{ order.totalPrice.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="card">
        <view class="section-title">订单信息</view>
        <view class="info-row">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ order.orderId }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ order.createTime }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">配送方式</text>
          <text class="info-value">{{ order.deliveryType === 0 ? '到店自提' : '同城配送' }}</text>
        </view>
      </view>

      <view style="height: 60rpx;"></view>
    </scroll-view>

    <view class="empty" v-else>
      <text class="empty-text">订单不存在</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useOrderStore, type Order } from '@/store/order'

const { orderList } = useOrderStore()

const order = ref<Order | null>(null)

onLoad((options) => {
  const id = options?.id || ''
  const found = orderList.value.find(o => o.orderId === id)
  if (found) order.value = found
})

const goodsTotal = computed(() => {
  if (!order.value) return 0
  return order.value.items.reduce((sum: number, item: any) => sum + item.price * item.num, 0)
})

const deliveryFee = computed(() => {
  if (!order.value) return 0
  return order.value.totalPrice - goodsTotal.value
})

const goBack = () => uni.navigateBack()
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fffdf0 0%, #f1f8dd 100%);
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: rgba(255, 254, 245, 0.98);
  border-bottom: 1rpx solid #ebf0ca;
}
.nav-back { width: 60rpx; }
.back-icon { font-size: 44rpx; color: #4e5c27; font-weight: bold; }
.nav-title { font-size: 34rpx; font-weight: 600; color: #4e5c27; }
.nav-placeholder { width: 60rpx; }

.detail-body {
  flex: 1;
  overflow: hidden;
}

/* 状态条 */
.status-bar {
  margin: 24rpx 24rpx 0;
  padding: 28rpx 32rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #8eb765 0%, #7eb05a 100%);
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.status-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

/* 卡片 */
.card {
  margin: 20rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8rpx 20rpx rgba(177, 198, 111, 0.08);
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #4e5c27;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f4d8;
}

/* 信息行 */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14rpx 0;
}
.info-label {
  font-size: 26rpx;
  color: #8d9760;
  flex-shrink: 0;
  margin-right: 20rpx;
}
.info-value {
  font-size: 26rpx;
  color: #4e5c27;
  text-align: right;
  flex: 1;
  word-break: break-all;
}

/* 商品列表 */
.goods-item {
  display: flex;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f0f4d8;
}
.goods-item:last-child { border-bottom: none; }
.goods-img {
  width: 120rpx;
  height: 120rpx;
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
  color: #4e5c27;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-desc {
  font-size: 22rpx;
  color: #8d9760;
  margin-top: 6rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}
.goods-price {
  font-size: 28rpx;
  color: #7eb05a;
  font-weight: 600;
}
.goods-num {
  font-size: 24rpx;
  color: #8d9760;
}

/* 金额 */
.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
}
.price-label {
  font-size: 28rpx;
  color: #4e5c27;
}
.price-value {
  font-size: 28rpx;
  color: #4e5c27;
}
.total-row {
  margin-top: 8rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f4d8;
}
.total-value {
  font-size: 34rpx;
  color: #7eb05a;
  font-weight: 700;
}

/* 空状态 */
.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
