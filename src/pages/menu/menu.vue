<template>
  <view class="container">
    <view class="search-bar">
      <view class="search-box">
        <uni-icons type="search" size="16" color="#6a7940" />
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索茶饮、甜品、面食"
          confirm-type="search"
        />
        <uni-icons v-if="searchKeyword" type="close" size="16" color="#999" class="search-clear" @click="searchKeyword = ''" />
      </view>
    </view>

    <!-- 搜索结果模式 -->
    <scroll-view v-if="searchKeyword.trim()" class="search-result" scroll-y>
      <view v-if="searchResults.length === 0" class="empty-search">
        <text class="empty-title">没有找到匹配的商品</text>
        <text class="empty-desc">试试其他关键词</text>
      </view>
      <view v-for="good in searchResults" :key="good.id" class="goods-item">
        <image :src="good.pic" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ good.name }}</text>
          <text class="desc">{{ good.desc || '门店现做，清爽不腻，适合即点即享' }}</text>
          <text class="price">¥{{ good.price }}</text>
        </view>
        <view class="cart-btn" @click="addCart(good)">+</view>
      </view>
      <view style="height: 140rpx"></view>
    </scroll-view>

    <!-- 正常分类模式 -->
    <template v-else>
      <scroll-view class="left-tabs" scroll-y>
        <view
          v-for="(item, index) in tabList"
          :key="item.id"
          class="tab-item"
          :class="{ active: currentIndex === index }"
          @click="clickTab(index)"
        >
          {{ item.title }}
        </view>
      </scroll-view>

      <scroll-view
        class="right-content"
        scroll-y
        :scroll-into-view="toView"
        scroll-with-animation
        @scroll="onRightScroll"
      >
        <view
          v-for="item in menuList"
          :id="item.id"
          :key="item.id"
          class="menu-section"
        >
          <view class="section-title">{{ item.title }}</view>

          <view v-for="good in item.goods" :key="good.id" class="goods-item">
            <image :src="good.pic" mode="aspectFill" />
            <view class="info">
              <text class="name">{{ good.name }}</text>
              <text class="desc">{{ good.desc || '门店现做，清爽不腻，适合即点即享' }}</text>
              <text class="price">¥{{ good.price }}</text>
            </view>
            <view class="cart-btn" @click="addCart(good)">+</view>
          </view>
        </view>

        <view style="height: 140rpx"></view>
      </scroll-view>
    </template>

    <view class="cart-footer">
      <view class="cart-footer-center">
        <view class="check-area left" @click="openPopup">
          已选
          <text class="left-price price">{{ totalCount }}</text>
        </view>
        <view class="right">
          <view class="total">
            <text>合计：</text>
            <text class="price">¥{{ totalPrice.toFixed(2) }}</text>
          </view>
          <view class="pay" :class="{ disabled: totalCount <= 0 }" @click="toCheck">
            去结算
          </view>
        </view>
      </view>
    </view>

    <uni-popup ref="popupRef" type="bottom" background-color="#fffdf2">
      <view class="content-box">
        <view class="top">
          共 {{ totalCount }} 件商品
          <text v-if="cartList.length !== 0" class="clear-btn" @click="clearCart">清空</text>
        </view>
        <scroll-view class="desc-box" scroll-y>
          <view v-if="cartList.length === 0" class="none-cart">
            <uni-icons type="shop" size="28" color="#c2ca96" />
            <text class="title">购物车还是空的</text>
            <text class="subtitle">去挑几样今天想吃的店内招牌吧</text>
          </view>
          <view v-else>
            <view v-for="item in cartList" :key="item.id" class="goods-item popup-item">
              <image :src="item.pic" mode="aspectFill" />
              <view class="info">
                <text class="name">{{ item.name }}</text>
                <text class="price">¥{{ item.price }}</text>
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
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import { useCartStore, type GoodsItem } from '@/store/cart'

interface MenuSection {
  id: string
  title: string
  goods: GoodsItem[]
}

const popupRef = ref()
const currentIndex = ref(0)
const toView = ref('menu-0')
const sectionScrollTopList = ref<number[]>([])
const searchKeyword = ref('')

const searchResults = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return []
  const results: GoodsItem[] = []
  for (const section of menuList.value) {
    for (const good of section.goods) {
      if (good.name.toLowerCase().includes(kw)) results.push(good)
    }
  }
  return results
})

