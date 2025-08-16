import { GroupBag } from "../../interface/bag"
import { Box } from "@chakra-ui/react"
import { BagData } from "./PrintBag"

const PrintListBags = ({ componentPrintRef, bags }:
  { componentPrintRef: HTMLElement, bags: GroupBag[] | null }) => {
  return <Box ref={componentPrintRef} background={'white'}>
    {bags?.length ? bags.map(bag => <div className="page">
      <BagData bag={bag} />
    </div>) : null}
  </Box>
}

export default PrintListBags