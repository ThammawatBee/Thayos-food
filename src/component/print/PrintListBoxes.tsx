import { Bag } from "../../interface/bag"
import { Box } from "@chakra-ui/react"
import sortBy from "lodash/sortBy";
import { types } from "../../utils/renderOrderMenu";
import { BoxData } from "./PrintBox";

const PrintListBoxes = ({ componentPrintRef, bags }:
  { componentPrintRef: HTMLElement, bags: Bag[] | null }) => {
  const indexMap = new Map(types.map((val, idx) => [val.value, idx]));
  return <Box ref={componentPrintRef} background={'white'}>
    {bags?.length ? bags.map(bag => sortBy(bag.orderItems, (item) =>
      indexMap.has(item.type) ? indexMap.get(item.type)! : Infinity).map(orderItem =>
        <div className="page">
          <BoxData bag={bag} orderItem={orderItem}/>
        </div>
      )) : null}
  </Box>
}

export default PrintListBoxes