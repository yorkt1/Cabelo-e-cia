
# SaaS de Agendamento — Front-end (Mock + Soft Pastel)

Apenas front-end, sem backend. Dados mockados em memória (Zustand) com seeds realistas. Visual minimalista soft pastel feminino (rosa nude / bege / off-white), tipografia refinada.

## Observação sobre stack

Você pediu "Vite + React Router DOM", mas este template Lovable usa **TanStack Start (Vite + TanStack Router)** como base obrigatória — recriar fora dele quebraria preview/build. A solução: manter o roteador do template (TanStack Router em `src/routes/`, comportamento equivalente ao React Router), e organizar **todo o resto** exatamente na arquitetura pedida (`pages`, `components`, `layouts`, `services`, `hooks`, `store`, `contexts`, `validations`, `modals`, `utils`, `styles`, `assets`). As páginas em `src/pages/` são importadas pelos arquivos finos em `src/routes/`. Na prática, você tem a mesma DX de React Router DOM.

## Design system (soft pastel feminino)

Tokens em `src/styles.css` (oklch):
- `--background`: off-white quente
- `--foreground`: marrom escuro suave
- `--primary`: rosa nude (≈ #E8B4B8 em oklch)
- `--accent`: bege champagne
- `--muted`: rosa pó muito claro
- `--ring`: rosa primary
- Sombras suaves, raios `xl/2xl`, gradientes sutis rosa→champagne
- Tipografia: **Fraunces** (display, headings) + **Inter** (corpo) via Google Fonts
- Modo claro como padrão; dark opcional em paleta plum/rosé

Princípios visuais: muito espaço em branco, cards com bordas finas e radius generoso, microinterações Framer Motion discretas, ícones `lucide-react` em traço fino.

## Estrutura de pastas (front)

```
src/
├── pages/              # uma pasta por área, com index.tsx
│   ├── auth/ (Login, Register, ForgotPassword, ResetPassword)
│   ├── dashboard/
│   ├── agenda/
│   ├── clients/
│   ├── professionals/
│   ├── services/
│   ├── financial/
│   ├── reports/
│   ├── subscription/
│   ├── settings/
│   ├── profile/
│   └── super-admin/
├── components/
│   ├── ui/             # shadcn (já existe)
│   ├── common/         # PageHeader, EmptyState, StatCard, DataTable wrapper
│   ├── charts/         # via recharts
│   ├── agenda/         # CalendarView, AppointmentCard, SlotPicker
│   └── forms/          # campos reutilizáveis
├── layouts/
│   ├── AppLayout.tsx   # sidebar + topbar + outlet
│   └── AuthLayout.tsx  # split com ilustração pastel
├── modals/             # AppointmentModal, ClientModal, ServiceModal, ConfirmModal
├── services/           # api.ts (axios pré-configurado, mock adapter), endpoints por domínio
├── store/              # zustand: authStore, tenantStore, uiStore, mockDb
├── hooks/              # useAuth, useTenant, useDebounce, useDisclosure, usePagination
├── contexts/           # ThemeContext
├── validations/        # zod schemas por domínio
├── utils/              # date (dayjs), currency, formatters, rbac
├── styles/             # tokens.css, animations.css
└── assets/             # logo, ilustrações pastel
```

`src/routes/*` permanece como entry-points finos: cada um só renderiza a página correspondente de `src/pages/`.

## Telas (entrega completa)

**Auth** (AuthLayout, ilustração pastel à esquerda)
- Login, Cadastro, Esqueci senha, Reset senha

**App** (AppLayout: sidebar colapsável + topbar com busca, notificações, avatar, seletor de tenant)
- **Dashboard**: 4 StatCards (faturamento, agendamentos hoje, ticket médio, novos clientes), gráfico de receita (area chart), próximos agendamentos, top serviços
- **Agenda**: FullCalendar (dia/semana/mês), drag-and-drop, modal de criar/editar agendamento com múltiplos serviços, bloqueios, filtro por profissional
- **Clientes**: TanStack Table com busca, filtros, paginação; drawer com histórico, aniversários, observações, foto
- **Profissionais**: lista em cards, detalhe com agenda, especialidades, comissão, folgas/férias
- **Serviços**: tabela com categoria, duração, preço, comissão, toggle ativo
- **Financeiro**: caixa do dia, entradas/saídas, lista de transações, comissões a pagar
- **Relatórios**: faturamento por período, serviços top, profissionais produtivos, horários de pico, taxa de cancelamento (recharts)
- **Assinatura**: 3 planos (Starter/Pro/Premium), status atual, faturas mock, upgrade/downgrade
- **Configurações**: dados do salão, logo, horários de funcionamento, integrações (placeholders)
- **Perfil**: dados pessoais, troca de senha, avatar
- **Super Admin** (rota separada `/admin`): lista de salões, métricas globais, bloquear tenant

## Funcionalidades transversais

- **Mock DB** (`store/mockDb.ts`): seeds com 1 salão exemplo, 4 profissionais, 30 clientes, 12 serviços, 60 agendamentos espalhados na semana
- **Auth mock**: login aceita qualquer credencial válida pelo zod; persiste em `localStorage`; rotas protegidas via `<RequireAuth>` wrapper
- **RBAC**: helper `can(role, action)` com roles owner/admin/receptionist/professional escondendo itens da sidebar
- **TanStack Query**: queries apontam para `services/*` que devolvem dados do mockDb com pequeno delay simulando rede
- **TanStack Table**: wrapper `<DataTable>` com sort, filter, paginação, busca global
- **Forms**: React Hook Form + Zod resolver; componentes `<FormField>` padronizados
- **Toasts**: sonner (já no template)
- **Tema claro/escuro**: toggle no topbar, persistido
- **Responsivo**: sidebar vira sheet em <md, tabelas viram cards
- **Loading**: skeletons por página; estados vazios ilustrados

## Dependências a instalar

`@fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @tanstack/react-table zustand axios react-hook-form @hookform/resolvers zod dayjs framer-motion recharts`

(react-query, sonner, lucide-react, shadcn, tailwind já existem)

## Etapas de implementação

1. Tokens de tema soft pastel + fontes em `styles.css`; AppLayout + AuthLayout; sidebar/topbar
2. Mock DB + stores Zustand (auth, tenant, ui) + service layer com axios mock adapter
3. Auth (4 telas) + guarda de rotas + RBAC
4. Dashboard + componentes comuns (StatCard, PageHeader, DataTable, EmptyState)
5. Agenda (FullCalendar + modal de agendamento + validação de conflito)
6. Clientes, Profissionais, Serviços (CRUD em modais)
7. Financeiro + Relatórios (recharts)
8. Assinatura, Configurações, Perfil
9. Super Admin
10. Polish: animações, responsivo, dark mode, estados vazios

## Fora de escopo (confirmado)

Backend, Prisma, Postgres, Redis, Socket.io, Cloudinary, jobs, integrações reais de pagamento/WhatsApp, Docker, CI/CD. A camada `services/` fica preparada para trocar o mock adapter por uma API real depois.
