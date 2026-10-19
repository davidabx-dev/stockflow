# STOCKFLOW
## Documento Técnico de Auditoria, Segurança e Validação

* **Projeto:** StockFlow
* **Escopo:** Sistema de gerenciamento de estoque
* **Stack:** FastAPI + PostgreSQL + Next.js + Docker
* **Estado avaliado:** Backend + Banco + Motor de estoque + Autenticação/Autorização + Frontend inicial
* **Data da auditoria:** Agosto de 2026

---

### 1. OBJETIVO DESTE DOCUMENTO

Este documento registra a avaliação técnica do StockFlow após a implementação do núcleo do sistema, incluindo:
* Modelagem do estoque;
* Movimentações;
* Requisições;
* Aprovações;
* Reservas;
* Baixa;
* Devoluções;
* Inventário;
* Custo médio;
* Auditoria;
* Autenticação;
* Autorização;
* Segurança de sessão;
* Defesa CSRF e Fetch Metadata;
* Integração frontend/backend;
* Testes automatizados;
* Build do frontend.

A avaliação foi comparada com documentação técnica atual e referências reconhecidas, principalmente:
* **OWASP** (Session Management, CSRF Prevention, API Security Top 10);
* **FastAPI** (Security, OAuth2, JWT);
* **Next.js** (App Router, Authentication Guides);
* **PostgreSQL** (Constraints, Row-Level Locks `SELECT FOR UPDATE`, Numeric Types);
* Práticas modernas de gestão de inventário.

> **Importante:** O objetivo não é declarar o sistema "100% seguro" nem "OWASP compliant". O objetivo é registrar o que foi implementado, o que foi comprovado por testes, o que foi validado contra boas práticas, o que está fora de escopo e quais riscos permanecem.

---

### 2. CONTEXTO DO PRODUTO

O StockFlow foi criado para controlar o estoque do escritório do cliente. A necessidade original inclui:
* Entrada de material;
* Saída de material;
* Requisição;
* Autorização;
* Controle de preço/custo;
* Vínculo da saída a uma obra;
* Relatórios;
* Histórico.

A evolução do projeto transformou essa necessidade inicial em um núcleo de gestão de estoque profissional com:
* Materiais, categorias e unidades de medida;
* Localizações;
* Estoque físico, estoque reservado e estoque disponível;
* Movimentações (*ledger* imutável);
* Requisições, aprovação, separação e entrega;
* Devolução rastreada com resgate de custo original;
* Inventário físico com apuração de divergências;
* Custo médio móvel ponderado (*Moving Average Cost*);
* Auditoria estruturada com diffs JSON;
* Controle de acesso baseado em papéis (RBAC).

---

### 3. ARQUITETURA E SEPARAÇÃO DE RESPONSABILIDADES EM CAMADAS

O pipeline de processamento de requisições no backend do StockFlow segue uma separação estrita de responsabilidades:

```
Requisição HTTP (ex: POST /api/v1/estoque/entradas)
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ 1. CSRF Guard (CSRFOriginGuardMiddleware)              │
│    Decide se a requisição apresenta contexto            │
│    cross-site aceitável ou forjado.                    │
│    - Cross-site / Origin não autorizada ──► 403        │
│    - Same-origin / Origin autorizada   ──► Prossegue   │
│    - Sem cookies ambientais             ──► Prossegue   │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ 2. Camada de Autenticação (deps.get_current_user)      │
│    Decide se o usuário possui credenciais válidas.     │
│    - Sem token ou token inválido/expirado ──► 401      │
│    - Usuário inativo / desativado         ──► 401      │
│    - Credencial válida                   ──► Prossegue │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ 3. Camada de Autorização (deps.require_roles / BOLA)   │
│    Decide se o usuário tem permissão para a operação.  │
│    - Papel insuficiente (RBAC)           ──► 403      │
│    - Acesso a objeto alheio (IDOR/BOLA)  ──► 403      │
│    - Permissão confirmada                ──► Prossegue │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ 4. Camada de Domínio / Regras de Negócio (StockEngine) │
│    Decide se a operação é válida no domínio do estoque.│
│    - Saldo insuficiente / Transição inválida ──► 400   │
│    - Transação atômica + Lock PostgreSQL   ──► 200 OK  │
└────────────────────────────────────────────────────────┘
```

