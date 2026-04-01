import { describe, it, expect } from 'vitest'
import { getPresetForCategoria, getClearedFieldsForSwitch, type ServiceCategoria } from '../ServiceCatalog'

describe('getPresetForCategoria', () => {
  it('consultoria → isAgendavel true, type agendavel, tipoPreco por_contrato', () => {
    const result = getPresetForCategoria('consultoria')
    expect(result.isAgendavel).toBe(true)
    expect(result.type).toBe('agendavel')
    expect(result.tipoPreco).toBe('por_contrato')
  })

  it('assessoria → isAgendavel false, type fixo, tipoPreco por_contrato', () => {
    const result = getPresetForCategoria('assessoria')
    expect(result.isAgendavel).toBe(false)
    expect(result.type).toBe('fixo')
    expect(result.tipoPreco).toBe('por_contrato')
  })

  it('diverso → isAgendavel false, type diverso', () => {
    const result = getPresetForCategoria('diverso')
    expect(result.isAgendavel).toBe(false)
    expect(result.type).toBe('diverso')
  })
})

describe('getClearedFieldsForSwitch', () => {
  it('consultoria → assessoria: limpa value, duration, tipoPreco', () => {
    const result = getClearedFieldsForSwitch('consultoria', 'assessoria')
    expect(result.value).toBe('')
    expect(result.duration).toBe('')
    expect(result.tipoPreco).toBe('por_contrato')
  })

  it('consultoria → diverso: reseta isAgendavel para false', () => {
    const result = getClearedFieldsForSwitch('consultoria', 'diverso')
    expect(result.isAgendavel).toBe(false)
  })

  it('assessoria → consultoria: limpa contratoTemplateId, tipoPreco', () => {
    const result = getClearedFieldsForSwitch('assessoria', 'consultoria')
    expect(result.contratoTemplateId).toBeNull()
    expect(result.tipoPreco).toBe('por_contrato')
  })

  it('assessoria → diverso: limpa contratoTemplateId', () => {
    const result = getClearedFieldsForSwitch('assessoria', 'diverso')
    expect(result.contratoTemplateId).toBeNull()
  })

  it('diverso → consultoria: seta isAgendavel true, limpa contratoTemplateId', () => {
    const result = getClearedFieldsForSwitch('diverso', 'consultoria')
    expect(result.isAgendavel).toBe(true)
    expect(result.contratoTemplateId).toBeNull()
  })

  it('diverso → assessoria: limpa value, duration, tipoPreco', () => {
    const result = getClearedFieldsForSwitch('diverso', 'assessoria')
    expect(result.value).toBe('')
    expect(result.duration).toBe('')
    expect(result.tipoPreco).toBe('por_contrato')
  })

  it('mesma categoria → retorna objeto vazio', () => {
    expect(getClearedFieldsForSwitch('consultoria', 'consultoria')).toEqual({})
    expect(getClearedFieldsForSwitch('assessoria', 'assessoria')).toEqual({})
    expect(getClearedFieldsForSwitch('diverso', 'diverso')).toEqual({})
  })

  it('nunca limpa documents nem subservices', () => {
    const transitions: Array<[ServiceCategoria, ServiceCategoria]> = [
      ['consultoria', 'assessoria'], ['consultoria', 'diverso'],
      ['assessoria', 'consultoria'], ['assessoria', 'diverso'],
      ['diverso', 'consultoria'],    ['diverso', 'assessoria'],
    ]
    for (const [from, to] of transitions) {
      const result = getClearedFieldsForSwitch(from, to)
      expect(result).not.toHaveProperty('documents')
      expect(result).not.toHaveProperty('subservices')
    }
  })
})