const drinkImages = ['/static/桂花乌龙.jpg', '/static/桑葚爆柠茶.jpg', '/static/抹茶牛奶.jpg']
const dessertImage = '/static/杨枝甘露.jpg'
const mangoImage = '/static/多芒捞小丸子.jpg'
const pastaImage = '/static/黑椒肉酱意面.jpg'

const tabList = ref([
  { id: 1, title: '茶饮果汁' },
  { id: 2, title: '甜品糖水' },
  { id: 3, title: '面食小吃' },
])

const menuList = ref<MenuSection[]>([
  {
    id: 'menu-0',
    title: '茶饮果汁',
    goods: [
      { id: 101, name: '茉莉', price: 6, pic: drinkImages[0], desc: '清香茶底，适合解腻' },
      { id: 102, name: '冰红茶', price: 6, pic: drinkImages[1], desc: '经典清爽，冰饮更顺口' },
      { id: 103, name: '冰绿茶', price: 6, pic: drinkImages[2], desc: '茶感更轻，回甘明显' },
      { id: 104, name: '四季春', price: 7, pic: drinkImages[0], desc: '花香明显，口感柔和' },
      { id: 105, name: '白桃乌龙', price: 7, pic: drinkImages[1], desc: '果香与茶香更平衡' },
      { id: 106, name: '柠檬红茶', price: 7, pic: drinkImages[2], desc: '酸甜清亮，适合夏天' },
      { id: 107, name: '柠檬绿茶', price: 7, pic: drinkImages[0], desc: '清爽解腻，入口更轻盈' },
      { id: 108, name: '梅子红茶', price: 7, pic: drinkImages[1], desc: '带一点梅香的酸甜感' },
      { id: 109, name: '梅子绿茶', price: 7, pic: drinkImages[2], desc: '茶底清爽，果香突出' },
      { id: 110, name: '百香果红茶', price: 10, pic: drinkImages[0], desc: '热带果香很足' },
      { id: 111, name: '百香果绿茶', price: 10, pic: drinkImages[1], desc: '清新果茶，酸甜平衡' },
      { id: 112, name: '柠檬水', price: 7, pic: drinkImages[2], desc: '简单清爽，适合解渴' },
      { id: 113, name: '百香果水', price: 10, pic: drinkImages[0], desc: '果味更浓，酸甜感明显' },
      { id: 114, name: '苹果汁', price: 10, pic: drinkImages[1], desc: '果香柔和，适合小朋友' },
      { id: 115, name: '西瓜汁', price: 10, pic: drinkImages[2], desc: '清凉爽口，解暑首选' },
      { id: 116, name: '芒果汁', price: 10, pic: drinkImages[0], desc: '果肉香甜，芒香更足' },
      { id: 117, name: '葡萄汁', price: 10, pic: drinkImages[1], desc: '酸甜清新，果香浓郁' },
      { id: 118, name: '苹果百香果汁', price: 12, pic: drinkImages[2], desc: '苹果清甜配百香果更开胃' },
      { id: 119, name: '芒果百香果汁', price: 12, pic: drinkImages[0], desc: '果香层次更丰富' },
    ],
  },
  {
    id: 'menu-1',
    title: '甜品糖水',
    goods: [
      { id: 201, name: '椰奶西米露', price: 7, pic: dessertImage, desc: '椰香轻甜，口感顺滑' },
      { id: 202, name: '牛奶西米露', price: 10, pic: dessertImage, desc: '奶香柔和，适合当作小甜品' },
      { id: 203, name: '芒果西米露', price: 10, pic: mangoImage, desc: '果香更足，清甜解腻' },
      { id: 204, name: '芒果椰奶西米露', price: 10, pic: mangoImage, desc: '芒果和椰奶搭配更浓郁' },
      { id: 205, name: '杨枝甘露', price: 16, pic: dessertImage, desc: '店内招牌，酸甜清爽' },
      { id: 206, name: '多芒捞小丸子', price: 16, pic: mangoImage, desc: '芒果丰富，小丸子更有口感' },
      { id: 207, name: '杨枝甘露小丸子', price: 18, pic: dessertImage, desc: '招牌升级版，口感更丰富' },
      { id: 208, name: '芒果牛奶', price: 16, pic: mangoImage, desc: '奶香和果香都很明显' },
      { id: 209, name: '苹果牛奶', price: 16, pic: dessertImage, desc: '清甜不腻，适合冰饮' },
      { id: 210, name: '牛油果奶昔', price: 25, pic: dessertImage, desc: '绵密顺滑，饱腹感更强' },
    ],
  },
  {
    id: 'menu-2',
    title: '面食小吃',
    goods: [
      { id: 301, name: '牛杂面（XO酱老挝）', price: 17, pic: pastaImage, desc: '酱香更足，口味偏浓郁' },
      { id: 302, name: '牛杂面（XO酱外婆）', price: 17, pic: pastaImage, desc: '家常风味，口感更顺口' },
      { id: 303, name: '乌冬面', price: 10, pic: pastaImage, desc: '面条更弹，适合轻口味' },
      { id: 304, name: '火鸡面', price: 10, pic: pastaImage, desc: '辣味更明显，越吃越上头' },
      { id: 305, name: '辛拉面', price: 10, pic: pastaImage, desc: '韩式泡面口感，香辣开胃' },
      { id: 306, name: '番茄意面', price: 16, pic: pastaImage, desc: '番茄酸甜，适合大众口味' },
      { id: 307, name: '培根番茄意面', price: 16, pic: pastaImage, desc: '培根咸香，番茄味更浓' },
      { id: 308, name: '黑椒肉酱意面', price: 12, pic: pastaImage, desc: '黑椒和肉酱融合，口味偏香浓' },
      { id: 309, name: '黑椒香肠意面', price: 16, pic: pastaImage, desc: '香肠更有嚼劲，黑椒味突出' },
      { id: 310, name: '黑椒培根意面', price: 18, pic: pastaImage, desc: '培根油香更足，适合重口一点' },
      { id: 311, name: '西多士', price: 5, pic: pastaImage, desc: '小吃加点更合适，香甜软糯' },
    ],
  },
])