---

### 4. MODELO DE DOMÍNIO

#### 4.1 Materiais
Cada material possui:
* SKU (identificador operacional único);
* Nome e descrição;
* Categoria e unidade de medida;
* Estoque mínimo de segurança;
* Custo médio atual;
* Status (ativo/inativo).

---

### 5. LOCALIZAÇÃO

O saldo não é armazenado diretamente no material. Foi modelada a relação:

```
MATERIAL
   └── ESTOQUE_POR_LOCALIZACAO
            └── LOCALIZACAO
```

A tabela de saldo (`estoque_por_localizacao`) contém:
* `material_id`;
* `localizacao_id`;
* `quantidade_fisica`;
* `quantidade_reservada`.

Isso permite que o mesmo material exista em múltiplas localizações físicas ou almoxarifados.

---

### 6. SALDO DE ESTOQUE

O StockFlow distingue rigorosamente três grandezas:
1. **Quantidade Física**: Total real existente no depósito.
2. **Quantidade Reservada**: Total comprometido por requisições já aprovadas.
3. **Quantidade Disponível**: Saldo livre para novas requisições.

$$\text{Disponível} = \text{Físico} - \text{Reservado}$$

A separação entre inventário físico e reservado é consistente com sistemas de gestão de inventário que diferenciam o estoque em mãos do estoque comprometido/reservado.

No banco de dados existe a invariante protegida por constraint:
$$\text{Físico} \ge \text{Reservado} \ge 0$$

Assim, o sistema não pode produzir uma disponibilidade negativa por erro de dados.

---

### 7. LIVRO-RAZÃO DE MOVIMENTAÇÕES

A tabela `movimentacoes` funciona como registro histórico e imutável das operações (*ledger*).
Tipos previstos:
* `ENTRADA`
* `SAIDA`
* `DEVOLUCAO`
* `AJUSTE`
* `TRANSFERENCIA`

As movimentações consolidadas são tratadas como eventos históricos (*INSERT-only*). O sistema não corrige o passado alterando registros históricos; correções produzem novos eventos, garantindo rastreabilidade contábil.

---

### 8. ENTRADA DE MATERIAL

Uma operação de entrada:
1. Identifica o material e a localização de destino;
2. Registra quantidade e custo unitário;
3. Registra o usuário responsável e documento fiscal;
4. Cria a movimentação de entrada no ledger;
5. Atualiza o saldo físico da localização;
6. Recalcula o custo médio móvel do material.

---

### 9. CUSTO MÉDIO MÓVEL

O sistema utiliza o método do **Custo Médio Móvel Ponderado** (*Moving Average Cost*):

$$\text{Novo Custo Médio} = \frac{(\text{Qtd Atual} \times \text{Custo Médio Atual}) + (\text{Qtd Entrada} \times \text{Custo Entrada})}{\text{Qtd Atual} + \text{Qtd Entrada}}$$

* **Entrada**: Recalcula o custo médio.
* **Saída**: Utiliza o custo médio vigente no momento da saída; a saída não altera o custo médio do material.
* **Devolução**: Recupera o custo registrado na saída original e não altera o custo médio vigente.
* **Ajuste**: Utiliza o custo médio vigente para valorar a diferença.

Cada movimentação preserva `custo_unitario` e `valor_total` no momento em que ocorre, evitando que entradas futuras alterem retroativamente o custo histórico de saídas consolidadas.

---

### 10. INTEGRIDADE MONETÁRIA

Valores monetários utilizam o tipo `NUMERIC(15, 2)` e quantidades `NUMERIC(15, 4)`, evitando o uso de ponto flutuante binário (`FLOAT`/`DOUBLE`) para cálculos financeiros.
O PostgreSQL documenta `NUMERIC`/`DECIMAL` como tipo de precisão exata, apropriado para garantir exatidão matemática.

