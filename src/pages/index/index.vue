<template>
  <scroll-view class="container" scroll-y>
    <view class="hero">
      <view class="hero-text">
        <text class="eyebrow">欢迎光临</text>
        <text class="title">毛豆工坊</text>
        <text class="subtitle">现做甜品、清爽果子、下午茶搭配都在这里</text>
      </view>
      <view class="hero-actions">
        <view class="primary-btn" @click="goToMenu">立即点单</view>
        <view class="secondary-btn" @click="goToCart">
          购物车
          <text v-if="totalCount > 0" class="badge">{{ totalCount }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <swiper class="banner" indicator-dots circular autoplay>
        <swiper-item v-for="item in bannerList" :key="item.title">
          <view class="banner-item">
            <image class="banner-image" :src="item.image" mode="aspectFill" />
            <view class="banner-overlay">
              <text class="banner-title">{{ item.title }}</text>
              <text class="banner-price">¥{{ item.price }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">今日推荐</text>
        <text class="section-link" @click="goToMenu">查看全部</text>
      </view>
      <view class="goods-list">
        <view
          v-for="item in recommendList"
          :key="item.id"
          class="goods-item"
          @click="goToMenu"
        >
          <image class="goods-cover" :src="item.pic" mode="aspectFill" />
          <view class="goods-content">
            <text class="goods-name">{{ item.name }}</text>
            <text class="goods-desc">{{ item.desc }}</text>
            <view class="goods-footer">
              <text class="goods-price">¥{{ item.price }}</text>
              <text class="goods-tag">{{ item.tag }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/store/cart'

const { totalCount } = useCartStore()

const bannerList = ref([
  { title: '多芒捞小丸子', price: 16, image: '/static/多芒捞小丸子.jpg' },
  { title: '杨枝甘露', price: 16, image: '/static/杨枝甘露.jpg' },
  { title: '黑椒肉酱意面', price: 12, image: '/static/黑椒肉酱意面.jpg' },
])

const picList = [
  '/static/桂花乌龙.jpg', '/static/桑葚爆柠茶.jpg', '/static/抹茶牛奶.jpg',
  '/static/杨枝甘露.jpg', '/static/多芒捞小丸子.jpg', '/static/黑椒肉酱意面.jpg',
]
const allGoods = [
  { id: 101, name: '茉莉', price: 6, desc: '清香茶底，适合解腻', tag: '茶饮' },
  { id: 102, name: '冰红茶', price: 6, desc: '经典清爽，冰饮更顺口', tag: '茶饮' },
  { id: 103, name: '冰绿茶', price: 6, desc: '茶感更轻，回甘明显', tag: '茶饮' },
  { id: 104, name: '四季春', price: 7, desc: '花香明显，口感柔和', tag: '茶饮' },
  { id: 105, name: '白桃乌龙', price: 7, desc: '果香与茶香更平衡', tag: '茶饮' },
  { id: 106, name: '柠檬红茶', price: 7, desc: '酸甜清亮，适合夏天', tag: '茶饮' },
  { id: 107, name: '柠檬绿茶', price: 7, desc: '清爽解腻，入口更轻盈', tag: '茶饮' },
  { id: 108, name: '梅子红茶', price: 7, desc: '带一点梅香的酸甜感', tag: '茶饮' },
  { id: 109, name: '梅子绿茶', price: 7, desc: '茶底清爽，果香突出', tag: '茶饮' },
  { id: 110, name: '百香果红茶', price: 10, desc: '热带果香很足', tag: '茶饮' },
  { id: 111, name: '百香果绿茶', price: 10, desc: '清新果茶，酸甜平衡', tag: '茶饮' },
  { id: 112, name: '柠檬水', price: 7, desc: '简单清爽，适合解渴', tag: '茶饮' },
  { id: 113, name: '百香果水', price: 10, desc: '果味更浓，酸甜感明显', tag: '茶饮' },
  { id: 114, name: '苹果汁', price: 10, desc: '果香柔和，适合小朋友', tag: '果汁' },
  { id: 115, name: '西瓜汁', price: 10, desc: '清凉爽口，解暑首选', tag: '果汁' },
  { id: 116, name: '芒果汁', price: 10, desc: '果肉香甜，芒香更足', tag: '果汁' },
  { id: 117, name: '葡萄汁', price: 10, desc: '酸甜清新，果香浓郁', tag: '果汁' },
  { id: 118, name: '苹果百香果汁', price: 12, desc: '苹果清甜配百香果更开胃', tag: '果汁' },
  { id: 119, name: '芒果百香果汁', price: 12, desc: '果香层次更丰富', tag: '果汁' },
  { id: 201, name: '椰奶西米露', price: 7, desc: '椰香轻甜，口感顺滑', tag: '甜品' },
  { id: 202, name: '牛奶西米露', price: 10, desc: '奶香柔和，适合当作小甜品', tag: '甜品' },
  { id: 203, name: '芒果西米露', price: 10, desc: '果香更足，清甜解腻', tag: '甜品' },
  { id: 204, name: '芒果椰奶西米露', price: 10, desc: '芒果和椰奶搭配更浓郁', tag: '甜品' },
  { id: 205, name: '杨枝甘露', price: 16, desc: '店内招牌，酸甜清爽', tag: '招牌' },
  { id: 206, name: '多芒捞小丸子', price: 16, desc: '芒果丰富，小丸子更有口感', tag: '热卖' },
  { id: 207, name: '杨枝甘露小丸子', price: 18, desc: '招牌升级版，口感更丰富', tag: '招牌' },
  { id: 208, name: '芒果牛奶', price: 16, desc: '奶香和果香都很明显', tag: '甜品' },
  { id: 209, name: '苹果牛奶', price: 16, desc: '清甜不腻，适合冰饮', tag: '甜品' },
  { id: 210, name: '牛油果奶昔', price: 25, desc: '绵密顺滑，饱腹感更强', tag: '甜品' },
  { id: 301, name: '牛杂面（XO酱老挝）', price: 17, desc: '酱香更足，口味偏浓郁', tag: '面食' },
  { id: 302, name: '牛杂面（XO酱外婆）', price: 17, desc: '家常风味，口感更顺口', tag: '面食' },
  { id: 303, name: '乌冬面', price: 10, desc: '面条更弹，适合轻口味', tag: '面食' },
  { id: 304, name: '火鸡面', price: 10, desc: '辣味更明显，越吃越上头', tag: '面食' },
  { id: 305, name: '辛拉面', price: 10, desc: '韩式泡面口感，香辣开胃', tag: '面食' },
  { id: 306, name: '番茄意面', price: 16, desc: '番茄酸甜，适合大众口味', tag: '主食' },
  { id: 307, name: '培根番茄意面', price: 16, desc: '培根咸香，番茄味更浓', tag: '主食' },
  { id: 308, name: '黑椒肉酱意面', price: 12, desc: '黑椒和肉酱融合，口味偏香浓', tag: '主食' },
  { id: 309, name: '黑椒香肠意面', price: 16, desc: '香肠更有嚼劲，黑椒味突出', tag: '主食' },
  { id: 310, name: '黑椒培根意面', price: 18, desc: '培根油香更足，适合重口一点', tag: '主食' },
  { id: 311, name: '西多士', price: 5, desc: '小吃加点更合适，香甜软糯', tag: '小吃' },
].map((item, i) => ({ ...item, pic: picList[i % picList.length] }))

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

const recommendList = ref(pickRandom(allGoods, 4))

const switchTab = (url: string) => {
  uni.switchTab({ url })
}

const goToMenu = () => switchTab('/pages/menu/menu')
const goToCart = () => switchTab('/pages/cart/cart')
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fffceb 0%, #f5f9df 52%, #eef7d8 100%);
}

.hero {
  margin: 24rpx;
  padding: 44rpx 34rpx;
  border-radius: 36rpx;
  background: linear-gradient(135deg, #f8eca4 0%, #dff1b4 54%, #bfe4a5 100%);
  color: #5b6b2f;
  box-shadow: 0 20rpx 42rpx rgba(177, 198, 111, 0.24);
}

.hero-text {
  display: flex;
  flex-direction: column;
}

.eyebrow {
  font-size: 26rpx;
  color: #7d8e47;
  letter-spacing: 4rpx;
}

.title {
  margin-top: 12rpx;
  font-size: 58rpx;
  font-weight: 700;
  color: #526126;
}

.subtitle {
  margin-top: 18rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: #61743a;
}

.hero-actions {
  display: flex;
  margin-top: 38rpx;
  gap: 20rpx;
}

.primary-btn,
.secondary-btn {
  height: 80rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.primary-btn {
  flex: 1;
  background: #8eb765;
  color: #fffef5;
  font-weight: 600;
}

.secondary-btn {
  min-width: 210rpx;
  background: rgba(255, 255, 255, 0.45);
  color: #607233;
  position: relative;
}

.badge {
  margin-left: 12rpx;
  min-width: 34rpx;
  height: 34rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  background: #fff6bf;
  color: #728432;
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.section {
  margin: 0 24rpx 24rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 12rpx 28rpx rgba(177, 198, 111, 0.12);
  backdrop-filter: blur(6px);
}

.banner {
  height: 320rpx;
  border-radius: 24rpx;
  overflow: hidden;
}

.banner-item {
  height: 100%;
  overflow: hidden;
  border-radius: 24rpx;
  position: relative;
}

.banner-image {
  width: 100%;
  height: 100%;
  display: block;
}

.banner-overlay {
  position: absolute;
  left: 22rpx;
  bottom: 46rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 252, 240, 0.88);
  box-shadow: 0 8rpx 18rpx rgba(0, 0, 0, 0.08);
}

.banner-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #5a6930;
}

.banner-price {
  font-size: 26rpx;
  font-weight: 700;
  color: #7eb05a;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #546329;
}

.section-link {
  font-size: 24rpx;
  color: #98a15c;
}

.goods-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.goods-item {
  border-radius: 20rpx;
  background: #fffef8;
  box-shadow: inset 0 0 0 2rpx #eff4cd;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.goods-cover {
  width: 100%;
  height: 180rpx;
  display: block;
}

.goods-content {
  padding: 16rpx 18rpx 18rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goods-name {
  font-size: 26rpx;
  color: #435324;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-desc {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #7a8550;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-footer {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goods-price {
  font-size: 28rpx;
  color: #7eb05a;
  font-weight: 700;
}

.goods-tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #f4f7d4;
  color: #8d9750;
  font-size: 18rpx;
}
</style>
