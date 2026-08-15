# Documentation

Three kinds of document live here. Know which you are reading.

## For the owner — start here if you are not a developer

**[`TheBucketListDXB-Owners-Handbook.pdf`](TheBucketListDXB-Owners-Handbook.pdf)**
— a 19-page printable guide written for a non-technical owner: setting up a
computer, working with Claude Code (with prompts to copy), everyday tasks,
publishing, safety rules, troubleshooting and a glossary.

Regenerate it after changing the source with:

```bash
python3 docs/build-owners-handbook.py
```

(needs `pip3 install reportlab`; the script writes the PDF beside itself).
Keep it in step with the reference docs below — it describes the same system
in plain English.

---

The rest of this folder is for whoever is writing code, human or agent.

## Reference — current, maintained, read these

Written to be read by a person or an AI agent picking up the project. Keep
them accurate: if you change behaviour they describe, update them in the same
commit.

| Doc | Read it when |
| --- | --- |
| [`../CLAUDE.md`](../CLAUDE.md) | **Start here.** The map, and the rules that matter most |
| [`architecture.md`](architecture.md) | You need to know how the three apps fit together, or how auth works |
| [`data-model.md`](data-model.md) | Before touching the database — tables, RLS, every RPC |
| [`conventions.md`](conventions.md) | Before writing code — patterns to follow, traps to avoid |
| [`operations.md`](operations.md) | Env vars, running locally, migrations, deploying, handover |

## History — a record of how it was built

Long, dated build plans. They explain **why** things are the way they are,
including options considered and rejected. They are **not** kept current —
where they disagree with the reference docs or the code, they are out of date.

They are large (`roadmap.md` is ~69KB). Search for a section; do not read one
end to end.

| Doc | Covers |
| --- | --- |
| [`roadmap.md`](roadmap.md) | The full phase-by-phase history of the public site |
| [`accounts-and-dashboard.md`](accounts-and-dashboard.md) | Original plan for accounts and vendor roles (Aug 7). Route map superseded by `vendor-dashboard.md` |
| [`vendor-dashboard.md`](vendor-dashboard.md) | Build plan for `apps/vendor` (Aug 8) |
| [`admin-site-and-bookings-plan.md`](admin-site-and-bookings-plan.md) | Splitting `apps/admin` out, plus cross-vendor bookings |

## Working with an AI agent on this project

The reference docs are written for this. A useful session usually starts by
pointing the agent at the right one:

- *"Read `docs/data-model.md`, then add a `waitlist` table with RLS."*
- *"Read `docs/conventions.md`, then add a Payouts page to the vendor
  dashboard."*
- *"Following `docs/operations.md`, walk me through applying migration 0029."*

`CLAUDE.md` is loaded automatically by Claude Code every session, so the
agent already knows the shape of the project and the non-negotiable rules
before you type anything.

Two habits that pay off:

- **Ask it to verify, not just to write.** The build command is in
  `CLAUDE.md`; ask for typecheck + build output, and for a browser check when
  the change is visual.
- **Ask it to update these docs** when a change makes one wrong. They are only
  worth having if they stay true.
