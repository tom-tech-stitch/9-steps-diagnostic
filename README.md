# The 9 Steps Diagnostic

A self-assessment for founders and CEOs, built for Business Leader, in two lengths:

- **The full diagnostic** (about 6 minutes, 27 statements): rates the business against all of Sir Richard
  Harpin's 9 Steps to a Billion and gives a report with a score out of 100, a profile across the nine
  steps, three priority steps with practical next moves, strengths and a suggested next step.
- **Five 2-minute checks** (6 statements each) for first outreach, each on one challenge and the steps
  behind it. The report shows where to start, Richard's next moves, and Business Leader articles and
  videos picked for the weakest step.

**Review version** (not indexed by search engines):

| | Link |
| --- | --- |
| Full diagnostic | https://tom-tech-stitch.github.io/9-steps-diagnostic/ |
| Is it lonely at the top? (isolation) | https://tom-tech-stitch.github.io/9-steps-diagnostic/?check=isolation |
| Has growth hit a plateau? (scaling, stuck) | https://tom-tech-stitch.github.io/9-steps-diagnostic/?check=stuck |
| Have you got the team for the next stage? (people and talent) | https://tom-tech-stitch.github.io/9-steps-diagnostic/?check=talent |
| Can you fund your next stage of growth? (access to capital) | https://tom-tech-stitch.github.io/9-steps-diagnostic/?check=capital |
| Are you ready to go international? (international expansion) | https://tom-tech-stitch.github.io/9-steps-diagnostic/?check=international |

Campaign parameters can be added to any of these (for example `&utm_source=linkedin`); they are passed to
HubSpot with the submission.

It is a static page (HTML, CSS and plain JavaScript, no build step), styled with Business Leader's brand.

## Run it locally

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open http://127.0.0.1:4173 (or http://127.0.0.1:4173/?check=isolation for a check).

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page shell: header, footer, script tags |
| `assets/js/content.js` | **All the words**: the nine steps, statements, principles, next moves, reading, the 2-minute checks, stages and score bands |
| `assets/js/config.js` | Settings: HubSpot form, CTA links, Tag Manager, whether details are required |
| `assets/js/app.js` | Screens, scoring, report links, HubSpot submission, analytics events |
| `assets/css/diagnostic.css` | Styles and brand tokens |
| `assets/css/fonts.css` | The brand typeface, off until its web licence is confirmed (instructions inside) |

Edit copy in `content.js`; you shouldn't need to touch `app.js` to change wording. Every push to `main`
republishes the page.

## How it works

**Full diagnostic:** three questions about you (role, turnover band, three-year ambition), then one screen
per step with a short principle and three statements rated *Not yet / Partly / Mostly / Fully* (0 to 3),
then details, then the report.

**2-minute check:** the six statements on one screen, grouped by step; then the same three questions about
you; then details; then the report.

Details are first name, last name, work email and company (job title and phone optional), plus an optional
marketing opt-in. Set `requireDetails: false` in `config.js` to let people skip.

Progress is saved in the visitor's browser (localStorage, one record per diagnostic or check), so a refresh
or a return visit resumes where they left off. Browser back and forward move between screens.

### The checks

Each check in `content.js` (`checks`) has an id (used in the link), a hook question, a lead, six statements,
three verdicts, a call to action and a reading list. A statement either reuses one of a step's three
statements (`{ step: 3, pick: 0 }`) or has its own wording (`{ step: 5, text: '…' }`).

| Check | Steps covered |
| --- | --- |
| Leading alone (`isolation`) | 3 Get some coachment, 5 Hire your replacement, 9 Hone your character |
| Stuck at a plateau (`stuck`) | 4 Bricks, clicks and paper, 7 Evolution not revolution, 8 Follow a not-to-do list |
| People and talent (`talent`) | 3 Get some coachment, 5 Hire your replacement, 9 Hone your character |
| Access to capital (`capital`) | 2 Get an investor, 7 Evolution not revolution |
| Going international (`international`) | 5 Hire your replacement, 6 Go global with locals |

