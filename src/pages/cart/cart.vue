<template>
  <view class="cart-page">
    <view class="address-bar">
      <view class="address-content" @click="openLocationPopup">
        <uni-icons type="location" size="18" color="#99a55f" />
        <view class="address-info">
          <text class="address-text">{{ address }}</text>
          <text v-if="deliveryStatus !== 'unknown'" class="delivery-tag" :class="deliveryStatus">
            {{ deliveryLabel }}
          </text>
          <text v-else class="delivery-tag hint">点击获取当前位置</text>
        </view>
      </view>
      <view>
        <text v-if="editState" class="arrow" @click.stop="editState = false">完成</text>
        <text v-else class="address-edit" @click.stop="editState = true">编辑</text>
      </view>
    </view>

    <view class="search-bar">
      <input
        class="search-input"
        v-model="searchKeyword"
        placeholder="搜索购物车商品"
        confirm-type="search"
      />
      <uni-icons v-if="searchKeyword" type="close" size="16" color="#999" class="search-clear" @click="searchKeyword = ''" />
    </view>

    <scroll-view class="goods-list" scroll-y>
      <view v-for="item in filteredCartList" :key="item.id" class="goods-item">
        <view class="check-col">
          <checkbox-group @change="(e: any) => handleCheckChange(item.id, e.detail.value.length > 0)">
            <checkbox :checked="item.checked" color="#8EB765" />
          </checkbox-group>
        </view>

        <image class="goods-img" :src="item.pic" mode="aspectFill" />

        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <text class="goods-desc">{{ item.desc || '门店现做，新鲜出品，口感轻盈' }}</text>
          <text class="delivery-time">最快明日 11:00 送达</text>
          <text class="goods-price">¥{{ item.price }}</text>
        </view>

        <uni-number-box
          :model-value="item.num"
          :min="0"
          :max="99"
          background="#8eb765"
          color="#fff"
          @change="(value) => changeCartNum(item.id, value)"
        />
      </view>

      <view v-if="filteredCartList.length === 0" class="empty-state">
        <text class="empty-title">{{ cartList.length === 0 ? '购物车还是空的' : '没有找到匹配的商品' }}</text>
        <text class="empty-desc">{{ cartList.length === 0 ? '去点单页挑一些你喜欢的春日甜品吧' : '试试其他关键词' }}</text>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="bottom-bar-left">
        <view
          class="select-all"
          :class="{ disabled: cartList.length === 0 }"
          @click="cartList.length > 0 && toggleAllCheck()"
        >
          <checkbox :checked="isAllChecked" color="#8EB765" />
          <text class="select-text">全选</text>
        </view>
      </view>

      <view class="bottom-bar-right">
        <template v-if="editState">
          <view
            class="settle-btn"
            :class="{ disabled: !hasSelected }"
            @click="handleDelete"
          >
            删除
          </view>
        </template>
        <template v-else>
          <view class="price-info">
            <view class="price-info-line">
              <text class="price-label">不含运费 </text>
              <text class="price-total">合计：</text>
              <text class="price-price">¥ {{ selectedTotalPrice.toFixed(2) }}</text>
            </view>
            <view class="price-info-line flex-end">
              <text class="discount-detail" @click="openDiscountPopup">
                金额明细
                <uni-icons type="down" size="16" color="#7c8a47" />
              </text>
            </view>
          </view>
          <view
            v-if="cartList.length === 0"
            class="settle-btn"
            @click="goToMenu"
          >
            去选购
          </view>
          <view
            v-else
            class="settle-btn"
            :class="{ disabled: !hasSelected }"
            @click="handleSettle"
          >
            去结算({{ selectedCount }})
          </view>
        </template>
      </view>
    </view>

    <uni-popup ref="locationPopup" type="center">
      <view class="location-popup">
        <view class="popup-header">
          <text class="popup-title">选择位置</text>
          <text class="close-btn" @click="locationPopup?.close()">关闭</text>
        </view>

        <!-- 手动输入 -->
        <view class="loc-section loc-input-section">
          <text class="loc-section-title">手动输入地址</text>
          <view class="loc-input-row">
            <input
              class="loc-input"
              v-model="inputValue"
              placeholder="输入详细地址"
              confirm-type="search"
              @confirm="geocodeAddress"
            />
            <text class="loc-confirm-btn" @click="geocodeAddress">确认</text>
          </view>
        </view>

        <view class="loc-divider" />

        <!-- 地图选点 -->
        <view class="loc-section" @click="chooseOnMap">
          <uni-icons type="map" size="22" color="#4f5e28" />
          <view class="loc-gps-info">
            <text class="loc-gps-label">在地图上选择位置</text>
            <text class="loc-gps-addr">打开地图，手动选点</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <uni-popup ref="discountPopup" type="bottom" mask-click>
      <view class="discount-popup">
        <view class="popup-header">
          <text class="popup-title">金额明细</text>
          <text class="close-btn" @click="discountPopup?.close()">关闭</text>
        </view>
        <scroll-view class="popup-scroll" scroll-y>
          <view class="popup-line">
            <text class="popup-title">商品总额</text>
            <text class="popup-value">¥{{ selectedTotalPrice.toFixed(2) }}</text>
          </view>
          <view class="popup-line">
            <text class="popup-title">额外费用</text>
            <text class="popup-value">¥0.00</text>
          </view>
          <view class="popup-line">
            <text class="popup-title">合计</text>
            <text class="popup-value">¥{{ selectedTotalPrice.toFixed(2) }}</text>
          </view>
          <view class="popup-desc">
            <text>以上金额不包含运费，实际支付金额请以确认订单页为准。</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useCartStore } from '@/store/cart'
