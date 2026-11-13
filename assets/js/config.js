/*
 * The 9 Steps Diagnostic: settings that change between environments.
 * Copy is in content.js; behaviour is in app.js.
 */
window.BL_DIAGNOSTIC_CONFIG = {
  // Ask for name, email and company before showing results. Set to false to let people skip.
  requireDetails: true,

  hubspot: {
    // Business Leader's HubSpot portal (EU data centre), as used by the website rebuild.
    portalId: '139679465',
    // Leave blank until a "9 Steps Diagnostic" form exists in HubSpot. While blank, nothing is
    // sent anywhere: the payload is logged to the browser console instead (see README).
    formGuid: '',
    apiBase: 'https://api.hsforms.com',
    // HubSpot internal property names. The nine_steps_* properties must be created on the
    // contact object and added to the form as hidden fields (see README).
    fields: {
      firstName: 'firstname',
      lastName: 'lastname',
      email: 'email',
      company: 'company',
      jobTitle: 'jobtitle',
      phone: 'phone',
      marketingOptIn: 'nine_steps_marketing_opt_in',
      score: 'nine_steps_score',
      stepScore: 'nine_steps_step_{n}_score',
      priorities: 'nine_steps_priority_steps',
      strengths: 'nine_steps_strengths',
      stage: 'nine_steps_stage',
      role: 'nine_steps_role',
      turnover: 'nine_steps_turnover_band',
      ambition: 'nine_steps_ambition',
      answers: 'nine_steps_answers',
      reportUrl: 'nine_steps_report_url',
    },
  },

  links: {
    site: 'https://www.businessleader.co.uk',
    // "Get started": the membership page's call booking route (HubSpot landing page).
    bookConversation: 'https://invites.businessleader.co.uk/get-started-web-mobile',
    // Roundtable with Sir Richard Harpin, where he takes people through the 9 Steps.
    roundtable: 'https://invites.businessleader.co.uk/growth-workshop-web-mobile',
    newsletter: 'https://www.businessleader.co.uk/newsletters',
    privacy: 'https://www.businessleader.co.uk/our-privacy-policy',
    cookies: 'https://www.businessleader.co.uk/cookie-policy',
    book: 'https://www.amazon.co.uk/How-Make-Billion-Nine-Steps/dp/0349445389',
    bookExtract: 'https://www.businessleader.co.uk/insights/how-make-billion-nine-steps',
    podcastApple: 'https://podcasts.apple.com/gb/podcast/how-to-make-a-billion-in-9-steps-with-richard-harpin/id1825363917',
    podcastSpotify: 'https://open.spotify.com/show/5aPBAfRKnqW8A2kN44X37w',
  },

  analytics: {
    // Google Tag Manager container. On the BL site, GTM also loads the Cookiebot banner, so
    // tracking only runs once this is set. Events are pushed to window.dataLayer either way.
    gtmId: '',
  },
}