---

### 11. REQUISIÇÃO DE MATERIAL

O ciclo de vida da requisição segue a máquina de estados:

```
PENDENTE ──► APROVADA ──► SEPARADA ──► ENTREGUE
   │
   └──► REJEITADA / CANCELADA
```

Uma requisição aprovada cria a reserva de estoque. A aprovação não significa que o material já saiu fisicamente do depósito.

---

### 12. RESERVA

Ao aprovar uma requisição:
* Saldo Físico permanece inalterado;
* Saldo Reservado aumenta;
* Saldo Disponível diminui.

*Exemplo:*
* **Antes**: Físico: $100$ | Reservado: $0$ | Disponível: $100$
* **Após aprovar 40**: Físico: $100$ | Reservado: $40$ | Disponível: $60$

Somente quando ocorrer a entrega física é efetivada a baixa no saldo físico e estornada a reserva.

---

### 13. CONTROLE DE CONCORRÊNCIA

O sistema utiliza transações atômicas com bloqueio pessimista de linha no PostgreSQL:

```
BEGIN
  SELECT ... FROM estoque_por_localizacao WHERE ... FOR UPDATE
  Verifica se (físico - reservado) >= solicitado
  Atualiza quantidade_reservada
  Registra log de auditoria
COMMIT
```

**Resultado do teste de concorrência comprovado:**
* Estoque disponível inicial: $10$
* Requisição A ($8$ un) e Requisição B ($8$ un) disparadas simultaneamente.
* **Resultado**: $1$ Aprovada, $1$ Rejeitada por saldo insuficiente.
* **Saldo final**: Físico = $10$, Reservado = $8$, Disponível = $2$.

---

### 14. IDEMPOTÊNCIA / MÁQUINA DE ESTADOS

Operações repetidas não produzem efeitos duplicados:
* **Aprovação duplicada**: Segunda tentativa é rejeitada com erro 400 (`StatusRequisicaoInvalidoError`).
* **Entrega duplicada**: Segunda tentativa é rejeitada, impedindo baixa dupla e duplicata no ledger.
* **Cancelamento duplicado**: Rejeitado, impedindo estorno múltiplo.

---

### 15. DEVOLUÇÃO

A devolução gera uma nova movimentação vinculada à saída de origem:
$$\text{Saída: } -20 \quad|\quad \text{Devolução: } +5 \quad\Longrightarrow\quad \text{Consumo Líquido: } 15$$
A movimentação original permanece intocada. O sistema impede devoluções cuja soma ultrapasse a quantidade da saída de origem.

---

### 16. INVENTÁRIO FÍSICO

O módulo de inventário é estruturado em:
$$\text{Sessão de Inventário} \longrightarrow \text{Lançamento de Contagens} \longrightarrow \text{Cálculo de Diferenças} \longrightarrow \text{Confirmação e Ajustes em Lote}$$
O ajuste registra a diferença apurada valorada pelo custo médio vigente.

---

### 17. PROTEÇÃO CONTRA AJUSTE ABAIXO DO RESERVADO

Se o saldo físico for $100$ e o reservado for $80$, não é permitido ajustar o físico para $70$ ($70 < 80$). A aplicação rejeita a operação com erro de domínio (`SaldoInsuficienteError`) e o banco mantém a restrição via constraint.

---

### 18. AUTENTICAÇÃO

A autenticação utiliza:
* **Argon2id** (`pwdlib[argon2]`, RFC 9106) para hashing seguro de senhas;
* **PyJWT** para geração e validação de tokens JWT;
* Par de tokens: `access_token` (8 horas) e `refresh_token` (7 dias);
* Endpoints `/auth/me`, `/auth/refresh` e `/auth/logout`.

---

### 19. SESSÃO NO NAVEGADOR

A estratégia de armazenamento em `localStorage` foi descontinuada e substituída por **Cookies HttpOnly Seguros**:
* `HttpOnly = True` (inibe acesso via JavaScript e neutraliza XSS);
* `Secure = True` em produção HTTPS;
* `SameSite = "Lax"` (proteção contra CSRF cross-origin);
* `Path = "/"` com tempos de expiração sincronizados.

