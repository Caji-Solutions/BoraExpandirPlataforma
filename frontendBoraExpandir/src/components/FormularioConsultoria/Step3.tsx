import React from 'react'
import { _inputClass, _labelClass, YesNoQuestion } from './YesNoQuestion'

interface Step3Props {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (field: string, value: string) => void;
  prevStep: () => void;
  tipoVistoAnswer: 'yes' | 'no' | null;
  setTipoVistoAnswer: (v: 'yes' | 'no' | null) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function Step3({
  formData,
  handleChange,
  handleCheckboxChange,
  prevStep,
  tipoVistoAnswer,
  setTipoVistoAnswer,
  setFormData
}: Step3Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Disposto a estudar */}
      <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">📚 Você está disposto(a) a estudar na Espanha? *</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'Sim', label: 'Sim' },
            { value: 'Apenas se esse for o único jeito de ficar regular', label: 'Apenas se for o único jeito' },
            { value: 'Não. De jeito nenhum', label: 'Não' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData((prev: any) => ({ ...prev, disposto_estudar: opt.value }))}
              className={`py-3 px-4 rounded-xl font-medium text-sm text-center transition-all ${
                formData.disposto_estudar === opt.value
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pretende trabalhar */}
      <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">💼 Você pretende trabalhar na Espanha? *</h2>
        {[
          'Sim. Isso é essencial para mim.',
          'Não pretendo. Tenho renda para me manter sem precisar trabalhar.',
          'Tenho renda para me manter. Mas quero ter a opção de poder trabalhar.',
          'Depende. Tenho renda p/ me manter sem trabalhar mas preciso analisar.',
        ].map(opcao => (
          <label key={opcao} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.pretende_trabalhar_espanha.includes(opcao)}
              onChange={() => handleCheckboxChange('pretende_trabalhar_espanha', opcao)}
              className="mt-0.5 w-4 h-4 accent-blue-500 flex-shrink-0"
            />
            <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{opcao}</span>
          </label>
        ))}
      </div>

      {/* Escolaridade */}
      <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">🎓 Qual sua escolaridade? *</h2>
        {[
          'Ensino fundamental completo',
          'Ensino fundamental incompleto',
          'Ensino médio completo',
          'Ensino médio incompleto',
          'Ensino superior completo',
          'Ensino superior incompleto',
        ].map(opcao => (
          <label key={opcao} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.escolaridade.includes(opcao)}
              onChange={() => handleCheckboxChange('escolaridade', opcao)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{opcao}</span>
          </label>
        ))}
      </div>

      {/* Situação profissional */}
      <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">🏗️ Qual sua situação profissional atual? *</h2>
        {[
          'Desempregado(a)',
          'Aposentado/Pensionista',
          'Autônomo(atua sem CNPJ)',
          'Tem empresa(atua com CNPJ: MEI ME ou LTDA)',
          'Contrato CLT',
          'Funcionário(a) Público(a)',
        ].map(opcao => (
          <label key={opcao} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.situacao_profissional.includes(opcao)}
              onChange={() => handleCheckboxChange('situacao_profissional', opcao)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{opcao}</span>
          </label>
        ))}
      </div>

      {/* Textos longos */}
      <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">📝 Formação e Objetivos</h2>
        <div>
          <label className={_labelClass}>Qual sua área de formação? *</label>
          <textarea name="area_formacao" value={formData.area_formacao} onChange={handleChange} className={_inputClass + ' min-h-[80px]'} placeholder="Ex: Engenharia de Software, Medicina, Direito..." />
        </div>
        <div>
          <label className={_labelClass}>Qual sua profissão? Você trabalha Online ou Presencial? *</label>
          <textarea name="profissao_online_presencial" value={formData.profissao_online_presencial} onChange={handleChange} className={_inputClass + ' min-h-[80px]'} placeholder="Ex: Desenvolvedor Frontend, trabalho 100% remoto" />
        </div>
        <YesNoQuestion
          label="Você já tem ideia do tipo de visto ou residência que pretende solicitar? Se sim, qual?"
          value={tipoVistoAnswer}
          onYes={() => {
            setTipoVistoAnswer('yes')
            setFormData((prev: any) => ({ ...prev, tipo_visto_planejado: '' }))
          }}
          onNo={() => {
            setTipoVistoAnswer('no')
            setFormData((prev: any) => ({ ...prev, tipo_visto_planejado: 'Ainda não sei' }))
          }}
        >
          <textarea
            name="tipo_visto_planejado"
            value={formData.tipo_visto_planejado}
            onChange={handleChange}
            className={_inputClass + ' min-h-[80px]'}
            placeholder="Ex: Visto de trabalho por conta alheia"
          />
        </YesNoQuestion>
        <div>
          <label className={_labelClass}>Como podemos te ajudar na Consultoria? Deixe aqui as dúvidas que você deseja resolver. *</label>
          <textarea name="duvidas_consultoria" value={formData.duvidas_consultoria} onChange={handleChange} className={_inputClass + ' min-h-[120px]'} placeholder="Descreva aqui as principais dúvidas que deseja resolver na consultoria..." />
        </div>
      </div>

      {/* Navegação + Submit */}
      <div className="flex justify-between pt-4">
        <button type="button" onClick={prevStep} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold transition-all active:scale-[0.98]">
          ← Anterior
        </button>
        <button
          type="submit"
          className="px-10 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98]"
        >
          ✓ Finalizar e Enviar
        </button>
      </div>
      <p className="text-center text-gray-500 text-xs">
        Ao clicar em finalizar, sua conta será criada automaticamente e os dados de acesso serão enviados para seu email.
      </p>
    </div>
  )
}
