export const SCALE_0_3 = [
  { label: "No / Not at all", score: 0 },
  { label: "Sometimes", score: 1 },
  { label: "Often", score: 2 },
  { label: "Always / Severe", score: 3 },
];

export const YESNO_RISK = [
  { label: "No", score: 0 },
  { label: "Yes", score: 2 },
];

export const YESNO_HELP = [
  { label: "Independent", score: 0 },
  { label: "Need help", score: 2 },
];

export const FREQ_CONTACT = [
  { label: "Daily", score: 0 },
  { label: "Few times a week", score: 1 },
  { label: "Rarely", score: 2 },
];

export const ACTIVITY_LEVEL = [
  { label: "Daily", score: 0 },
  { label: "Sometimes", score: 1 },
  { label: "Rarely", score: 2 },
];

export const HEALTH_RATING = [
  { label: "Excellent", score: 0 },
  { label: "Good", score: 1 },
  { label: "Average", score: 2 },
  { label: "Poor", score: 3 },
];

export const QUESTIONS = {
  physical: [
    { id: "ph_fatigue", text: "Do you feel tired most of the time?", opts: SCALE_0_3 },
    { id: "ph_walk", text: "Do you have difficulty walking without support?", opts: SCALE_0_3 },
    { id: "ph_falls", text: "Have you fallen in the last 6 months?", opts: YESNO_RISK, note: "Fall history is a strong risk signal" },
    { id: "ph_pain", text: "Do you have frequent joint/muscle pain?", opts: SCALE_0_3 },
    { id: "ph_sleep", text: "Do you have trouble sleeping at night?", opts: SCALE_0_3 },
    { id: "ph_healthrate", text: "How would you rate your overall physical health?", opts: HEALTH_RATING },
    { id: "ph_weightloss", text: "Unintentional weight loss in last 3 months?", opts: YESNO_RISK, note: "Frailty indicator" },
  ],
  functional: [
    { id: "fn_bathing", text: "Bathing", opts: YESNO_HELP },
    { id: "fn_dressing", text: "Dressing", opts: YESNO_HELP },
    { id: "fn_cooking", text: "Cooking", opts: YESNO_HELP },
    { id: "fn_phone", text: "Using phone", opts: YESNO_HELP },
    { id: "fn_meds", text: "Taking medicines correctly", opts: YESNO_HELP, note: "Strong safety & adherence signal" },
    { id: "fn_shopping", text: "Shopping / errands", opts: YESNO_HELP },
    { id: "fn_househelp", text: "Do you need help with household tasks overall?", opts: SCALE_0_3 },
  ],
  mental: [
    { id: "mh_lonely", text: "Do you feel lonely frequently?", opts: SCALE_0_3 },
    { id: "mh_sad", text: "Do you feel sad/depressed often?", opts: SCALE_0_3 },
    { id: "mh_anxiety", text: "Do you feel anxious about your health?", opts: SCALE_0_3 },
    { id: "mh_interest", text: "Have you lost interest in activities you used to enjoy?", opts: SCALE_0_3, note: "Depression indicator" },
    { id: "mh_engage", text: "Do you enjoy talking with family/friends regularly?", opts: [
      { label: "Yes", score: 0 },
      { label: "Sometimes", score: 1 },
      { label: "Rarely", score: 2 },
      { label: "No", score: 3 },
    ] },
  ],
  cognitive: [
    { id: "cg_objects", text: "Do you lose/forget where you placed things?", opts: SCALE_0_3 },
    { id: "cg_appt", text: "Do you forget appointments/important dates?", opts: SCALE_0_3 },
    { id: "cg_names", text: "Do you forget names of familiar people?", opts: SCALE_0_3 },
    { id: "cg_instruct", text: "Difficulty understanding instructions recently?", opts: SCALE_0_3, note: "Cognitive risk signal" },
  ],
  social: [
    { id: "so_contact", text: "How often do you talk with family members?", opts: FREQ_CONTACT },
    { id: "so_community", text: "Do you participate in social/community activities?", opts: [
      { label: "Yes (often)", score: 0 },
      { label: "Sometimes", score: 1 },
      { label: "Rarely", score: 2 },
      { label: "No", score: 3 },
    ] },
    { id: "so_friends", text: "Do you have friends/neighbors you interact with?", opts: [
      { label: "Yes", score: 0 },
      { label: "Some", score: 1 },
      { label: "Very few", score: 2 },
      { label: "None", score: 3 },
    ] },
  ],
  safety: [
    { id: "sf_livealone", text: "Do you live alone?", opts: [{ label: "No", score: 0 }, { label: "Yes", score: 2 }] },
    { id: "sf_safehome", text: "Do you feel safe at home?", opts: [
      { label: "Yes", score: 0 },
      { label: "Mostly", score: 1 },
      { label: "Sometimes not", score: 2 },
      { label: "No", score: 3 },
    ] },
    { id: "sf_emergency", text: "Do you have someone to call during emergency?", opts: [
      { label: "Yes", score: 0 },
      { label: "Not sure", score: 2 },
      { label: "No", score: 3 },
    ] },
    { id: "sf_confident", text: "Confident moving around inside home?", opts: [
      { label: "Yes", score: 0 },
      { label: "Sometimes", score: 1 },
      { label: "No", score: 3 },
    ] },
    { id: "sf_vision", text: "Any vision problems affecting walking?", opts: YESNO_RISK, note: "Fall risk signal" },
    { id: "sf_meds_count", text: "Do you take 4 or more medicines daily?", opts: YESNO_RISK, note: "Polypharmacy increases fall risk" },
    { id: "sf_balance", text: "Do you feel balance problems/dizziness?", opts: SCALE_0_3, note: "Fall risk signal" },
    { id: "sf_hazards", text: "Home hazards (slippery floor / no grab bars / poor lighting)?", opts: SCALE_0_3 },
  ],
  lifestyle: [
    { id: "ls_meals", text: "Do you eat three meals regularly?", opts: [
      { label: "Yes", score: 0 },
      { label: "Mostly", score: 1 },
      { label: "Sometimes", score: 2 },
      { label: "No", score: 3 },
    ] },
    { id: "ls_water", text: "Do you drink enough water daily?", opts: [
      { label: "Yes", score: 0 },
      { label: "Mostly", score: 1 },
      { label: "Sometimes", score: 2 },
      { label: "No", score: 3 },
    ] },
    { id: "ls_activity", text: "Do you do physical activity / walking?", opts: ACTIVITY_LEVEL, note: "Frailty protection factor" },
  ],
  self: [
    { id: "sa_happy", text: "How happy do you feel with current life? (lower = worse)", opts: [
      { label: "5 (Very happy)", score: 0 },
      { label: "4", score: 1 },
      { label: "3", score: 2 },
      { label: "2", score: 3 },
      { label: "1 (Not happy)", score: 4 },
    ] },
    { id: "sa_concern", text: "Biggest health concern (text)", type: "text" },
  ],
};
