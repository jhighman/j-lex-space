# experiments/

The lab bench. Empty on purpose — experiments land here when a question
does.

## The discipline

An experiment here is held to the framework's own standard: it must say,
*before it runs*, what it asks and what would prove it wrong. Every
experiment file carries three headers:

- **QUESTION** — the one thing this probe asks.
- **METHOD** — the smallest honest way to ask it. Standard library only,
  in-memory sqlite, readable top to bottom. Experiments build on the
  record in `framework/sentinel.py` rather than inventing new machinery.
- **REFUTED BY** — the result that would kill the idea. Written first,
  because an experiment that cannot fail is an opinion with a run button.

Results are read before they are interpreted. The numbers a run prints go
in the record; what we think they mean goes in letters, and reaches the
book only if it earns its way there.

Start from `template.py`:

```bash
cp experiments/template.py experiments/my_question.py
python3 experiments/my_question.py
```
