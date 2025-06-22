import { createSystem, defaultConfig, defineConfig, defineTextStyles, defineTokens } from "@chakra-ui/react"
const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "brand",
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#ffffff" },
          100: { value: "#ffffff" },
          200: { value: "#9faeea" },
          300: { value: "#7a8fe0" },
          400: { value: "#566fd7" },
          500: { value: "#3c56bd" },
          600: { value: "#2B3E8F" },
          700: { value: "#243574" },
          800: { value: "#1c2b5a" },
          900: { value: "#141f3f" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "{colors.brand.100}" },
          fg: { value: "{colors.brand.700}" },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.200}" },
          emphasized: { value: "{colors.brand.300}" },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
})

const theme = createSystem(defaultConfig,config)

export default theme;