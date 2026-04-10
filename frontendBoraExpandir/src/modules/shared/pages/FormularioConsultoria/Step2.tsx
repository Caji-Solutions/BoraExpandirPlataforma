import React from 'react'
import { _inputClass, _labelClass, YesNoQuestion } from './YesNoQuestion'

interface Step2Props {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (field: string, value: string) => void;
  prevStep: () => void;
  nextStep: () => void;
  filhosAnswer: 'yes' | 'no' | null;
  setFilhosAnswer: (v: 'yes' | 'no' | null) => void;
  familiaresEspanhaAnswer: 'yes' | 'no' | null;
  setFamiliaresEspanhaAnswer: (v: 'yes' | 'no' | null) => void;
  cnhAnswer: 'yes' | 'no' | null;
  setCnhAnswer: (v: 'yes' | 'no' | null) => void;
  propostaTrabalhoAnswer: 'yes' | 'no' | null;
  setPropostaTrabalhoAnswer: (v: 'yes' | 'no' | null) => void;
  vistoUeAnswer: 'yes' | 'no' | null;
  setVistoUeAnswer: (v: 'yes' | 'no' | null) => void;
  trabalhoDestacadoAnswer: 'yes' | 'no' | null;
  setTrabalhoDestacadoAnswer: (v: 'yes' | 'no' | null) => void;
  filhosEuropeusAnswer: 'yes' | 'no' | null;
  setFilhosEuropeusAnswer: (v: 'yes' | 'no' | null) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function Step2({
  formData,
  handleChange,
  handleCheckboxChange,
  prevStep,
  nextStep,
  filhosAnswer,
  setFilhosAnswer,
  familiaresEspanhaAnswer,
  setFamiliaresEspanhaAnswer,
  cnhAnswer,
  setCnhAnswer,
  propostaTrabalhoAnswer,
  setPropostaTrabalhoAnswer,
  vistoUeAnswer,
  setVistoUeAnswer,
  trabalhoDestacadoAnswer,
  setTrabalhoDestacadoAnswer,
  filhosEuropeusAnswer,
  setFilhosEuropeusAnswer,
  setFormData
}: Step2Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Estado Civil */}
      <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
        <label className={_labelClass}>💍 Qual seu estado civil? *</label>
        <select
          value={formData.estado_civil[0] || ''}
          onChange={e => setFormData((prev: any) => ({ ...prev, estado_civil: [e.target.value] }))}
          className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white cursor-pointer focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        >
          <option value="" className="bg-neutral-800 text-white">Selecione...</option>
          <option value="Solteiro(a)" className="bg-neutral-800 text-white">Solteiro(a)</option>
          <option value="Namorando" className="bg-neutral-800 text-white">Namorando</option>
          <option value="Noivo(a)" className="bg-neutral-800 text-white">Noivo(a)</option>
          <option value="Casado(a)" className="bg-neutral-800 text-white">Casado(a)</option>
          <option value="Amasiado" className="bg-neutral-800 text-white">Amasiado (sem registro)</option>
          <option value="União Estável" className="bg-neutral-800 text-white">União Estável (com registro em cartório)</option>
          <option value="Divorciado(a)" className="bg-neutral-800 text-white">Divorciado(a)</option>
          <option value="Separado(a)" className="bg-neutral-800 text-white">Separado(a) (sem divórcio)</option>
        </select>
      </div>

