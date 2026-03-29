import { describe, it, expect } from 'vitest';
import { extractLocalTimeMapping } from '../dateUtils';

describe('dateUtils - formatAgendamentoTZ (Testes de Persistência de Fuso Horário)', () => {

  it('deve manter 21:00 quando o backend retornar horário sem timezone (interpretado como BRT)', () => {
    const mockDbDateNoZ = '2026-03-30T21:00:00';
    const result = extractLocalTimeMapping(mockDbDateNoZ);

    expect(result.dataStr).toBe('2026-03-30');
    expect(result.horaStr).toBe('21:00');
  });

  it('deve extrair 18:00 BRT quando o backend retornar um horário em UTC formalmente exato com sufixo Z', () => {
    // Comportamento normal do javascript com padronização via toLocaleTimeString e timezone prefixado.
    const mockDbDateWithZ = '2026-03-30T21:00:00.000Z';
    const result = extractLocalTimeMapping(mockDbDateWithZ);

    expect(result.dataStr).toBe('2026-03-30');
    expect(result.horaStr).toBe('18:00');
  });

  it('deve extrair 18:00 BRT quando lidar com timestamp contendo timezone offset explícito (+00:00)', () => {
    const mockDbDateWithOffset = '2026-03-30T21:00:00+00:00';
    const result = extractLocalTimeMapping(mockDbDateWithOffset);

    expect(result.dataStr).toBe('2026-03-30');
    expect(result.horaStr).toBe('18:00');
  });

  it('deve extrair 22:30 BRT recuando a data para o dia exato do fuso na virada de mês', () => {
    // 01:30 da manhã UTC de 01/04 corresponde a 22:30 do dia 31/03 em BRT (UTC-3)
    const mockMonthTransition = '2026-04-01T01:30:00.000Z';
    const result = extractLocalTimeMapping(mockMonthTransition);

    expect(result.dataStr).toBe('2026-03-31');
    expect(result.horaStr).toBe('22:30');
  });
});
