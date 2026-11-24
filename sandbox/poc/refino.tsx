import * as React from "react"

import { Switch } from "@/components/ui/switch"

// Chave de comparação da POC: liga e desliga o refinamento da auditoria de usabilidade.
// Não faz parte da plataforma; some quando a versão escolhida for consolidada.
const Ctx = React.createContext(true)
export const useRefino = () => React.useContext(Ctx)

const CHAVE = "poc-refinamento"
const salvo = () => {
  try {
    return localStorage.getItem(CHAVE) !== "0"
  } catch {
    return true
  }
}

export function RefinoProvider({ children }: { children: React.ReactNode }) {
  const [ligado, setLigado] = React.useState(salvo)
  const trocar = (v: boolean) => {
    setLigado(v)
    try {
      localStorage.setItem(CHAVE, v ? "1" : "0")
    } catch {
      /* sem armazenamento: a escolha vale só nesta aba */
    }
  }
  return (
    <Ctx.Provider value={ligado}>
      {children}
      <label className="fixed top-(--padding-sm) right-(--padding-sm) z-50 flex items-center gap-(--gap-sm) rounded-full border-sm border-dashed bg-warning-subtle px-(--padding-lg) py-(--padding-xs) text-label-xs text-warning shadow-lg">
        Refinamento
        <Switch size="sm" checked={ligado} onCheckedChange={trocar} />
      </label>
    </Ctx.Provider>
  )
}
