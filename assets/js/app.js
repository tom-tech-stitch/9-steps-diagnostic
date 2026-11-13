/*
 * The 9 Steps Diagnostic: screens, scoring, report links and the HubSpot hand-off.
 * Words live in content.js and settings in config.js; this file should rarely need editing.
 */
;(() => {
  'use strict'

  const C = window.BL_DIAGNOSTIC_CONTENT
  const CFG = window.BL_DIAGNOSTIC_CONFIG || {}
  const LINKS = CFG.links || {}
  const STEPS = C.steps
  const STORAGE_KEY = 'bl-9-steps-diagnostic-v1'
  const REPORT_VERSION = '1'
  const app = document.getElementById('app')
  const live = document.getElementById('live')

  // Where each step's statements start in the flat answers array.
  const OFFSETS = []
  const TOTAL_STATEMENTS = STEPS.reduce((n, step, i) => {
    OFFSETS[i] = n
    return n + step.statements.length
  }, 0)
  const MAX_VALUE = Math.max(...C.scale.map((o) => o.value))

  const fresh = () => ({
    screen: 'intro',
    step: 0,
    profile: Object.fromEntries(C.profile.map((q) => [q.id, null])),
    answers: new Array(TOTAL_STATEMENTS).fill(null),
    firstName: '',
    details: null, // kept in memory only, never stored
    detailsDone: false,
    sentCode: null,
    shared: false,
  })
  let state = fresh()

  /* ---------- Small helpers ---------- */

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  const pad = (n) => String(n).padStart(2, '0')
  const profileOption = (qid, oid) => C.profile.find((q) => q.id === qid)?.options.find((o) => o.id === oid)
  const scaleLabel = (v) => C.scale.find((o) => o.value === v)?.label ?? 'Not answered'
  const stepAnswers = (i) => STEPS[i].statements.map((_, j) => state.answers[OFFSETS[i] + j])
  const stepComplete = (i) => stepAnswers(i).every((v) => v !== null)
  const profileComplete = () => C.profile.every((q) => state.profile[q.id])
  const firstIncompleteStep = () => STEPS.findIndex((_, i) => !stepComplete(i))
  const hasProgress = () => profileComplete() || state.answers.some((v) => v !== null)
  const watchUrl = (w) => `https://www.youtube.com/watch?v=${encodeURIComponent(w.video)}&t=${Number(w.t) || 0}s`
  const reportUrl = (code) => `${location.origin}${location.pathname}#r=${code}`
  const newTab = 'target="_blank" rel="noopener"'
  const newTabNote = '<span class="sr-only"> (opens in a new tab)</span>'

  function track(event, data = {}) {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event, ...data })
  }

  function announce(message) {
    live.textContent = ''
    window.setTimeout(() => {
      live.textContent = message
    }, 50)
  }

  /* ---------- Icons (inline, decorative) ---------- */

  const svg = (paths) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`
  const icon = {
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowUpRight: '<path d="M7 17L17 7M8 7h9v9"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    half: '<circle cx="12" cy="12" r="7.5"/><path d="M12 4.5a7.5 7.5 0 0 1 0 15z" fill="currentColor" stroke="none"/>',
    gap: '<circle cx="12" cy="12" r="7.5"/><path d="M12 8v4.5M12 16h.01"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    print: '<path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  }

  /* ---------- Scoring ---------- */

  function statusFor(total) {
    if (total >= C.status.strength.minTotal) return 'strength'
    if (total >= C.status.developing.minTotal) return 'developing'
    return 'gap'
  }

  function score(answers) {
    const steps = STEPS.map((step, i) => {
      const vals = step.statements.map((_, j) => answers[OFFSETS[i] + j] ?? 0)
      const total = vals.reduce((a, b) => a + b, 0)
      const max = step.statements.length * MAX_VALUE
      return { ...step, index: i, vals, total, score: Math.round((total / max) * 100), status: statusFor(total) }
    })
    const grand = steps.reduce((a, s) => a + s.total, 0)
    const overall = Math.round((grand / (TOTAL_STATEMENTS * MAX_VALUE)) * 100)
    const band = C.bands.find((b) => overall >= b.min) || C.bands[C.bands.length - 1]
    // Ties go to the earlier step: the first steps are the foundations for the later ones.
    const low = [...steps].sort((a, b) => a.score - b.score || a.n - b.n)
    const high = [...steps].sort((a, b) => b.score - a.score || a.n - b.n)
    const even = high[0].score === low[0].score
    const priorities = low.slice(0, 3)
    const frontier = priorities.every((s) => s.status === 'strength')
    let strengths = high.filter((s) => s.status === 'strength' && !priorities.includes(s)).slice(0, 3)
    const relative = strengths.length === 0
    if (relative && !even) strengths = high.filter((s) => !priorities.includes(s)).slice(0, 2)
    return { steps, overall, band, low, high, even, priorities, frontier, strengths, relative }
  }

  /* ---------- Report links ---------- */

  // A report code is the version, one digit per profile answer and one digit per statement.
  // It carries no personal details, so it is safe to share and to store in HubSpot.
  function encodeReport() {
    const idx = C.profile.map((q) => q.options.findIndex((o) => o.id === state.profile[q.id]))
    if (idx.some((i) => i < 0 || i > 9) || state.answers.some((v) => v === null)) return null
    return REPORT_VERSION + idx.join('') + state.answers.join('')
  }

  function decodeReport(code) {
    if (!code || code.length !== 1 + C.profile.length + TOTAL_STATEMENTS) return null
    if (!/^\d+$/.test(code) || code[0] !== REPORT_VERSION) return null
    const profile = {}
    for (let i = 0; i < C.profile.length; i++) {
      const option = C.profile[i].options[Number(code[1 + i])]
      if (!option) return null
      profile[C.profile[i].id] = option.id
    }
    const answers = code
      .slice(1 + C.profile.length)
      .split('')
      .map(Number)
    if (answers.some((v) => v > MAX_VALUE)) return null
    return { profile, answers }
  }

  function readSharedReport() {
    const match = location.hash.match(/^#r=(\d+)$/)
    return match ? decodeReport(match[1]) : null
  }

  /* ---------- Saved progress (this browser only) ---------- */

  const store = {
    load() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    },
    save() {
      if (state.shared) return
      try {
        const { screen, step, profile, answers, firstName, detailsDone, sentCode } = state
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, step, profile, answers, firstName, detailsDone, sentCode }))
      } catch {
        /* storage unavailable: the diagnostic still works, it just won't resume */
      }
    },
    clear() {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* nothing to clear */
      }
    },
  }

  function restore(saved) {
    if (!saved || typeof saved !== 'object') return
    if (saved.profile && typeof saved.profile === 'object') {
      for (const q of C.profile) {
        if (profileOption(q.id, saved.profile[q.id])) state.profile[q.id] = saved.profile[q.id]
      }
    }
    if (Array.isArray(saved.answers) && saved.answers.length === TOTAL_STATEMENTS) {
      state.answers = saved.answers.map((v) => (Number.isInteger(v) && v >= 0 && v <= MAX_VALUE ? v : null))
    }
    if (['intro', 'profile', 'step', 'details', 'results'].includes(saved.screen)) state.screen = saved.screen
    if (Number.isInteger(saved.step)) state.step = saved.step
    state.firstName = typeof saved.firstName === 'string' ? saved.firstName.slice(0, 60) : ''
    state.detailsDone = saved.detailsDone === true
    state.sentCode = typeof saved.sentCode === 'string' ? saved.sentCode : null
  }

  /* ---------- Navigation ---------- */

  // Never land on a screen whose earlier answers are missing.
  function resolve(screen, step) {
    if (state.shared) return { screen: 'results', step: 0 }
    if (screen === 'intro' || screen === 'profile') return { screen, step: 0 }
    if (!profileComplete()) return { screen: 'profile', step: 0 }
    const gap = firstIncompleteStep()
    if (screen === 'step') {
      const clamped = Math.min(Math.max(step, 0), STEPS.length - 1)
      return { screen, step: gap !== -1 && clamped > gap ? gap : clamped }
    }
    if (gap !== -1) return { screen: 'step', step: gap }
    if (screen === 'results' && CFG.requireDetails !== false && !state.detailsDone) return { screen: 'details', step: 0 }
    return { screen, step: 0 }
  }

  function resumeTarget() {
    if (!profileComplete()) return ['profile', 0]
    const gap = firstIncompleteStep()
    if (gap !== -1) return ['step', gap]
    return [state.detailsDone || CFG.requireDetails === false ? 'results' : 'details', 0]
  }

  function go(screen, step = 0, { history: mode = 'push', focus = true } = {}) {
    ;({ screen, step } = resolve(screen, step))
    state.screen = screen
    state.step = step
    store.save()
    const url = state.shared ? location.pathname + location.search + location.hash : location.pathname + location.search
    const depth = typeof window.history.state?.depth === 'number' ? window.history.state.depth : 0
    if (mode === 'push') window.history.pushState({ screen, step, depth: depth + 1 }, '', url)
    if (mode === 'replace') window.history.replaceState({ screen, step, depth }, '', url)
    render()
    if (focus) {
      window.scrollTo(0, 0)
      app.querySelector('[data-focus]')?.focus({ preventScroll: true })
    }
  }

  function back() {
    // If the previous history entry is ours, use it so the browser's back button stays in step.
    if ((window.history.state?.depth || 0) > 0) {
      window.history.back()
      return
    }
    const previous = {
      profile: ['intro', 0],
      step: state.step > 0 ? ['step', state.step - 1] : ['profile', 0],
      details: ['step', STEPS.length - 1],
    }[state.screen]
    if (previous) go(previous[0], previous[1], { history: 'replace' })
  }

  function restart() {
    const wasShared = state.shared
    store.clear()
    state = fresh()
    go('intro', 0)
    track(wasShared ? 'nine_steps_take_it_yourself' : 'nine_steps_restart')
  }

  window.addEventListener('popstate', (event) => {
    const shared = readSharedReport()
    if (shared) {
      openShared(shared)
      return
    }
    if (state.shared) {
      // Leaving someone else's report: pick up this visitor's own saved progress again.
      state = fresh()
      restore(store.load())
    }
    const target = event.state || { screen: 'intro', step: 0 }
    go(target.screen, target.step, { history: 'none' })
  })

  function openShared(report) {
    state = fresh()
    state.shared = true
    state.profile = report.profile
    state.answers = report.answers
    state.screen = 'results'
    render()
    window.scrollTo(0, 0)
  }

  /* ---------- Rendering ---------- */

  const TITLES = {
    intro: () => 'The 9 Steps Diagnostic | Business Leader',
    profile: () => 'About you | The 9 Steps Diagnostic',
    step: () => `Step ${STEPS[state.step].n} of ${STEPS.length}: ${STEPS[state.step].name} | The 9 Steps Diagnostic`,
    details: () => 'Your report is ready | The 9 Steps Diagnostic',
    results: () => 'Your 9 Steps report | Business Leader',
  }

  function render() {
    const views = {
      intro: renderIntro,
      profile: renderProfile,
      step: () => renderStep(state.step),
      details: renderDetails,
      results: renderResults,
    }
    app.innerHTML = views[state.screen]()
    document.title = TITLES[state.screen]()
    if (state.screen === 'results') onResultsShown()
  }

  function progress({ current = -1, label, right = '' }) {
    const done = STEPS.filter((_, i) => stepComplete(i)).length
    const segments = STEPS.map((_, i) => {
      const cls = i === current ? ' is-current' : stepComplete(i) ? ' is-done' : ''
      return `<span class="progress-seg${cls}"></span>`
    }).join('')
    return `
      <div class="progress" role="progressbar" aria-label="Diagnostic progress" aria-valuemin="0" aria-valuemax="${STEPS.length}"
        aria-valuenow="${done}" aria-valuetext="${esc(label)}. ${done} of ${STEPS.length} steps complete.">
        <div class="progress-segs" aria-hidden="true">${segments}</div>
        <p class="progress-text" aria-hidden="true"><span>${esc(label)}</span><span>${esc(right)}</span></p>
      </div>`
  }

  function startButton(extraClass = '') {
    const resume = hasProgress()
    return `<button type="button" class="btn btn-primary ${extraClass}" data-action="${resume ? 'resume' : 'start'}">
      ${resume ? 'Continue where you left off' : 'Start the diagnostic'} ${svg(icon.arrowRight)}</button>`
  }

  function renderIntro() {
    const stairs = STEPS.map(
      (s, i) => `<li class="stair" style="--i:${i}"><span class="stair-n">${pad(s.n)}</span><span>${esc(s.name)}</span></li>`,
    ).join('')
    const list = STEPS.map(
      (s) =>
        `<li><span class="n">${pad(s.n)}</span><span><strong>${esc(s.name)}</strong><span class="short">${esc(s.short)}</span></span></li>`,
    ).join('')
    return `
      <section class="hero on-dark" aria-labelledby="intro-title">
        <div class="container hero-grid">
          <div class="hero-copy">
            <p class="eyebrow"><span class="bl-dot" aria-hidden="true"></span>${esc(C.meta.name)}</p>
            <h1 id="intro-title" tabindex="-1" data-focus>Which of the <mark>9&nbsp;Steps</mark> is holding your business back?</h1>
            <p class="lead">Sir Richard Harpin grew HomeServe from a £50,000 start-up to a £4.1bn sale. His 9 Steps to a Billion set out how.
              Rate your business against each step and get a personal report on where you are strong, where you are stuck and what to do next.</p>
            <div class="hero-cta">
              ${startButton('btn-lg')}
              <p class="hero-meta">
                <span>${svg(icon.clock)} About ${C.meta.minutes} minutes</span>
                <span>${svg(icon.list)} ${TOTAL_STATEMENTS} statements</span>
                <span>${svg(icon.file)} Free personal report</span>
              </p>
            </div>
            ${hasProgress() ? '<p class="hero-resume">Or <button type="button" class="btn-text" data-action="restart">start again</button> from the beginning.</p>' : ''}
          </div>
          <div class="stairs-wrap">
            <p class="stairs-top" aria-hidden="true"><span class="bl-dot"></span>£1bn</p>
            <ol class="stairs" aria-label="The 9 Steps to a Billion">${stairs}</ol>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="how-title">
        <div class="container">
          <h2 id="how-title" class="section-title">How it works</h2>
          <ol class="how-grid">
            <li class="how-card"><span class="how-n" aria-hidden="true">1</span><h3>Tell us about your business</h3>
              <p>Three quick questions about your role, your turnover and your ambition.</p></li>
            <li class="how-card"><span class="how-n" aria-hidden="true">2</span><h3>Rate yourself on each step</h3>
              <p>Three statements per step. Be candid: the report is only as useful as your answers.</p></li>
            <li class="how-card"><span class="how-n" aria-hidden="true">3</span><h3>Get your personal report</h3>
              <p>Your score out of 100, your strongest steps and your three priority steps, with practical next moves from Richard's playbook.</p></li>
          </ol>
        </div>
      </section>

      <section class="section section-tight" aria-labelledby="framework-title">
        <div class="container">
          <div class="framework">
            <div class="framework-copy">
              <p class="eyebrow"><span class="bl-dot" aria-hidden="true"></span>The framework</p>
              <h2 id="framework-title" class="section-title">Built on the 9 Steps to a Billion</h2>
              <p>Sir Richard Harpin founded HomeServe and grew it from a £50,000 start-up to a £4.1bn sale. In his Sunday Times bestseller,
                <em>How to Make a Billion in Nine Steps</em>, he distils what he learned into nine steps any founder or CEO can work through.</p>
              <p>Business Leader, which Richard owns, uses the 9 Steps as the backbone of its CEO coaching and peer forums for founders and CEOs of £3m+ businesses.</p>
              <div class="framework-cta">
                ${startButton()}
                <a class="link-arrow" href="${esc(LINKS.book)}" ${newTab} data-cta="intro-book">Get the book ${svg(icon.arrowUpRight)}${newTabNote}</a>
              </div>
            </div>
            <ol class="framework-list" aria-label="The 9 Steps">${list}</ol>
          </div>
        </div>
      </section>`
  }

  function renderProfile() {
    const questions = C.profile
      .map(
        (q) => `
        <fieldset class="question" data-question="${q.id}">
          <legend>${esc(q.question)}</legend>
          <div class="options">
            ${q.options
              .map(
                (o) => `<label class="option"><input type="radio" name="p-${q.id}" value="${esc(o.id)}" data-profile="${q.id}"
                  ${state.profile[q.id] === o.id ? 'checked' : ''} /><span>${esc(o.label)}</span></label>`,
              )
              .join('')}
          </div>
        </fieldset>`,
      )
      .join('')
    return `
      <section class="screen" aria-labelledby="profile-title">
        <div class="container narrow">
          ${progress({ label: 'Before you start', right: `About ${C.meta.minutes} minutes in total` })}
          <p class="eyebrow">Before you start</p>
          <h1 id="profile-title" class="screen-title" tabindex="-1" data-focus>First, a little about you</h1>
          <p class="lead">Three quick questions so your report reflects your stage and your ambition.</p>
          <form id="profile-form" novalidate>
            <div class="qform">${questions}</div>
            <p class="form-error" role="alert" hidden></p>
            <div class="nav">
              <button type="button" class="btn btn-text" data-action="back">${svg(icon.arrowLeft)} Back</button>
              <button type="submit" class="btn btn-primary">Continue ${svg(icon.arrowRight)}</button>
            </div>
          </form>
        </div>
      </section>`
  }

  function renderStep(i) {
    const step = STEPS[i]
    const statements = step.statements
      .map((text, j) => {
        const idx = OFFSETS[i] + j
        const value = state.answers[idx]
        return `
        <fieldset class="question statement" data-question="${idx}">
          <legend><span class="statement-n" aria-hidden="true">${j + 1}</span><span>${esc(text)}</span></legend>
          <div class="scale">
            ${C.scale
              .map(
                (o) => `<label class="scale-option"><input type="radio" name="s-${idx}" value="${o.value}" data-statement="${idx}"
                  ${value === o.value ? 'checked' : ''} /><span>${esc(o.label)}</span></label>`,
              )
              .join('')}
          </div>
        </fieldset>`
      })
      .join('')
    const minutesLeft = Math.max(1, Math.round((STEPS.length - i) * (C.meta.minutes / STEPS.length)))
    const last = i === STEPS.length - 1
    return `
      <section class="screen" aria-labelledby="step-title">
        <div class="container narrow">
          ${progress({ current: i, label: `Step ${step.n} of ${STEPS.length}`, right: `About ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'} left` })}
          <div class="step-head">
            <div class="step-badge" aria-hidden="true">${pad(step.n)}</div>
            <div>
              <p class="eyebrow">Step ${step.n} of ${STEPS.length}</p>
              <h1 id="step-title" class="screen-title" tabindex="-1" data-focus><span class="sr-only">Step ${step.n}: </span>${esc(step.name)}</h1>
            </div>
          </div>
          <p class="principle">${esc(step.principle)}</p>
          <form id="step-form" novalidate>
            <p class="instructions">How true is each statement for you and your business today?</p>
            <div class="qform">${statements}</div>
            <p class="form-error" role="alert" hidden></p>
            <div class="nav">
              <button type="button" class="btn btn-text" data-action="back">${svg(icon.arrowLeft)} Back</button>
              <button type="submit" class="btn btn-primary">${last ? 'Finish' : 'Next step'} ${svg(icon.arrowRight)}</button>
            </div>
          </form>
        </div>
      </section>`
  }

  function renderDetails() {
    const d = state.details || {}
    const field = (name, label, { type = 'text', autocomplete = '', required = true, wide = false } = {}) => `
      <div class="field${wide ? ' field-wide' : ''}">
        <label for="f-${name}">${esc(label)}${required ? '' : ' <span class="optional">(optional)</span>'}</label>
        <input id="f-${name}" name="${name}" type="${type}" autocomplete="${autocomplete}" value="${esc(d[name] || '')}"
          ${required ? 'required aria-required="true"' : ''} aria-describedby="f-${name}-error" />
        <p class="field-error" id="f-${name}-error" hidden></p>
      </div>`
    return `
      <section class="screen" aria-labelledby="details-title">
        <div class="container narrow">
          ${progress({ label: 'All 9 steps complete', right: 'One last thing' })}
          <p class="eyebrow">All 9 steps complete</p>
          <h1 id="details-title" class="screen-title" tabindex="-1" data-focus>Your report is ready</h1>
          <p class="lead">Tell us who you are to see it: your score out of 100, your strongest steps and your three priority steps, with practical next moves.</p>
          <form id="details-form" class="question details-card" novalidate>
            <div class="field-grid">
              ${field('firstName', 'First name', { autocomplete: 'given-name' })}
              ${field('lastName', 'Last name', { autocomplete: 'family-name' })}
              ${field('email', 'Work email', { type: 'email', autocomplete: 'email', wide: true })}
              ${field('company', 'Company', { autocomplete: 'organization' })}
              ${field('jobTitle', 'Job title', { autocomplete: 'organization-title', required: false })}
              ${field('phone', 'Phone', { type: 'tel', autocomplete: 'tel', required: false })}
            </div>
            <label class="check"><input type="checkbox" name="marketingOptIn" ${d.marketingOptIn ? 'checked' : ''} />
              <span>Send me Business Leader's insights, events and offers by email. You can unsubscribe at any time.</span></label>
            <p class="small">We use your details to produce your report, and a member of the Business Leader team may get in touch to talk
              through your results. See our <a href="${esc(LINKS.privacy)}" ${newTab}>privacy policy${newTabNote}</a>.</p>
            <p class="form-error" role="alert" hidden></p>
            <div class="nav">
              <button type="button" class="btn btn-text" data-action="back">${svg(icon.arrowLeft)} Back</button>
              <button type="submit" class="btn btn-primary">See my report ${svg(icon.arrowRight)}</button>
            </div>
            ${CFG.requireDetails === false ? '<p class="skip-row"><button type="button" class="btn-text" data-action="skip-details">Skip and see my report</button></p>' : ''}
          </form>
        </div>
      </section>`
  }

  function chip(status) {
    const glyph = { strength: icon.check, developing: icon.half, gap: icon.gap }[status]
    return `<span class="chip chip-${status}">${svg(glyph)}${esc(C.status[status].label)}</span>`
  }

  function renderResults() {
    const r = score(state.answers)
    const stage = C.stages[state.profile.turnover] || null
    const ambition = profileOption('ambition', state.profile.ambition)
    const code = encodeReport()
    const top = r.high[0]
    const low = r.low[0]
    const name = state.shared ? '' : state.firstName
    const heading = name
      ? `${esc(name)}, here’s where your business stands`
      : state.shared
        ? 'Here’s where this business stands'
        : 'Here’s where your business stands'

    const facts = [
      stage ? `<div><dt>Stage</dt><dd>${esc(stage.name)}<span>${esc(stage.range)}. ${esc(stage.focus)}</span></dd></div>` : '',
      r.even
        ? `<div><dt>Across the 9 Steps</dt><dd>Level scores<span>Every step scored ${top.score}/100.</span></dd></div>`
        : `<div><dt>Strongest step</dt><dd>${pad(top.n)} ${esc(top.name)}<span>${top.score}/100</span></dd></div>
           <div><dt>Biggest opportunity</dt><dd>${pad(low.n)} ${esc(low.name)}<span>${low.score}/100</span></dd></div>`,
    ].join('')

    const hero = `
      <section class="results-hero on-dark" aria-labelledby="results-title">
        <div class="container">
          <div>
            <p class="eyebrow"><span class="bl-dot" aria-hidden="true"></span>${state.shared ? 'Shared 9 Steps report' : 'Your 9 Steps report'}</p>
            <h1 id="results-title" tabindex="-1" data-focus>${heading}</h1>
            <div class="score-block">
              <p class="score"><span class="score-value">${r.overall}</span><span class="score-max">/100</span><span class="sr-only"> overall 9 Steps score</span></p>
              <svg class="score-meter" height="8" aria-hidden="true" focusable="false">
                <rect class="score-track" width="100%" height="8" rx="4" />
                ${r.overall > 0 ? `<rect class="score-fill" width="${r.overall}%" height="8" rx="4" />` : ''}
              </svg>
              <p class="band"><mark>${esc(r.band.label)}</mark></p>
              <p class="band-text">${esc(r.band.text)}</p>
              ${ambition ? `<p class="ambition-line">To ${esc(ambition.phrase)}, start with <strong>Step ${low.n}: ${esc(low.name)}</strong>.</p>` : ''}
            </div>
          </div>
          <dl class="facts">${facts}</dl>
        </div>
      </section>`

    const rows = r.steps
      .map(
        (s) => `
        <li>
          <details class="profile-row">
            <summary>
              <span class="row-n">${pad(s.n)}</span>
              <span class="row-name">${esc(s.name)}</span>
              <span class="row-meter" aria-hidden="true"><span class="row-fill" style="--v:${s.score}%"></span></span>
              <span class="row-value">${s.score}<span class="sr-only"> out of 100</span></span>
              <span class="row-chip">${chip(s.status)}</span>
              <span class="row-chev" aria-hidden="true">${svg(icon.chevron)}</span>
            </summary>
            <ul class="row-answers" aria-label="Your answers for ${esc(s.name)}">
              ${s.statements.map((t, j) => `<li><span class="answer-tag">${esc(scaleLabel(s.vals[j]))}</span><span>${esc(t)}</span></li>`).join('')}
            </ul>
          </details>
        </li>`,
      )
      .join('')

    const cards = r.priorities
      .map(
        (s, k) => `
        <article class="priority-card" id="step-${s.id}" aria-labelledby="prio-${s.id}">
          <div class="priority-top"><span class="priority-rank">${r.frontier ? 'Next frontier' : 'Priority'} ${k + 1}</span>${chip(s.status)}</div>
          <h3 id="prio-${s.id}"><span class="num">${pad(s.n)}</span><span>${esc(s.name)}</span></h3>
          <p class="priority-score">Your score: <strong>${s.score}/100</strong></p>
          <p class="principle">${esc(s.principle)}</p>
          <h4>Try this next</h4>
          <ol class="actions">${s.actions.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>
          <div class="bl-helps"><span class="bl-dot" aria-hidden="true"></span><p><strong>How Business Leader helps:</strong> ${esc(s.blHelps)}</p></div>
          <p class="watch">
            <a class="link-arrow" href="${esc(watchUrl(s.watch))}" ${newTab} data-cta="watch-step-${s.n}">${svg(icon.play)} Watch Richard on this step${newTabNote}</a>
            <small>With ${esc(s.watch.guest)}, ${esc(s.watch.guestRole)}, on the 9 Steps podcast</small>
          </p>
        </article>`,
      )
      .join('')

    let strengthsBody
    if (r.even) {
      strengthsBody =
        top.status === 'strength'
          ? '<p class="section-intro">Every one of the nine steps is a strength. The job now is to protect them as the business grows.</p>'
          : '<p class="section-intro">Your scores are level across all nine steps, so no step stands out yet. Your priority steps above are the place to start.</p>'
    } else {
      strengthsBody = `
        <p class="section-intro">${
          r.relative
            ? 'None of your steps is a clear strength yet, but these are your best foundations to build on.'
            : 'Keep doing what works here, and use these strengths to support your priority steps.'
        }</p>
        <ul class="strength-list">
          ${r.strengths
            .map(
              (s) => `<li class="strength-item"><span class="n">${pad(s.n)}</span><div><strong>${esc(s.name)}</strong>
                <span class="strength-score">${s.score}/100</span><p>${esc(s.short)}</p></div></li>`,
            )
            .join('')}
        </ul>`
    }

    const inIcp = stage ? stage.inIcp : true
    const cta = inIcp
      ? `
        <div>
          <p class="eyebrow"><span class="bl-dot" aria-hidden="true"></span>Your next step</p>
          <h2>Talk through your results with us</h2>
          <p class="cta-text">A membership adviser will take you through your 9 Steps profile and show how founders and CEOs at your stage use
            Business Leader's peer forums, CEO coaching and 12-month Growth Plan to work on their priority steps. It's a conversation, not a commitment.</p>
        </div>
        <div class="cta-buttons">
          <a class="btn btn-primary btn-lg" href="${esc(LINKS.bookConversation)}" ${newTab} data-cta="book-conversation">Book a conversation ${svg(icon.arrowRight)}${newTabNote}</a>
          <a class="btn btn-secondary btn-lg" href="${esc(LINKS.roundtable)}" ${newTab} data-cta="roundtable">Join a Roundtable with Sir Richard Harpin${newTabNote}</a>
          <p class="cta-note">Roundtables are small-group sessions where Richard shares how he scaled HomeServe and the 9 Steps in practice.</p>
        </div>`
      : `
        <div>
          <p class="eyebrow"><span class="bl-dot" aria-hidden="true"></span>Your next step</p>
          <h2>Keep building towards £3m</h2>
          <p class="cta-text">Business Leader membership is designed for founders and CEOs of £3m+ businesses. Until you get there, Richard's book,
            the 9 Steps podcast and our weekly newsletter will help you work through your priority steps.</p>
        </div>
        <div class="cta-buttons">
          <a class="btn btn-primary btn-lg" href="${esc(LINKS.newsletter)}" ${newTab} data-cta="newsletter">Get the weekly newsletter ${svg(icon.arrowRight)}${newTabNote}</a>
          <a class="btn btn-secondary btn-lg" href="${esc(LINKS.book)}" ${newTab} data-cta="book">Read the book${newTabNote}</a>
        </div>`

    const deeper = `
      <div class="deeper-grid">
        <a class="deeper-card" href="${esc(LINKS.book)}" ${newTab} data-cta="deeper-book">
          <span class="kicker">The book</span><strong>How to Make a Billion in Nine Steps</strong>
          <p>Richard's Sunday Times bestseller, with the full story behind each step.</p>
          <span class="link-arrow">Get the book ${svg(icon.arrowUpRight)}</span>${newTabNote}</a>
        <a class="deeper-card" href="${esc(LINKS.podcastSpotify)}" ${newTab} data-cta="deeper-podcast">
          <span class="kicker">The podcast</span><strong>How to Make a Billion in 9 Steps</strong>
          <p>Three episodes, three steps each, with Touker Suleyman, Steve Hewitt and Jonathan King.</p>
          <span class="link-arrow">Listen on Spotify ${svg(icon.arrowUpRight)}</span>${newTabNote}</a>
        <a class="deeper-card" href="${esc(LINKS.bookExtract)}" ${newTab} data-cta="deeper-extract">
          <span class="kicker">Read</span><strong>Why the hardest leadership skill is saying no</strong>
          <p>An extract from the book on focus, foxes and hedgehogs, and the not-to-do list.</p>
          <span class="link-arrow">Read on Business Leader ${svg(icon.arrowUpRight)}</span>${newTabNote}</a>
      </div>`

    const actions = `
      <div class="report-actions">
        <button type="button" class="btn btn-secondary btn-sm" data-action="print">${svg(icon.print)} Save as PDF</button>
        ${code ? `<button type="button" class="btn btn-secondary btn-sm" data-action="copy-link" data-url="${esc(reportUrl(code))}">${svg(icon.link)} Copy link to this report</button>` : ''}
        <button type="button" class="btn btn-text" data-action="restart">${state.shared ? 'Take the diagnostic yourself' : 'Start again'}</button>
      </div>`

    const banner = state.shared
      ? `<div class="shared-banner"><div class="container"><p>You are viewing a shared 9 Steps report.</p>
          <button type="button" class="btn btn-secondary btn-sm" data-action="restart">Take the diagnostic yourself</button></div></div>`
      : ''

    return `
      ${banner}
      ${hero}
      <section class="results-section" aria-labelledby="profile-heading">
        <div class="container">
          <h2 id="profile-heading" class="section-title">Your profile across the 9 Steps</h2>
          <p class="section-intro">Each step is scored out of 100 from your three answers. Select a step to see how you answered.</p>
          <div class="profile-card"><ol class="profile-list">${rows}</ol></div>
          <ul class="legend-row" aria-label="Key">
            ${['strength', 'developing', 'gap'].map((k) => `<li>${chip(k)} ${esc(C.status[k].key)}</li>`).join('')}
          </ul>
        </div>
      </section>

      <section class="results-section" aria-labelledby="priorities-heading">
        <div class="container">
          <h2 id="priorities-heading" class="section-title">${r.frontier ? 'Your next frontier' : 'Your three priority steps'}</h2>
          <p class="section-intro">${
            r.frontier
              ? 'You are strong across the board. These are the steps with the most room left, and where your next gains will come from.'
              : 'The steps where focused effort will move your business fastest. Start with the first.'
          }</p>
          <div class="priority-grid">${cards}</div>
        </div>
      </section>

      <section class="results-section" aria-labelledby="strengths-heading">
        <div class="container">
          <h2 id="strengths-heading" class="section-title">${r.relative || r.even ? 'Your strongest steps' : 'Where you are strong'}</h2>
          ${strengthsBody}
        </div>
      </section>

      <section class="results-section" aria-label="Your next step">
        <div class="container"><div class="cta-panel on-dark">${cta}</div></div>
      </section>

      <section class="results-section" aria-labelledby="deeper-heading">
        <div class="container">
          <h2 id="deeper-heading" class="section-title">Go deeper into the 9 Steps</h2>
          ${deeper}
          ${actions}
          <p class="print-only small">Your 9 Steps report, ${esc(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))}. Take the diagnostic at ${esc(location.origin + location.pathname)}</p>
        </div>
      </section>`
  }

  function onResultsShown() {
    const r = score(state.answers)
    const stage = C.stages[state.profile.turnover]
    track('nine_steps_results_view', {
      nine_steps_score: r.overall,
      nine_steps_stage: stage ? stage.name : '',
      nine_steps_priority: r.priorities.map((s) => s.n).join(','),
      nine_steps_shared: state.shared,
    })
  }

  /* ---------- Form handling ---------- */

  function showFormError(form, message) {
    const el = form.querySelector('.form-error')
    if (!el) return
    el.textContent = message
    el.hidden = !message
  }

  function onProfileSubmit(form) {
    const missing = C.profile.filter((q) => !state.profile[q.id])
    form.querySelectorAll('.question').forEach((fs) => fs.classList.toggle('is-missing', missing.some((q) => q.id === fs.dataset.question)))
    if (missing.length) {
      showFormError(form, `Please answer ${missing.length === 1 ? 'the last question' : `all ${C.profile.length} questions`} to continue.`)
      form.querySelector(`.question[data-question="${missing[0].id}"] input`)?.focus()
      return
    }
    track('nine_steps_profile_complete', {
      nine_steps_role: state.profile.role,
      nine_steps_turnover: state.profile.turnover,
      nine_steps_ambition: state.profile.ambition,
    })
    go('step', 0)
  }

  function onStepSubmit(form) {
    const i = state.step
    const missing = STEPS[i].statements.map((_, j) => OFFSETS[i] + j).filter((idx) => state.answers[idx] === null)
    form.querySelectorAll('.question').forEach((fs) => fs.classList.toggle('is-missing', missing.includes(Number(fs.dataset.question))))
    if (missing.length) {
      showFormError(form, `Please rate ${missing.length === 1 ? 'the remaining statement' : 'all three statements'} to continue.`)
      form.querySelector(`.question[data-question="${missing[0]}"] input`)?.focus()
      return
    }
    track('nine_steps_step_complete', { nine_steps_step: STEPS[i].n, nine_steps_step_name: STEPS[i].name })
    if (i < STEPS.length - 1) go('step', i + 1)
    else go('details')
  }

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  function onDetailsSubmit(form) {
    const get = (name) => (form.elements[name]?.value || '').trim()
    const details = {
      firstName: get('firstName'),
      lastName: get('lastName'),
      email: get('email'),
      company: get('company'),
      jobTitle: get('jobTitle'),
      phone: get('phone'),
      marketingOptIn: Boolean(form.elements.marketingOptIn?.checked),
    }
    state.details = details
    const errors = {}
    if (!details.firstName) errors.firstName = 'Enter your first name.'
    if (!details.lastName) errors.lastName = 'Enter your last name.'
    if (!EMAIL.test(details.email)) errors.email = 'Enter a valid email address, like name@company.co.uk.'
    if (!details.company) errors.company = 'Enter your company name.'
    for (const name of ['firstName', 'lastName', 'email', 'company', 'jobTitle', 'phone']) {
      const input = form.elements[name]
      const message = form.querySelector(`#f-${name}-error`)
      if (!input || !message) continue
      input.setAttribute('aria-invalid', errors[name] ? 'true' : 'false')
      message.textContent = errors[name] || ''
      message.hidden = !errors[name]
    }
    const invalid = Object.keys(errors)
    if (invalid.length) {
      showFormError(form, invalid.length === 1 ? 'Please check the highlighted field.' : 'Please check the highlighted fields.')
      form.elements[invalid[0]]?.focus()
      return
    }
    showFormError(form, '')
    state.firstName = details.firstName.slice(0, 60)
    state.detailsDone = true
    sendLead(details)
    go('results')
  }

  function sendLead(details) {
    const code = encodeReport()
    if (!code || state.sentCode === code) return // already sent these answers
    state.sentCode = code
    store.save()
    const r = score(state.answers)
    const payload = hubspotPayload(details, r, code)
    document.dispatchEvent(new CustomEvent('nine-steps:lead', { detail: payload }))
    track('nine_steps_lead_submitted', {
      nine_steps_score: r.overall,
      nine_steps_stage: C.stages[state.profile.turnover]?.name || '',
      nine_steps_marketing_opt_in: details.marketingOptIn,
    })
    submitToHubSpot(payload).catch((error) => {
      console.warn('[9 Steps] HubSpot submission failed. The results were still shown.', error)
      track('nine_steps_lead_error')
    })
  }

  function hubspotPayload(details, r, code) {
    const f = CFG.hubspot?.fields || {}
    const fields = []
    const add = (name, value) => {
      if (name && value !== undefined && value !== null && value !== '') fields.push({ objectTypeId: '0-1', name, value: String(value) })
    }
    add(f.firstName, details.firstName)
    add(f.lastName, details.lastName)
    add(f.email, details.email)
    add(f.company, details.company)
    add(f.jobTitle, details.jobTitle)
    add(f.phone, details.phone)
    add(f.marketingOptIn, details.marketingOptIn ? 'true' : 'false')
    add(f.score, r.overall)
    if (f.stepScore) r.steps.forEach((s) => add(f.stepScore.replace('{n}', s.n), s.score))
    add(f.priorities, r.priorities.map((s) => `${s.n}. ${s.name}`).join('; '))
    add(f.strengths, r.strengths.map((s) => `${s.n}. ${s.name}`).join('; '))
    add(f.stage, C.stages[state.profile.turnover]?.name)
    add(f.role, profileOption('role', state.profile.role)?.label)
    add(f.turnover, profileOption('turnover', state.profile.turnover)?.label)
    add(f.ambition, profileOption('ambition', state.profile.ambition)?.label)
    add(f.answers, code)
    add(f.reportUrl, reportUrl(code))
    const context = { pageUri: location.origin + location.pathname, pageName: 'The 9 Steps Diagnostic' }
    const hutk = (document.cookie.match(/(?:^|;\s*)hubspotutk=([^;]+)/) || [])[1]
    if (hutk) context.hutk = hutk
    return { fields, context }
  }

  async function submitToHubSpot(payload) {
    const hs = CFG.hubspot || {}
    if (!hs.portalId || !hs.formGuid) {
      console.info('[9 Steps] No HubSpot form is configured, so nothing was sent. This is what would be submitted:', payload)
      return { sent: false }
    }
    const url = `${hs.apiBase || 'https://api.hsforms.com'}/submissions/v3/integration/submit/${encodeURIComponent(hs.portalId)}/${encodeURIComponent(hs.formGuid)}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
    if (!response.ok) throw new Error(`HubSpot responded ${response.status}: ${await response.text()}`)
    return { sent: true }
  }

  async function copyLink(button) {
    const url = button.dataset.url
    let copied = false
    try {
      await navigator.clipboard.writeText(url)
      copied = true
    } catch {
      const area = document.createElement('textarea')
      area.value = url
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      try {
        copied = document.execCommand('copy')
      } catch {
        copied = false
      }
      area.remove()
    }
    if (!copied) {
      window.prompt('Copy this link to your report:', url)
      return
    }
    const original = button.innerHTML
    button.innerHTML = `${svg(icon.check)} Link copied`
    announce('Link to this report copied to your clipboard.')
    track('nine_steps_report_link_copied')
    window.setTimeout(() => {
      button.innerHTML = original
    }, 2500)
  }

  /* ---------- Events ---------- */

  app.addEventListener('click', (event) => {
    const cta = event.target.closest('[data-cta]')
    if (cta) track('nine_steps_cta_click', { nine_steps_cta: cta.dataset.cta })
    const el = event.target.closest('[data-action]')
    if (!el) return
    switch (el.dataset.action) {
      case 'start':
        track('nine_steps_start')
        go('profile')
        break
      case 'resume': {
        const [screen, step] = resumeTarget()
        track('nine_steps_resume')
        go(screen, step)
        break
      }
      case 'restart':
        restart()
        break
      case 'back':
        back()
        break
      case 'skip-details':
        track('nine_steps_details_skipped')
        go('results')
        break
      case 'print':
        track('nine_steps_print')
        window.print()
        break
      case 'copy-link':
        copyLink(el)
        break
    }
  })

  app.addEventListener('change', (event) => {
    const input = event.target
    if (input.matches('input[data-profile]')) {
      state.profile[input.dataset.profile] = input.value
    } else if (input.matches('input[data-statement]')) {
      state.answers[Number(input.dataset.statement)] = Number(input.value)
      // Changing an answer after sending means the next details submit sends the new answers.
    } else {
      return
    }
    input.closest('.question')?.classList.remove('is-missing')
    const form = input.closest('form')
    if (form && !form.querySelector('.question.is-missing')) showFormError(form, '')
    store.save()
  })

  app.addEventListener('submit', (event) => {
    event.preventDefault()
    const form = event.target
    if (form.id === 'profile-form') onProfileSubmit(form)
    if (form.id === 'step-form') onStepSubmit(form)
    if (form.id === 'details-form') onDetailsSubmit(form)
  })

  /* ---------- Start ---------- */

  function loadTagManager(id) {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`
    document.head.appendChild(script)
  }

  function init() {
    if (CFG.analytics?.gtmId) loadTagManager(CFG.analytics.gtmId)
    const shared = readSharedReport()
    if (shared) {
      openShared(shared)
      window.history.replaceState({ screen: 'results', step: 0, depth: 0 }, '', location.href)
      return
    }
    restore(store.load())
    const { screen, step } = resolve(state.screen, state.step)
    state.screen = screen
    state.step = step
    window.history.replaceState({ screen, step, depth: 0 }, '', location.pathname + location.search)
    render()
  }

  init()
})()
