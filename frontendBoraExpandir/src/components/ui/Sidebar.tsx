import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SidebarItem = {
  label: string
  to: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: React.ReactNode
  disabled?: boolean
}

export type SidebarGroup = {
  label?: string
  items: SidebarItem[]
}

type SidebarProps = {
  groups: SidebarGroup[]
  sidebarOpen?: boolean
  setSidebarOpen?: (open: boolean) => void
}

export function Sidebar({ groups, sidebarOpen = false, setSidebarOpen }: SidebarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [localSidebarOpen, setLocalSidebarOpen] = useState(false)

  // Use props if provided, otherwise use local state
  const isOpen = sidebarOpen !== undefined ? sidebarOpen : localSidebarOpen
  const setOpen = setSidebarOpen || setLocalSidebarOpen

  const userName = (typeof window !== 'undefined' && localStorage.getItem('userName')) || 'Usuário'

  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userName')
    } catch {}
    navigate('/', { replace: true })
  }

  return (
    <>
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        data-sidebar-toggle="true"
        className={cn(
          'fixed left-0 top-0 h-screen w-64 shrink-0 border-r bg-sidebar background border-sidebar-border text-sidebar-foreground flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          isOpen ? 'translate-x-0 z-30' : '-translate-x-full md:translate-x-0'
        )}
        style={{} as React.CSSProperties}
      >
      <div className="px-3 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between gap-2 mb-2">
          <img
            src="/assets/bora-logo.png"
            alt="BoraExpandir"
            className="h-14 w-auto max-w-full"
          />
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 rounded hover:bg-sidebar-accent transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="text-xs text-muted-foreground truncate">{userName}</div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map((group, gi) => (
          <div key={gi} className="px-2">
            {group.label && (
              <div className="px-2 py-2 text-xs uppercase tracking-wide text-muted-foreground">{group.label}</div>
            )}
            <ul className="space-y-1">
              {group.items.map((item, ii) => {
                const Icon = item.icon
                return (
                  <li key={`${gi}-${ii}`}>
                    <NavLink
                      to={item.to}
                      end={true}
                      className={({ isActive }) => cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition',
                        'hover:bg-sidebar-accent',
                        isActive ? 'bg-sidebar-accent text-sidebar-primary' : 'text-foreground',
                        item.disabled && 'opacity-50 pointer-events-none'
                      )}
                    >
                      {({ isActive }) => (
                        <>
                          {Icon && (
                            <Icon className={cn('h-4 w-4', isActive ? 'text-sidebar-primary' : 'text-muted-foreground')} />
                          )}
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer padrão */}
      <div className="px-3 py-3 border-t border-sidebar-border mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-md px-3 py-2 text-sm bg-destructive/15 text-destructive hover:bg-destructive/25 transition"
        >
          Sair
        </button>
      </div>
    </aside>
    </>
  )
}

export default Sidebar
