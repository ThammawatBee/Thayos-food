import { Bag } from "../interface/bag"


export const types = [
  { text: 'มื้อเช้า', value: 'breakfast' },
  { text: 'ของว่างเช้า', value: 'breakfastSnack' },
  { text: 'มื้อกลางวัน', value: 'lunch' },
  { text: 'ของว่างกลางวัน', value: 'lunchSnack' },
  { text: 'มื้อเย็น', value: 'dinner' },
  { text: 'ของว่างเย็น', value: 'dinnerSnack' },
]

export const renderMenu = (bag: Bag) => {
  let text = ''
  types.forEach(type => {
    const items = bag.orderItems.filter(item => item.type === type.value)
    if (items.length) {
      text = text + `${type.text}(${items.length}) `
    }
  })
  return text
}