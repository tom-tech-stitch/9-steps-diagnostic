/*
 * The 9 Steps Diagnostic: screens, scoring, report links and the HubSpot hand-off.
 * Words live in content.js and settings in config.js; this file should rarely need editing.
 *
 * One engine runs two kinds of flow:
 *   - the full diagnostic: about you, one screen per step (27 statements), details, report;
 *   - a 2-minute check (?check=<id>): six statements on one screen, about you, details, report.
 */
;(() => {
  'use strict'

  const C = window.BL_DIAGNOSTIC_CONTENT
  const CFG = window.BL_DIAGNOSTIC_CONFIG || {}
  const LINKS = CFG.links || {}
  const STEPS = C.steps
  const CHECKS = C.checks || []
  const MAX_VALUE = Math.max(...C.scale.map((o) => o.value))
  const SCREENS = {
    full: ['intro', 'profile', 'step', 'details', 'results'],
    check: ['intro', 'questions', 'profile', 'details', 'results'],
  }
  const app = document.getElementById('app')
  const live = document.getElementById('live')

  /* ---------- Flows ---------- */

  function buildFlow(check) {
    if (!check) {
      return {
        kind: 'full',
        id: 'full',
        check: null,
        minutes: C.meta.minutes,
        statements: STEPS.flatMap((s) => s.statements.map((text) => ({ step: s.n, text }))),
        storageKey: 'bl-9-steps-diagnostic-v1',
      }
    }
    return {
      kind: 'check',
      id: check.id,
      check,
      minutes: check.minutes || 2,
      statements: check.statements.map((ref) => ({ step: ref.step, text: ref.text || STEPS[ref.step - 1].statements[ref.pick] })),
      storageKey: `bl-9-steps-check-${check.id}-v1`,
    }
  }

  // The flow this page's address asks for: a check (?check=isolation) or the full diagnostic.
  const pageFlow = () => buildFlow(CHECKS.find((c) => c.id === new URLSearchParams(location.search).get('check')))

  let FLOW
  let FLOW_STEPS = [] // step numbers covered by this flow, ascending
  let STEP_INDICES = {} // step number -> positions of its statements in FLOW.statements

  function useFlow(flow) {
    FLOW = flow
    FLOW_STEPS = [...new Set(flow.statements.map((s) => s.step))].sort((a, b) => a - b)
    STEP_INDICES = {}
    flow.statements.forEach((s, i) => (STEP_INDICES[s.step] = STEP_INDICES[s.step] || []).push(i))
  }

  const isCheck = () => FLOW.kind === 'check'

  const fresh = () => ({
    screen: 'intro',
    step: 0, // position in FLOW_STEPS (full diagnostic only)
    profile: Object.fromEntries(C.profile.map((q) => [q.id, null])),
    answers: new Array(FLOW.statements.length).fill(null),
    firstName: '',
    details: null, // kept in memory only, never stored
    detailsDone: false,
    sentCode: null,
    shared: false,
  })
  let state

  /* ---------- Small helpers ---------- */

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  const pad = (n) => String(n).padStart(2, '0')
  const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  const word = (n) => WORDS[n] || String(n)
  const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  const listOf = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`)
  const stepByN = (n) => STEPS[n - 1]
  const stepsOf = (check) => [...new Set(check.statements.map((s) => s.step))].sort((a, b) => a - b)
  const profileOption = (qid, oid) => C.profile.find((q) => q.id === qid)?.options.find((o) => o.id === oid)
  const scaleLabel = (v) => C.scale.find((o) => o.value === v)?.label ?? 'Not answered'
  const stepComplete = (n) => STEP_INDICES[n].every((i) => state.answers[i] !== null)
  const allAnswered = () => state.answers.every((v) => v !== null)
  const profileComplete = () => C.profile.every((q) => state.profile[q.id])
  const firstIncompleteStep = () => FLOW_STEPS.findIndex((n) => !stepComplete(n))
  const hasProgress = () => profileComplete() || state.answers.some((v) => v !== null)
  const watchUrl = (w) => `https://www.youtube.com/watch?v=${encodeURIComponent(w.video)}&t=${Number(w.t) || 0}s`
  const reportUrl = (code) => `${location.origin}${location.pathname}#r=${code}`
  const checkUrl = (check) => `?check=${encodeURIComponent(check.id)}`
  const newTab = 'target="_blank" rel="noopener"'
  const newTabNote = '<span class="sr-only"> (opens in a new tab)</span>'

  function track(event, data = {}) {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event, nine_steps_check: FLOW ? FLOW.id : '', ...data })
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
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M8 7h8M8 11h6"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    print: '<path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  }

  /* ---------- Scoring ---------- */

  function statusFor(share) {
    if (share >= C.status.strength.minShare) return 'strength'
    if (share >= C.status.developing.minShare) return 'developing'
    return 'gap'
  }

  function score(answers) {
    const steps = FLOW_STEPS.map((n) => {
      const idx = STEP_INDICES[n]
      const vals = idx.map((i) => answers[i] ?? 0)
      const total = vals.reduce((a, b) => a + b, 0)
      const max = idx.length * MAX_VALUE
      return {
        ...stepByN(n),
        items: idx.map((i) => FLOW.statements[i].text),
        vals,
        total,
        score: Math.round((total / max) * 100),
        status: statusFor(total / max),
      }
    })
    const grand = steps.reduce((a, s) => a + s.total, 0)
    const overall = Math.round((grand / (FLOW.statements.length * MAX_VALUE)) * 100)
    const band = C.bands.find((b) => overall >= b.min) || C.bands[C.bands.length - 1]
    // Ties go to the earlier step: the first steps are the foundations for the later ones.
    const low = [...steps].sort((a, b) => a.score - b.score || a.n - b.n)
    const high = [...steps].sort((a, b) => b.score - a.score || a.n - b.n)
    const even = high[0].score === low[0].score
    const priorities = low.slice(0, Math.min(3, steps.length))
    const frontier = priorities.every((s) => s.status === 'strength')
    let strengths = high.filter((s) => s.status === 'strength' && !priorities.includes(s)).slice(0, 3)
    const relative = strengths.length === 0
    if (relative && !even) strengths = high.filter((s) => !priorities.includes(s)).slice(0, 2)
    return { steps, overall, band, low, high, even, priorities, frontier, strengths, relative }
  }

  /* ---------- Report links ---------- */

  // A report code holds no personal details, so it is safe to share and to store in HubSpot.
  //   Full diagnostic: "1" + one digit per profile answer + one digit per statement (27).
  //   2-minute check:  "2" + the check's code digit + profile digits + one digit per statement.
  function encodeReport() {
    const idx = C.profile.map((q) => q.options.findIndex((o) => o.id === state.profile[q.id]))
    if (idx.some((i) => i < 0 || i > 9) || !allAnswered()) return null
    return (isCheck() ? `2${FLOW.check.code}` : '1') + idx.join('') + state.answers.join('')
  }

  function decodeReport(code) {
    if (!code || !/^\d+$/.test(code)) return null
    let flow
    let rest
    if (code[0] === '1') {
      flow = buildFlow(null)
      rest = code.slice(1)
    } else if (code[0] === '2') {
      const check = CHECKS.find((c) => String(c.code) === code[1])
      if (!check) return null
      flow = buildFlow(check)
      rest = code.slice(2)
    } else {
      return null
    }
    if (rest.length !== C.profile.length + flow.statements.length) return null
    const profile = {}
    for (let i = 0; i < C.profile.length; i++) {
      const option = C.profile[i].options[Number(rest[i])]
      if (!option) return null
      profile[C.profile[i].id] = option.id
    }
    const answers = rest
      .slice(C.profile.length)
      .split('')
      .map(Number)
    if (answers.some((v) => v > MAX_VALUE)) return null
    return { flow, profile, answers }
  }

  function readSharedReport() {
    const match = location.hash.match(/^#r=(\d+)$/)
    return match ? decodeReport(match[1]) : null
  }

  /* ---------- Saved progress (this browser only, one record per flow) ---------- */

  const store = {
    load() {
      try {
        const raw = window.localStorage.getItem(FLOW.storageKey)
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    },
    save() {
      if (state.shared) return
      try {
        const { screen, step, profile, answers, firstName, detailsDone, sentCode } = state
        window.localStorage.setItem(FLOW.storageKey, JSON.stringify({ screen, step, profile, answers, firstName, detailsDone, sentCode }))
      } catch {
        /* storage unavailable: the diagnostic still works, it just won't resume */
      }
    },
    clear() {
      try {
        window.localStorage.removeItem(FLOW.storageKey)
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
    if (Array.isArray(saved.answers) && saved.answers.length === FLOW.statements.length) {
      state.answers = saved.answers.map((v) => (Number.isInteger(v) && v >= 0 && v <= MAX_VALUE ? v : null))
    }
    if (SCREENS[FLOW.kind].includes(saved.screen)) state.screen = saved.screen
    if (Number.isInteger(saved.step)) state.step = saved.step
    state.firstName = typeof saved.firstName === 'string' ? saved.firstName.slice(0, 60) : ''
    state.detailsDone = saved.detailsDone === true
    state.sentCode = typeof saved.sentCode === 'string' ? saved.sentCode : null
  }

  /* ---------- Navigation ---------- */

  // Never land on a screen whose earlier answers are missing.
  function resolve(screen, step) {
    if (state.shared) return { screen: 'results', step: 0 }
    if (!SCREENS[FLOW.kind].includes(screen) || screen === 'intro') return { screen: 'intro', step: 0 }
    const needDetails = (s) => s === 'results' && CFG.requireDetails !== false && !state.detailsDone
    if (isCheck()) {
      if (screen === 'questions' || !allAnswered()) return { screen: 'questions', step: 0 }
      if (screen === 'profile' || !profileComplete()) return { screen: 'profile', step: 0 }
      return { screen: needDetails(screen) ? 'details' : screen, step: 0 }
    }
    if (screen === 'profile' || !profileComplete()) return { screen: 'profile', step: 0 }
    const gap = firstIncompleteStep()
    if (screen === 'step') {
      const clamped = Math.min(Math.max(step, 0), FLOW_STEPS.length - 1)
      return { screen, step: gap !== -1 && clamped > gap ? gap : clamped }
    }
    if (gap !== -1) return { screen: 'step', step: gap }
    return { screen: needDetails(screen) ? 'details' : screen, step: 0 }
  }

  function resumeTarget() {
    if (isCheck()) {
      if (!allAnswered()) return ['questions', 0]
      if (!profileComplete()) return ['profile', 0]
    } else {
      if (!profileComplete()) return ['profile', 0]
      const gap = firstIncompleteStep()
      if (gap !== -1) return ['step', gap]
    }
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
    const previous = isCheck()
      ? { questions: ['intro', 0], profile: ['questions', 0], details: ['profile', 0] }[state.screen]
      : {
          profile: ['intro', 0],
          step: state.step > 0 ? ['step', state.step - 1] : ['profile', 0],
          details: ['step', FLOW_STEPS.length - 1],
        }[state.screen]
    if (previous) go(previous[0], previous[1], { history: 'replace' })
  }

  function restart() {
    if (state.shared) {
      // From someone else's report to this visitor's own go at the same flow.
      track('nine_steps_take_it_yourself')
      window.history.pushState(null, '', isCheck() ? location.pathname + checkUrl(FLOW.check) : location.pathname)
      state = fresh()
      restore(store.load())
      go('intro', 0, { history: 'replace' })
      return
    }
    store.clear()
    state = fresh()
    go('intro', 0)
    track('nine_steps_restart')
  }

  window.addEventListener('popstate', (event) => {
    const shared = readSharedReport()
    if (shared) {
      openShared(shared)
      return
    }
    if (state.shared) {
      // Leaving someone else's report: back to this page's own flow and saved progress.
      useFlow(pageFlow())
      state = fresh()
      restore(store.load())
    }
    const target = event.state || { screen: 'intro', step: 0 }
    go(target.screen, target.step, { history: 'none' })
  })

  function openShared(report) {
    useFlow(report.flow)
    state = fresh()
    state.shared = true
    state.profile = report.profile
    state.answers = report.answers
    state.screen = 'results'
    render()
    window.scrollTo(0, 0)
  }

  /* ---------- Rendering ---------- */

  function title() {
    const check = FLOW.check
    const step = STEPS[FLOW_STEPS[state.step] - 1]
    if (check) {
      return {
        intro: `${check.title} | Business Leader`,
        questions: `${check.name} check | The 9 Steps Diagnostic`,
        profile: `About you | ${check.name} check`,
        details: `Your report is ready | ${check.name} check`,
        results: `Your ${check.name} check | Business Leader`,
      }[state.screen]
    }
    return {
      intro: 'The 9 Steps Diagnostic | Business Leader',
      profile: 'About you | The 9 Steps Diagnostic',
      step: step ? `Step ${step.n} of ${STEPS.length}: ${step.name} | The 9 Steps Diagnostic` : 'The 9 Steps Diagnostic',
      details: 'Your report is ready | The 9 Steps Diagnostic',
      results: 'Your 9 Steps report | Business Leader',
    }[state.screen]
  }

  function render() {
    const views = {
      intro: isCheck() ? renderCheckIntro : renderIntro,
      questions: renderQuestions,
      profile: renderProfile,
      step: () => renderStep(state.step),
      details: renderDetails,
      results: isCheck() ? renderCheckResults : renderResults,
    }
    app.innerHTML = views[state.screen]()
    document.title = title()
    if (state.screen === 'results') onResultsShown()
  }

  function progress({ current = -1, label, right = '' }) {
    let segments
    let done
    let total
    if (isCheck()) {
      const stages = ['questions', 'profile', 'details']
      const at = stages.indexOf(state.screen)
      segments = stages.map((_, i) => (i < at ? ' is-done' : i === at ? ' is-current' : ''))
      done = Math.max(at, 0)
      total = stages.length
    } else {
      segments = FLOW_STEPS.map((n, i) => (i === current ? ' is-current' : stepComplete(n) ? ' is-done' : ''))
      done = FLOW_STEPS.filter((n) => stepComplete(n)).length
      total = FLOW_STEPS.length
    }
    return `
      <div class="progress" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="${total}"
        aria-valuenow="${done}" aria-valuetext="${esc(label)}. ${done} of ${total} ${isCheck() ? 'parts' : 'steps'} complete.">
        <div class="progress-segs${isCheck() ? ' progress-segs--3' : ''}" aria-hidden="true">
          ${segments.map((cls) => `<span class="progress-seg${cls}"></span>`).join('')}
        </div>
        <p class="progress-text" aria-hidden="true"><span>${esc(label)}</span><span>${esc(right)}</span></p>
      </div>`
  }

  function startButton(extraClass = '', label = 'Start the diagnostic') {
    const resume = hasProgress()
    return `<button type="button" class="btn btn-primary ${extraClass}" data-action="${resume ? 'resume' : 'start'}">
      ${resume ? 'Continue where you left off' : esc(label)} ${svg(icon.arrowRight)}</button>`
  }

  function resumeLine() {
    return hasProgress()
      ? '<p class="hero-resume">Or <button type="button" class="btn-text" data-action="restart">start again</button> from the beginning.</p>'
      : ''
  }

  function heroMeta() {
    return `<p class="hero-meta">
      <span>${svg(icon.clock)} About ${FLOW.minutes} minutes</span>
      <span>${svg(icon.list)} ${FLOW.statements.length} statements</span>
      <span>${svg(icon.file)} Free personal report</span>
    </p>`
  }

  function stairs(highlight = null) {
    const items = STEPS.map((s, i) => {
      const cls = highlight ? (highlight.includes(s.n) ? ' is-on' : ' is-dim') : ''
      const note = highlight && highlight.includes(s.n) ? '<span class="sr-only"> (in this check)</span>' : ''
      return `<li class="stair${cls}" style="--i:${i}"><span class="stair-n">${pad(s.n)}</span><span>${esc(s.name)}</span>${note}</li>`
    }).join('')
    return `
      <div class="stairs-wrap">
        <p class="stairs-top" aria-hidden="true"><span class="bl-dot"></span>£1bn</p>
        <ol class="stairs" aria-label="The 9 Steps to a Billion">${items}</ol>
        ${highlight ? `<p class="stairs-note">This check covers steps ${listOf(highlight.map(String))} of the nine.</p>` : ''}
      </div>`
  }

  function checkCards(excludeId = null) {
    return `
      <ul class="check-grid">
        ${CHECKS.filter((c) => c.id !== excludeId)
          .map(
            (c) => `
          <li>
            <a class="check-card" href="${esc(checkUrl(c))}" data-cta="open-check-${esc(c.id)}">
              <span class="kicker">${c.minutes || 2}-minute check · ${esc(c.name)}</span>
              <strong>${esc(c.title)}</strong>
              <span class="check-steps">Covers ${listOf(stepsOf(c).map((n) => esc(stepByN(n).name)))}</span>
              <span class="link-arrow">Take the check ${svg(icon.arrowRight)}</span>
            </a>
          </li>`,
          )
          .join('')}
      </ul>`
  }

  function fullDiagnosticPanel(heading, text, headingId = '') {
    return `
      <div class="full-panel">
        <div>
          <p class="eyebrow"><span class="bl-dot" aria-hidden="true"></span>Want the full picture?</p>
          <h2 ${headingId ? `id="${headingId}" ` : ''}class="section-title">${esc(heading)}</h2>
          <p class="section-intro">${esc(text)}</p>
        </div>
        <a class="btn btn-secondary" href="./" data-cta="full-diagnostic">Take the full diagnostic ${svg(icon.arrowRight)}</a>
      </div>`
  }

  function renderIntro() {
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
              ${heroMeta()}
            </div>
            ${resumeLine()}
          </div>
          ${stairs()}
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

      ${
        CHECKS.length
          ? `<section class="section section-tight" aria-labelledby="checks-title">
        <div class="container">
          <h2 id="checks-title" class="section-title">Short on time? Start with one challenge</h2>
          <p class="section-intro">Four 2-minute checks on the challenges founders and CEOs raise most: six statements each,
            a short report, and what to read and watch next.</p>
          ${checkCards()}
        </div>
      </section>`
          : ''
      }

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

  function renderCheckIntro() {
    const check = FLOW.check
    const heading = esc(check.title).replace(esc(check.highlight), `<mark>${esc(check.highlight)}</mark>`)
    const n = FLOW.statements.length
    return `
      <section class="hero on-dark" aria-labelledby="intro-title">
        <div class="container hero-grid">
          <div class="hero-copy">
            <p class="eyebrow"><span class="bl-dot" aria-hidden="true"></span>A ${FLOW.minutes}-minute check · ${esc(C.meta.name)}</p>
            <h1 id="intro-title" tabindex="-1" data-focus>${heading}</h1>
            <p class="lead">${esc(check.lead)}</p>
            <div class="hero-cta">
              ${startButton('btn-lg', 'Start the check')}
              ${heroMeta()}
            </div>
            ${resumeLine()}
          </div>
          ${stairs(FLOW_STEPS)}
        </div>
      </section>

      <section class="section" aria-labelledby="how-title">
        <div class="container">
          <h2 id="how-title" class="section-title">How it works</h2>
          <ol class="how-grid">
            <li class="how-card"><span class="how-n" aria-hidden="true">1</span><h3>Rate ${word(n)} statements</h3>
              <p>Each one comes from Sir Richard Harpin's 9 Steps to a Billion. Go with your first instinct.</p></li>
            <li class="how-card"><span class="how-n" aria-hidden="true">2</span><h3>Tell us about your business</h3>
              <p>Three quick taps: your role, your turnover and your ambition.</p></li>
            <li class="how-card"><span class="how-n" aria-hidden="true">3</span><h3>Get your report</h3>
              <p>Your score, where to start, Richard's practical next moves, and what to read and watch next.</p></li>
          </ol>
        </div>
      </section>

      <section class="section section-tight" aria-labelledby="more-title">
        <div class="container">
          <h2 id="more-title" class="section-title">More 2-minute checks</h2>
          ${checkCards(check.id)}
          ${fullDiagnosticPanel(
            'The full 9 Steps Diagnostic',
            `This check covers ${word(FLOW_STEPS.length)} of Richard's 9 Steps. The full diagnostic covers all nine in about ${C.meta.minutes} minutes, with a report across every step.`,
          )}
        </div>
      </section>`
  }

  function statementFieldset(idx, number) {
    const value = state.answers[idx]
    return `
      <fieldset class="question statement" data-question="${idx}">
        <legend><span class="statement-n" aria-hidden="true">${number}</span><span>${esc(FLOW.statements[idx].text)}</span></legend>
        <div class="scale">
          ${C.scale
            .map(
              (o) => `<label class="scale-option"><input type="radio" name="s-${idx}" value="${o.value}" data-statement="${idx}"
                ${value === o.value ? 'checked' : ''} /><span>${esc(o.label)}</span></label>`,
            )
            .join('')}
        </div>
      </fieldset>`
  }

  function navButtons(nextLabel) {
    return `
      <p class="form-error" role="alert" hidden></p>
      <div class="nav">
        <button type="button" class="btn btn-text" data-action="back">${svg(icon.arrowLeft)} Back</button>
        <button type="submit" class="btn btn-primary">${esc(nextLabel)} ${svg(icon.arrowRight)}</button>
      </div>`
  }

  function renderQuestions() {
    const check = FLOW.check
    let number = 0
    const groups = FLOW_STEPS.map((n) => {
      const items = STEP_INDICES[n].map((idx) => statementFieldset(idx, (number += 1))).join('')
      return `
        <div class="q-group">
          <p class="q-group-head"><span class="q-group-n" aria-hidden="true">${pad(n)}</span><span>Step ${n}: ${esc(stepByN(n).name)}</span></p>
          <div class="qform">${items}</div>
        </div>`
    }).join('')
    return `
      <section class="screen" aria-labelledby="questions-title">
        <div class="container narrow">
          ${progress({ label: `${check.name} check`, right: `About ${FLOW.minutes} minutes` })}
          <p class="eyebrow">${esc(check.name)} · ${FLOW.statements.length} statements</p>
          <h1 id="questions-title" class="screen-title" tabindex="-1" data-focus>How true is each of these for you today?</h1>
          <p class="lead">${capitalise(word(FLOW.statements.length))} statements from ${word(FLOW_STEPS.length)} of Sir Richard Harpin's 9 Steps.
            Go with your first instinct.</p>
          <form id="questions-form" novalidate>
            ${groups}
            ${navButtons('Continue')}
          </form>
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
    const copy = isCheck()
      ? {
          progress: { label: 'About your business', right: 'About a minute left' },
          eyebrow: 'Nearly there',
          title: 'Now, a little about your business',
          lead: 'Three quick taps so your report reflects your stage and your ambition.',
        }
      : {
          progress: { label: 'Before you start', right: `About ${FLOW.minutes} minutes in total` },
          eyebrow: 'Before you start',
          title: 'First, a little about you',
          lead: 'Three quick questions so your report reflects your stage and your ambition.',
        }
    return `
      <section class="screen" aria-labelledby="profile-title">
        <div class="container narrow">
          ${progress(copy.progress)}
          <p class="eyebrow">${esc(copy.eyebrow)}</p>
          <h1 id="profile-title" class="screen-title" tabindex="-1" data-focus>${esc(copy.title)}</h1>
          <p class="lead">${esc(copy.lead)}</p>
          <form id="profile-form" novalidate>
            <div class="qform">${questions}</div>
            ${navButtons('Continue')}
          </form>
        </div>
      </section>`
  }

  function renderStep(i) {
    const step = stepByN(FLOW_STEPS[i])
    const statements = STEP_INDICES[step.n].map((idx, j) => statementFieldset(idx, j + 1)).join('')
    const minutesLeft = Math.max(1, Math.round((FLOW_STEPS.length - i) * (FLOW.minutes / FLOW_STEPS.length)))
    const last = i === FLOW_STEPS.length - 1
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
            ${navButtons(last ? 'Finish' : 'Next step')}
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
    const copy = isCheck()
      ? {
          progress: { label: 'Last step', right: 'One last thing' },
          eyebrow: `${FLOW.check.name} check complete`,
          lead: 'Tell us who you are to see it: your score, where to start, Richard’s practical next moves, and what to read and watch next.',
        }
      : {
          progress: { label: 'All 9 steps complete', right: 'One last thing' },
          eyebrow: 'All 9 steps complete',
          lead: 'Tell us who you are to see it: your score out of 100, your strongest steps and your three priority steps, with practical next moves.',
        }
    return `
      <section class="screen" aria-labelledby="details-title">
        <div class="container narrow">
          ${progress(copy.progress)}
          <p class="eyebrow">${esc(copy.eyebrow)}</p>
          <h1 id="details-title" class="screen-title" tabindex="-1" data-focus>Your report is ready</h1>
          <p class="lead">${esc(copy.lead)}</p>
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
            ${navButtons('See my report')}
            ${CFG.requireDetails === false ? '<p class="skip-row"><button type="button" class="btn-text" data-action="skip-details">Skip and see my report</button></p>' : ''}
          </form>
        </div>
      </section>`
  }

  /* ---------- Report pieces shared by both flows ---------- */

  function chip(status) {
    const glyph = { strength: icon.check, developing: icon.half, gap: icon.gap }[status]
    return `<span class="chip chip-${status}">${svg(glyph)}${esc(C.status[status].label)}</span>`
  }

  function resultsHero({ eyebrow, heading, r, label, text, facts, ambitionStep }) {
    const ambition = profileOption('ambition', state.profile.ambition)
    return `
      <section class="results-hero on-dark" aria-labelledby="results-title">
        <div class="container">
          <div>
            <p class="eyebrow"><span class="bl-dot" aria-hidden="true"></span>${esc(eyebrow)}</p>
            <h1 id="results-title" tabindex="-1" data-focus>${heading}</h1>
            <div class="score-block">
              <p class="score"><span class="score-value">${r.overall}</span><span class="score-max">/100</span><span class="sr-only"> overall score</span></p>
              <svg class="score-meter" height="8" aria-hidden="true" focusable="false">
                <rect class="score-track" width="100%" height="8" rx="4" />
                ${r.overall > 0 ? `<rect class="score-fill" width="${r.overall}%" height="8" rx="4" />` : ''}
              </svg>
              <p class="band"><mark>${esc(label)}</mark></p>
              <p class="band-text">${esc(text)}</p>
              ${ambition ? `<p class="ambition-line">To ${esc(ambition.phrase)}, start with <strong>Step ${ambitionStep.n}: ${esc(ambitionStep.name)}</strong>.</p>` : ''}
            </div>
          </div>
          <dl class="facts">${facts}</dl>
        </div>
      </section>`
  }

  function stageFact() {
    const stage = C.stages[state.profile.turnover]
    return stage ? `<div><dt>Stage</dt><dd>${esc(stage.name)}<span>${esc(stage.range)}. ${esc(stage.focus)}</span></dd></div>` : ''
  }

  function profileChart(r) {
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
              ${s.items.map((t, j) => `<li><span class="answer-tag">${esc(scaleLabel(s.vals[j]))}</span><span>${esc(t)}</span></li>`).join('')}
            </ul>
          </details>
        </li>`,
      )
      .join('')
    return `
      <div class="profile-card"><ol class="profile-list">${rows}</ol></div>
      <ul class="legend-row" aria-label="Key">
        ${['strength', 'developing', 'gap'].map((k) => `<li>${chip(k)} ${esc(C.status[k].key)}</li>`).join('')}
      </ul>`
  }

  function stepCard(s, rank) {
    return `
      <article class="priority-card" id="step-${s.id}" aria-labelledby="card-${s.id}">
        <div class="priority-top"><span class="priority-rank">${esc(rank)}</span>${chip(s.status)}</div>
        <h3 id="card-${s.id}"><span class="num">${pad(s.n)}</span><span>${esc(s.name)}</span></h3>
        <p class="priority-score">Your score: <strong>${s.score}/100</strong></p>
        <p class="principle">${esc(s.principle)}</p>
        <h4>Try this next</h4>
        <ol class="actions">${s.actions.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>
        <div class="bl-helps"><span class="bl-dot" aria-hidden="true"></span><p><strong>How Business Leader helps:</strong> ${esc(s.blHelps)}</p></div>
        <div class="step-links">
          <p>
            <a class="link-arrow" href="${esc(watchUrl(s.watch))}" ${newTab} data-cta="watch-step-${s.n}">${svg(icon.play)} Watch Richard on this step${newTabNote}</a>
            <small>With ${esc(s.watch.guest)}, ${esc(s.watch.guestRole)}, on the 9 Steps podcast</small>
          </p>
          ${
            s.read
              ? `<p>
            <a class="link-arrow" href="${esc(s.read.url)}" ${newTab} data-cta="read-step-${s.n}">${svg(icon.book)} ${esc(s.read.title)}${newTabNote}</a>
            <small>On businessleader.co.uk</small>
          </p>`
              : ''
          }
        </div>
      </article>`
  }

  function contentCard(item, cta, action = '') {
    const label = action || (/video/i.test(item.kind) ? 'Watch on YouTube' : 'Read on Business Leader')
    return `
      <a class="deeper-card" href="${esc(item.url)}" ${newTab} data-cta="${esc(cta)}">
        <span class="kicker">${esc(item.kind)}${item.step ? ` · Step ${item.step}: ${esc(stepByN(item.step).name)}` : ''}</span>
        <strong>${esc(item.title)}</strong>
        ${item.blurb ? `<p>${esc(item.blurb)}</p>` : ''}
        <span class="link-arrow">${esc(label)} ${svg(icon.arrowUpRight)}</span>${newTabNote}</a>`
  }

  function ctaPanel({ title: heading, text }) {
    const stage = C.stages[state.profile.turnover]
    const inIcp = stage ? stage.inIcp : true
    if (!inIcp) {
      return `
        <div class="cta-panel on-dark">
          <div>
            <p class="eyebrow"><span class="bl-dot" aria-hidden="true"></span>Your next step</p>
            <h2>Keep building towards £3m</h2>
            <p class="cta-text">Business Leader membership is designed for founders and CEOs of £3m+ businesses. Until you get there, Richard's book,
              the 9 Steps podcast and our weekly newsletter will help you work through your priority steps.</p>
          </div>
          <div class="cta-buttons">
            <a class="btn btn-primary btn-lg" href="${esc(LINKS.newsletter)}" ${newTab} data-cta="newsletter">Get the weekly newsletter ${svg(icon.arrowRight)}${newTabNote}</a>
            <a class="btn btn-secondary btn-lg" href="${esc(LINKS.book)}" ${newTab} data-cta="book">Read the book${newTabNote}</a>
          </div>
        </div>`
    }
    return `
      <div class="cta-panel on-dark">
        <div>
          <p class="eyebrow"><span class="bl-dot" aria-hidden="true"></span>Your next step</p>
          <h2>${esc(heading)}</h2>
          <p class="cta-text">${esc(text)} Talk to a membership adviser about your results; it's a conversation, not a commitment.</p>
        </div>
        <div class="cta-buttons">
          <a class="btn btn-primary btn-lg" href="${esc(LINKS.bookConversation)}" ${newTab} data-cta="book-conversation">Book a conversation ${svg(icon.arrowRight)}${newTabNote}</a>
          <a class="btn btn-secondary btn-lg" href="${esc(LINKS.roundtable)}" ${newTab} data-cta="roundtable">Book a Roundtable with us${newTabNote}</a>
          <p class="cta-note">Roundtables are small-group problem-solving sessions. Bring your biggest challenge and work through it with other founders and CEOs.</p>
        </div>
      </div>`
  }

  function reportActions(code) {
    return `
      <div class="report-actions">
        <button type="button" class="btn btn-secondary btn-sm" data-action="print">${svg(icon.print)} Save as PDF</button>
        ${code ? `<button type="button" class="btn btn-secondary btn-sm" data-action="copy-link" data-url="${esc(reportUrl(code))}">${svg(icon.link)} Copy link to this report</button>` : ''}
        <button type="button" class="btn btn-text" data-action="restart">${state.shared ? (isCheck() ? 'Take the check yourself' : 'Take the diagnostic yourself') : 'Start again'}</button>
      </div>
      <p class="print-only small">${esc(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))}.
        Take it yourself at ${esc(location.origin + location.pathname + (isCheck() ? checkUrl(FLOW.check) : ''))}</p>`
  }

  function sharedBanner() {
    if (!state.shared) return ''
    return `<div class="shared-banner"><div class="container"><p>You are viewing a shared ${isCheck() ? `${esc(FLOW.check.name)} check` : '9 Steps report'}.</p>
      <button type="button" class="btn btn-secondary btn-sm" data-action="restart">${isCheck() ? 'Take the check yourself' : 'Take the diagnostic yourself'}</button></div></div>`
  }

  /* ---------- The full diagnostic's report ---------- */

  function renderResults() {
    const r = score(state.answers)
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
      stageFact(),
      r.even
        ? `<div><dt>Across the 9 Steps</dt><dd>Level scores<span>Every step scored ${top.score}/100.</span></dd></div>`
        : `<div><dt>Strongest step</dt><dd>${pad(top.n)} ${esc(top.name)}<span>${top.score}/100</span></dd></div>
           <div><dt>Biggest opportunity</dt><dd>${pad(low.n)} ${esc(low.name)}<span>${low.score}/100</span></dd></div>`,
    ].join('')

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

    const deeper = `
      <div class="deeper-grid">
        ${contentCard(
          { kind: 'The book', title: 'How to Make a Billion in Nine Steps', blurb: "Richard's Sunday Times bestseller, with the full story behind each step.", url: LINKS.book },
          'deeper-book',
          'Get the book',
        )}
        ${contentCard(
          { kind: 'The podcast', title: 'How to Make a Billion in 9 Steps', blurb: 'Three episodes, three steps each, with Touker Suleyman, Steve Hewitt and Jonathan King.', url: LINKS.podcastSpotify },
          'deeper-podcast',
          'Listen on Spotify',
        )}
        ${contentCard(
          { kind: 'Read', title: 'Why the hardest leadership skill is saying no', blurb: 'An extract from the book on focus, foxes and hedgehogs, and the not-to-do list.', url: LINKS.bookExtract },
          'deeper-extract',
        )}
      </div>`

    return `
      ${sharedBanner()}
      ${resultsHero({
        eyebrow: state.shared ? 'Shared 9 Steps report' : 'Your 9 Steps report',
        heading,
        r,
        label: r.band.label,
        text: r.band.text,
        facts,
        ambitionStep: low,
      })}
      <section class="results-section" aria-labelledby="profile-heading">
        <div class="container">
          <h2 id="profile-heading" class="section-title">Your profile across the 9 Steps</h2>
          <p class="section-intro">Each step is scored out of 100 from your three answers. Select a step to see how you answered.</p>
          ${profileChart(r)}
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
          <div class="priority-grid">${r.priorities.map((s, k) => stepCard(s, `${r.frontier ? 'Next frontier' : 'Priority'} ${k + 1}`)).join('')}</div>
        </div>
      </section>

      <section class="results-section" aria-labelledby="strengths-heading">
        <div class="container">
          <h2 id="strengths-heading" class="section-title">${r.relative || r.even ? 'Your strongest steps' : 'Where you are strong'}</h2>
          ${strengthsBody}
        </div>
      </section>

      <section class="results-section" aria-label="Your next step">
        <div class="container">${ctaPanel({
          title: 'Talk through your results with us',
          text: "A membership adviser will take you through your 9 Steps profile and show how founders and CEOs at your stage use Business Leader's peer forums, CEO coaching and 12-month Growth Plan to work on their priority steps.",
        })}</div>
      </section>

      <section class="results-section" aria-labelledby="deeper-heading">
        <div class="container">
          <h2 id="deeper-heading" class="section-title">Go deeper into the 9 Steps</h2>
          ${deeper}
          ${reportActions(code)}
        </div>
      </section>`
  }

  /* ---------- A 2-minute check's report ---------- */

  // The check's reading list, most relevant first: items on the weakest step, then the next weakest.
  // Anything already linked from a step card below is skipped.
  function recommended(r) {
    const shown = new Set(r.low.map((s) => s.read && s.read.url).filter(Boolean))
    const rank = (item) => {
      const pos = r.low.findIndex((s) => s.n === item.step)
      return pos === -1 ? r.low.length : pos
    }
    return FLOW.check.reading
      .filter((item) => !shown.has(item.url))
      .map((item, order) => ({ item, order }))
      .sort((a, b) => rank(a.item) - rank(b.item) || a.order - b.order)
      .slice(0, 3)
      .map((x) => x.item)
  }

  function renderCheckResults() {
    const check = FLOW.check
    const r = score(state.answers)
    const code = encodeReport()
    const verdict = check.verdicts.find((v) => r.overall >= v.min) || check.verdicts[check.verdicts.length - 1]
    const top = r.high[0]
    const low = r.low[0]
    const name = state.shared ? '' : state.firstName
    const heading = name
      ? `${esc(name)}, ${esc(check.resultHeading)}`
      : state.shared
        ? `${esc(check.name)}: the results`
        : esc(capitalise(check.resultHeading))
    const facts = [
      stageFact(),
      r.even
        ? `<div><dt>Across this check</dt><dd>Level scores<span>Every step scored ${top.score}/100.</span></dd></div>`
        : `<div><dt>Strongest step</dt><dd>${pad(top.n)} ${esc(top.name)}<span>${top.score}/100</span></dd></div>
           <div><dt>Start with</dt><dd>${pad(low.n)} ${esc(low.name)}<span>${low.score}/100</span></dd></div>`,
    ].join('')
    const reading = recommended(r)
    const stepNames = listOf(FLOW_STEPS.map((n) => esc(stepByN(n).name)))

    return `
      ${sharedBanner()}
      ${resultsHero({
        eyebrow: state.shared ? `Shared ${check.name} check` : `Your ${check.name} check`,
        heading,
        r,
        label: verdict.label,
        text: verdict.text,
        facts,
        ambitionStep: low,
      })}
      <section class="results-section" aria-labelledby="profile-heading">
        <div class="container">
          <h2 id="profile-heading" class="section-title">How you scored on each step</h2>
          <p class="section-intro">This check covers ${word(FLOW_STEPS.length)} of Richard's 9 Steps: ${stepNames}. Each is scored out of 100
            from your answers; select a step to see them.</p>
          ${profileChart(r)}
        </div>
      </section>

      <section class="results-section" aria-labelledby="start-heading">
        <div class="container">
          <h2 id="start-heading" class="section-title">Where to start</h2>
          <p class="section-intro">Your steps in order, weakest first, with Richard's practical next moves for each.</p>
          <div class="priority-grid">${r.low.map((s, k) => stepCard(s, ['Start here', 'Then', 'After that'][k] || 'Then')).join('')}</div>
        </div>
      </section>

      ${
        reading.length
          ? `<section class="results-section" aria-labelledby="reading-heading">
        <div class="container">
          <h2 id="reading-heading" class="section-title">Recommended for you</h2>
          <p class="section-intro">Picked from Business Leader for where you scored lowest.</p>
          <div class="deeper-grid">${reading.map((item, k) => contentCard(item, `read-${check.id}-${k + 1}`)).join('')}</div>
        </div>
      </section>`
          : ''
      }

      <section class="results-section" aria-label="Your next step">
        <div class="container">${ctaPanel(check.cta)}</div>
      </section>

      <section class="results-section" aria-labelledby="full-heading">
        <div class="container">
          ${fullDiagnosticPanel(
            'Take the full 9 Steps Diagnostic',
            `This check covered ${word(FLOW_STEPS.length)} of the nine steps. The full diagnostic covers all nine in about ${C.meta.minutes} minutes, with a report across every step.`,
            'full-heading',
          )}
          ${reportActions(code)}
        </div>
      </section>`
  }

  function onResultsShown() {
    const r = score(state.answers)
    const stage = C.stages[state.profile.turnover]
    track('nine_steps_results_view', {
      nine_steps_score: r.overall,
      nine_steps_stage: stage ? stage.name : '',
      nine_steps_priority: r.low[0] ? r.low[0].n : '',
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

  function markMissing(form, missing) {
    form.querySelectorAll('.question').forEach((fs) => fs.classList.toggle('is-missing', missing.includes(fs.dataset.question)))
    if (missing.length) form.querySelector(`.question[data-question="${missing[0]}"] input`)?.focus()
  }

  function onProfileSubmit(form) {
    const missing = C.profile.filter((q) => !state.profile[q.id]).map((q) => q.id)
    markMissing(form, missing)
    if (missing.length) {
      showFormError(form, `Please answer ${missing.length === 1 ? 'the last question' : `all ${C.profile.length} questions`} to continue.`)
      return
    }
    track('nine_steps_profile_complete', {
      nine_steps_role: state.profile.role,
      nine_steps_turnover: state.profile.turnover,
      nine_steps_ambition: state.profile.ambition,
    })
    if (isCheck()) go('details')
    else go('step', 0)
  }

  function onStatementsSubmit(form, indices, onDone) {
    const missing = indices.filter((idx) => state.answers[idx] === null).map(String)
    markMissing(form, missing)
    if (missing.length) {
      const all = indices.length === 1 ? 'the statement' : `all ${word(indices.length)} statements`
      showFormError(form, `Please rate ${missing.length === 1 ? 'the remaining statement' : all} to continue.`)
      return
    }
    onDone()
  }

  function onStepSubmit(form) {
    const i = state.step
    const step = stepByN(FLOW_STEPS[i])
    onStatementsSubmit(form, STEP_INDICES[step.n], () => {
      track('nine_steps_step_complete', { nine_steps_step: step.n, nine_steps_step_name: step.name })
      if (i < FLOW_STEPS.length - 1) go('step', i + 1)
      else go('details')
    })
  }

  function onQuestionsSubmit(form) {
    onStatementsSubmit(
      form,
      FLOW.statements.map((_, i) => i),
      () => {
        track('nine_steps_questions_complete')
        go('profile')
      },
    )
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
    const named = (steps) => steps.map((s) => `${s.n}. ${s.name}`).join('; ')
    add(f.firstName, details.firstName)
    add(f.lastName, details.lastName)
    add(f.email, details.email)
    add(f.company, details.company)
    add(f.jobTitle, details.jobTitle)
    add(f.phone, details.phone)
    add(f.marketingOptIn, details.marketingOptIn ? 'true' : 'false')
    add(f.check, isCheck() ? FLOW.check.name : 'Full diagnostic')
    add(f.score, r.overall)
    if (f.stepScore) r.steps.forEach((s) => add(f.stepScore.replace('{n}', s.n), s.score))
    add(f.priorities, named(isCheck() ? r.low.slice(0, 1) : r.priorities))
    add(f.strengths, named(isCheck() ? r.steps.filter((s) => s.status === 'strength') : r.strengths))
    add(f.stage, C.stages[state.profile.turnover]?.name)
    add(f.role, profileOption('role', state.profile.role)?.label)
    add(f.turnover, profileOption('turnover', state.profile.turnover)?.label)
    add(f.ambition, profileOption('ambition', state.profile.ambition)?.label)
    add(f.answers, code)
    add(f.reportUrl, reportUrl(code))
    // The query string is kept so campaign (utm_) parameters reach HubSpot with the submission.
    const context = { pageUri: location.origin + location.pathname + location.search, pageName: document.title }
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
        go(isCheck() ? 'questions' : 'profile')
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
    if (form.id === 'questions-form') onQuestionsSubmit(form)
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
      track('nine_steps_shared_report_view')
      return
    }
    useFlow(pageFlow())
    state = fresh()
    restore(store.load())
    const { screen, step } = resolve(state.screen, state.step)
    state.screen = screen
    state.step = step
    window.history.replaceState({ screen, step, depth: 0 }, '', location.pathname + location.search)
    render()
    track('nine_steps_view')
  }

  init()
})()