import { AMapWX } from '@/common/amap-wx.js'
const amapPlugin = new AMapWX({ key: '7da2bd447c479d18d9626fff7dfe1eb2' })

// 商家坐标（春漫里 20 号，请按实际坐标修改）
const MERCHANT_LAT = 23.129163
const MERCHANT_LNG = 113.264435

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

type DeliveryStatus = 'unknown' | 'free' | 'fee' | 'unavailable'

const address = ref('点击获取当前位置')
const editState = ref(false)
const discountPopup = ref()
const locationPopup = ref()
const deliveryStatus = ref<DeliveryStatus>('unknown')
const deliveryDistance = ref(0)
const locating = ref(false)
const inputValue = ref('')
const searchKeyword = ref('')

const filteredCartList = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return cartList.value
  return cartList.value.filter((item: any) => item.name.toLowerCase().includes(kw))
})

const deliveryLabel = computed(() => {
  const d = deliveryDistance.value.toFixed(1)
  if (deliveryStatus.value === 'free') return `距离 ${d}km · 免配送费`
  if (deliveryStatus.value === 'fee') return `距离 ${d}km · 配送费 ¥12`
  if (deliveryStatus.value === 'unavailable') return `距离 ${d}km · 超出配送范围`
  return ''
})

const openLocationPopup = () => {
  locationPopup.value?.open('center')
  if (deliveryStatus.value === 'unknown') fetchLocation()
}

const chooseOnMap = () => {
  locationPopup.value?.close()
  setTimeout(() => {
    uni.chooseLocation({
      latitude: MERCHANT_LAT,
      longitude: MERCHANT_LNG,
      success: (res) => {
        if (res.name || res.address) {
          const addr = res.name ? `${res.name}（${res.address}）` : res.address
          applyLocation(addr, res.latitude, res.longitude)
        }
      },
      fail: (err: any) => {
        const msg = err?.errMsg || ''
        if (msg.indexOf('cancel') > -1) return
        console.error('chooseLocation fail:', msg)
        uni.showToast({ title: '打开地图失败，请检查appid和定位权限', icon: 'none' })
      },
    })
  }, 300)
}

