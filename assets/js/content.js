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

  // Per-step status, from the share of available points the step scored. In the full diagnostic
  // (three statements, 0 to 9) that is: 6+ Strength ("Mostly" or better on average), 4 to 5
  // Developing, 3 or less Gap. Shares rather than totals, because a check can use 1 to 4
  // statements from a step.
  status: {
    strength: { label: 'Strength', key: 'Mostly or fully in place', minShare: 0.66 },
    developing: { label: 'Developing', key: 'Partly in place', minShare: 0.44 },
    gap: { label: 'Gap', key: 'Not yet in place', minShare: 0 },
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
      // A Business Leader article on this step, linked from the step's card in the report.
      read: { title: 'How the world\u2019s most successful companies pivoted', url: 'https://www.businessleader.co.uk/insights/the-top-business-pivots' },
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
      // A Business Leader article on this step, linked from the step's card in the report.
      read: { title: 'Ask Richard: Capital', url: 'https://www.businessleader.co.uk/insights/ask-richard-capital' },
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
      // A Business Leader article on this step, linked from the step's card in the report.
      read: { title: 'Ask Richard: The power of coaching and mentoring', url: 'https://www.businessleader.co.uk/insights/ask-richard-the-power-of-coaching-and-mentoring' },
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
      // A Business Leader article on this step, linked from the step's card in the report.
      read: { title: 'Ask Richard: How to combine bricks, clicks and paper', url: 'https://www.businessleader.co.uk/insights/ask-richard-how-to-combine-bricks-clicks-and-paper' },
    },
    {
      n: 5,
      id: 'hire-your-replacement',
      name: 'Hire your replacement',
      short: 'Step back so the business can step up.',
      principle:
        'Hiring your replacement doesn’t mean stepping away. It means someone else runs the day to day, so you can focus on strategy and growth. A founder who does everything becomes the ceiling on the business. Richard hired someone to run HomeServe UK after eight years, which freed him to take HomeServe international.',
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
      // A Business Leader article on this step, linked from the step's card in the report.
      read: { title: 'Ask Richard: When is the right time to hire my replacement?', url: 'https://www.businessleader.co.uk/insights/ask-richard-when-is-the-right-time-to-hire-my-replacement' },
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
      // A Business Leader article on this step, linked from the step's card in the report.
      read: { title: 'Ask Richard: International expansion', url: 'https://www.businessleader.co.uk/insights/ask-richard-international-expansion' },
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
      // A Business Leader article on this step, linked from the step's card in the report.
      read: { title: 'Swingers CEO: Use pop-ups to test your big idea', url: 'https://www.businessleader.co.uk/insights/swingers-ceo-use-pop-ups-to-test-your-big-idea' },
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
      // A Business Leader article on this step, linked from the step's card in the report.
      read: { title: 'Why the hardest leadership skill is saying no', url: 'https://www.businessleader.co.uk/insights/how-make-billion-nine-steps' },
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
      // A Business Leader article on this step, linked from the step's card in the report.
      read: { title: 'Ask Richard: Productivity playbook', url: 'https://www.businessleader.co.uk/insights/ask-richard-productivity-playbook' },
    },
  ],

  // Short pain-point checks for first outreach: six statements from the steps that matter most for
  // one challenge, about two minutes. Link to one with ?check=<id>, e.g. ?check=isolation.
  // A statement either reuses one of a step's three statements ({ step, pick: 0 to 2 }) or has its own
  // text ({ step, text }). Report links store `code` and the answers in this order, so once links are
  // out: never change a check's code or reorder its statements; add new checks at the end.
  checks: [
    {
      id: 'isolation',
      code: 1,
      name: 'Leading alone',
      title: 'Is it lonely at the top?',
      highlight: 'lonely',
      lead:
        'Most founders and CEOs carry decisions they can’t talk through with anyone inside the business. Six quick statements from Sir Richard Harpin’s 9 Steps show how well supported you are, and where to start.',
      resultHeading: 'here’s how supported you are as a leader',
      statements: [
        { step: 3, pick: 0 },
        { step: 3, pick: 1 },
        { step: 9, pick: 0 },
        { step: 9, pick: 1 },
        { step: 5, pick: 0 },
        { step: 5, pick: 2 },
      ],
      verdicts: [
        {
          min: 67,
          label: 'Well supported',
          text: 'You have people who challenge you and time to think. Keep protecting both: they get harder to hold on to as the business grows.',
        },
        {
          min: 40,
          label: 'Partly supported',
          text: 'Some support is in place, but a lot still sits on your shoulders. A trusted room of peers and protected thinking time would lighten the load fastest.',
        },
        {
          min: 0,
          label: 'Carrying it alone',
          text: 'You are carrying most of the weight on your own. That is common, and fixable: the right coach and a room of peers who have been there change the job.',
        },
      ],
      cta: {
        title: 'Find a room of CEOs who get it',
        text: 'Business Leader’s peer forums bring founders and CEOs at your stage together for trusted challenge, eight sessions a year, alongside 1:1 CEO coaching.',
      },
      reading: [
        {
          kind: 'Article',
          step: 9,
          title: 'The signs of executive burnout – and how to avoid it',
          blurb: 'If you can spot the signs of burnout, you can stop it, and recover.',
          url: 'https://www.businessleader.co.uk/insights/the-signs-of-executive-burnout-and-how-to-avoid-it',
        },
        {
          kind: 'Article',
          step: 3,
          title: 'Want to unleash your potential? Get a mentor',
          blurb: 'Castore co-founder and CEO Tom Beahon on the part mentoring played in his journey.',
          url: 'https://www.businessleader.co.uk/insights/want-to-unleash-your-potential-get-a-mentor',
        },
        {
          kind: 'Video',
          step: 3,
          title: '“I like to keep my pit crew really close to me”',
          blurb: 'IBM UK and Ireland CEO Nicola Hodson on the people she relies on.',
          url: 'https://www.youtube.com/watch?v=knOtN77qj7U',
        },
      ],
    },
    {
      id: 'stuck',
      code: 2,
      name: 'Stuck at a plateau',
      title: 'Has growth hit a plateau?',
      highlight: 'plateau',
      lead:
        'Plenty of good businesses stall between stages: the old playbook stops working and the next one isn’t clear yet. Six quick statements from Sir Richard Harpin’s 9 Steps show what is holding you back, and where to start.',
      resultHeading: 'here’s what’s holding your growth back',
      statements: [
        { step: 4, pick: 0 },
        { step: 4, pick: 2 },
        { step: 7, pick: 1 },
        { step: 7, pick: 2 },
        { step: 8, pick: 1 },
        { step: 8, pick: 2 },
      ],
      verdicts: [
        {
          min: 67,
          label: 'Ready for the next stage',
          text: 'Your growth engine is in good shape: you know where customers come from, you test before you scale and you stay focused. The next gains come from doing more of it, faster.',
        },
        {
          min: 40,
          label: 'Losing momentum',
          text: 'Parts of your growth engine are working, but gaps are slowing you down. Fixing the weakest step below will do more than adding new initiatives.',
        },
        {
          min: 0,
          label: 'Stuck',
          text: 'Growth is being held back by the basics: knowing where customers come from, testing before you scale and saying no. These are fixable, one step at a time.',
        },
      ],
      cta: {
        title: 'Plan your way off the plateau',
        text: 'Business Leader members set a three-year ambition and a 12-month Growth Plan, then work through it with a peer forum of CEOs who hold them to it.',
      },
      reading: [
        {
          kind: 'Article',
          step: 5,
          title: 'How to know when it’s time to replace yourself as the boss',
          blurb: 'When growth plateaus, the biggest barrier is sometimes the person at the top.',
          url: 'https://www.businessleader.co.uk/insights/how-to-know-when-its-time-to-replace-yourself-as-the-boss',
        },
        {
          kind: 'Article',
          step: 4,
          title: 'Scaling sales overcomes the tyranny of project revenue cycles',
          blurb: 'Ideal Response Group founder Javid Ibrahim on what it takes to reach the next stage.',
          url: 'https://www.businessleader.co.uk/insights/growth-engines-scaling-sales-overcomes-the-tyranny-of-project-revenue-cycles',
        },
        {
          kind: 'Article',
          step: 7,
          title: 'What it really takes to turn growth into scale',
          blurb: 'Investor Saul Klein on why so many UK businesses struggle to scale.',
          url: 'https://www.businessleader.co.uk/insights/saul-klein-business-leader-podcast',
        },
      ],
    },
    {
      id: 'talent',
      code: 3,
      name: 'People and talent',
      title: 'Have you got the team for the next stage?',
      highlight: 'team',
      lead:
        'A business can only grow as fast as the people running it. Six quick statements from Sir Richard Harpin’s 9 Steps show how ready your team is, and where to start.',
      resultHeading: 'here’s how ready your team is for the next stage',
      statements: [
        { step: 5, pick: 1 },
        { step: 5, text: 'We can attract and keep the senior people we need for the next stage.' },
        { step: 3, pick: 2 },
        { step: 3, text: 'Our managers are trained to lead, not just promoted for being good at their last job.' },
        { step: 9, pick: 2 },
        { step: 9, pick: 0 },
      ],
      verdicts: [
        {
          min: 67,
          label: 'Built to grow',
          text: 'You have the people, the succession plan and the culture to grow. Keep investing in them: the next stage will need leaders you haven’t hired yet.',
        },
        {
          min: 40,
          label: 'Stretched',
          text: 'Some of the team you need is in place, but growth still leans on you and a few key people. Succession and leadership development are where to start.',
        },
        {
          min: 0,
          label: 'Running on you',
          text: 'Too much of the business still depends on you. Building a leadership team that can run it without you is the biggest unlock for growth.',
        },
      ],
      cta: {
        title: 'Build a team that can run it without you',
        text: 'Business Leader members get 1:1 CEO coaching matched to their stage, and a peer forum of CEOs who have made the hires, built the teams and planned their own succession.',
      },
      reading: [
        {
          kind: 'Article',
          step: 5,
          title: 'How to hire for growth',
          blurb: 'Recruiting at the right pace for sustainable growth, and how to find the sweet spot.',
          url: 'https://www.businessleader.co.uk/insights/how-to-hire-for-growth',
        },
        {
          kind: 'Article',
          step: 5,
          title: 'The secrets to successful CEO succession planning',
          blurb: 'A leading headhunter’s tips on what to look for in your next chief executive.',
          url: 'https://www.businessleader.co.uk/insights/ceo-succession-discipline',
        },
        {
          kind: 'Article',
          step: 3,
          title: 'Ask Richard: Advisory boards, accidental managers and being a public company',
          blurb: 'Richard on accidental managers, building an advisory board and what he looks for as an investor.',
          url: 'https://www.businessleader.co.uk/insights/ask-richard-advisory-boards-accidental-managers-and-being-a-public-company',
        },
        {
          kind: 'Article',
          step: 9,
          title: 'Building winning teams relies on spotting future stars',
          blurb: 'Why harnessing top talent without compromising culture is key to scaling.',
          url: 'https://www.businessleader.co.uk/insights/building-winning-teams-relies-on-spotting-future-stars',
        },
      ],
    },
    {
      id: 'capital',
      code: 4,
      name: 'Access to capital',
      title: 'Can you fund your next stage of growth?',
      highlight: 'fund',
      lead:
        'Ambition needs fuel, and the wrong money can cost more than it brings. Six quick statements from Sir Richard Harpin’s 9 Steps show how ready you are to fund growth, and where to start.',
      resultHeading: 'here’s how ready you are to fund the next stage',
      statements: [
        { step: 2, pick: 0 },
        { step: 2, pick: 1 },
        { step: 2, pick: 2 },
        { step: 2, text: 'Our numbers (forecasts, margins and cash) would stand up to an investor’s or lender’s scrutiny tomorrow.' },
        { step: 7, pick: 1 },
        { step: 7, text: 'Each new initiative pays for itself before we fund the next one.' },
      ],
      verdicts: [
        {
          min: 67,
          label: 'Investment-ready',
          text: 'You know what you need, who you want and your numbers stand up. You are in a strong position to choose the right capital rather than take what is offered.',
        },
        {
          min: 40,
          label: 'Getting there',
          text: 'The foundations are there, but gaps would show under an investor’s or lender’s scrutiny. Tighten the weakest step below before you start those conversations.',
        },
        {
          min: 0,
          label: 'Not yet ready',
          text: 'Raising money now would be hard going. Start by proving growth that pays for itself and getting your numbers investor-ready; the right capital follows.',
        },
      ],
      cta: {
        title: 'Talk it through with CEOs who have raised',
        text: 'Business Leader’s peer forums put you alongside founders and CEOs who have raised capital and worked with investors, for honest challenge before you take money on.',
      },
      reading: [
        {
          kind: 'Article',
          step: 2,
          title: 'How growth capital is powering the UK’s most ambitious businesses',
          blurb: 'Why securing the right funding at the right time matters as much as the amount.',
          url: 'https://www.businessleader.co.uk/insights/how-growth-capital-is-powering-the-uks-most-ambitious-businesses',
        },
        {
          kind: 'Article',
          step: 2,
          title: 'Beyond banks: How UK entrepreneurs are rewriting the rules of fundraising',
          blurb: 'From crowdfunding to media-for-equity: newer ways founders are funding growth.',
          url: 'https://www.businessleader.co.uk/insights/how-uk-entrepreneurs-rewriting-rules-fundraising',
        },
        {
          kind: 'Video',
          step: 2,
          title: 'Caspar Lee: Why Most Founders Fail After Funding',
          blurb: 'The founder and investor on what goes wrong once the money lands.',
          url: 'https://www.youtube.com/watch?v=A5iJRWzKr6o',
        },
      ],
    },
    {
      id: 'international',
      code: 5,
      name: 'Going international',
      title: 'Are you ready to go international?',
      highlight: 'international',
      lead:
        'A new country can open up years of growth, or pull focus from the business that pays for it. Six quick statements from Sir Richard Harpin’s 9 Steps show how ready you are to expand abroad profitably, and where to start.',
      resultHeading: 'here’s how ready you are to go international',
      // From Richard's "Ask Richard: International expansion": weigh it against growth at home first, pick a
      // market where you change little (his 15 per cent rule), and find your replacement before you go big.
      statements: [
        { step: 6, text: 'We have weighed going international against the growth still left in our home market.' },
        { step: 6, text: 'We have found a market with customers like ours, where we would need to change little of what we sell.' },
        { step: 6, pick: 1 },
        { step: 6, text: 'We know what a new market would cost us, and how long it would take to pay back.' },
        { step: 5, pick: 0 },
        { step: 5, pick: 1 },
      ],
      verdicts: [
        {
          min: 67,
          label: 'Ready to expand',
          text: 'You have strong foundations: a business that doesn’t lean on you, and a clear view of where to go and how to make it pay. Prove the model in one country before you open the next.',
        },
        {
          min: 40,
          label: 'Getting ready',
          text: 'Some of the groundwork is in place, but there are gaps at home or in your plan for a new market. Close them before you commit serious time and money abroad.',
        },
        {
          min: 0,
          label: 'Home first',
          text: 'Going international now would stretch you and the business at home. Get the business running without you first, then pick a market where your model works with little change.',
        },
      ],
      cta: {
        title: 'Go global with people who have done it',
        text: 'Business Leader’s peer forums put you alongside founders and CEOs who have taken their businesses into new markets, for honest challenge before you commit time and money abroad.',
      },
      reading: [
        {
          kind: 'Article',
          step: 6,
          title: 'International expansion: How to take your business into new markets',
          blurb: 'Founders and advisers on when to go, where to start and how to judge success.',
          url: 'https://www.businessleader.co.uk/insights/international-expansion-how-to-take-your-business-into-new-markets',
        },
        {
          kind: 'Video',
          step: 6,
          title: 'Expanding Rentokil to 88 countries',
          blurb: 'Richard Harpin talks to Andy Ransom, outgoing CEO of Rentokil Initial, about building the business worldwide.',
          url: 'https://www.youtube.com/watch?v=0dcpypa5irM&t=1383s',
        },
        {
          kind: 'Article',
          step: 6,
          title: 'Why local talent is the secret to global business success',
          blurb: 'Why local expertise, rather than remote teams or staff sent from home, can decide whether expansion works.',
          url: 'https://www.businessleader.co.uk/insights/why-local-talent-is-the-secret-to-global-business-success',
        },
        {
          kind: 'Article',
          step: 5,
          title: 'How to know when it’s time to replace yourself as the boss',
          blurb: 'Richard’s advice is to find your replacement before you go big abroad. Here’s how to know when it’s time.',
          url: 'https://www.businessleader.co.uk/insights/how-to-know-when-its-time-to-replace-yourself-as-the-boss',
        },
      ],
    },
  ],
}
