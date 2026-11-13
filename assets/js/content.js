/*
 * The 9 Steps Diagnostic: all of the words on the page.
 *
 * Edit copy here, not in app.js. Each step has a short principle, three statements the
 * CEO rates, three practical next moves and one line on how Business Leader helps.
 *
 * Sources for the framework (see README): the nine step names come from Business Leader's
 * "How to Make a Billion in 9 Steps" podcast listings; the principles and next moves are
 * paraphrased from Richard Harpin's newsletters, the book extract on businessleader.co.uk
 * and "Ask Richard" articles. Have Richard's team approve wording before launch.
 */
window.BL_DIAGNOSTIC_CONTENT = {
  meta: {
    name: 'The 9 Steps Diagnostic',
    minutes: 6,
  },

  // How each statement is rated. Scores are 0 to 3 per statement, 0 to 9 per step.
  scale: [
    { value: 0, label: 'Not yet' },
    { value: 1, label: 'Partly' },
    { value: 2, label: 'Mostly' },
    { value: 3, label: 'Fully' },
  ],

  // Asked first, on one screen. Turnover sets the stage and which next step we offer.
  profile: [
    {
      id: 'role',
      question: 'Which best describes you?',
      options: [
        { id: 'founder', label: 'Founder and CEO or MD' },
        { id: 'ceo', label: 'CEO or MD, not the founder' },
        { id: 'leader', label: 'Another leadership role' },
        { id: 'other', label: 'Other' },
      ],
    },
    {
      id: 'turnover',
      question: "What is your business's annual turnover?",
      options: [
        { id: 'under3', label: 'Under £3m' },
        { id: '3to15', label: '£3m to £15m' },
        { id: '15to75', label: '£15m to £75m' },
        { id: 'over75', label: '£75m or more' },
      ],
    },
    {
      id: 'ambition',
      question: 'What is your ambition for the next three years?',
      options: [
        { id: 'steady', label: 'Steady, profitable growth', phrase: 'keep growing steadily and profitably' },
        { id: 'double', label: 'Double in size', phrase: 'double the business in three years' },
        { id: 'triple', label: 'Triple or more', phrase: 'triple the business or more' },
        { id: 'exit', label: 'Prepare for sale or investment', phrase: 'get the business ready for a sale or investment' },
      ],
    },
  ],

  // Stage by turnover band. Mirrors the Professionalising / Scaling / Fortifying segments sales use.
  stages: {
    under3: {
      name: 'Building to £3m',
      range: 'under £3m turnover',
      focus: 'Business Leader membership is designed for founders and CEOs of £3m+ businesses. The 9 Steps still apply: start with the ones below.',
      inIcp: false,
    },
    '3to15': {
      name: 'Professionalising',
      range: '£3m to £15m turnover',
      focus: 'At this stage the work is structure and systems: building a business that doesn’t depend on you for everything.',
      inIcp: true,
    },
    '15to75': {
      name: 'Scaling',
      range: '£15m to £75m turnover',
      focus: 'At this stage the work is speed and leverage: growing faster without losing what made you successful.',
      inIcp: true,
    },
    over75: {
      name: 'Fortifying',
      range: '£75m+ turnover',
      focus: 'At this stage the work is resilience and leadership: protecting what you have built while you keep growing.',
      inIcp: true,
    },
  },

  // Overall score bands (score is 0 to 100). Checked top down.
  bands: [
    {
      min: 80,
      label: 'Running the playbook',
      text: 'Most of the 9 Steps are firmly in place. The job now is to protect them as you grow and sharpen the few that lag.',
    },
    {
      min: 60,
      label: 'Well on your way',
      text: 'You have strong foundations, with a few steps holding you back. Fixing those is where your next stage of growth will come from.',
    },
    {
      min: 40,
      label: 'Building momentum',
      text: 'Several steps are partly in place. Focusing hard on two or three of them will move you faster than working on all nine.',
    },
    {
      min: 0,
      label: 'Early in the journey',
      text: 'There is a lot of upside here. A small number of focused changes will compound quickly.',
    },
  ],

  // Per-step status, from the step total (0 to 9): 6+ is "Mostly" or better on average,
  // 4 to 5 is between "Partly" and "Mostly", 3 or less is "Partly" or worse.
  status: {
    strength: { label: 'Strength', key: 'Mostly or fully in place', minTotal: 6 },
    developing: { label: 'Developing', key: 'Partly in place', minTotal: 4 },
    gap: { label: 'Gap', key: 'Not yet in place', minTotal: 0 },
  },

  steps: [
    {
      n: 1,
      id: 'copy-and-pivot',
      name: 'Copy and pivot',
      short: 'Build on what already works, then adapt fast.',
      principle:
        'You don’t need a world-first idea. It is far easier to take a model that already works, copy it well and improve it than to invent something from scratch, then keep adjusting as customers show you what works.',
      statements: [
        'We regularly study what is working in other businesses, sectors and countries.',
        'When we see a proven idea, we adopt it and improve it rather than reinventing it.',
        'When the evidence says something isn’t working, we change course quickly.',
      ],
      actions: [
        'Name three businesses, in any sector or country, that already do something you want to do. Pick one idea to borrow this quarter.',
        'Ask your team what a competitor does better than you, then adopt it and improve on it.',
        'Give every new initiative a review date, so you pivot on evidence rather than instinct.',
      ],
      blHelps: 'Company visits, masterclasses and peer forums put you inside other growing businesses, so you can borrow what is working.',
      // Timestamped clip from the "How to Make a Billion in 9 Steps" podcast (YouTube).
      watch: { video: 'QAvF3n914ic', t: 70, guest: 'Touker Suleyman', guestRole: 'Dragons’ Den investor' },
    },
    {
      n: 2,
      id: 'get-an-investor',
      name: 'Get an investor',
      short: 'Bring in capital that brings challenge too.',
      principle:
        'The right investor brings more than money: challenge, discipline, contacts and the confidence to move faster than you could alone. The question isn’t only how much to raise, but who you want around the table.',
      statements: [
        'We have the capital we need for our next stage of growth, or a clear plan to secure it.',
        'We have an investor, chair or board who brings real challenge and expertise, not just money.',
        'We know what kind of investor or partner would accelerate us, and what they would need to see.',
      ],
      actions: [
        'Write down the growth you would go after if capital were no constraint. That is the start of your investment case.',
        'List the three investors or partners whose experience, not just their money, would accelerate you most.',
        'Not ready for an investor? Appoint an independent chair or non-executive director to bring board-level challenge first.',
      ],
      blHelps: 'Peer forum challenge from CEOs who have raised capital and worked with investors.',
      watch: { video: 'QAvF3n914ic', t: 853, guest: 'Touker Suleyman', guestRole: 'Dragons\u2019 Den investor' },
    },
    {
      n: 3,
      id: 'get-some-coachment',
      name: 'Get some coachment',
      short: 'Learn from people who have done it.',
      principle:
        'Coachment is coaching and mentoring together. Every leader needs people who have already built what they are trying to build, and peers who will tell them what their own team won’t.',
      statements: [
        'I have a mentor or coach who has built a bigger business than mine.',
        'I get regular, honest challenge from peers outside my business.',
        'My leadership team is coached and developed, not just me.',
      ],
      actions: [
        'Identify someone who has built the business you want to build, and ask them for an hour of their time.',
        'Find a group of peers at your stage who will challenge you without an agenda.',
        'Budget for coaching across your leadership team, not only for yourself.',
      ],
      blHelps: '1:1 CEO coaching matched to your stage, and a trusted peer forum of CEOs who have been there.',
      watch: { video: 'QAvF3n914ic', t: 1507, guest: 'Touker Suleyman', guestRole: 'Dragons\u2019 Den investor' },
    },
    {
      n: 4,
      id: 'bricks-clicks-and-paper',
      name: 'Bricks, clicks and paper',
      short: 'Win customers through every channel.',
      principle:
        'Customers don’t live in one channel, so your business shouldn’t either. Physical presence, digital and print each reach people differently, and the strongest businesses make each one feed the others.',
      statements: [
        'We know where our next hundred customers will come from.',
        'We reach customers through more than one route (in person, online and in print or direct mail), and each feeds the others.',
        'We know what each channel costs and returns, and we move investment to what works.',
      ],
      actions: [
        'Map your last 50 new customers: which channel found them, and which one won them?',
        'Test one neglected channel (a letter, an event, a shop window or a search campaign) on a capped budget.',
        'Make every channel point to the next: print drives web visits, events drive referrals.',
      ],
      blHelps: 'Masterclasses and member stories on how growing businesses find and win customers across channels.',
      watch: { video: 'CKoI47Pz32c', t: 57, guest: 'Steve Hewitt', guestRole: 'former Gymshark CEO' },
    },
    {
      n: 5,
      id: 'hire-your-replacement',
      name: 'Hire your replacement',
      short: 'Step back so the business can step up.',
      principle:
        'A founder who does everything becomes the ceiling on growth. Richard hired someone to run HomeServe UK day to day after eight years, which freed him to think strategically and take the business international.',
      statements: [
        'The business would run well for a month without me.',
        'I have a successor for my day-to-day role, or a clear plan to hire one.',
        'Most of my time goes on strategy, people and the long term rather than firefighting.',
      ],
      actions: [
        'Review your diary for the last two weeks. How much of it could someone else do?',
        'Write the job description for your replacement now, even if you won’t hire for a year.',
        'Hand over one decision you currently own, and don’t take it back.',
      ],
      blHelps: 'Peer forum members who have made that hire, and a 12-month Growth Plan that frees up your time.',
      watch: { video: 'CKoI47Pz32c', t: 1164, guest: 'Steve Hewitt', guestRole: 'former Gymshark CEO' },
    },
    {
      n: 6,
      id: 'go-global-with-locals',
      name: 'Go global with locals',
      short: 'Expand with people who know the market.',
      principle:
        'New markets, at home or abroad, are a step change, and they work best when they are led by local people who know the customers, the culture and the rules. Export the model; let locals run it.',
      statements: [
        'We know which new markets we will enter, international or regional, and in what order.',
        'Where we expand, local leaders who know the market run it rather than head office.',
        'Our model is documented well enough to be copied in a new market.',
      ],
      actions: [
        'Rank three potential markets by how much of today’s model each one could reuse.',
        'Before you enter a market, find a local leader or partner who already wins customers there.',
        'Write the playbook that would let a new team copy your first market.',
      ],
      blHelps: 'Members who have expanded into new markets, and company visits to businesses that have done it.',
      watch: { video: 'CKoI47Pz32c', t: 2259, guest: 'Steve Hewitt', guestRole: 'former Gymshark CEO' },
    },
    {
      n: 7,
      id: 'evolution-not-revolution',
      name: 'Evolution not revolution',
      short: 'Change constantly, one step at a time.',
      principle:
        'Standing still is fatal, but big leaps are risky. Grow one step from what you already do, prove each new idea on a small scale, and make each step pay for the next.',
      statements: [
        'Our new initiatives are usually one step from what we already do: the same customers, skills or cost base.',
        'We prove new ideas on a small scale, with a cap on the cost, before we scale them.',
        'We improve something meaningful every year. We never stand still.',
      ],
      actions: [
        'Before any new idea, ask three questions: will it sell to customers we already have, use skills we already have and fit the cost base we already have? Every no is another step from the core.',
        'Decide in advance what would make you stop, and cap the cost of finding out.',
        'Ask what this step earns you the right to do next. If it can’t fund its own next step, think again.',
      ],
      blHelps: 'A three-year ambition and a 12-month Growth Plan that sequence your next steps.',
      watch: { video: 'I_t0OJ-AT6U', t: 329, guest: 'Jonathan King', guestRole: 'former MD of HomeServe UK' },
    },
    {
      n: 8,
      id: 'follow-a-not-to-do-list',
      name: 'Follow a not-to-do list',
      short: 'Protect the core by saying no.',
      principle:
        'The hardest leadership skill is saying no to good ideas. A written not-to-do list, longer than your to-do list, keeps you and your team focused on the core.',
      statements: [
        'We have a written list of things we have decided not to do.',
        'I say no to most new ideas that don’t serve our core business.',
        'Our priorities for the next 12 months fit on one page, and everyone knows them.',
      ],
      actions: [
        'Write your not-to-do list. Make it longer than your to-do list and put it on the wall.',
        'Say no to whatever doesn’t serve the core, including your own ideas.',
        'Strip out one meeting, report or approval step that slows decisions down.',
      ],
      blHelps: 'A focused 12-month Growth Plan, and peers who will hold you to it.',
      watch: { video: 'I_t0OJ-AT6U', t: 998, guest: 'Jonathan King', guestRole: 'former MD of HomeServe UK' },
    },
    {
      n: 9,
      id: 'hone-your-character',
      name: 'Hone your character',
      short: 'Grow yourself as fast as the business.',
      principle:
        'A business can only grow as fast as its leader. Self-awareness, resilience, values and energy can all be developed, and they are what people choose to follow.',
      statements: [
        'I actively seek feedback on my leadership and act on it.',
        'I protect time for thinking, health and energy, not just meetings.',
        'My values are clear, and I hold to them when decisions get hard.',
      ],
      actions: [
        'Ask three people who work closely with you what you should start, stop and continue doing.',
        'Block two hours of thinking time each week, and protect it.',
        'Write down the three values you want to be known for, and test this week’s biggest decision against them.',
      ],
      blHelps: '1:1 CEO coaching, and a trusted forum where you can be candid about the realities of the job.',
      watch: { video: 'I_t0OJ-AT6U', t: 1847, guest: 'Jonathan King', guestRole: 'former MD of HomeServe UK' },
    },
  ],
}
