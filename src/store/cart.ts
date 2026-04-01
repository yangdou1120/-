import { computed, ref, watch } from 'vue'

export interface GoodsItem {
  id: number
  name: string
  price: number
  pic: string
  desc?: string
}

export interface CartItem extends GoodsItem {
  num: number
  checked: boolean
}

const STORAGE_KEY = 'cart-list'

function loadCartList() {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved) as CartItem[]
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item) =>
        typeof item?.id === 'number' &&
        typeof item?.name === 'string' &&
        typeof item?.price === 'number' &&
        typeof item?.pic === 'string' &&
        typeof item?.num === 'number' &&
        typeof item?.checked === 'boolean',
    )
  } catch {
    return []
  }
}

const cartList = ref<CartItem[]>(loadCartList())

const totalCount = computed(() =>
  cartList.value.reduce((sum, item) => sum + item.num, 0),
)

const totalPrice = computed(() =>
  cartList.value.reduce((sum, item) => sum + item.price * item.num, 0),
)

const selectedCount = computed(() =>
  cartList.value.filter((item) => item.checked).length,
)

const selectedTotalPrice = computed(() =>
  cartList.value
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.price * item.num, 0),
)

const isAllChecked = computed(
  () => cartList.value.length > 0 && cartList.value.every((item) => item.checked),
)

function addToCart(good: GoodsItem) {
  const existed = cartList.value.find((item) => item.id === good.id)
  if (existed) {
    existed.num += 1
    return
  }

  cartList.value.push({
    ...good,
    num: 1,
    checked: true,
  })
}

function updateCartItemNum(id: number, num: number) {
  const target = cartList.value.find((item) => item.id === id)
  if (!target) return

  if (num <= 0) {
    removeCartItem(id)
    return
  }

  target.num = num
}

function toggleCartItemChecked(id: number, checked: boolean) {
  const target = cartList.value.find((item) => item.id === id)
  if (!target) return
  target.checked = checked
}

function toggleAllCartItems(checked: boolean) {
  cartList.value.forEach((item) => {
    item.checked = checked
  })
}

function removeCartItem(id: number) {
  cartList.value = cartList.value.filter((item) => item.id !== id)
}

function clearCart() {
  cartList.value = []
}

function removeCheckedItems() {
  cartList.value = cartList.value.filter((item) => !item.checked)
}

watch(
  cartList,
  (value) => {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true },
)

export function useCartStore() {
  return {
    cartList,
    totalCount,
    totalPrice,
    selectedCount,
    selectedTotalPrice,
    isAllChecked,
    addToCart,
    updateCartItemNum,
    toggleCartItemChecked,
    toggleAllCartItems,
    removeCartItem,
    clearCart,
    removeCheckedItems,
  }
}