const { cartList, totalCount, totalPrice, addToCart, updateCartItemNum, clearCart } =
  useCartStore()

const addCart = (good: GoodsItem) => {
  addToCart(good)
  // uni.showToast({ title: '已加入购物车', icon: 'none' })
}

const openPopup = () => {
  popupRef.value?.open('bottom')
}

let scrollLocked = false

const clickTab = (index: number) => {
  currentIndex.value = index
  scrollLocked = true
  const targetId = menuList.value[index]?.id ?? 'menu-0'
  toView.value = ''
  setTimeout(() => {
    toView.value = targetId
  }, 50)
  // 动画结束后恢复滚动监听
  setTimeout(() => {
    scrollLocked = false
  }, 500)
}

const onRightScroll = (e: { detail: { scrollTop: number } }) => {
  if (scrollLocked) return
  const scrollTop = e.detail.scrollTop
  const matchedIndex = sectionScrollTopList.value.findIndex((top, index) => {
    const nextTop = sectionScrollTopList.value[index + 1] ?? Number.POSITIVE_INFINITY
    return scrollTop >= top && scrollTop < nextTop
  })

  if (matchedIndex >= 0) {
    currentIndex.value = matchedIndex
  }
}

const changeCartNum = (id: number, value: number | string) => {
  const nextValue = Number(value)
  if (Number.isNaN(nextValue)) return
  updateCartItemNum(id, nextValue)
}

const toCheck = () => {
  if (totalCount.value <= 0) {
    uni.showToast({ title: '请先选择商品', icon: 'none' })
    return
  }

  uni.switchTab({
    url: '/pages/cart/cart',
  })
}

const querySectionOffsets = () => {
  const query = uni.createSelectorQuery()
  menuList.value.forEach((item) => {
    query.select(`#${item.id}`).boundingClientRect()
  })

  query.exec((result) => {
    const tops = (result || []).map((rect) => rect?.top ?? 0)
    const baseTop = tops[0] ?? 0
    sectionScrollTopList.value = tops.map((top) => Math.max(top - baseTop, 0))
  })
}

onReady(() => {
  querySectionOffsets()
  // 等待图片加载完成后重新计算，避免图片撑高导致偏移量不准
  setTimeout(querySectionOffsets, 800)
})
</script>