const applyLocation = (addr: string, lat: number, lng: number, close = false) => {
  address.value = addr
  const dist = calcDistance(lat, lng, MERCHANT_LAT, MERCHANT_LNG)
  deliveryDistance.value = dist
  if (dist <= 1) {
    deliveryStatus.value = 'free'
  } else if (dist <= 5) {
    deliveryStatus.value = 'fee'
  } else {
    deliveryStatus.value = 'unavailable'
  }
  if (close) locationPopup.value?.close()
}

const fetchLocation = () => {
  locating.value = true
  amapPlugin.getRegeo({
    success: (data: any[]) => {
      locating.value = false
      const info = data[0]
      applyLocation(
        info.name || info.regeocodeData?.formatted_address || '当前位置',
        parseFloat(info.latitude),
        parseFloat(info.longitude),
      )
    },
    fail: (err: any) => {
      locating.value = false
      console.error('amap getRegeo fail:', JSON.stringify(err))
      uni.showToast({ title: '获取位置失败，请检查定位权限', icon: 'none' })
    },
  })
}

const geocodeAddress = () => {
  if (!inputValue.value.trim()) {
    uni.showToast({ title: '请输入地址', icon: 'none' })
    return
  }
  uni.showLoading({ title: '查询中...' })
  amapPlugin.getGeo({
    options: { address: inputValue.value.trim() },
    success: (data: any) => {
      uni.hideLoading()
      const geocodes = data?.geocodes
      if (!geocodes || geocodes.length === 0) {
        uni.showToast({ title: '未找到该地址', icon: 'none' })
        return
      }
      const [lng, lat] = geocodes[0].location.split(',').map(Number)
      const addr = geocodes[0].formatted_address || inputValue.value.trim()
      inputValue.value = ''
      applyLocation(addr, lat, lng, true)
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '地址查询失败，请重试', icon: 'none' })
    },
  })
}

const {
  cartList,
  selectedCount,
  selectedTotalPrice,
  isAllChecked,
  updateCartItemNum,
  toggleCartItemChecked,
  toggleAllCartItems,
  removeCheckedItems,
} = useCartStore()

const hasSelected = computed(() => selectedCount.value > 0)

const changeCartNum = (id: number, value: number | string) => {
  const nextValue = Number(value)
  if (Number.isNaN(nextValue)) return
  updateCartItemNum(id, nextValue)
}


const handleCheckChange = (id: number, checked: boolean) => {
  toggleCartItemChecked(id, checked)
}

const toggleAllCheck = () => {
  toggleAllCartItems(!isAllChecked.value)
}

const handleDelete = () => {
  if (!hasSelected.value) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }

  removeCheckedItems()
  editState.value = false
}

const goToMenu = () => {
  uni.switchTab({ url: '/pages/menu/menu' })
}

const handleSettle = () => {
  if (!hasSelected.value) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }

  uni.navigateTo({ url: '/pages/order/order' })
}

const openDiscountPopup = () => {
  discountPopup.value?.open('bottom')
}

onMounted(() => {
  fetchLocation()
})
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #fffdf0 0%, #f2f8dd 100%);
  box-sizing: border-box;
  overflow: hidden;
}

.address-bar {
  height: 92rpx;
  padding: 0 30rpx;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #ecf1ca;
}

.address-content {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.address-icon {
  font-size: 28rpx;
  color: #99a55f;
  flex-shrink: 0;
  line-height: 40rpx;
}

.address-text {
  font-size: 28rpx;
  color: #4f5e28;
  line-height: 40rpx;
}

.delivery-tag {
  font-size: 22rpx;
  text-align: left;
}

.delivery-tag.free {
  color: #7eb05a;
}

.delivery-tag.fee {
  color: #e6a817;
}

.delivery-tag.unavailable {
  color: #d9534f;
}

.delivery-tag.hint {
  color: #99a55f;
}

.address-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  margin-left: 12rpx;
}

.location-popup {
  background: #fffef5;
  border-radius: 24rpx;
  width: 640rpx;
  box-sizing: border-box;
  padding-bottom: 32rpx;
}

.loc-section {
  display: flex;
  align-items: center;
  padding: 32rpx 30rpx;
  gap: 20rpx;
}

