export function fillSample() {
  const set = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = value;
  };

  set("name", "Lakshmi");
  set("age", "72");
  set("gender", "Female");

  const sample = {
    ph_fatigue:"2", ph_walk:"1", ph_falls:"2", ph_pain:"2", ph_sleep:"1", ph_healthrate:"2", ph_weightloss:"0",
    fn_bathing:"0", fn_dressing:"0", fn_cooking:"2", fn_phone:"0", fn_meds:"2", fn_shopping:"2", fn_househelp:"2",
    mh_lonely:"2", mh_sad:"1", mh_anxiety:"1", mh_interest:"2", mh_engage:"2",
    cg_objects:"1", cg_appt:"2", cg_names:"1", cg_instruct:"1",
    so_contact:"1", so_community:"2", so_friends:"2",
    sf_livealone:"2", sf_safehome:"1", sf_emergency:"0", sf_confident:"1", sf_vision:"0", sf_meds_count:"2", sf_balance:"1", sf_hazards:"2",
    ls_meals:"1", ls_water:"1", ls_activity:"1",
    sa_happy:"2"
  };

  for (const [k,v] of Object.entries(sample)) set(k, v);
  set("sa_concern", "Knee pain, feels lonely in evenings, sometimes forgets medicine.");
}