<style scoped lang="scss">
.container {
  display: flex;
  height: 100vh;
  padding-top: 104rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #fffdf0 0%, #f3f8de 100%);
}

.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 20rpx 24rpx 16rpx;
  background: rgba(255, 253, 240, 0.96);
  backdrop-filter: blur(8px);
}

.search-box {
  height: 76rpx;
  border-radius: 999rpx;
  background: #fffef6;
  border: 2rpx solid #e8efbd;
  display: flex;
  align-items: center;
  padding: 0 26rpx;
  box-shadow: 0 8rpx 18rpx rgba(177, 198, 111, 0.08);
}

.search-icon {
  font-size: 26rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: #4f5e28;
}

.search-clear {
  font-size: 28rpx;
  color: #999;
  padding-left: 16rpx;
}

.search-result {
  position: fixed;
  top: calc(var(--window-top, 0px) + 112rpx);
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #fffdf0 0%, #f2f8dd 100%);
}

.empty-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #55662b;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #95a064;
}

.left-tabs {
  width: 168rpx;
  background: #eff4cf;
}

.tab-item {
  min-height: 108rpx;
  padding: 24rpx 12rpx;
  text-align: center;
  font-size: 28rpx;
  color: #6a7940;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.4;
}

.tab-item.active {
  background: #fffef7;
  color: #7cad58;
  border-left: 6rpx solid #8eb765;
  font-weight: 600;
}

.right-content {
  height: 100%;
  flex: 1;
  background: transparent;
}

.menu-section {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 20rpx;
  color: #56662c;
}

.goods-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.88);
  padding: 20rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 24rpx rgba(177, 198, 111, 0.1);
}

.goods-item image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 18rpx;
  margin-right: 20rpx;
}

.info {
  flex: 1;
}

.name {
  font-size: 28rpx;
  color: #455426;
  font-weight: 600;
}

.desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #7e8857;
  line-height: 1.5;
}

.price {
  font-size: 32rpx;
  color: #7eb05a;
  font-weight: 700;
  display: block;
  margin-top: 12rpx;
}

.cart-btn {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #f5e98e 0%, #8eb765 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.cart-footer {
  z-index: 9999;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  min-height: 108rpx;
  padding: 0 30rpx;
  background: rgba(255, 254, 245, 0.96);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  box-shadow: 0 -6rpx 24rpx rgba(177, 198, 111, 0.12);
}

.cart-footer-center {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  height: 108rpx;
}

.check-area {
  display: flex;
  align-items: center;
  color: #67763d;
  font-size: 28rpx;
  line-height: 72rpx;
  height: 72rpx;
}

.left {
  display: flex;
  align-items: center;
}

.left-price {
  font-size: 32rpx;
  padding-left: 10rpx;
  line-height: 72rpx;
}

.right {
  display: flex;
  align-items: center;
  gap: 16rpx;
  height: 72rpx;
}

.total {
  display: flex;
  align-items: center;
  color: #56662c;
  font-size: 28rpx;
  line-height: 72rpx;
  height: 72rpx;
}

.cart-footer-center .price {
  margin-top: 0;
  display: inline;
}

.pay {
  width: 240rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #f7e98f 0%, #8eb765 100%);
  color: #fffef7;
  border-radius: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
}

.pay.disabled {
  background: #cfd6b0;
}

.content-box {
  margin-bottom: 30rpx;
}

.desc-box {
  padding: 0 20rpx 20rpx;
  max-height: 50vh;
}

.none-cart {
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 24rpx;
}

.none-cart .icon {
  font-size: 48rpx;
  color: #c2ca96;
  margin-bottom: 24rpx;
}

.none-cart .title {
  font-size: 32rpx;
  font-weight: 500;
  color: #55662b;
  text-align: center;
  margin-bottom: 16rpx;
}

.none-cart .subtitle {
  font-size: 28rpx;
  color: #96a161;
  text-align: center;
}

.top {
  display: flex;
  justify-content: space-between;
  padding: 22rpx;
  border-bottom: 1rpx solid #eef2cf;
  color: #56662c;
}

.clear-btn {
  color: #8aac64;
}

.popup-item {
  margin-top: 18rpx;
  margin-bottom: 0;
  background: #fffef8;
}
</style>
