import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@/index.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { App } from "./app"
import { RefinoProvider } from "./refino"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <ThemeProvider>
        <RefinoProvider><App /></RefinoProvider>
        <Toaster />
      </ThemeProvider>
    </TooltipProvider>
  </StrictMode>
)
