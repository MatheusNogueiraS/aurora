import { addons } from "storybook/manager-api"
import { create } from "storybook/theming/create"

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Aurora",
    colorPrimary: "#fa6300",
    colorSecondary: "#462a71",
  }),
})