Alinhado com a documentação oficial da OWASP e do Next.js.

---

### 20. DEFESA CSRF E MODELO DE AMEAÇA FETCH METADATA

O StockFlow utiliza o middleware `CSRFOriginGuardMiddleware` para métodos mutáveis (`POST`, `PUT`, `DELETE`, `PATCH`). A política do middleware e os resultados de ponta a ponta avaliados são:

| Cenário de Requisição Mutável | Decisão do CSRF Guard | Resultado Final da API | Justificativa Técnica do Modelo de Ameaça |
| :--- | :---: | :---: | :--- |
| **`Sec-Fetch-Site: cross-site` com cookie** | **Bloqueia** | **403 Forbidden** | Navegador informa explicitamente origem externa hostil. |
| **`Sec-Fetch-Site: same-origin` com cookie** | **Permite** | **200 OK** | Requisição originada da mesma origem exata. |
| **`Sec-Fetch-Site: same-site` + Origin autorizada** | **Permite** | **200 OK** | Origem listada em `BACKEND_CORS_ORIGINS`. |
| **`Sec-Fetch-Site: same-site` + Origin não listada** | **Bloqueia** | **403 Forbidden** | **Threat Model:** Subdomínios irmãos não são confiados cegamente (proteção contra ataques de subdomínio comprometido). |
| **`Sec-Fetch-Site` ausente + Origin não confiável** | **Bloqueia** | **403 Forbidden** | Fallback de navegador legado: origem hostil bloqueada. |
| **Endpoint Protegido sem autenticação** | **Permite (passa)** | **401 Unauthorized** | O middleware não bloqueia requisições sem cookies ambientais; a **camada de autenticação** rejeita com 401. |
| **Endpoint Público de Login (`/auth/login/json`)** | **Permite (passa)** | **200 OK** | Endpoint público legítimo processa credenciais no corpo JSON. |

---

### 21. PREFIXO DE COOKIE (`__Host-`)

O sistema adota o prefixo `__Host-` dinamicamente quando `COOKIE_SECURE=True` (em ambiente de produção HTTPS), garantindo conformidade estrita com o RFC 6265bis e prevenindo ataques de *cookie tossing* por subdomínios.

---

### 22. AUTORIZAÇÃO / RBAC

Perfis configurados:
* `ADMIN`: Acesso total e gestão de usuários;
* `ALMOXARIFE`: Entradas, aprovação, separação, entrega, inventário e ajustes;
* `SOLICITANTE`: Criação e acompanhamento de requisições próprias;
* `AUDITOR`: Acesso somente-leitura a relatórios e logs de auditoria.

A autorização é aplicada no servidor através de dependências `require_roles`.

---

### 23. BOLA / IDOR (Broken Object Level Authorization)

O sistema possui checagens em nível de objeto:
* Solicitantes só visualizam e cancelam requisições de sua propriedade (`403 Forbidden` para IDs de terceiros);
* Bloqueio estrito de autoaprovação de requisições (`req.solicitante_id == current_user.id`).

---

### 24. FUNCTION-LEVEL AUTHORIZATION

Usuários sem permissão recebem **403 Forbidden** ao tentar invocar endpoints protegidos:
$$\text{SOLICITANTE } \xrightarrow{\quad\text{POST /estoque/ajustes}\quad} \mathbf{403\text{ Forbidden}}$$

---

### 25. AUDITORIA E LOGS

Operações críticas registram em `auditoria_logs`:
* Usuário e IP de origem;
* Timestamp UTC;
* Tabela e ID do registro afetado;
* Ação executada;
* Payloads JSON de dados anteriores e dados novos;
* Motivo/justificativa.

Varreduras automatizadas comprovaram que senhas em texto puro ou tokens JWT não são registrados em logs.

---

### 26. GESTÃO DE SEGREDOS

