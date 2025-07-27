const BagHeader = [
  "id",
  "Basket",
]

export const checkErrorUploadHeader = (fileHeaders: string[] | undefined) => {
  if (!fileHeaders?.length) {
    return true
  }

  const missingHeaders = BagHeader.filter(
    (header) => !fileHeaders.includes(header)
  );

  if (missingHeaders.length > 0) {
    return true
  }
  return false
}