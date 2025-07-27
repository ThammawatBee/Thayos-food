import VerifyBag from "../component/VerifyBox"
import { Box, Text } from "@chakra-ui/react"
import { useState } from "react"

const VerifyPage = () => {
  const [mode, setMode] = useState('init')
  const renderSection = () => {
    if (mode === 'init') {
      return <Box display={'flex'} flexDirection={'column'}>
        <Box marginTop={"60px"} padding={"20px"} background={'#06B050'} borderRadius={'md'}
          onClick={() => {
            setMode("checkBox")
          }}
        >
          <Text color={'white'} fontWeight="bold" textStyle="lg" textAlign={'center'}>
            เช็คกล่องกับถุง
          </Text>
        </Box>
        <Box marginTop={"60px"} padding={"20px"} background={'#06B050'} borderRadius={'md'}
          onClick={() => {
            setMode("checkBag")
          }}
        >
          <Text color={'white'} fontWeight="bold" textStyle="lg" textAlign={'center'}>
            เช็คถุงกับตะกร้า
          </Text>
        </Box>
      </Box>
    }
    else if (mode === 'checkBox') {
      return <VerifyBag setMode={setMode} />
    }
    return <Box></Box>
  }

  return <Box height={'90vh'}>
    <Box background={'#4472C5'} padding={"30px"}>
      <Text color={'white'} fontWeight="bold" textStyle="lg" textAlign={'center'}>
        Checking program
      </Text>
    </Box>
    <Box padding={"20px"} height={"100%"}>
      {renderSection()}
    </Box>
  </Box>
}

export default VerifyPage