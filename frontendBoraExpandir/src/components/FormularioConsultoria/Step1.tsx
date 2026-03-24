import React from 'react'
import { _inputClass, _labelClass, YesNoQuestion } from './YesNoQuestion'

interface Step1Props {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  nextStep: () => void;
  preNome: string;
  preEmail: string;
  preTelefone: string;
  europeAnswer: 'yes' | 'no' | null;
  setEuropeAnswer: (v: 'yes' | 'no' | null) => void;
  residenciaAnswer: 'yes' | 'no' | null;
  setResidenciaAnswer: (v: 'yes' | 'no' | null) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function Step1({
  formData,
  handleChange,
  nextStep,
  preNome,
  preEmail,
  preTelefone,
  europeAnswer,
  setEuropeAnswer,
  residenciaAnswer,
  setResidenciaAnswer,
  setFormData
}: Step1Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Identificação */}
      <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">👤 Identificação</h2>
        <div>
          <label className={_labelClass}>Nome completo *</label>
          <input name="nome_completo" value={formData.nome_completo} onChange={handleChange} className={_inputClass + (preNome ? ' opacity-70' : '')} placeholder="Seu nome completo" readOnly={!!preNome} />
        </div>
        <div>
          <label className={_labelClass}>Você foi indicado(a) por algum parceiro(a)? Se sim, qual nome dele(a)?</label>
          <input name="parceiro_indicador" value={formData.parceiro_indicador} onChange={handleChange} className={_inputClass} placeholder="Deixe em branco se não foi indicado" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={_labelClass}>Qual seu email? *</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className={_inputClass + (preEmail ? ' opacity-70' : '')} placeholder="seuemail@exemplo.com" readOnly={!!preEmail} />
          </div>
          <div>
            <label className={_labelClass}>Qual seu número de WhatsApp com DDI? *</label>
            <input name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} className={_inputClass + (preTelefone ? ' opacity-70' : '')} placeholder="+55 11 99999-9999" readOnly={!!preTelefone} />
          </div>
        </div>
      </div>

      {/* Dados Pessoais */}
      <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">🌍 Dados Pessoais</h2>
        <div>
          <label className={_labelClass}>Qual sua nacionalidade? *</label>
          <textarea name="nacionalidade" value={formData.nacionalidade} onChange={handleChange} className={_inputClass + ' min-h-[80px]'} placeholder="Ex: Brasileira" />
        </div>
        <YesNoQuestion
          label="Você esteve na EUROPA nos últimos 6 meses? Se sim, quais as datas?"
          value={europeAnswer}
          onYes={() => {
            setEuropeAnswer('yes')
            setFormData((prev: any) => ({ ...prev, esteve_europa_6meses: '' }))
          }}
          onNo={() => {
            setEuropeAnswer('no')
            setFormData((prev: any) => ({ ...prev, esteve_europa_6meses: 'Não' }))
          }}
        >
          <textarea
            name="esteve_europa_6meses"
            value={formData.esteve_europa_6meses}
            onChange={handleChange}
            className={_inputClass + ' min-h-[80px]'}
            placeholder="Informe as datas (Ex: Março/2024 a Abril/2024)"
          />
        </YesNoQuestion>
        <YesNoQuestion
          label="Qual cidade e país reside hoje?"
          yesLabel="Já estou na Espanha"
          noLabel="Ainda no Brasil"
          value={residenciaAnswer}
          showChildrenOnBoth
          onYes={() => {
            setResidenciaAnswer('yes')
            setFormData((prev: any) => ({ ...prev, cidade_pais_residencia: '' }))
          }}
          onNo={() => {
            setResidenciaAnswer('no')
            setFormData((prev: any) => ({ ...prev, cidade_pais_residencia: '' }))
          }}
        >
          <textarea
            name="cidade_pais_residencia"
            value={formData.cidade_pais_residencia}
            onChange={handleChange}
            className={_inputClass + ' min-h-[80px]'}
            placeholder={residenciaAnswer === 'yes' ? "Ex: Madrid, Espanha (entrou em 15/03/2024)" : "Ex: São Paulo, Brasil"}
          />
        </YesNoQuestion>
      </div>

      {/* Navegação */}
      <div className="flex justify-end pt-4">
        <button type="button" onClick={nextStep} className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25">
          Próximo →
        </button>
      </div>
    </div>
  )
}
