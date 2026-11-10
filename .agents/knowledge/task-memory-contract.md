# Task Memory Data Contract

Governs durable task memory artifacts (`memory.md`) produced by retrospective capitalizations and consumed by intent routers, scoping skills, and domain indexes.

## Core Purpose

Transform episodic operational execution (post-mortems, bug resolutions, ERP imports, workflow fixes) into machine-actionable, low-token heuristic atoms. Prevent repeated trial-and-error across customer tasks.

## Token Budget & Physical Limits

- **Maximum footprint**: 250 tokens per `memory.md` file (~150-180 words).
- **Prose density**: Zero narrative fluff, zero pleasantries, zero generic summaries.
- **Audience**: AI agent reasoning in high-context tasks; human-readable on demand.

## Schema Specification (`memory.md`)

Each task archive in `Work_data/Task History/<reference>/` must expose `memory.md` using strict YAML frontmatter followed by 3 semantic sections:

### 1. Frontmatter Attributes

| Attribute | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Primary task identifier (ticket number or date slug). | `"3637"` |
| `date` | `string` | ISO format `YYYY-MM-DD`. | `"2026-10-26"` |
| `domain` | `string[]` | Primary technical or business domains. | `["axelor", "sale"]` |
| `entities` | `string[]` | ERP models, systems, clients, or interfaces. | `["SaleOrder", "Project"]` |
| `trigger_keywords` | `string[]` | Symptoms, error codes, and operational terms. | `["company_id", "project-generation", "null-pointer"]` |
| `trap` | `string` | One-sentence summary of the pitfall / failure mode. | `"company_id is cleared if quote lacks default company"` |
| `solution_type` | `string` | Pattern taxonomy. | `"workaround"`, `"api_mutation"`, `"workflow_rule"` |

### 2. Mandatory Markdown Sections

- `### Context & Trigger`: Operational starting state. Exactly what request or anomaly triggered the task.
- `### Critical Trap & Root Cause`: The silent break, ERP quirk, or technical pitfall that caused friction or failure.
- `### Validated Resolution Pattern`: The minimal, reproducible, verified sequence that solves the issue.

## Central Index Specification (`memory-index.json`)

Located at `Work_data/Task History/memory-index.json`. Stores a compact array of JSON objects. Each entry is formatted on a single line for line-based grep efficiency and minimal token consumption.

### Entry Schema:
```json
{
  "id": "3637",
  "date": "2026-10-26",
  "domain": ["axelor", "sale"],
  "entities": ["SaleOrder", "Project"],
  "trigger_keywords": ["company_id", "project-generation", "devis"],
  "trap": "company_id is cleared if quote lacks default company",
  "solution_type": "workaround",
  "path": "3637-generation-projet-devis/memory.md"
}
```

### Querying Rules (Token Efficiency):
1. **Never load all retrospective files**: Agents must not load `01_process_historique.md` or arbitrary project files during scoping.
2. **Targeted scanning**: Filter `memory-index.json` by matching keywords/entities against `domain`, `entities`, or `trigger_keywords`.
3. **Selective reading**: When a candidate entry matches, load ONLY the target `memory.md` indicated by `path`.

## User-Local Isolation & Git Boundary

- **Strictly Local to User Account**: `Work_data/Task History/` and its `memory-index.json` are excluded from Git (`.gitignore`).
- **Zero Merge Collisions**: Each user maintains their own independent memory registry. Pulling or pushing Git updates will never cause conflicts on memory files.
- **Organic Specialization**: Over time, each teammate's local memory organically specializes on their specific assigned clients, domains, and problem patterns without leaking customer data or cross-polluting peers' context.
- **Graceful Degradation**: On a fresh checkout where `memory-index.json` does not yet exist, scoping skills proceed normally without errors, and retrospective skills initialize the registry on first capitalization.

