# The 9 Steps Diagnostic

A self-assessment for founders and CEOs, built for Business Leader. Visitors rate their business against
Sir Richard Harpin's 9 Steps to a Billion and get a personal report: a score out of 100, a profile across
the nine steps, their three priority steps with practical next moves, their strengths, and a suggested
next step.

**Review version:** https://tom-tech-stitch.github.io/9-steps-diagnostic/ (not indexed by search engines).

It is a static page (HTML, CSS and plain JavaScript, no build step), styled with Business Leader's brand.

## Run it locally

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open http://127.0.0.1:4173.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | Page shell: header, footer, script tags |
| `assets/js/content.js` | **All the words**: the nine steps, 27 statements, principles, next moves, how Business Leader helps, podcast clips, stages, score bands |
| `assets/js/config.js` | Settings: HubSpot form, CTA links, Tag Manager, whether details are required |
| `assets/js/app.js` | Screens, scoring, report links, HubSpot submission, analytics events |
| `assets/css/diagnostic.css` | Styles and brand tokens |
| `assets/css/fonts.css` | The brand typeface, off until its web licence is confirmed (instructions inside) |

Edit copy in `content.js`; you shouldn't need to touch `app.js` to change wording. Every push to `main`
republishes the page.

## How it works

1. **About you**: role, turnover band, three-year ambition.
2. **Nine screens, one per step**: a short principle, then three statements rated *Not yet / Partly /
   Mostly / Fully* (0 to 3).
3. **Details**: first name, last name, work email and company (job title and phone optional), plus an
   optional marketing opt-in. Set `requireDetails: false` in `config.js` to let people skip.
4. **Report**.

Progress is saved in the visitor's browser (localStorage), so a refresh or a return visit resumes where
they left off. Browser back and forward move between screens.

### Scoring

- Each step: sum of its three answers (0 to 9), shown as 0 to 100.
- Overall: all 27 answers, 0 to 100.
- Step status: **Strength** (6+, i.e. "Mostly" or better on average), **Developing** (4 to 5), **Gap** (3 or less).
- Priority steps: the three lowest steps. Ties go to the earlier step. If even the lowest three are
  strengths, the section becomes "Your next frontier".
- Strengths: up to three Strength steps that aren't priorities.
- Bands: 80+ *Running the playbook*, 60+ *Well on your way*, 40+ *Building momentum*, below 40 *Early in the journey*.
- Stage, from turnover: under £3m *Building to £3m* (newsletter and book instead of a sales call),
  £3m to £15m *Professionalising*, £15m to £75m *Scaling*, £75m+ *Fortifying*.

### Report links

"Copy link to this report" gives a URL like `/#r=1021323101…`: one version digit, one digit per profile
answer and one per statement. It holds no personal details, so it is safe to share and to store in a CRM.
Anyone opening it sees the report with a "shared report" banner.

## HubSpot

Nothing is sent anywhere until a form GUID is set in `config.js`; until then the page logs the payload it
would send to the browser console.

To switch it on:

1. Create these contact properties (single-line text unless noted): `nine_steps_score` (number),
   `nine_steps_step_1_score` to `nine_steps_step_9_score` (number), `nine_steps_priority_steps`,
   `nine_steps_strengths`, `nine_steps_stage`, `nine_steps_role`, `nine_steps_turnover_band`,
   `nine_steps_ambition`, `nine_steps_answers`, `nine_steps_report_url`, `nine_steps_marketing_opt_in`
   (single checkbox).
2. Create a form, "9 Steps Diagnostic", with first name, last name, email, company, job title and phone,
   plus the properties above as hidden fields.
3. Paste its GUID into `hubspot.formGuid` in `config.js`.
4. Optionally, add a workflow on submission: email the report link, route by `nine_steps_stage`, and
   subscribe people who ticked `nine_steps_marketing_opt_in`.

Submissions use the Forms API (`/submissions/v3/integration/submit/…`), with the `hubspotutk` cookie when
present. A failed submission never blocks the report. The page also fires a `nine-steps:lead` DOM event
with the same payload, for any other integration.

## Analytics

Events are pushed to `window.dataLayer`; set `analytics.gtmId` in `config.js` to load Google Tag Manager:

`nine_steps_start`, `nine_steps_resume`, `nine_steps_profile_complete`, `nine_steps_step_complete`,
`nine_steps_lead_submitted`, `nine_steps_lead_error`, `nine_steps_results_view`, `nine_steps_cta_click`,
`nine_steps_report_link_copied`, `nine_steps_print`, `nine_steps_restart`, `nine_steps_take_it_yourself`,
`nine_steps_details_skipped`.

## Sources

The nine steps come from Sir Richard Harpin's *How to Make a Billion in Nine Steps* (Piatkus) and Business
Leader's podcast of the same name. The principles and next moves paraphrase Richard's newsletters and the
book extract on businessleader.co.uk.
