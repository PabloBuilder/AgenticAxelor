---
name: saisie-temps-agenda
description: Import completed calendar events referencing Redmine tickets into the time-tracking sheet, with user approval.
user-invocable: true
---

# Calendar time tracking

Follow `.agents/rules/agents.md`, `.agents/google-workspace-index.md`, and the current Redmine routing. Discover actual tool schemas; never assume capabilities. Calendar and Redmine are read-only: never change events or Redmine time entries. This skill serves any repository user; never assume Pablo.

**Spreadsheet:** `1zFrDLPu6huTu17fPj0h1miL77-11FhYKVd7uFhdGbO0`. The supplied link opens `Consolidation` (gid 380726837), not necessarily an input sheet. For Seenorest, the user confirms that entries are added below the last populated row. Inspect client tabs, headers, existing rows and formulas before selecting a destination; empty-looking rows can contain checkboxes or formulas. Never alter sheet structure, overwrite data or unrelated formulas, or fill the billable-time field. A profile formula on a new row may be replaced only after the user explicitly approves the affected cells and proposed value; preserve all other formulas.

## Identify and read

Identify the authenticated Google account and primary calendar. Confirm its Sheet name and Redmine identity when uncertain. Default to the current Monday–Sunday week; accept an explicitly requested day or week. Use the calendar's time zone; ask if the period or zone is unclear. Include only completed timed events; exclude cancelled, all-day, ongoing and future events.

Prove the event list is complete. At design time `get_events` exposed `max_results` but no page parameter: a response at the limit may be truncated. Split the interval if necessary, deduplicate by stable occurrence ID, and ensure every response is below the limit. Stop if completeness or stable IDs cannot be established. Account for time-zone transitions; never interpret failed or truncated reads as an empty calendar.

## Prepare

Select titles containing an identifiable ticket number, with or without a project name or abbreviation, e.g. `SEEN 5630`, `Seenorest 5630`, `5630`. Ask about ambiguous numbers or multiple tickets. Read each distinct Redmine ticket once per run and reuse the result for its events; read the user's actions when useful and accessible. A ticket title alone does not prove what happened during a particular event.

Propose client tab, task type, person, date, elapsed hours, concise evidence-based description, ticket and profile. Profiles describe the activity: `RDD - admin` for data migration, `CP` for project management and miscellaneous non-code work, consultant tech for development and technical work; verify exact sheet labels. Infer profile from the actual work, not the person's name or a sheet formula. If a prefilled profile conflicts, show the conflict and obtain explicit approval before replacing that new row's profile formula; otherwise skip it. Use the exact validated label, including whitespace: `CP ` was accepted in a Seenorest test where `CP` was rejected. Adapt type to the work; it need not match the ticket type. Never invent work. Ask about uncertain required fields; leave uncertain optional fields, including project phase, empty. Leave billable time untouched.

## Deduplicate and approve

Apply `references/suivi.md` and compare existing sheet rows before proposing writes. Skip verified unchanged occurrences; report changed or missing occurrences without updating or deleting their rows. Flag potential duplicates, including manual entries. Equal person, date, ticket and duration do not prove two events are identical. If the user confirms an existing entry covers only part of an event, propose only the approved remainder and record the existing amount, remainder, evidence and relevant occurrence IDs; if the allocation across events is ambiguous, preserve the ambiguity and require reconciliation before later imports. Keep the original event snapshot and separately record user-approved ticket or project corrections; reuse those corrections only while the original snapshot remains unchanged.

Block affected writes if the registry or destination is unreliable, a prior write outcome is unknown, or an active conflict is detected. Do not create shared tracking storage or sheet columns without appropriate authorization.

Show each event, destination, proposed cell values, empty fields and uncertainties; distinguish imported, changed and potentially duplicate entries. Before every import, warn: "L'écriture n'est pas verrouillée : une saisie simultanée peut être écrasée. Vérifie qu'aucune autre personne n'utilise le classeur avant de valider. Une synchronisation automatique peut aussi écrire sans être visible ; la relecture ne garantit pas l'absence de conflit." Wait for explicit approval of the exact rows and destinations after this warning. Re-present substantive corrections for approval. No approval means no writes.

## Write and verify

After approval, group entries by destination sheet and contiguous rows. Persist a `prepared` intent for each occurrence before any writes. Immediately before writing each block, read its destination in one range, including formulas; confirm every target is still safe. Respect locale and numeric types: in a French-locale test, `USER_ENTERED` value `0.25` became text, while `0,25` became numeric.

Use the available Sheets tool's 2D values support to write contiguous approved rows together. Split into separate ranges around protected columns: e.g. A, C:E, and G:I only where each cell in each range is approved and safe. Never send blanks or values across untouched checkboxes, billable-time cells, data or formulas; an individually approved profile-formula replacement is the sole exception. If rows are noncontiguous, or a rectangular block would touch an unapproved cell, split into smaller safe blocks. Do not assume separate range writes form an atomic transaction.

Read back each completed block and compare every approved value, date, number, profile and preserved field with the approved plan; mark each occurrence `verified` only after its complete row matches. A separate read and write is not a lock: the user accepts the residual race only after the warning and explicit approval. Stop on detected conflict or unexpected change; readback cannot prove that no concurrent data was overwritten. On any failure, interruption, uncertain response or mismatch, some rows or cells may already have been written: stop, keep affected intents pending, re-read the entire affected block and request reconciliation. Never retry blindly. Report verified, skipped and blocked entries separately.
