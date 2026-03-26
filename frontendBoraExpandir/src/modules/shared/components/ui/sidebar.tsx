import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationsDropdown } from '@/modules/shared/components/NotificationsDropdown'
import { useAuth } from '@/contexts/AuthContext'

export type SidebarItem = {
  label: string
  to?: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: React.ReactNode
  disabled?: boolean
  children?: SidebarItem[]
}

export type SidebarGroup = {
  label?: string
  items: SidebarItem[]
}

type SidebarProps = {
  groups?: SidebarGroup[]
  sidebarOpen?: boolean
  setSidebarOpen?: (open: boolean) => void
  children?: React.ReactNode
  className?: string
}

// Component for rendering individual sidebar items (with support for expandable children)
function SidebarItemComponent({ item }: { item: SidebarItem }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { pathname } = useLocation()
  const Icon = item.icon

  // Check if any child is active
  const hasActiveChild = item.children?.some(child => pathname === child.to)

  // If item has children, render as expandable
  if (item.children && item.children.length > 0) {
    return (
      <li>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition',
            'hover:bg-sidebar-accent',
            hasActiveChild ? 'bg-sidebar-accent text-sidebar-primary' : 'text-foreground',
            item.disabled && 'opacity-50 pointer-events-none'
          )}
        >
          {Icon && (
            <Icon className={cn('h-4 w-4', hasActiveChild ? 'text-sidebar-primary' : 'text-muted-foreground')} />
          )}
          <span className="flex-1 truncate text-left">{item.label}</span>
          {item.badge}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {isExpanded && (
          <ul className="ml-6 mt-1 space-y-1">
            {item.children.map((child, idx) => (
              <SidebarItemComponent key={idx} item={child} />
            ))}
          </ul>
        )}
      </li>
    )
  }

  // Regular item with link
  if (!item.to) {
    return null
  }

  return (
    <li>
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
}


export function Sidebar({ groups, sidebarOpen = false, setSidebarOpen, children, className }: SidebarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [localSidebarOpen, setLocalSidebarOpen] = useState(false)
  const { impersonatedProfile, setImpersonatedProfile, profile, activeProfile } = useAuth()

  // Use props if provided, otherwise use local state
  const isOpen = sidebarOpen !== undefined ? sidebarOpen : localSidebarOpen
  const setOpen = setSidebarOpen || setLocalSidebarOpen

  const userName = activeProfile?.full_name || (typeof window !== 'undefined' && localStorage.getItem('userName')) || 'Usuário'
  const impersonatedClientId = typeof window !== 'undefined' ? localStorage.getItem('impersonatedClientId') : null
  const impersonatedClientName = typeof window !== 'undefined' ? localStorage.getItem('impersonatedClientName') : null

  const handleLogout = () => {
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('authToken')
      localStorage.removeItem('userName')
    } catch { }
    window.location.href = '/login'
  }

  // Se tiver children, renderizar com a nova estrutura
  if (children) {
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
            isOpen ? 'translate-x-0 z-30' : '-translate-x-full md:translate-x-0',
            className
          )}
          style={{} as React.CSSProperties}
        >
          {children}
        </aside>
      </>
    )
  }

  // Renderizar com grupos (estrutura antiga)
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
            <div className="flex items-center gap-1">
              <NotificationsDropdown />
              <button
                onClick={() => setOpen(false)}
                className="md:hidden p-1 rounded hover:bg-sidebar-accent transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground truncate">{userName}</div>
        </div>

        {/* Banner de impersonação — Super Admin visualizando como outro usuário */}
        {impersonatedProfile && (
          <div className="mx-3 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-xs text-amber-600 font-medium">Visualizando como:</p>
            <p className="text-sm text-amber-700 font-semibold truncate">
              {impersonatedProfile.full_name}
            </p>
            <button
              onClick={() => {
                setImpersonatedProfile(null)
                if (profile?.role === 'comercial' && profile?.is_supervisor) {
                  navigate('/comercial/supervisor')
                } else {
                  navigate('/adm')
                }
              }}
              className="mt-2 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              {profile?.role === 'comercial' ? 'Voltar a Minha Equipe' : 'Voltar ao Admin'}
            </button>
          </div>
        )}

        {/* Banner de impersonação - Super Admin visualizando como cliente */}
        {!impersonatedProfile && impersonatedClientId && activeProfile?.role === 'super_admin' && (
          <div className="mx-3 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-xs text-amber-600 font-medium">Visualizando como cliente:</p>
            <p className="text-sm text-amber-700 font-semibold truncate capitalize">
              {impersonatedClientName || 'Cliente'}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('impersonatedClientId')
                localStorage.removeItem('impersonatedClientName')
                // Se quisermos dar um refresh na tela para garantir voltar ao estado anterior ou redirecionar ao admin
                navigate('/adm/dna')
              }}
              className="mt-2 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Voltar ao Admin
            </button>
          </div>
        )}

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-2">
          {groups && groups.map((group, gi) => (
            <div key={gi} className="px-2">
              {group.label && (
                <div className="px-2 py-2 text-xs uppercase tracking-wide text-muted-foreground">{group.label}</div>
              )}
              <ul className="space-y-1">
                {group.items.map((item, ii) => (
                  <SidebarItemComponent key={`${gi}-${ii}`} item={item} />
                ))}
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

// Context para gerenciar estado da sidebar
import { createContext, useContext } from 'react'

interface SidebarContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    return { open: true, setOpen: () => {} }
  }
  return context
}

// Componentes compostos para compatibilidade com shadcn/ui
export function SidebarProvider({ children, open = true, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(open)

  return (
    <SidebarContext.Provider value={{ open: sidebarOpen, setOpen: (o) => { setSidebarOpen(o); onOpenChange?.(o) } }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-auto md:ml-64">{children}</div>
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <nav className="flex-1 overflow-y-auto py-2">{children}</nav>
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="px-2">{children}</div>
}

export function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2 py-2 text-xs uppercase tracking-wide text-muted-foreground">{children}</div>
}

export function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1">{children}</ul>
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1">{children}</ul>
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>
}

export function SidebarMenuButton({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; [key: string]: any }) {
  return (
    <button className="w-full rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent transition" {...props}>
      {children}
    </button>
  )
}

export default Sidebar
