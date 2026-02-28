import { Bag } from "../../interface/bag"
import { Box } from "@chakra-ui/react"
import sortBy from "lodash/sortBy";
import { printTypes, types } from "../../utils/renderOrderMenu";
import { BoxData } from "./PrintBox";

const PrintListBoxes = ({ componentPrintRef, bags }:
  { componentPrintRef: HTMLElement, bags: Bag[] | null }) => {
  const indexMap = new Map(types.map((val, idx) => [val.value, idx]));
  const mealPriority: Record<string, number> = {
    breakfast: 0,
    lunch: 1,
    dinner: 2,
  }
  const bagTypePriority = (type: string) => {
    if (type === "HEALTHY") return 0
    if (type === "DIET") return 1
    return 2
  }
  let count = 0
  return <Box ref={componentPrintRef} background={'white'}>
    {bags?.length ? sortBy(bags, (bag) => bagTypePriority(bag.order.type)).map((bag) => {
      return sortBy(
        bag.orderItems.filter(orderItem => printTypes.includes(orderItem.type)),
        (item) => {
          if (bag.order.type === "HEALTHY" || bag.order.type === "DIET") {
            const mealIdx = mealPriority[item.type]
            if (mealIdx !== undefined) return mealIdx
          }
          return indexMap.has(item.type) ? indexMap.get(item.type)! : Infinity
        }
      ).map((orderItem) => {
        count = count + 1
        return <div className="page">
          <BoxData bag={bag} orderItem={orderItem} index={count} />
        </div>
      })
    }) : null}
  </Box>
}

export default PrintListBoxes
