# Badge Component

Componente padronizado de badge/tag para toda a plataforma Bora Expandir.

## Uso Básico

```tsx
import { Badge } from '@/components/ui/Badge';

// Exemplo simples
<Badge>Default</Badge>

// Com variante
<Badge variant="success">Aprovado</Badge>
<Badge variant="warning">Pendente</Badge>
<Badge variant="destructive">Rejeitado</Badge>
```

## Props

| Prop        | Tipo                                                                               | Obrigatório | Padrão      | Descrição                |
| ----------- | ---------------------------------------------------------------------------------- | ----------- | ----------- | ------------------------ |
| `variant`   | `'default' \| 'secondary' \| 'destructive' \| 'outline' \| 'success' \| 'warning'` | Não         | `'default'` | Variante de cor do badge |
| `className` | `string`                                                                           | Não         | `''`        | Classe CSS adicional     |
| `children`  | `ReactNode`                                                                        | Sim         | -           | Conteúdo do badge        |

## Variantes Disponíveis

### Default (Azul)

```tsx
<Badge variant="default">Em Análise</Badge>;
```

- **Cor**: Azul (`bg-blue-600`)
- **Uso**: Status padrão, informações gerais

### Secondary (Cinza)

```tsx
<Badge variant="secondary">Obrigatório</Badge>;
```

- **Cor**: Cinza (`bg-gray-200` / `dark:bg-neutral-700`)
- **Uso**: Informações secundárias, labels neutros

### Success (Verde)

```tsx
<Badge variant="success">Aprovado</Badge>
<Badge variant="success">Documento traduzido</Badge>
```

- **Cor**: Verde (`bg-green-600`)
- **Uso**: Status positivos, aprovações, conclusões

### Warning (Amarelo)

```tsx
<Badge variant="warning">Aguardando tradução</Badge>
<Badge variant="warning">Pendente</Badge>
```

- **Cor**: Amarelo (`bg-yellow-600`)
- **Uso**: Avisos, status de atenção, pendências

### Destructive (Vermelho)

```tsx
<Badge variant="destructive">Rejeitado</Badge>
<Badge variant="destructive">Cancelado</Badge>
```

- **Cor**: Vermelho (`bg-red-600`)
- **Uso**: Erros, rejeições, cancelamentos

### Outline (Borda)

```tsx
<Badge variant="outline">Rascunho</Badge>;
```

- **Cor**: Borda cinza com texto escuro
- **Uso**: Status neutros, rascunhos

## Exemplos de Uso por Contexto

### Status de Documentos

```tsx
<Badge variant="secondary">Obrigatório</Badge>
<Badge variant="warning">Aguardando Envio</Badge>
<Badge variant="default">Em Análise</Badge>
<Badge variant="success">Aprovado</Badge>
<Badge variant="destructive">Rejeitado</Badge>
```

### Status de Tradução

```tsx
<Badge variant="warning">Aguardando tradução</Badge>
<Badge variant="success">Documento traduzido</Badge>
```

### Status Financeiros

```tsx
<Badge variant="success">Pago</Badge>
<Badge variant="destructive">Atrasado</Badge>
<Badge variant="warning">A Vencer</Badge>
```

### Status de Processos

```tsx
<Badge variant="default">Em Andamento</Badge>
<Badge variant="success">Concluído</Badge>
<Badge variant="destructive">Cancelado</Badge>
<Badge variant="outline">Arquivado</Badge>
```

## Características

- ✅ Texto sempre em branco (exceto variante outline e secondary)
- ✅ 6 variantes de cores pré-definidas
- ✅ Suporte a dark mode
- ✅ Efeito hover sutil
- ✅ Bordas arredondadas (rounded-full)
- ✅ Totalmente tipado com TypeScript
- ✅ Acessível com focus ring
- ✅ Aceita props HTML padrão de div

## Customização

Você pode adicionar classes CSS personalizadas:

```tsx
<Badge variant="success" className="text-sm px-4 py-1">
    Custom Badge
</Badge>;
```

O componente usa a função `cn()` para mesclar classes de forma inteligente com
Tailwind CSS.