Todas as credenciais sensíveis (`SECRET_KEY`, `DATABASE_URL`, `FIRST_ADMIN_PASSWORD`) são carregadas estritamente via variáveis de ambiente (`backend/.env`), sem chaves hardcoded no código-fonte.

---

### 27. BANCO DE DADOS E PRINCÍPIO DE MENOR PRIVILÉGIO

A aplicação conecta-se utilizando a role:
$$\mathbf{stockflow\_user \quad (NOSUPERUSER,\; NOCREATEDB,\; NOCREATEROLE)}$$
com privilégios limitados a DML no schema `public`. A role administrativa é separada.

---

### 28. CONSTRAINTS DE BANCO DE DADOS

O PostgreSQL garante as regras no nível de schema:
* `chk_saldo_fisico_positivo`: `quantidade_fisica >= 0`
* `chk_saldo_reservado_positivo`: `quantidade_reservada >= 0`
* `chk_saldo_fisico_maior_reservado`: `quantidade_fisica >= quantidade_reservada`
* Unicidade de SKU, integridade referencial por Foreign Keys e precisão monetária.

---

### 29. RESULTADOS DA SUÍTE DE TESTES AUTOMATIZADOS

$$\mathbf{42\; /\; 42\quad TESTES\; APROVADOS\; (100\%)}$$

Testes executados no PostgreSQL real cobrindo:
1. Autenticação e Hashing Argon2id;
2. JWT, Expiração e Algoritmos forjados;
3. Rejeição com 401 em endpoints protegidos sem autenticação;
4. Revogação de acesso por usuário desativado;
5. RBAC e bloqueio de Solicitante, Almoxarife e Auditor em rotas restritas;
6. Proteção IDOR / BOLA em consulta e cancelamento de requisições;
7. Defesa CSRF com Fetch Metadata e threat model de `same-site`;
8. Endpoint público de login acessível sem autenticação prévia;
9. Concorrência atômica com disputa de saldo;
10. Idempotência em aprovações, entregas e cancelamentos;
11. Custo médio móvel e imutabilidade de saídas históricas;
12. Devoluções e bloqueio de excedentes;
13. Inventário físico e bloqueio de ajuste abaixo do reservado;
14. Sessão via Cookies HttpOnly, `/auth/me`, refresh e logout;
15. Auditoria e ausência de vazamento de segredos;
16. Imutabilidade do ledger (bloqueio de PUT/DELETE em movimentações).

---

### 30. AVALIAÇÃO DETALHADA CONTRA OWASP API SECURITY TOP 10 (2023)

> **Nota de Conformidade:** Esta avaliação reflete a análise técnica do código e dos testes executados no ambiente atual. Categorias aplicáveis foram avaliadas; algumas foram comprovadas pelos 42 testes automatizados existentes; outras estão parcialmente mitigadas na aplicação (demandando controles de infraestrutura/gateway); e outras estão fora de escopo por não existirem funcionalidades correspondentes. **Este documento não declara conformidade integral com a OWASP.**

