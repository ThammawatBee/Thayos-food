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
          50: { value: "#fafafa" },
          100: { value: "#e6e4e4" },
          200: { value: "#ccc9c9" },
          300: { value: "#b3aeae" },
          400: { value: "#999393" },
          500: { value: "#807979" },
          600: { value: "#666060" },
          700: { value: "#4d4747" },
          800: { value: "#3f3939" },
          900: { value: "#373535" },
          950: { value: "#1c1b1b" },
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

const theme = createSystem(defaultConfig)

export default theme;