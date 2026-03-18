# Widicom - Brainstorming de Design

## Abordagem Selecionada: Minimalismo Moderno com Acentos Cibernéticos

### Design Movement
**Neo-Brutalism Digital** combinado com **Minimalismo Funcional** - uma estética que equilibra a simplicidade extrema com elementos visuais sofisticados, inspirada em interfaces de pesquisa científica e ferramentas de OSINT profissionais.

### Core Principles
1. **Clareza Radical**: Cada elemento tem um propósito claro; nenhuma decoração supérflua. O foco é permitir que o usuário encontre Lost Media rapidamente.
2. **Tipografia como Hierarquia**: Uso estratégico de pesos tipográficos para guiar o olho do usuário através da interface.
3. **Espaço Negativo Intencional**: Amplo uso de whitespace para criar uma sensação de respiração e sofisticação.
4. **Acentos Cibernéticos Sutis**: Linhas finas, gradientes suaves e efeitos de hover que evocam a estética de ferramentas de pesquisa avançada.

### Color Philosophy
- **Paleta Primária**: Fundo branco limpo (`#FFFFFF`) com texto em cinza muito escuro (`#1A1A1A`).
- **Acentos**: Azul profundo (`#0F3A7D`) para botões e links principais, criando um contraste sofisticado.
- **Secundário**: Cinza neutro (`#6B7280`) para textos secundários e bordas subtis.
- **Destaque**: Verde menta suave (`#10B981`) para indicadores de sucesso e links ativos.
- **Raciocínio Emocional**: A paleta transmite profissionalismo, confiança e sofisticação, apropriada para uma ferramenta de pesquisa especializada.

### Layout Paradigm
- **Hero Assimétrico**: A barra de busca não está centralizada, mas posicionada no topo-esquerdo com espaço generoso ao redor.
- **Grid Assimétrico para Resultados**: Os resultados são exibidos em um layout de cards com diferentes tamanhos, criando dinamismo visual sem parecer caótico.
- **Sidebar Minimalista**: Uma barra lateral sutil (colapsível em mobile) com filtros e opções avançadas, mantendo a interface limpa.

### Signature Elements
1. **Linha Divisória Animada**: Uma linha horizontal fina que anima suavemente quando o usuário interage com a interface, criando feedback visual.
2. **Cards com Bordas Sutis**: Cada resultado é um card com uma borda de 1px em cinza claro, sem sombras pesadas - mantendo a estética minimalista.
3. **Ícones Monocromáticos**: Uso de ícones simples (lucide-react) em cinza escuro, com hover em azul profundo.

### Interaction Philosophy
- **Feedback Imediato**: Cada clique ou hover produz uma resposta visual clara mas sutil (mudança de cor, animação leve).
- **Transições Suaves**: Uso de `transition` CSS para todas as mudanças de estado, criando uma sensação de fluidez.
- **Loading States Elegantes**: Spinners minimalistas e mensagens de status claras durante a busca.

### Animation
- **Entrada de Página**: Fade-in suave (300ms) dos elementos principais.
- **Hover em Botões**: Mudança de cor de fundo (azul escuro) com transição de 200ms, sem scale ou shadow.
- **Linha Animada**: A linha divisória pulsa levemente (opacity 0.5 → 1.0) durante a busca.
- **Resultados**: Cards aparecem com um fade-in em cascata (staggered), criando uma sensação de descoberta.

### Typography System
- **Display Font**: `Poppins` (bold, 700) para títulos principais - moderna e limpa.
- **Body Font**: `Inter` (regular, 400) para corpo de texto - altamente legível.
- **Hierarchy**:
  - H1: Poppins 700, 36px (título principal)
  - H2: Poppins 600, 24px (subtítulos)
  - Body: Inter 400, 16px (texto padrão)
  - Small: Inter 400, 14px (textos secundários)
  - Label: Inter 500, 12px (labels de filtros)

---

## Justificativa da Escolha

Este design foi selecionado porque:
1. **Profissionalismo**: Apropriado para uma ferramenta de OSINT e busca especializada.
2. **Usabilidade**: A clareza radical garante que o usuário encontre o que procura rapidamente.
3. **Diferenciação**: Evita o clichê de interfaces "coloridas" ou "modernas demais", optando por sofisticação através da simplicidade.
4. **Performance Visual**: Menos elementos visuais = interface mais rápida e responsiva.
5. **Acessibilidade**: Alto contraste entre texto e fundo garante legibilidade para todos os usuários.
