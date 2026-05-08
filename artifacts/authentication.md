# Documentação de Autenticação e Controle de Acesso (RBAC)

Esta documentação detalha como o sistema de autenticação e os níveis de permissão (Roles) estão estruturados no projeto **Belle — SalonFlow Pro**.

## 1. Visão Geral
O sistema utiliza uma arquitetura de **RBAC (Role-Based Access Control)** para garantir que cada usuário tenha acesso apenas às funcionalidades pertinentes ao seu cargo. A autenticação é gerenciada client-side através de um store centralizado (`authStore.ts`) com persistência no navegador.

## 2. Níveis de Acesso (Roles)

| Role | Descrição | Permissões Principais |
| :--- | :--- | :--- |
| **Owner** | Proprietário do Salão | Acesso total a todas as páginas, incluindo Financeiro, Equipe e Assinatura SaaS. |
| **Admin** | Gerente / Administrador | Gestão de equipe, serviços e relatórios. Não acessa dados sensíveis de lucro/saídas financeiras brutas. |
| **Receptionist** | Recepção | Focada em Agenda e Cadastro de Clientes. Não acessa configurações do sistema ou dados financeiros. |
| **Professional** | Colaborador (Manicure, Barbeiro, etc) | Acesso à Agenda e Clientes. Visualiza apenas seus próprios agendamentos e metas. |

---

## 3. Estrutura Técnica

### Store de Autenticação (`src/store/authStore.ts`)
O estado de autenticação é mantido pelo Zustand e persistido via `localStorage`.

```typescript
interface User {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'receptionist' | 'professional';
  salonId: string;
}
```

### Proteção de Navegação (Menu Lateral)
O menu lateral (`AppLayout.tsx`) filtra os itens dinamicamente:

```typescript
const NAV = [
  { to: "/financeiro", label: "Financeiro", roles: ["owner"] },
  { to: "/agenda", label: "Agenda", roles: ["owner", "admin", "professional", "receptionist"] },
  // ...
];
```

### Segurança de Rota (`beforeLoad`)
As rotas são protegidas a nível de definição no TanStack Router. Se um usuário sem permissão tentar acessar uma URL diretamente, ele é redirecionado.

```typescript
export const Route = createFileRoute("/_app/financeiro")({
  beforeLoad: () => {
    const { user } = useAuth.getState();
    if (user?.role !== "owner") {
      throw redirect({ to: "/dashboard" });
    }
  }
});
```

---

## 4. Fluxo de Autenticação

1. **Login**: O usuário insere credenciais na rota `/login`.
2. **Sessão**: Após validar, o objeto `user` é injetado no `useAuth`, disparando a re-renderização do layout.
3. **Persistência**: A sessão permanece ativa mesmo após o refresh da página (via `persist` middleware).
4. **Logout**: Limpa o estado do store e redireciona para a página pública.

## 5. Implementações Futuras (Roadmap)
- [ ] Integração com **Supabase Auth** para autenticação via JWT.
- [ ] MFA (Multi-Factor Authentication) para o nível **Owner**.
- [ ] Logs de Auditoria: Rastrear quem alterou horários na agenda ou deletou clientes.