Report links store each check's `code` and its answers in order, so once links are out, never change a
check's code or reorder its statements. Add new checks at the end with the next code (1 to 9).

### Scoring

- Each step: its answers as a share of the points available, shown as 0 to 100.
- Overall: all answers, 0 to 100.
- Step status: **Strength** (two thirds of the points or more, i.e. "Mostly" or better on average),
  **Developing** (44% or more), **Gap** (below that).
- Full diagnostic: the three lowest steps are the priorities (ties go to the earlier step); bands are
  80+ *Running the playbook*, 60+ *Well on your way*, 40+ *Building momentum*, below 40 *Early in the journey*.
- Checks: every step in the check gets a card, weakest first; each check has its own three verdicts.
- Stage, from turnover: under £3m *Building to £3m* (newsletter and book instead of a sales call),
  £3m to £15m *Professionalising*, £15m to £75m *Scaling*, £75m+ *Fortifying*.

### Reading

Each step links one Business Leader article (mostly Richard's "Ask Richard" columns) and a timestamped clip
from the *How to Make a Billion in 9 Steps* podcast. Each check adds a reading list; the report shows up to
three items, those on the weakest step first, skipping anything already linked from a step card.

### Report links

"Copy link to this report" gives a URL like `/#r=…`. It holds no personal details, so it is safe to share
and to store in a CRM. Anyone opening it sees the report with a "shared report" banner.

- Full diagnostic: `1`, one digit per profile answer, one digit per statement (31 digits).
- Check: `2`, the check's code, one digit per profile answer, one digit per statement (11 digits).

## HubSpot

Nothing is sent anywhere until a form GUID is set in `config.js`; until then the page logs the payload it
would send to the browser console.

To switch it on:

1. Create these contact properties (single-line text unless noted): `nine_steps_check`,
   `nine_steps_score` (number), `nine_steps_step_1_score` to `nine_steps_step_9_score` (number),
   `nine_steps_priority_steps`, `nine_steps_strengths`, `nine_steps_stage`, `nine_steps_role`,
   `nine_steps_turnover_band`, `nine_steps_ambition`, `nine_steps_answers`, `nine_steps_report_url`,
   `nine_steps_marketing_opt_in` (single checkbox).
2. Create a form, "9 Steps Diagnostic", with first name, last name, email, company, job title and phone,
   plus the properties above as hidden fields.
3. Paste its GUID into `hubspot.formGuid` in `config.js`.
4. Optionally, add workflows on submission: email the report link, route by `nine_steps_check` and
   `nine_steps_stage` (for example a content nurture per check), and subscribe people who ticked
   `nine_steps_marketing_opt_in`.

`nine_steps_check` is "Full diagnostic" or the check's name. A check only sends scores for the steps it
covers; its `nine_steps_priority_steps` is the step it says to start with.

Submissions use the Forms API (`/submissions/v3/integration/submit/…`), with the `hubspotutk` cookie when
present. A failed submission never blocks the report. The page also fires a `nine-steps:lead` DOM event
with the same payload, for any other integration.

## Analytics

Events are pushed to `window.dataLayer`, each with `nine_steps_check` (`full` or the check's id); set
`analytics.gtmId` in `config.js` to load Google Tag Manager:

`nine_steps_view`, `nine_steps_start`, `nine_steps_resume`, `nine_steps_questions_complete`,
`nine_steps_profile_complete`, `nine_steps_step_complete`, `nine_steps_lead_submitted`,
`nine_steps_lead_error`, `nine_steps_results_view`, `nine_steps_shared_report_view`, `nine_steps_cta_click`,
`nine_steps_report_link_copied`, `nine_steps_print`, `nine_steps_restart`, `nine_steps_take_it_yourself`,
`nine_steps_details_skipped`.

## Sources

The nine steps come from Sir Richard Harpin's *How to Make a Billion in Nine Steps* (Piatkus) and Business
Leader's podcast of the same name. The principles and next moves paraphrase Richard's newsletters and the
book extract on businessleader.co.uk. Reading links point to articles and videos published by Business
Leader.
