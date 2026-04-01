import { ref, watch } from 'vue'

export interface OrderItem {
  id: number
  name: string
  price: number
  pic: string
  num: number
  desc?: string
}

export interface Order {
  orderId: string
  items: OrderItem[]
  totalPrice: number
  deliveryType: number // 0=自提 1=配送
  pickTime: string
  address: string
  remark: string
  status: string // 待付款 | 已付款 | 待发货 | 待收货 | 已完成
  createTime: string
}

const STORAGE_KEY = 'order-list'

function loadOrders(): Order[] {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const orderList = ref<Order[]>(loadOrders())

function addOrder(order: Order) {
  orderList.value.unshift(order)
}

function generateOrderId(): string {
  const now = new Date()
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return date + rand
}

watch(
  orderList,
  (value) => {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true },
)

export function useOrderStore() {
  return {
    orderList,
    addOrder,
    generateOrderId,
  }
}