      {/* Família e Documentos */}
      <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">👨‍👩‍👧 Família e Documentos</h2>
        <YesNoQuestion
          label="Possui filhos? Se sim, quantos e idade? *"
          value={filhosAnswer}
          onYes={() => {
            setFilhosAnswer('yes')
            setFormData((prev: any) => ({ ...prev, filhos_qtd_idades: '' }))
          }}
          onNo={() => {
            setFilhosAnswer('no')
            setFormData((prev: any) => ({ ...prev, filhos_qtd_idades: 'Não tenho filhos' }))
          }}
        >
          <textarea name="filhos_qtd_idades" value={formData.filhos_qtd_idades} onChange={handleChange} className={_inputClass + ' min-h-[80px]'} placeholder="Ex: 2 filhos, 5 e 8 anos" />
        </YesNoQuestion>
        <YesNoQuestion
          label="Possui familiares que mora na Espanha? Se sim qual o grau de parentesco e qual tipo de residência eles possuem aqui? *"
          value={familiaresEspanhaAnswer}
          onYes={() => {
            setFamiliaresEspanhaAnswer('yes')
            setFormData((prev: any) => ({ ...prev, familiares_espanha: '' }))
          }}
          onNo={() => {
            setFamiliaresEspanhaAnswer('no')
            setFormData((prev: any) => ({ ...prev, familiares_espanha: 'Não tenho familiares na Espanha' }))
          }}
        >
          <textarea name="familiares_espanha" value={formData.familiares_espanha} onChange={handleChange} className={_inputClass + ' min-h-[80px]'} placeholder="Ex: Irmão com residência permanente" />
        </YesNoQuestion>
        <YesNoQuestion
          label="Você possui CNH? Se sim, informe qual a categoria e qual ano você obteve."
          value={cnhAnswer}
          onYes={() => {
            setCnhAnswer('yes')
            setFormData((prev: any) => ({ ...prev, possui_cnh_categoria_ano: '' }))
          }}
          onNo={() => {
            setCnhAnswer('no')
            setFormData((prev: any) => ({ ...prev, possui_cnh_categoria_ano: 'Não possuo' }))
          }}
        >
          <input
            name="possui_cnh_categoria_ano"
            value={formData.possui_cnh_categoria_ano}
            onChange={handleChange}
            className={_inputClass}
            placeholder="Ex: Categoria B, 2015"
          />
        </YesNoQuestion>
        <YesNoQuestion
          label="Você já tem uma proposta de trabalho na Espanha? Se sim, qual o tipo de contrato, salário e cargo?"
          value={propostaTrabalhoAnswer}
          onYes={() => {
            setPropostaTrabalhoAnswer('yes')
            setFormData((prev: any) => ({ ...prev, proposta_trabalho_espanha: '' }))
          }}
          onNo={() => {
            setPropostaTrabalhoAnswer('no')
            setFormData((prev: any) => ({ ...prev, proposta_trabalho_espanha: 'Não' }))
          }}
        >
          <textarea
            name="proposta_trabalho_espanha"
            value={formData.proposta_trabalho_espanha}
            onChange={handleChange}
            className={_inputClass + ' min-h-[80px]'}
            placeholder="Ex: Contrato CLT, 2000€/mês, cargo de Engenheiro"
          />
        </YesNoQuestion>
        <YesNoQuestion
          label="Você tem algum tipo de visto, residência ou nacionalidade de outro país da União Europeia? *"
          value={vistoUeAnswer}
          onYes={() => {
            setVistoUeAnswer('yes')
            setFormData((prev: any) => ({ ...prev, visto_ue: '' }))
          }}
          onNo={() => {
            setVistoUeAnswer('no')
            setFormData((prev: any) => ({ ...prev, visto_ue: 'Não tenho' }))
          }}
        >
          <textarea name="visto_ue" value={formData.visto_ue} onChange={handleChange} className={_inputClass + ' min-h-[80px]'} placeholder="Ex: Tenho residência portuguesa" />
        </YesNoQuestion>
        <YesNoQuestion
          label="Você trabalha na Espanha como destacado/transladado por uma empresa de outro país da União Europeia?"
          value={trabalhoDestacadoAnswer}
          onYes={() => {
            setTrabalhoDestacadoAnswer('yes')
            setFormData((prev: any) => ({ ...prev, trabalho_destacado_ue: '' }))
          }}
          onNo={() => {
            setTrabalhoDestacadoAnswer('no')
            setFormData((prev: any) => ({ ...prev, trabalho_destacado_ue: 'Não' }))
          }}
        >
          <input
            name="trabalho_destacado_ue"
            value={formData.trabalho_destacado_ue}
            onChange={handleChange}
            className={_inputClass}
            placeholder="Ex: Empresa portuguesa prestando serviço na Espanha"
          />
        </YesNoQuestion>
        <YesNoQuestion
          label="Você tem algum filho menor de idade que tem nacionalidade europeia? *"
          value={filhosEuropeusAnswer}
          onYes={() => {
            setFilhosEuropeusAnswer('yes')
            setFormData((prev: any) => ({ ...prev, filhos_nacionalidade_europeia: '' }))
          }}
          onNo={() => {
            setFilhosEuropeusAnswer('no')
            setFormData((prev: any) => ({ ...prev, filhos_nacionalidade_europeia: 'Não tenho' }))
          }}
        >
          <textarea name="filhos_nacionalidade_europeia" value={formData.filhos_nacionalidade_europeia} onChange={handleChange} className={_inputClass + ' min-h-[80px]'} placeholder="Ex: Sim, filho de 7 anos com passaporte espanhol" />
        </YesNoQuestion>
      </div>

      {/* Pretende Autônomo */}
      <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">🏢 Você pretende trabalhar como autônomo, abrir um negócio/empreender, assim que chegar na Espanha? *</h2>
        {[
          'Sim. Tenho experiência/formação na área. Tenho investimento inicial',
          'Sim. Mas não tenho experiência/formação na área. Tenho investimento',
          'Sim. Mas não tenho experiência/formação. Não tenho investimento',
          'Não pretendo agora mas em futuro quem sabe',
          'Não pretendo',
        ].map(opcao => (
          <label key={opcao} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="radio"
              name="pretende_autonomo"
              checked={formData.pretende_autonomo === opcao}
              onChange={() => setFormData((prev: any) => ({ ...prev, pretende_autonomo: opcao }))}
              className="mt-0.5 w-4 h-4 accent-blue-500 flex-shrink-0"
            />
            <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{opcao}</span>
          </label>
        ))}
      </div>

      {/* Navegação */}
      <div className="flex justify-between pt-4">
        <button type="button" onClick={prevStep} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold transition-all active:scale-[0.98]">
          ← Anterior
        </button>
        <button type="button" onClick={nextStep} className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25">
          Próximo →
        </button>
      </div>
    </div>
  )
}