| Categoria Oficial OWASP (2023) | Classificação no StockFlow | Status Real / Justificativa Técnica |
| :--- | :---: | :--- |
| **API1:2023 Broken Object Level Authorization (BOLA)** | **Aplicável & Avaliado** | ✅ Comprovado: Solicitantes são bloqueados com HTTP 403 ao consultar ou cancelar requisições de outros usuários. |
| **API2:2023 Broken Authentication** | **Aplicável & Avaliado** | ✅ Comprovado: Hashing Argon2id, PyJWT HS256, rejeição com 401 sem credenciais/expirados, cookies HttpOnly e revogação imediata para usuários desativados. |
| **API3:2023 Broken Object Property Level Authorization** | **Aplicável & Avaliado** | ✅ Comprovado: Schemas Pydantic estritos barram injeção de propriedades não autorizadas (ex: status, custo médio) e responses não vazam campos internos. |
| **API4:2023 Unrestricted Resource Consumption** | **Parcialmente Mitigado** | 🟡 Parcial: Paginação com `limit <= 1000` implementada no código. Rate limiting no gateway/proxy pendente como requisito de infraestrutura de produção. |
| **API5:2023 Broken Function Level Authorization (BFLA)** | **Aplicável & Avaliado** | ✅ Comprovado: RBAC no nível de endpoint (`ADMIN`, `ALMOXARIFE`, `SOLICITANTE`, `AUDITOR`) validado via testes automatizados. |
| **API6:2023 Unrestricted Access to Sensitive Business Flows** | **Aplicável & Avaliado** | ✅ Comprovado: Máquina de estados finita impede pulos de etapas (ex: entrega sem aprovação prévia, devoluções excedentes, autoaprovação). |
| **API7:2023 Server Side Request Forgery (SSRF)** | **Fora de Escopo** | ⚪ Não aplicável: A API não realiza requisições HTTP outbound a URLs fornecidas por usuários nem consome webhooks dinâmicos. |
| **API8:2023 Security Misconfiguration** | **Parcialmente Mitigado** | 🟡 Parcial: CORS restrito sem wildcards e role PostgreSQL sem superuser. Pendente: Cabeçalhos HSTS/CSP, TLS e WAF em produção. |
| **API9:2023 Improper Inventory Management** | **Parcialmente Mitigado** | 🟡 Parcial: Rotas versionadas formalmente sob `/api/v1` e ausência de endpoints legados constituem apenas parte do controle. O inventário contínuo de hosts, versões, endpoints e separação estrita de ambientes (dev/homologação/prod) é documentado como requisito operacional mandatório para produção. |
| **API10:2023 Unsafe Consumption of APIs** | **Fora de Escopo** | ⚪ Não aplicável: A aplicação não consome APIs de terceiros com dados não confiáveis no estado atual. |

---

### 31. O QUE OS 42 TESTES PROVAM

Os 42 testes provam que os cenários implementados funcionam de acordo com as regras de negócio e restrições de integridade no PostgreSQL:
* Separação estrita entre CSRF Guard, Autenticação (401) e Autorização (403) ✅
* Defesa CSRF e Bloqueio de Origens/Subdomínios Não Confiáveis ✅
* Proteção BOLA / IDOR em Consulta e Cancelamento ✅
* Custo Médio Móvel Ponderado ✅
* Concorrência Atômica com Locks Pessimistas ✅
* Reserva e Disponibilidade de Estoque ✅
* RBAC e Autorização por Papel ✅
* Validação de JWT e Cookies HttpOnly ✅
* Devolução e Reaproveitamento de Custo ✅
* Inventário e Bloqueio de Ajustes Inválidos ✅
* Imutabilidade de Auditoria e Ledger ✅

---

### 32. O QUE OS 42 TESTES NÃO PROVAM

Não provam isoladamente:
* Ausência absoluta de vulnerabilidades futuras;
* Segurança da infraestrutura de rede, certificados TLS e proxy de produção;
* Configurações de DNS e WAF não aplicados localmente;
* Resiliência a ataques DDoS distribuídos massivos (exige mitigação de borda).

---

### 33. STATUS OFICIAL DO DOCUMENTO

* **StockFlow — Banco de Dados:** `Implementado e validado no ambiente atual (não significa produção)`
* **StockFlow — Backend & Motor de Domínio:** `Implementado e validado no ambiente atual (não significa produção)`
* **StockFlow — Frontend Next.js:** `Implementado e validado no ambiente atual (não significa produção)`
* **StockFlow — Segurança de Aplicação:** `Controles de segurança da aplicação implementados e testados nos cenários cobertos.`
* **StockFlow — Infraestrutura de Produção:** `PENDENTE DE HARDENING E TESTES DE RECUPERAÇÃO (GATE ATUAL)`
* **StockFlow — Produção:** `NÃO DECLARADO AINDA`

*Próximo gate:* Homologação → Infraestrutura de Produção (TLS, Reverse Proxy, HSTS, CSP, Headers, Rate Limiting, Roles do PostgreSQL, Backup Externo Criptografado, Teste Completo de Restore e Smoke Tests).
