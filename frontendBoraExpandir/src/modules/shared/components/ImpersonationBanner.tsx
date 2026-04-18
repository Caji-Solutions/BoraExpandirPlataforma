import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function ImpersonationBanner() {
    const { impersonatedProfile, profile, setImpersonatedProfile } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    if (!impersonatedProfile || profile?.role !== 'super_admin') return null
    if (location.pathname.startsWith('/adm')) return null

    const handleStop = () => {
        setImpersonatedProfile(null)
        navigate('/adm')
    }

    return (
        <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-amber-950 shadow-md">
            <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Eye className="h-4 w-4 shrink-0" />
                    <span>
                        Visualizando como{' '}
                        <strong className="font-bold">{impersonatedProfile.full_name}</strong>
                        {' '}({impersonatedProfile.role})
                    </span>
                </div>
                <button
                    onClick={handleStop}
                    className="flex items-center gap-1.5 bg-amber-950 text-amber-100 hover:bg-amber-900 transition-colors px-3 py-1.5 rounded-md text-xs font-semibold"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Voltar ao Admin
                </button>
            </div>
        </div>
    )
}
