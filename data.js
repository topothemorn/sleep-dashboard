// All dashboard content lives here so it can be edited without touching layout code.
// Loaded as a plain script (not fetched JSON) so the page works when opened straight from disk.
window.SLEEP_DATA = {
  quickFacts: [
    { value: "7–9 hrs", label: "Adults need per night", note: "65+ need 7–8 hrs" },
    { value: "~90 min", label: "One sleep cycle", note: "4–6 cycles a night" },
    { value: "60–67°F", label: "Ideal bedroom temp", note: "Core body temp must drop to sleep" },
    { value: "~1 in 3", label: "US adults sleep < 7 hrs", note: "CDC estimate" },
    { value: "7–10 yrs", label: "Typical mattress lifespan", note: "Sooner if sagging or causing aches" }
  ],

  // Hypnogram order (top to bottom) and display info
  stages: {
    wake: { short: "Wake", name: "Awake", color: "wake" },
    rem:  { short: "REM", name: "REM sleep", color: "rem" },
    n1:   { short: "N1", name: "Light sleep (N1)", color: "n1" },
    n2:   { short: "N2", name: "Light sleep (N2)", color: "n2" },
    n3:   { short: "N3", name: "Deep sleep (N3)", color: "n3" }
  },
  stageOrder: ["wake", "rem", "n1", "n2", "n3"],

  stageDetails: [
    {
      id: "n1",
      name: "N1 · Falling asleep",
      tagline: "The doorway between awake and asleep",
      share: "~5%",
      shareNum: 5,
      length: "1–7 min per cycle",
      wave: "Theta (4–8 Hz)",
      body: [
        "Heart rate and breathing begin to slow",
        "Muscles relax; you may get a sudden 'falling' jerk (hypnic jerk)",
        "Very easy to wake — noise, light or a partner moving brings you right back"
      ],
      purpose: ["Hands the brain off from wakefulness into sleep"],
      disruptors: ["Light and noise", "Partner movement", "A racing mind / screens before bed"],
      talkingPoint: "This is the lightest sleep. If something wakes you here — a partner rolling over, a noisy spring — you have to start the climb all over again."
    },
    {
      id: "n2",
      name: "N2 · Light sleep",
      tagline: "Where you spend about half the night",
      share: "~45–55%",
      shareNum: 50,
      length: "10–25 min early, longer later",
      wave: "Theta + sleep spindles & K-complexes",
      body: [
        "Body temperature drops, heart rate slows further",
        "Eye movement stops, muscles relax more",
        "Brain fires 'sleep spindles' that help block outside noise"
      ],
      purpose: ["Memory and motor-skill learning", "Protects sleep from small disturbances", "Gateway to deep sleep"],
      disruptors: ["Overheating", "Pressure points that make you shift position", "Alcohol late in the night"],
      talkingPoint: "Half your night is here. Every time pressure on a shoulder or hip makes you toss and turn, you get bumped back toward the surface."
    },
    {
      id: "n3",
      name: "N3 · Deep sleep",
      tagline: "The physical recovery stage",
      share: "~15–25%",
      shareNum: 20,
      length: "20–40 min, mostly in the first half of the night",
      wave: "Delta (0.5–4 Hz) — big, slow waves",
      body: [
        "Lowest heart rate, breathing and blood pressure of the night",
        "Hardest stage to wake from — you feel groggy if you do",
        "Growth hormone is released"
      ],
      purpose: ["Tissue and muscle repair", "Immune system support", "Brain 'clean-up' of waste products", "Feeling physically refreshed"],
      disruptors: ["Sleeping hot", "Frequent wake-ups early in the night", "Alcohol and late caffeine", "Aging (deep sleep naturally declines)"],
      talkingPoint: "Deep sleep is when your body repairs itself, and most of it happens in the first few hours. Staying cool and undisturbed early in the night protects it."
    },
    {
      id: "rem",
      name: "REM · Dream sleep",
      tagline: "Mental and emotional recovery",
      share: "~20–25%",
      shareNum: 22,
      length: "10 min early → up to 60 min by morning",
      wave: "Mixed, fast, awake-like (beta/theta)",
      body: [
        "Eyes dart rapidly; most vivid dreams happen here",
        "Major muscles are temporarily paralyzed (atonia) so you don't act out dreams",
        "Heart rate and breathing become irregular; body is less able to regulate temperature"
      ],
      purpose: ["Emotional processing and mood", "Learning, memory and creativity", "Brain development"],
      disruptors: ["Cutting the night short (REM is concentrated near morning)", "Alcohol and some medications", "Overheating near morning"],
      talkingPoint: "Most REM happens in the last few hours. Lose your final 90 minutes of sleep and you can lose a big chunk of the sleep that keeps your mood and focus sharp."
    }
  ],

  brainWaves: [
    { id: "gamma", name: "Gamma", hz: "30–100 Hz", freq: 9, amp: 0.15, when: "Intense focus, problem solving", sleep: "Rare in sleep" },
    { id: "beta", name: "Beta", hz: "13–30 Hz", freq: 6, amp: 0.25, when: "Alert, active thinking", sleep: "Brief awakenings; part of REM's awake-like pattern" },
    { id: "alpha", name: "Alpha", hz: "8–12 Hz", freq: 3.5, amp: 0.4, when: "Relaxed, eyes closed", sleep: "Fades as you drift off — its loss marks sleep onset" },
    { id: "theta", name: "Theta", hz: "4–8 Hz", freq: 2, amp: 0.55, when: "Drowsy, light sleep", sleep: "Dominant in N1 and N2 (and REM)" },
    { id: "delta", name: "Delta", hz: "0.5–4 Hz", freq: 0.8, amp: 0.95, when: "Deep sleep", sleep: "Defines N3 — the bigger the waves, the deeper the sleep" }
  ],

  // Illustrative 8-hour nights. Segments are [stage, minutes]. Events mark what caused a wake-up.
  nights: {
    healthy: {
      label: "Healthy",
      summary: "Falls asleep in ~10 minutes, cycles smoothly about every 90 minutes. Deep sleep is front-loaded; REM grows toward morning.",
      segments: [
        ["wake", 10], ["n1", 5], ["n2", 20], ["n3", 45], ["n2", 10], ["rem", 10],
        ["n2", 30], ["n3", 30], ["n2", 15], ["rem", 20], ["wake", 2],
        ["n1", 3], ["n2", 35], ["n3", 15], ["n2", 15], ["rem", 25],
        ["n2", 55], ["n3", 5], ["n2", 10], ["rem", 30], ["wake", 2],
        ["n1", 3], ["n2", 40], ["rem", 35], ["wake", 10]
      ],
      events: []
    },
    pressure: {
      label: "Pressure & motion",
      summary: "Shoulder/hip pressure and a partner's movement cause repeated shifts and wake-ups. The person may not remember them, but deep sleep gets cut short.",
      segments: [
        ["wake", 20], ["n1", 8], ["n2", 22], ["n3", 20], ["wake", 4], ["n1", 5], ["n2", 15], ["rem", 8],
        ["n2", 18], ["n3", 15], ["n1", 4], ["wake", 6], ["n1", 5], ["n2", 20], ["rem", 15],
        ["wake", 5], ["n1", 6], ["n2", 40], ["n3", 8], ["n2", 12], ["wake", 4], ["n1", 4], ["rem", 18],
        ["n2", 45], ["wake", 8], ["n1", 6], ["n2", 35], ["rem", 30], ["wake", 4], ["n1", 4], ["n2", 25], ["rem", 20], ["wake", 21]
      ],
      events: [
        { at: 70, text: "Hip pressure → rolls over" },
        { at: 139, text: "Partner gets up" },
        { at: 256, text: "Shoulder numb → shifts" },
        { at: 327, text: "Partner rolls over" },
        { at: 406, text: "Wakes stiff, tosses" }
      ]
    },
    hot: {
      label: "Too hot",
      summary: "A warm room or heat-trapping bed slows the core-temperature drop. Takes longer to fall asleep, deep sleep shrinks, and wake-ups cluster in REM-heavy early morning.",
      segments: [
        ["wake", 35], ["n1", 10], ["n2", 30], ["n3", 20], ["n2", 15], ["rem", 15],
        ["n2", 25], ["n3", 15], ["n2", 15], ["rem", 15], ["wake", 8],
        ["n1", 6], ["n2", 45], ["n3", 5], ["n2", 10], ["rem", 25], ["wake", 10],
        ["n1", 5], ["n2", 40], ["rem", 25], ["wake", 12], ["n1", 5], ["n2", 35], ["rem", 15], ["wake", 39]
      ],
      events: [
        { at: 10, text: "Too warm to drift off" },
        { at: 195, text: "Kicks off covers" },
        { at: 294, text: "Wakes sweaty" },
        { at: 441, text: "Can't get back to sleep" }
      ]
    }
  },

  ageGroups: [
    { label: "Newborn", range: "0–3 mo", hours: [14, 17], note: "Sleep in short bursts around the clock; about half of sleep is REM." },
    { label: "Infant", range: "4–11 mo", hours: [12, 15], note: "Naps plus longer night stretches start to form." },
    { label: "Toddler", range: "1–2 yrs", hours: [11, 14], note: "Includes naps. Consistent bedtime routines matter most." },
    { label: "Preschool", range: "3–5 yrs", hours: [10, 13], note: "Includes naps. Lots of deep sleep for growth." },
    { label: "School age", range: "6–13 yrs", hours: [9, 11], note: "Deep sleep is at its lifetime peak." },
    { label: "Teen", range: "14–17 yrs", hours: [8, 10], note: "Body clock shifts later — teens genuinely struggle to fall asleep early." },
    { label: "Adult", range: "18–64 yrs", hours: [7, 9], note: "Deep sleep slowly declines with age; consistency and comfort matter more." },
    { label: "Older adult", range: "65+ yrs", hours: [7, 8], note: "Need does NOT drop much, but sleep gets lighter, with more wake-ups and earlier waking. Pain and pressure points disturb sleep more easily." }
  ],

  // Customer conversation helper
  positions: [
    {
      id: "side", label: "Side",
      pressure: ["Shoulder", "Hip"],
      need: "Pressure relief so the shoulder and hip can sink in while the spine stays straight.",
      feel: "Soft to medium",
      watch: "Too firm → numb arm, sore shoulder/hip, lots of tossing."
    },
    {
      id: "back", label: "Back",
      pressure: ["Lower back", "Shoulder blades", "Heels"],
      need: "Even support that fills the gap under the lower back without letting hips sink.",
      feel: "Medium to medium-firm",
      watch: "Too soft → hips sink and low back aches. Too firm → lumbar gap."
    },
    {
      id: "stomach", label: "Stomach",
      pressure: ["Hips", "Lower back", "Neck"],
      need: "Firmer, flatter support so hips don't sink and arch the lower back. Thin pillow.",
      feel: "Medium-firm to firm",
      watch: "Soft beds let the hips 'hammock' and strain the low back."
    },
    {
      id: "combo", label: "Combination",
      pressure: ["Shoulder", "Hip", "Lower back"],
      need: "Balanced, responsive feel that's easy to move on and works in every position.",
      feel: "Medium, responsive",
      watch: "Very slow-recovery foam can feel 'stuck' when changing positions."
    }
  ],

  concerns: [
    {
      id: "aches-shoulder", label: "Wakes with shoulder/hip pain or numb arm",
      priority: "Pressure relief",
      why: "Concentrated pressure reduces circulation, so the body shifts to relieve it — each shift is a micro-arousal that pulls you out of deep sleep.",
      look: ["Thicker or softer comfort layer", "Zoned support (softer at shoulders)", "Check that the spine stays level on their side"],
      say: "Every time that shoulder goes numb you're waking up a little, even if you don't remember it. Let's find something that lets it sink in."
    },
    {
      id: "aches-back", label: "Wakes with low-back stiffness",
      priority: "Support & alignment",
      why: "Poor alignment strains muscles all night. Research on low-back pain has generally favored medium-firm over very firm surfaces.",
      look: ["Medium-firm support with good lumbar fill", "Check current mattress for sagging/body impressions", "Adjustable base (slight leg lift) can take load off the low back"],
      say: "Firmer isn't automatically better for backs — it's about keeping the spine in a neutral line. Lie on your back and let's check the gap."
    },
    {
      id: "hot", label: "Sleeps hot / kicks off covers",
      priority: "Temperature control",
      why: "Core body temperature has to drop about 1–2°F to start and stay asleep. Heat cuts deep sleep and causes early-morning wake-ups.",
      look: ["Breathable materials: coils, latex, open-cell or gel foams", "Cooling cover / breathable bedding", "Bedroom at roughly 60–67°F"],
      say: "Your body has to cool down to stay in deep sleep. If the bed traps heat, you end up waking up in the second half of the night."
    },
    {
      id: "partner", label: "Partner's movement wakes them",
      priority: "Motion isolation",
      why: "Light sleep (N1/N2) is easily disrupted. Each disturbance can bump someone back toward wake.",
      look: ["Memory foam or individually pocketed coils", "Size up (queen → king) for more personal space", "Split or dual-firmness options if needs differ"],
      say: "If you feel them every time they roll over, you're getting pulled out of deep sleep all night. Let's do the wine-glass test."
    },
    {
      id: "snore", label: "Snoring (them or partner)",
      priority: "Elevation & referral",
      why: "Raising the head a few inches can help some people breathe more easily. Loud snoring with gasping or pauses can be a sign of sleep apnea — that's a doctor conversation.",
      look: ["Adjustable base with head elevation", "Pillow height that keeps the neck neutral"],
      say: "Some people find raising the head of the bed helps. If there's gasping or pauses in breathing, it's worth mentioning to your doctor — that's a medical question.",
      refer: true
    },
    {
      id: "reflux", label: "Heartburn / reflux at night",
      priority: "Head elevation",
      why: "Elevating the upper body helps gravity keep stomach acid down.",
      look: ["Adjustable base (head up)", "Wedge or elevated pillow as a budget option"],
      say: "Raising the head of the bed is one of the most common tips for nighttime heartburn — an adjustable base makes that easy."
    },
    {
      id: "onset", label: "Takes 30+ minutes to fall asleep",
      priority: "Environment & routine",
      why: "Sleep onset depends on sleep debt, the body clock, and a calm, cool, dark environment. A mattress helps comfort, but it isn't the whole fix.",
      look: ["Comfort and temperature first", "Blackout/quiet environment", "Consistent wake time, less screen time before bed"],
      say: "A comfortable, cool bed takes away a reason to stay awake — and a consistent schedule does a lot of the rest.",
      refer: false
    },
    {
      id: "tired", label: "Tired even after 7+ hours",
      priority: "Sleep quality",
      why: "Fragmented sleep can mean plenty of time in bed but not enough deep or REM sleep. Persistent daytime sleepiness should be checked by a doctor.",
      look: ["Reduce disruptions: pressure, heat, motion", "Check mattress age and sagging"],
      say: "Hours in bed and quality sleep aren't the same thing. If you're waking up a lot, you may never stay in deep sleep long.",
      refer: true
    },
    {
      id: "old", label: "Mattress is 7+ years old or sagging",
      priority: "Replacement window",
      why: "Comfort layers soften and support breaks down over time, creating dips that pull the spine out of alignment.",
      look: ["Body impressions over ~1.5 in", "Sleeps better in hotels/guest beds", "Waking with aches that fade during the day"],
      say: "If you sleep better in a hotel than at home, that's a strong sign your mattress has worn out."
    }
  ],

  healthyVsPoor: [
    { metric: "Time to fall asleep", good: "≤ 30 min (10–20 is typical)", poor: "> 30 min regularly" },
    { metric: "Sleep efficiency", good: "≥ 85% of time in bed asleep", poor: "< 85%" },
    { metric: "Wake-ups lasting 5+ min", good: "0–1 per night", poor: "2+ per night" },
    { metric: "Awake after first falling asleep", good: "≤ 20 min total", poor: "> 40 min total" },
    { metric: "Deep sleep (N3)", good: "Roughly 15–25% (less with age)", poor: "Short, broken deep sleep" },
    { metric: "REM", good: "Roughly 20–25%", poor: "Cut short or fragmented" },
    { metric: "Next day", good: "Alert without needing a nap", poor: "Groggy, irritable, unfocused" }
  ],

  consequences: {
    shortTerm: [
      { area: "Brain", items: ["Slower reactions — being awake 17–19 hrs is similar to being legally drunk in some studies", "Poor focus and memory", "Microsleeps"] },
      { area: "Mood", items: ["Irritability", "More anxious and reactive", "Less patience"] },
      { area: "Body", items: ["Hunger hormones shift → more cravings", "More aches and pain sensitivity", "Weaker immune response"] }
    ],
    longTerm: [
      { area: "Heart", items: ["High blood pressure", "Higher heart disease and stroke risk"] },
      { area: "Metabolism", items: ["Weight gain", "Insulin resistance / type 2 diabetes risk"] },
      { area: "Immune", items: ["Catch colds more easily", "Weaker vaccine response"] },
      { area: "Brain", items: ["Higher depression and anxiety risk", "Linked to cognitive decline and dementia risk"] }
    ]
  },

  drivers: {
    caffeineHalfLife: 5, // hours, typical adult average (varies ~2–10)
    caffeineMg: 95,      // one 8 oz cup of brewed coffee
    points: [
      { title: "Sleep debt", body: "The longer you're awake, the more sleep debt builds up (a chemical called adenosine), making you sleepy. Sleep pays it back. Short nights carry the debt into the next day. Caffeine blocks adenosine — it hides the tiredness, it doesn't pay off the debt." },
      { title: "Body clock", body: "Your circadian rhythm runs on a ~24-hour cycle set mostly by light. Evening darkness triggers melatonin; morning light resets the clock. Screens and bright light late at night push it later." },
      { title: "Temperature", body: "Core temperature drops as you fall asleep and bottoms out in the early morning. A cool room and breathable bed help the body shed heat — a hot bed fights this." }
    ]
  },

  disorders: [
    { name: "Insomnia", stat: "~10% of adults chronically", signs: "Trouble falling or staying asleep 3+ nights a week for 3+ months, with daytime effects.", note: "Comfort helps, but chronic insomnia is best treated with CBT-I through a clinician." },
    { name: "Obstructive sleep apnea", stat: "Very common; most cases undiagnosed", signs: "Loud snoring, gasping or choking, pauses in breathing, morning headaches, daytime sleepiness.", note: "Raises heart and stroke risk. Always a referral — never something a mattress fixes." },
    { name: "Restless legs syndrome", stat: "Several % of adults", signs: "Urge to move the legs in the evening, eased by movement; can delay sleep.", note: "Worth a doctor visit; can be linked to iron levels." },
    { name: "Circadian rhythm disorders", stat: "Common in teens & shift workers", signs: "Body clock out of sync with schedule — can't sleep until very late, or very early wake.", note: "Light timing and consistent schedules are the main tools." }
  ],

  myths: [
    { myth: "Firmer is always better for back pain.", fact: "Not necessarily. Research has generally favored medium-firm over very firm for low-back pain. Alignment and pressure relief matter more than firmness alone." },
    { myth: "Older adults need less sleep.", fact: "Adults 65+ still need 7–8 hours. Sleep just gets lighter and more broken, which makes comfort and fewer disruptions even more important." },
    { myth: "A nightcap helps you sleep.", fact: "Alcohol can make you drowsy, but it suppresses REM and causes more wake-ups in the second half of the night." },
    { myth: "You can catch up on sleep on weekends.", fact: "Extra sleep helps some, but it doesn't fully reverse the effects of a short-sleep week — and it shifts your body clock for Monday." },
    { myth: "Snoring is harmless.", fact: "Often it is, but loud snoring with gasps or pauses can signal sleep apnea, which needs a doctor." },
    { myth: "If I'm not waking up, I'm sleeping well.", fact: "Many brief arousals (from pressure, heat or motion) aren't remembered, but they still fragment deep sleep." },
    { myth: "Everyone needs exactly 8 hours.", fact: "Most adults need 7–9. Quality and consistency count as much as the number." },
    { myth: "Your mattress is fine if it looks fine.", fact: "Foams and coils lose support inside before it's visible. Waking stiff, or sleeping better away from home, are better clues." }
  ],

  tracking: [
    { name: "Sleep study (polysomnography)", tag: "Gold standard", detail: "Lab or hospital test measuring brain waves (EEG), eye movement, muscle tone, breathing and oxygen. The only way to truly measure sleep stages and diagnose most disorders." },
    { name: "Home sleep apnea test", tag: "Apnea screening", detail: "Measures breathing, airflow and oxygen at home. Good for diagnosing sleep apnea, but doesn't measure sleep stages." },
    { name: "Wearables (watch, ring)", tag: "Good for trends", detail: "Estimate sleep from movement and heart rate. Reasonably good at total sleep time; stage estimates (deep/REM) are rough. Best used for night-to-night trends." },
    { name: "Under-mattress & bedside sensors", tag: "Good for trends", detail: "Track movement, breathing and heart rate without wearing anything. Similar strengths and limits to wearables." }
  ],

  glossary: [
    { term: "Sleep latency", def: "How long it takes to fall asleep after lights out. 10–20 minutes is typical." },
    { term: "Sleep efficiency", def: "Percent of time in bed actually asleep. 85%+ is considered healthy." },
    { term: "WASO", def: "'Wake after sleep onset' — total time awake during the night after first falling asleep." },
    { term: "Sleep cycle", def: "One pass through N1 → N2 → N3 → N2 → REM, roughly 90 minutes. Most people get 4–6 a night." },
    { term: "Hypnogram", def: "A chart showing which sleep stage you're in across the night." },
    { term: "Micro-arousal", def: "A brief (3–15 second) shift toward wakefulness you usually don't remember. Caused by pressure, noise, heat, motion or breathing issues." },
    { term: "Sleep spindle", def: "Short burst of brain activity in N2 that helps block outside disturbances and supports memory." },
    { term: "K-complex", def: "A single large brain wave in N2, often in response to a sound or touch, that helps keep you asleep." },
    { term: "Slow-wave sleep", def: "Another name for deep sleep (N3), named for its large, slow delta waves." },
    { term: "Atonia", def: "Temporary muscle paralysis during REM that keeps you from acting out dreams." },
    { term: "Sleep inertia", def: "Grogginess after waking, strongest when woken from deep sleep." },
    { term: "Circadian rhythm", def: "The body's ~24-hour internal clock, set mainly by light." },
    { term: "Chronotype", def: "Whether you're naturally a morning person, night owl, or in between." },
    { term: "Adenosine", def: "Chemical that builds up while you're awake and drives sleep debt and makes you sleepy. Caffeine blocks it." },
    { term: "Melatonin", def: "Hormone released in darkness that signals it's night. Bright light suppresses it." },
    { term: "Sleep debt", def: "The running total of sleep you've missed versus what you need." },
    { term: "AHI", def: "Apnea-Hypopnea Index — breathing interruptions per hour of sleep. 5+ indicates sleep apnea." },
    { term: "Pressure point", def: "Where body weight concentrates on the mattress (shoulders, hips). Too much pressure causes tossing and turning." },
    { term: "Spinal alignment", def: "Keeping the spine in its natural neutral line while lying down. The goal for support in every position." },
    { term: "Motion isolation", def: "How well a mattress keeps one sleeper's movement from reaching the other." }
  ],

  sources: [
    { label: "American Academy of Sleep Medicine", url: "https://aasm.org/" },
    { label: "National Sleep Foundation — sleep duration recommendations", url: "https://www.thensf.org/how-many-hours-of-sleep-do-you-really-need/" },
    { label: "CDC — Sleep and sleep disorders", url: "https://www.cdc.gov/sleep/" },
    { label: "Sleep Foundation — stages of sleep", url: "https://www.sleepfoundation.org/stages-of-sleep" },
    { label: "NIH / NINDS — Brain basics: understanding sleep", url: "https://www.ninds.nih.gov/health-information/public-education/brain-basics/brain-basics-understanding-sleep" }
  ]
};
