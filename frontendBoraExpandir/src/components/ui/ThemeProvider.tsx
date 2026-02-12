import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar tema ao carregar a aplicação
    // Force light mode
    const html = document.documentElement
    html.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }, [])

  return <>{children}</>
}
