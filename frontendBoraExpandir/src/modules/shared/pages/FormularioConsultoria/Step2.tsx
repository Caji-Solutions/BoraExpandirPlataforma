import React from 'react'
import { _inputClass, _labelClass, YesNoQuestion } from './YesNoQuestion'

interface Step2Props {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (field: string, value: string) => void;
  prevStep: () => void;
  nextStep: () => void;
  semFilhos: boolean;
  setSemFilhos: (v: boolean) => void;
  semFamiliaresEspanha: boolean;
  setSemFamiliaresEspanha: (v: boolean) => void;
  cnhAnswer: 'yes' | 'no' | null;
  setCnhAnswer: (v: 'yes' | 'no' | null) => void;
  propostaTrabalhoAnswer: 'yes' | 'no' | null;
  setPropostaTrabalhoAnswer: (v: 'yes' | 'no' | null) => void;
  semVistoUe: boolean;
  setSemVistoUe: (v: boolean) => void;
  trabalhoDestacadoAnswer: 'yes' | 'no' | null;
  setTrabalhoDestacadoAnswer: (v: 'yes' | 'no' | null) => void;
  semFilhosEuropeus: boolean;
  setSemFilhosEuropeus: (v: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function Step2({
  formData,
  handleChange,
  handleCheckboxChange,
  prevStep,
  nextStep,
  semFilhos,
  setSemFilhos,
  semFamiliaresEspanha,
  setSemFamiliaresEspanha,
  cnhAnswer,
  setCnhAnswer,
  propostaTrabalhoAnswer,
  setPropostaTrabalhoAnswer,
  semVistoUe,
  setSemVistoUe,
  trabalhoDestacadoAnswer,
  setTrabalhoDestacadoAnswer,
  semFilhosEuropeus,
  setSemFilhosEuropeus,
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
          className={_inputClass + ' cursor-pointer appearance-none'}
        >
          <option value="">Selecione...</option>
          <option value="Solteiro(a)">Solteiro(a)</option>
          <option value="Namorando">Namorando</option>
          <option value="Noivo(a)">Noivo(a)</option>
          <option value="Casado(a)">Casado(a)</option>
          <option value="Amasiado">Amasiado (sem registro)</option>
          <option value="União Estável">União Estável (com registro em cartório)</option>
          <option value="Divorciado(a)">Divorciado(a)</option>
          <option value="Separado(a)">Separado(a) (sem divórcio)</option>
        </select>
      </div>

      {/* Família e Documentos */}
      <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">👨‍👩‍👧 Família e Documentos</h2>
        <div>
          <label className={_labelClass}>Possui filhos? Se sim, quantos e idade? *</label>
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              id="sem_filhos"
              checked={semFilhos}
              onChange={e => {
                setSemFilhos(e.target.checked)
                setFormData((prev: any) => ({
                  ...prev,
                  filhos_qtd_idades: e.target.checked ? 'Não tenho filhos' : ''
                }))
              }}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="sem_filhos" className="text-sm font-medium text-gray-300 cursor-pointer">Não tenho filhos</label>
          </div>
          {!semFilhos && (
            <div className="animate-in fade-in duration-200">
              <textarea name="filhos_qtd_idades" value={formData.filhos_qtd_idades} onChange={handleChange} className={_inputClass + ' min-h-[80px]'} placeholder="Ex: 2 filhos, 5 e 8 anos" />
            </div>
          )}
        </div>
        <div>
          <label className={_labelClass}>Possui familiares que mora na Espanha? Se sim qual o grau de parentesco e qual tipo de residência eles possuem aqui? *</label>
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              id="sem_familiares_espanha"
              checked={semFamiliaresEspanha}
              onChange={e => {
                setSemFamiliaresEspanha(e.target.checked)
                setFormData((prev: any) => ({
                  ...prev,
                  familiares_espanha: e.target.checked ? 'Não tenho familiares na Espanha' : ''
                }))
              }}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="sem_familiares_espanha" className="text-sm font-medium text-gray-300 cursor-pointer">Não tenho familiares na Espanha</label>
          </div>
          {!semFamiliaresEspanha && (
            <div className="animate-in fade-in duration-200">
              <textarea name="familiares_espanha" value={formData.familiares_espanha} onChange={handleChange} className={_inputClass + ' min-h-[80px]'} placeholder="Ex: Irmão com residência permanente" />
            </div>
          )}
        </div>
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
        <div>
          <label className={_labelClass}>Você tem algum tipo de visto, residência ou nacionalidade de outro país da União Europeia? *</label>
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              id="sem_visto_ue"
              checked={semVistoUe}
              onChange={e => {
                setSemVistoUe(e.target.checked)
                setFormData((prev: any) => ({
                  ...prev,
                  visto_ue: e.target.checked ? 'Não tenho' : ''
                }))
              }}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="sem_visto_ue" className="text-sm font-medium text-gray-300 cursor-pointer">Não tenho</label>
          </div>
          {!semVistoUe && (
            <div className="animate-in fade-in duration-200">
              <textarea name="visto_ue" value={formData.visto_ue} onChange={handleChange} className={_inputClass + ' min-h-[80px]'} placeholder="Ex: Tenho residência portuguesa" />
            </div>
          )}
        </div>
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
        <div>
          <label className={_labelClass}>Você tem algum filho menor de idade que tem nacionalidade europeia? *</label>
          <div className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              id="sem_filhos_europeus"
              checked={semFilhosEuropeus}
              onChange={e => {
                setSemFilhosEuropeus(e.target.checked)
                setFormData((prev: any) => ({
                  ...prev,
                  filhos_nacionalidade_europeia: e.target.checked ? 'Não tenho' : ''
                }))
              }}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="sem_filhos_europeus" className="text-sm font-medium text-gray-300 cursor-pointer">Não tenho</label>
          </div>
          {!semFilhosEuropeus && (
            <div className="animate-in fade-in duration-200">
              <textarea name="filhos_nacionalidade_europeia" value={formData.filhos_nacionalidade_europeia} onChange={handleChange} className={_inputClass + ' min-h-[80px]'} placeholder="Ex: Sim, filho de 7 anos com passaporte espanhol" />
            </div>
          )}
        </div>
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
              type="checkbox"
              checked={formData.pretende_autonomo.includes(opcao)}
              onChange={() => handleCheckboxChange('pretende_autonomo', opcao)}
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