.loc-gps-icon {
  font-size: 36rpx;
  flex-shrink: 0;
}

.loc-gps-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.loc-gps-label {
  font-size: 30rpx;
  color: #4f5e28;
  font-weight: 600;
}

.loc-gps-addr {
  font-size: 24rpx;
  color: #7a8554;
}

.loc-divider {
  height: 1rpx;
  background: #ecf1ca;
  margin: 0 30rpx;
}

.loc-input-section {
  flex-direction: column;
  align-items: flex-start;
}

.loc-section-title {
  font-size: 26rpx;
  color: #7a8554;
  margin-bottom: 16rpx;
}

.loc-input-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 16rpx;
}

.loc-input {
  flex: 1;
  font-size: 28rpx;
  color: #4f5e28;
  border-bottom: 1rpx solid #c4d47a;
  padding-bottom: 8rpx;
}

.loc-confirm-btn {
  font-size: 28rpx;
  color: #8eb765;
  font-weight: 600;
  flex-shrink: 0;
}

.arrow,
.address-edit {
  font-size: 24rpx;
  color: #8eb765;
}

.search-bar {
  display: flex;
  align-items: center;
  margin: 16rpx 24rpx 0;
  padding: 0 24rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 36rpx;
  border: 1rpx solid #ecf1ca;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #4f5e28;
}

.search-clear {
  font-size: 28rpx;
  color: #999;
  padding-left: 16rpx;
}

.goods-list {
  flex: 1;
  padding: 24rpx 24rpx 160rpx;
  box-sizing: border-box;
  overflow-y: auto;
  width: 100%;
}

.goods-item {
  background: rgba(255, 255, 255, 0.88);
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  box-shadow: 0 10rpx 24rpx rgba(177, 198, 111, 0.1);
}

.check-col {
  margin-right: 20rpx;
}

.goods-img {
  width: 150rpx;
  height: 150rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.goods-name {
  font-size: 32rpx;
  color: #4e5d28;
  font-weight: 600;
}

.goods-desc {
  font-size: 24rpx;
  color: #788452;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.delivery-time {
  font-size: 22rpx;
  color: #a7af57;
}

.goods-price {
  font-size: 28rpx;
  color: #7eb05a;
  font-weight: 700;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  color: #95a064;
}

.empty-title {
  font-size: 32rpx;
  color: #55662b;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 24rpx;
}

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

.select-all {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.select-text {
  font-size: 32rpx;
  color: #516028;
}

.select-all.disabled {
  opacity: 0.4;
}

.bottom-bar-right {
  display: flex;
  align-items: center;
}

.price-info .price-label {
  font-size: 24rpx;
  color: #7a8554;
}

.price-info .price-total {
  font-size: 32rpx;
  color: #506027;
  font-weight: 600;
}

.price-info .price-price {
  font-size: 24rpx;
  color: #7eb05a;
  font-weight: 700;
}

.flex-end {
  display: flex;
  justify-content: flex-end;
}

.discount-detail {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: #7c8a47;
  background: #f3f7d5;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
}

.settle-btn {
  margin-left: 20rpx;
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #f7e98f 0%, #8eb765 100%);
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 60rpx;
  font-weight: 600;
}

.settle-btn.disabled {
  background: #cbd3ae;
}

.discount-popup {
  background: #fffef5;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  max-height: 70vh;
  margin-bottom: 54rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 30rpx 20rpx;
  flex-shrink: 0;
}

.popup-scroll {
  flex: 1;
  padding: 0 30rpx 32rpx;
  box-sizing: border-box;
}

.popup-desc {
  width: 100%;
  font-size: 24rpx;
  color: #87925a;
  margin-top: 24rpx;
  line-height: 1.6;
}

.popup-line {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.popup-title,
.popup-value {
  font-size: 30rpx;
  font-weight: 500;
  color: #4f5f27;
}

.close-btn {
  color: #8eb765;
  font-size: 24rpx;
}
</style>
