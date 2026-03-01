import { GroupBag } from "../../interface/bag"
import { Box } from "@chakra-ui/react"
import { BagData } from "./PrintBag"
import sortBy from "lodash/sortBy"

const PrintListBags = ({ componentPrintRef, bags }:
  { componentPrintRef: HTMLElement, bags: GroupBag[] | null }) => {
  return <Box ref={componentPrintRef} background={'white'}>
    {bags?.length ? sortBy(bags, (bag) => bag.order.type === "HEALTHY" ? 0 : 1).map((bag, index) => <div className="page">
      <BagData bag={bag} index={index + 1} />
    </div>) : null}
  </Box>
}

export default PrintListBags