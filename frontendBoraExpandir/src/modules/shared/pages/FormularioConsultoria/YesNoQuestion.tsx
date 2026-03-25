import React from 'react'

export const _inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
export const _labelClass = "block text-sm font-semibold text-gray-300 mb-1.5"

interface YesNoQuestionProps {
  label: string
  yesLabel?: string
  noLabel?: string
  value: 'yes' | 'no' | null
  onYes: () => void
  onNo: () => void
  children?: React.ReactNode
  showChildrenOnBoth?: boolean
}

export function YesNoQuestion({
  label,
  yesLabel = "Sim",
  noLabel = "Não",
  value,
  onYes,
  onNo,
  children,
  showChildrenOnBoth = false
}: YesNoQuestionProps) {
  const showChildren = showChildrenOnBoth ? value !== null : value === 'yes'
  return (
    <div className="space-y-3">
      <label className={_labelClass}>{label} *</label>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onYes}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            value === "yes" 
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
              : "bg-white/10 text-gray-300 hover:bg-white/15 border border-white/10"
          }`}
        >
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={onNo}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${
            value === "no" 
              ? "bg-red-500/80 text-white shadow-lg shadow-red-500/25" 
              : "bg-white/10 text-gray-300 hover:bg-white/15 border border-white/10"
          }`}
        >
          {noLabel}
        </button>
      </div>
      {showChildren && children && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}
