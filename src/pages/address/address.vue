<template>
  <view class="address-page">
    <view class="navbar">
      <view class="nav-back" @click="goBack">
        <uni-icons type="left" size="22" color="#4e5c27" />
      </view>
      <text class="nav-title">收货地址</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view class="address-body" scroll-y>
      <!-- 用户信息 -->
      <view class="card user-card">
        <view class="card-header">
          <text class="card-title">用户信息</text>
        </view>
        <view class="info-row">
          <text class="info-label">姓名</text>
          <text class="info-value">{{ userInfo.name }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">手机号</text>
          <text class="info-value">{{ userInfo.phone }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">会员等级</text>
          <text class="info-value">{{ userInfo.level }}</text>
        </view>
      </view>

      <!-- 收货地址列表 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">我的地址</text>
          <text class="card-link" @click="addAddress">新增地址</text>
        </view>

        <view v-if="addressList.length === 0" class="empty">
          <uni-icons type="location" size="48" color="#c2ca96" />
          <text class="empty-text">暂无收货地址</text>
          <text class="empty-desc">点击右上角新增地址</text>
        </view>

        <view
          v-for="(item, index) in addressList"
          :key="index"
          class="address-item"
        >
          <view class="address-item-body">
            <view class="address-item-header">
              <text class="address-name">{{ item.name }}</text>
              <text class="address-phone">{{ item.phone }}</text>
              <view v-if="item.isDefault" class="default-tag">默认</view>
            </view>
            <text class="address-detail">{{ item.address }}</text>
          </view>
          <view class="address-item-actions">
            <view class="action-btn" @click="editAddress(index)">
              <uni-icons type="compose" size="18" color="#8eb765" />
            </view>
            <view class="action-btn" @click="deleteAddress(index)">
              <uni-icons type="trash" size="18" color="#e64340" />
            </view>
          </view>
        </view>
      </view>

      <view style="height: 60rpx;"></view>
    </scroll-view>

    <!-- 新增/编辑地址弹窗 -->
    <uni-popup ref="addPopup" type="bottom">
      <view class="add-popup">
        <view class="popup-header">
          <text class="popup-title">{{ editingIndex >= 0 ? '编辑收货地址' : '新增收货地址' }}</text>
          <text class="close-btn" @click="addPopup?.close()">关闭</text>
        </view>
        <view class="form-group">
          <text class="form-label">收货人</text>
          <input class="form-input" v-model="form.name" placeholder="请输入收货人姓名" />
        </view>
        <view class="form-group">
          <text class="form-label">手机号</text>
          <input class="form-input" v-model="form.phone" placeholder="请输入手机号" type="number" maxlength="11" />
        </view>
        <view class="form-group">
          <text class="form-label">详细地址</text>
          <view class="address-input-wrap">
            <input class="address-inner-input" v-model="form.address" placeholder="请输入详细地址" />
            <view class="location-icon-btn" @click="chooseOnMap">
              <uni-icons type="location" size="20" color="#8eb765" />
            </view>
          </view>
        </view>
        <view class="form-group row">
          <text class="form-label">设为默认</text>
          <switch :checked="form.isDefault" color="#8eb765" @change="form.isDefault = !form.isDefault" />
        </view>
        <view class="save-btn" @click="saveAddress">保存地址</view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface AddressItem {
  name: string
  phone: string
  address: string
  isDefault: boolean
}

const STORAGE_KEY = 'address-list'
const USER_KEY = 'user-info'

function loadAddresses(): AddressItem[] {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function loadUserInfo() {
  try {
    const saved = uni.getStorageSync(USER_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { name: 'lidou', phone: '18889252696', level: '春日银卡会员' }
}

const userInfo = ref(loadUserInfo())
const addressList = ref<AddressItem[]>(loadAddresses())
const addPopup = ref()
const editingIndex = ref(-1)

const form = ref<AddressItem>({
  name: '',
  phone: '',
  address: '',
  isDefault: false,
})

watch(addressList, (val) => {
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

const goBack = () => uni.navigateBack()

const chooseOnMap = () => {
  uni.chooseLocation({
    success: (res) => {
      if (res.name || res.address) {
        form.value.address = res.name ? `${res.name}（${res.address}）` : res.address
      }
    },
    fail: (err: any) => {
      const msg = err?.errMsg || ''
      if (msg.indexOf('cancel') > -1) return
      uni.showToast({ title: '打开地图失败，请检查定位权限', icon: 'none' })
    },
  })
}

const addAddress = () => {
  editingIndex.value = -1
  form.value = { name: userInfo.value.name, phone: userInfo.value.phone, address: '', isDefault: addressList.value.length === 0 }
  addPopup.value?.open('bottom')
}

const editAddress = (index: number) => {
  editingIndex.value = index
  const item = addressList.value[index]
  form.value = { ...item }
  addPopup.value?.open('bottom')
}

const saveAddress = () => {
  if (!form.value.name.trim()) {
    return uni.showToast({ title: '请输入收货人', icon: 'none' })
  }
  if (!form.value.phone.trim()) {
    return uni.showToast({ title: '请输入手机号', icon: 'none' })
  }
  if (!form.value.address.trim()) {
    return uni.showToast({ title: '请输入详细地址', icon: 'none' })
  }

  if (form.value.isDefault) {
    addressList.value.forEach(item => item.isDefault = false)
  }

  if (editingIndex.value >= 0) {
    addressList.value[editingIndex.value] = { ...form.value }
  } else {
    addressList.value.push({ ...form.value })
  }
  addPopup.value?.close()
  uni.showToast({ title: editingIndex.value >= 0 ? '修改成功' : '添加成功', icon: 'success' })
}

const setDefault = (index: number) => {
  addressList.value.forEach((item, i) => {
    item.isDefault = i === index
  })
}

const deleteAddress = (index: number) => {
  uni.showModal({
    title: '提示',
    content: '确定删除该地址吗？',
    success: (res) => {
      if (res.confirm) {
        addressList.value.splice(index, 1)
        uni.showToast({ title: '已删除', icon: 'none' })
      }
    },
  })
}
</script>

<style scoped>
.address-page {
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
.nav-title { font-size: 34rpx; font-weight: 600; color: #4e5c27; }
.nav-placeholder { width: 60rpx; }

.address-body {
  flex: 1;
  overflow: hidden;
}

.card {
  margin: 20rpx 24rpx 0;
  padding: 28rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8rpx 20rpx rgba(177, 198, 111, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f0f4d8;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #4e5c27;
}

.card-link {
  font-size: 24rpx;
  color: #8eb765;
  font-weight: 500;
}

.user-card .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f5f8e8;
}
.user-card .info-row:last-child { border-bottom: none; }

.info-label {
  font-size: 26rpx;
  color: #8d9760;
}

.info-value {
  font-size: 26rpx;
  color: #4e5c27;
  font-weight: 500;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;
  gap: 16rpx;
}
.empty-text {
  font-size: 28rpx;
  color: #8d9760;
}
.empty-desc {
  font-size: 24rpx;
  color: #aab36a;
}

.address-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f4d8;
}
.address-item:last-child { border-bottom: none; }

.address-item-body {
  flex: 1;
  min-width: 0;
}

.address-item-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.address-name {
  font-size: 28rpx;
  color: #4e5c27;
  font-weight: 600;
}

.address-phone {
  font-size: 24rpx;
  color: #8d9760;
}

.default-tag {
  font-size: 20rpx;
  color: #8eb765;
  border: 1rpx solid #8eb765;
  border-radius: 6rpx;
  padding: 2rpx 10rpx;
}

.address-detail {
  font-size: 26rpx;
  color: #6a7940;
  line-height: 1.5;
  word-break: break-all;
}

.address-item-actions {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  margin-left: 20rpx;
}

.action-btn {
  padding: 8rpx;
}

/* 弹窗 */
.add-popup {
  background: #fffef5;
  border-radius: 32rpx 32rpx 0 0;
  padding: 0 30rpx 48rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 0 20rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #4e5c27;
}

.close-btn {
  font-size: 24rpx;
  color: #8eb765;
}

.form-group {
  margin-top: 24rpx;
}

.form-group.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-group.row :deep(switch) {
  transform: scale(0.7);
  transform-origin: right center;
}

.form-label {
  font-size: 26rpx;
  color: #6a7940;
  margin-bottom: 12rpx;
  display: block;
}

.form-group.row .form-label {
  margin-bottom: 0;
}

.form-input {
  font-size: 28rpx;
  color: #4e5c27;
  padding: 20rpx;
  background: #f7fadf;
  border-radius: 12rpx;
  border: 1rpx solid #e8efbd;
}

.address-input-wrap {
  display: flex;
  align-items: center;
  background: #f7fadf;
  border-radius: 12rpx;
  border: 1rpx solid #e8efbd;
  padding: 0 12rpx 0 20rpx;
}

.address-inner-input {
  flex: 1;
  font-size: 28rpx;
  color: #4e5c27;
  height: 72rpx;
  line-height: 72rpx;
}

.location-icon-btn {
  flex-shrink: 0;
  padding: 12rpx;
}

.save-btn {
  margin-top: 36rpx;
  height: 82rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #f7e98f 0%, #8eb765 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
}
</style>
