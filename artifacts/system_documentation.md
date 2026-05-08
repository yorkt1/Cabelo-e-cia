# Documentação Belle — SalonFlow Pro

O **Belle** é um SaaS de agendamento e gestão para salões de beleza, barbearias e clínicas de estética. O sistema é dividido em uma interface pública para clientes e um painel administrativo para colaboradores e proprietários.

## 🚀 Arquitetura Técnica
- **Framework**: React 19 + TanStack Start (Full-stack)
- **Roteamento**: TanStack Router
- **Estilização**: Tailwind CSS + Shadcn/UI
- **Animações**: Framer Motion
- **Estado**: Zustand (com persistência local)
- **Calendário**: FullCalendar

---

## 🗺️ Mapa de Páginas e Funcionalidades

### 1. Área Pública (Clientes)
- **Landing Page (`/`)**: 
  - Apresentação visual premium.
  - Seções de Hero, Como Funciona, Serviços, Equipe, Preços e FAQ.
- **Fluxo de Agendamento (`/agendar`)**: 
  - Stepper de 4 passos.
  - Seleção de serviço, profissional, data/hora e dados de contato.
- **Autenticação**:
  - Login, Registro, Recuperação e Reset de senha.

### 2. Painel Administrativo (`/_app`)
- **Dashboard (`/dashboard`)**:
  - Resumo de faturamento, novos clientes e taxa de cancelamento.
- **Agenda (`/agenda`)**:
  - Calendário interativo com suporte a Drag & Drop.
- **Clientes (`/clientes`)**:
  - CRM simplificado para gestão de base de dados.
- **Profissionais (`/profissionais`)**:
  - Gestão de equipe e níveis de acesso (Roles).
- **Serviços (`/servicos`)**:
  - Configuração de catálogo.
- **Financeiro (`/financeiro`)**:
  - Gestão de fluxo de caixa (Entradas/Saídas).
- **Relatórios (`/relatorios`)**:
  - Dashboards de BI e produtividade.

---

## 🔐 Controle de Acesso (RBAC)
O sistema implementa 4 níveis de acesso:
1. **Owner**: Acesso total ao sistema e financeiro.
2. **Admin**: Gestão operacional e de equipe.
3. **Receptionist**: Foco em agendamentos e clientes.
4. **Professional**: Visualização de agenda pessoal e clientes.

Para mais detalhes, veja o arquivo [authentication.md](./authentication.md).

---

## 💡 Sugestões de Novas Funcionalidades (UI/UX)

Para elevar o nível do sistema para um padrão de mercado, as seguintes funcionalidades de front-end são recomendadas:

### Para Clientes (Retenção e Facilidade)
- [ ] **Área "Meu Perfil"**: Onde a cliente visualiza agendamentos futuros e pode cancelar/reagendar com um clique.
- [ ] **Histórico de Fotos**: Galeria onde o salão sobe fotos do resultado dos serviços (antes/depois) para a cliente consultar.
- [ ] **Sistema de Avaliação**: Formulário pós-serviço para coletar feedback e nota das profissionais.

### Para Colaboradores (Engajamento e Gestão)
- [ ] **Dashboard de Comissões**: Visão simplificada para o profissional acompanhar seus ganhos em tempo real.
- [ ] **Bloqueio de Agenda**: Função para marcar intervalos (almoço, cursos) rapidamente na agenda.
- [ ] **Notificações Push**: Alertas imediatos no navegador/celular quando um novo agendamento for realizado para ela.
- [ ] **Lista de Espera**: Interface para gerenciar clientes que desejam ser avisados em caso de desistências.

### Avançado (Diferenciais de Mercado)
- [ ] **PDV (Ponto de Venda)**: Interface para venda de produtos físicos (shampoos, cremes) com baixa automática de estoque.
- [ ] **Pagamento Antecipado (Pix/Cartão)**: Integração no fluxo de agendamento para cobrança de sinal, reduzindo no-shows.
- [ ] **Suporte Multi-unidade**: Seletor global para alternar entre diferentes unidades/endereços do mesmo salão.
- [ ] **LGPD e Privacidade**: Central de consentimento para uso de dados e termos de serviço.

---

## 🎨 Guia de Estilo
- **Cores**: Tons pastéis (Rose, Gold, Nude) com modo escuro refinado.
- **Tipografia**: Fraunces (Display) e Inter (Corpo).
- **UX**: Feedback imediato via `sonner` (Toasts) e transições suaves entre páginas.
