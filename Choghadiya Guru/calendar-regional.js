// Computes the Malayalam (Kollavarsham), Tamil and Gujarati festival calendars for ANY year.
// 2026 comes from calendar-data-regional.js (published page data); every other year is calculated here from the same
// astronomy engine as the Panchang pages: solar transits (sankranti), tithi, nakshatra and the festival rules below.
// Eclipses are not calculated (they are listed for 2026 only).
const G = require("./calendar-gen.js"), H = G._h;
const P = require("./assets/panchang-engine.js");
const V = require("./vrat-calc.js");
const DEL = V.DEL, E = P._int;
const { blank, add, finish, addDays, isoOf, parts, wdOf, base, findDay } = H;

// ---------- per-day table (sunrise nakshatra, sun rashi, tithi runs) ----------
const TAB = {};
function table(y) {
  if (TAB[y]) return TAB[y];
  const days = [], by = {}, n = (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 366 : 365;
  for (let i = -3; i < n + 3; i++) {
    const iso = addDays(isoOf(y, 1, 1), i), [yy, m, d] = parts(iso), x = P.dayData(yy, m, d, DEL.lat, DEL.lon);
    const o = { iso, wd: x.wd, sr: x.sunrise, ss: x.sunset, nak: x.nak, tithi: x.tithi, rashi: x.sunRashi };
    days.push(o); by[iso] = o;
  }
  return (TAB[y] = { days, by });
}
const dayOf = iso => table(+iso.slice(0, 4)).by[iso];
const at = (z, min) => z.find(e => e.s <= min && min < e.e);
function anchorMin(o, a) { return a === "sr" ? o.sr + 1 : a === "md" ? (o.sr + o.ss) / 2 : a === "pr" ? o.ss + 30 : o.ss + 120; }
const nakOn = (iso, a) => { const o = dayOf(iso), z = at(o.nak, anchorMin(o, a)); return z ? z.i : -1; };
const titOn = (iso, a) => { const o = dayOf(iso), z = at(o.tithi, anchorMin(o, a)); return z ? z.n : -1; };
// every run of solar month `rashi` inside year y (Dhanu can occur twice: Jan and Dec) -> first day whose nakshatra matches
function nakDays(y, rashi, nak, anchors) {
  const t = table(y).days.filter(o => o.iso.startsWith(String(y))), out = [];
  let run = [];
  const flush = () => { if (!run.length) return; for (const a of anchors) { const f = run.find(o => { const z = at(o.nak, anchorMin(o, a)); return z && z.i === nak; }); if (f) { out.push(f.iso); return; } } };
  t.forEach(o => { if (o.rashi === rashi) run.push(o); else { flush(); run = []; } }); flush();
  return out;
}
const nakDay = (y, rashi, nak, anchors) => nakDays(y, rashi, nak, anchors)[0] || null;
const nakInRange = (from, to, nak, anchors) => { // first day in [from,to] with this nakshatra
  for (const a of anchors) for (let d = from; d <= to; d = addDays(d, 1)) if (nakOn(d, a) === nak) return d;
  return null;
};
// one date per lunar occurrence of tithi t (clusters of neighbouring days), choosing the first anchor that hits
function tithiDays(y, t, anchors) {
  const days = table(y).days.filter(o => o.iso.startsWith(String(y))), hits = [];
  anchors.forEach((a, ai) => days.forEach(o => { const z = at(o.tithi, anchorMin(o, a)); if (z && z.n === t) hits.push({ iso: o.iso, ai }); }));
  hits.sort((a, b) => a.iso < b.iso ? -1 : 1);
  const out = []; let cl = [];
  const flush = () => { if (cl.length) { cl.sort((a, b) => a.ai - b.ai || (a.iso < b.iso ? -1 : 1)); out.push(cl[0].iso); } };
  hits.forEach(h => { if (cl.length && (new Date(h.iso) - new Date(cl[cl.length - 1].iso)) / 864e5 > 2) { flush(); cl = []; } cl.push(h); });
  flush(); return out;
}
const inAdhik = (iso) => G.adhikRuns(+iso.slice(0, 4)).some(r => iso >= r.start && iso <= r.end);
const sankOf = (v, rashi) => v.sankranti.find(r => r.rashi === rashi);
const momentMin = r => { const t = r.moment.slice(11); return +t.slice(0, 2) * 60 + +t.slice(3, 5); };
const tamilMonthStart = r => r.afterSunset ? addDays(r.date, 1) : r.date;
function keralaMonthStart(r) { // Kerala rule: month begins that day if the transit is before the end of aparahna, else the next day
  const o = dayOf(r.date), cut = o.sr + 0.8 * (o.ss - o.sr); return momentMin(r) <= cut ? r.date : addDays(r.date, 1);
}
const amavByRashi = (v, rashi) => v.amavasya.filter(r => dayOf(r.date) && dayOf(r.date).rashi === rashi);
const purnByRashi = (v, rashi) => v.purnima.filter(r => dayOf(r.date) && dayOf(r.date).rashi === rashi);
const fest = (y, id) => base(y).byId[id];
const addIf = (M, y, iso, ...n) => { if (iso) add(M, y, iso, ...n); };
const sunSidCross = (y, deg) => { // IST date on which sidereal Sun crosses `deg` (0-360)
  const jd0 = E.jd0(y, 1, 1), j = E.cross(E.sunSid, deg, jd0 + 20);
  return new Date((j - 2440587.5) * 864e5 + 330 * 60e3).toISOString().slice(0, 10);
};

// =====================================================================================================
// MALAYALAM (Kollavarsham, solar)
// =====================================================================================================
const MAL_SANK = { 9: "Makaram", 10: "Kumbham", 11: "Meenam", 0: "Metam", 1: "Itavam", 2: "Mithunam", 3: "Karkatakam", 4: "Chingam", 5: "Kanni", 6: "Thulam", 7: "Vrischikam", 8: "Dhanu" };
function malayalam(y) {
  const { v } = base(y), M = blank();
  v.sankranti.forEach(r => add(M, y, r.date, MAL_SANK[r.rashi] + " Sankramam"));
  const mk = sankOf(v, 9); if (mk) { addIf(M, y, mk.date, "Makaravilakku"); addIf(M, y, tamilMonthStart(mk), "Pongal"); }
  const me = sankOf(v, 0); if (me) addIf(M, y, momentMin(me) < dayOf(me.date).sr ? me.date : addDays(me.date, 1), "Vishu");
  const ch = sankOf(v, 4); if (ch) addIf(M, y, keralaMonthStart(ch), "Malayalam New Year");
  const ka = sankOf(v, 5); if (ka) addIf(M, y, ka.date, "Vishwakarma Puja");
  const vr = sankOf(v, 7); if (vr) { const st = keralaMonthStart(vr); add(M, y, st, "Mandalakala Begins"); add(M, y, addDays(st, 40), "Mandalakala Pooja"); }
  // nakshatra festivals
  nakDays(y, 8, 5, ["sr", "md"]).forEach(d => add(M, y, d, "Thiruvathira"));              // Dhanu Ardra
  addIf(M, y, nakDay(y, 9, 7, ["sr", "md"]), "Thai Pooyam");               // Makaram Pushya
  addIf(M, y, nakDay(y, 10, 10, ["md", "sr"]), "Attukal Pongal");          // Kumbham Pooram
  addIf(M, y, nakDay(y, 11, 11, ["sr", "md"]), "Painkuni Uthram");         // Meenam Uthram
  addIf(M, y, nakDay(y, 0, 10, ["md", "sr"]), "Thrissur Pooram");          // Medam Pooram
  addIf(M, y, nakDay(y, 4, 21, ["sr", "md"]), "Onam");                     // Chingam Thiruvonam
  const on = nakDay(y, 4, 21, ["sr", "md"]); if (on) add(M, y, on, "Avani Avittam");
  addIf(M, y, nakDay(y, 7, 2, ["pr", "sr"]), "Karthigai Deepam");
  addIf(M, y, fest(y, "shivratri"), "Shivarathri");
  addIf(M, y, fest(y, "ramnavami"), "Shree Rama Navami");
  addIf(M, y, fest(y, "akshaya"), "Parashurama Jayanthi", "Akshaya Trithiya");
  addIf(M, y, fest(y, "guru"), "Guru Poornima");
  addIf(M, y, fest(y, "janmashtami"), "Ashtami Rohini");
  addIf(M, y, fest(y, "ganesh"), "Kerala Vinayaka Chathurthi");
  addIf(M, y, fest(y, "sharadnav"), "Navarathri");
  addIf(M, y, fest(y, "durgashtami"), "Durgashtami");
  addIf(M, y, fest(y, "mahanavami"), "Maha Navami");
  addIf(M, y, fest(y, "dussehra"), "Vijayadashami", "Vidyarambham Day");
  addIf(M, y, fest(y, "diwali"), "Diwali");
  // tithi festivals
  addIf(M, y, findDay(y, 3, 0, ["sr", "md"]), "Matsyavathara Dinam");      // Chaitra Shukla 3
  addIf(M, y, findDay(y, 5, 1, ["sr", "md"]), "Shree Shankara Jayanthi");  // Vaishakha Shukla 5
  addIf(M, y, findDay(y, 14, 1, ["pr", "sr"]), "Narasimha Jayanthi");      // Vaishakha Shukla 14
  addIf(M, y, findDay(y, 3, 5, ["md", "sr"]), "Varaha Jayanthi");          // Bhadrapada Shukla 3
  addIf(M, y, findDay(y, 5, 5, ["md", "sr"]), "Rishi Panchami");
  addIf(M, y, findDay(y, 12, 5, ["sr", "md"]), "Vamana Jayanthi");
  const kp = v.purnima.find(r => !r.month.adhik && r.month.en === "Vaishakha"); if (kp) add(M, y, kp.date, "Kurmavathara Dinam");
  const cp = purnByRashi(v, 0).find(r => nakOn(r.date, "pr") === 13 || nakOn(r.date, "sr") === 13) || purnByRashi(v, 0)[0]; if (cp) add(M, y, cp.date, "Chitra Pournami");
  v.ekadashi.forEach(r => {
    if (!r.adhik && r.en === "Devutthani Ekadashi") { const a = x => [11, 26].includes(titOn(x, "sr")); add(M, y, a(r.date) && a(addDays(r.date, 1)) ? addDays(r.date, 1) : r.date, "Guruvayur Ekadasi"); }
    if (!r.adhik && r.en.startsWith("Mokshada")) add(M, y, r.date, "Geeta Dinam", "Mukkoti Ekadasi");
  });
  return finish(M);
}

// =====================================================================================================
// TAMIL
// =====================================================================================================
function tamil(y) {
  const { v } = base(y), M = blank();
  const mk = sankOf(v, 9); if (mk) { const p = tamilMonthStart(mk); add(M, y, addDays(p, -1), "Bhogi Pandigai"); add(M, y, p, "Pongal"); add(M, y, addDays(p, 1), "Mattu Pongal"); }
  nakDays(y, 8, 5, ["sr", "md"]).forEach(d => add(M, y, d, "Arudra Darshan"));
  amavByRashi(v, 9).forEach(r => add(M, y, r.date, "Thai Amavasai"));
  amavByRashi(v, 3).forEach(r => add(M, y, r.date, "Aadi Amavasai"));
  v.amavasya.filter(r => !r.month.adhik && r.month.en === "Ashwin").forEach(r => add(M, y, r.date, "Mahalaya Amavasai"));
  addIf(M, y, findDay(y, 7, 10, ["sr", "md"]), "Ratha Sapthami");
  addIf(M, y, nakDay(y, 9, 7, ["sr", "md"]), "Thai Pusam");
  addIf(M, y, fest(y, "shivratri"), "Shivaratri");
  addIf(M, y, nakDay(y, 10, 9, ["sr", "md"]), "Masi Magam");
  const mn = sankOf(v, 11); if (mn) addIf(M, y, momentMin(mn) < 360 ? addDays(mn.date, -1) : mn.date, "Karadaiyan Nombu");
  addIf(M, y, fest(y, "ugadi"), "Ugadi - Telugu New Year");
  addIf(M, y, fest(y, "ramnavami"), "Rama Navami");
  addIf(M, y, nakDay(y, 11, 11, ["sr", "md"]), "Panguni Uthiram");
  const me = sankOf(v, 0); if (me) { addIf(M, y, tamilMonthStart(me), "Puthandu"); addIf(M, y, momentMin(me) < dayOf(me.date).sr ? me.date : addDays(me.date, 1), "Vishu"); }
  addIf(M, y, fest(y, "akshaya"), "Akshaya Thiruthiyai");
  addIf(M, y, findDay(y, 5, 1, ["sr", "md"]), "Sankara Jayanthi");
  addIf(M, y, nakDay(y, 0, 5, ["sr", "md"]), "Ramanuja Jayanthi");
  const cp = purnByRashi(v, 0).find(r => nakOn(r.date, "pr") === 13 || nakOn(r.date, "sr") === 13) || purnByRashi(v, 0)[0]; if (cp) add(M, y, cp.date, "Chitra Pournami");
  addIf(M, y, sunSidCross(y, 20), "Agni Nakshatram Begins"); addIf(M, y, sunSidCross(y, 43), "Agni Nakshatram Ends");
  addIf(M, y, nakDay(y, 1, 15, ["sr", "md"]), "Vaikasi Visakam");
  const ad = sankOf(v, 3); if (ad) addIf(M, y, addDays(tamilMonthStart(ad), 17), "Aadi Perukku");
  amavByRashi(v, 3).forEach(r => addIf(M, y, nakInRange(addDays(r.date, 1), addDays(r.date, 14), 10, ["sr", "md"]), "Andal Jayanthi"));
  addIf(M, y, findDay(y, 5, 4, ["sr", "md"]), "Garuda Panjami");
  const rg = nakDay(y, 4, 21, ["sr", "md"]); addIf(M, y, rg, "Avani Avittam *Rigveda", "Onam");
  const yj = fest(y, "raksha"); if (yj) { const d0 = findDay(y, 15, 4, ["md", "sr"]) || yj; add(M, y, d0, "Avani Avittam *Yajurveda"); add(M, y, addDays(d0, 1), "Gayathri Japam"); }
  const wl = fest(y, "raksha"); if (wl) { let d = wl; while (wdOf(d) !== 5) d = addDays(d, -1); add(M, y, d, "Varalakshmi Vratam"); }
  const sam = fest(y, "ganesh"); if (sam) addIf(M, y, nakInRange(addDays(sam, -7), sam, 12, ["md", "sr"]), "Avani Avittam *Samaveda");
  v.sankashti.forEach(r => { if (!r.month.adhik && r.month.i === 5) add(M, y, r.date, "Maha Sangada Hara Chathurti"); });
  addIf(M, y, fest(y, "janmashtami"), "Gokulastami", "Astami Rohini");
  addIf(M, y, fest(y, "ganesh"), "Vinayagar Chathurthi");
  // Pitru Paksha stars
  const ps = fest(y, "pitrustart"), sp = fest(y, "sarvapitri");
  if (ps && sp) { addIf(M, y, nakInRange(ps, sp, 1, ["md", "sr"]), "Maha Bharani"); addIf(M, y, nakInRange(ps, sp, 9, ["sr", "md"]), "Magha Shraddha"); }
  addIf(M, y, fest(y, "sharadnav"), "Navarathiri");
  addIf(M, y, fest(y, "mahanavami"), "Ayutha Poojai", "Saraswati Poojai");
  addIf(M, y, fest(y, "dussehra"), "Vidyarambham");
  addIf(M, y, fest(y, "diwali"), "Lakshmi Puja", "Kedara Gowri Vratham", "Deepavali");
  addIf(M, y, findDay(y, 6, 7, ["sr", "md"]), "Soora Samharam");
  addIf(M, y, nakDay(y, 7, 2, ["pr", "sr"]), "Karthigai Deepam");
  addIf(M, y, findDay(y, 6, 8, ["sr", "md"]), "Subrahmanya Sashti");
  v.ekadashi.forEach(r => { if (!r.adhik && r.en.startsWith("Mokshada")) add(M, y, r.date, "Vaikuntha Ekadashi"); });
  return finish(M);
}

// =====================================================================================================
// GUJARATI (Vikram Samvat, Amanta, year starts after Diwali)
// =====================================================================================================
const GUJ_CHAT = ["Vasudeva", "Sankarshana", "Pradyumna", "Aniruddha", "Durva Ganapati", "Siddhivinayaka", "Kapardisha", "Labh", "Krichchhra", "Pausha", "Gauriganesha", "Dhundhiraja"]; // by amanta month, Chaitra first
const GUJ_EKA = n => n.replace(" (Gita Jayanti)", "").replace("Papmochani", "Papamochani").replace("Parivartini", "Parsva").replace("Devutthani", "Devutthana").replace("Shravana Putrada", "Pavitra");
function gujarati(y) {
  const { v } = base(y), M = blank();
  v.ekadashi.forEach(r => {
    const nm = GUJ_EKA(r.en); add(M, y, r.date, nm);
    // Vaishnava / Gauna day: Ekadashi starts after Arunodaya of its first day (Dashami-viddha) -> next day
    if (r.run && r.run.s.slice(0, 10) === r.date) { const o = dayOf(r.date), sm = +r.run.s.slice(11, 13) * 60 + +r.run.s.slice(14, 16); if (sm > o.sr - 96) add(M, y, addDays(r.date, 1), "Gauna " + nm, "Vaishnava " + nm); }
  });
  v.sankashti.forEach(r => { const am = r.month.adhik ? null : (r.month.i + 11) % 12; add(M, y, r.date, (am === null ? "Vibhuvana" : H.SANKASHTAHARA[am]) + " Sankashta"); if (!r.month.adhik && r.month.i === 5) add(M, y, r.date, "Bol Choth"); });
  v.vinayaka.forEach(r => { if (r.ganesh) return; const n = r.month.adhik ? "Varada" : GUJ_CHAT[r.month.i]; if (n) add(M, y, r.date, n + " Chaturthi"); });
  // Chandra Darshana: first evening after Amavasya when the Moon can be seen (Dwitiya at sunset)
  v.amavasya.forEach(r => { for (let k = 1; k <= 3; k++) { const d = addDays(r.date, k); if (titOn(d, "pr") >= 2 && titOn(d, "pr") <= 4) { add(M, y, d, (r.month.adhik ? "Adhika " : "") + "Chandra Darshana"); break; } } });
  tithiDays(y, 23, ["pr", "md"]).forEach(d => add(M, y, d, (inAdhik(d) ? "Adhika " : "") + "Kalashtami", (inAdhik(d) ? "Adhika " : "") + "Masik Krishna Janmashtami"));
  tithiDays(y, 8, ["sr", "md"]).forEach(d => add(M, y, d, (inAdhik(d) ? "Adhika " : "") + "Masik Durgashtami"));
  const mk = sankOf(v, 9); if (mk) add(M, y, mk.date, "Makara Sankranti", "Uttarayana");
  addIf(M, y, fest(y, "basant"), "Vasant Panchami");
  addIf(M, y, fest(y, "shivratri"), "Maha Shivaratri");
  addIf(M, y, fest(y, "holika"), "Holi", "Holika Dahan"); addIf(M, y, fest(y, "holi"), "Dhuleti");
  addIf(M, y, fest(y, "ugadi"), "Gudi Padwa"); addIf(M, y, fest(y, "ramnavami"), "Rama Navami");
  addIf(M, y, fest(y, "hanuman"), "Hanuman Jayanti", "Hanuman Janmotsava"); addIf(M, y, fest(y, "akshaya"), "Parashurama Jayanti", "Akha Trij");
  addIf(M, y, findDay(y, 7, 1, ["md", "sr"]), "Ganga Saptami"); addIf(M, y, fest(y, "janaki"), "Sita Navami");
  addIf(M, y, findDay(y, 14, 1, ["pr", "sr"]), "Nrisinha Jayanti"); addIf(M, y, findDay(y, 16, 1, ["sr"]), "Narada Jayanti");
  const kp = v.purnima.find(r => !r.month.adhik && r.month.en === "Vaishakha"); if (kp) add(M, y, kp.date, "Kurma Jayanti");
  v.amavasya.forEach(r => { if (!r.month.adhik && r.month.en === "Jyeshtha") add(M, y, r.date, "Shani Jayanti"); });
  addIf(M, y, fest(y, "rath"), "Jagannath Rathyatra");
  const ds = v.ekadashi.find(r => !r.adhik && r.en.startsWith("Devshayani"));
  if (ds) { add(M, y, ds.date, "Gauri Vrat Begins"); }
  addIf(M, y, findDay(y, 13, 3, ["sr", "md"]), "Jayaparvati Vrat Begins");
  const gp = fest(y, "guru"); if (gp) { add(M, y, addDays(gp, -1), "Kokila Vrat"); add(M, y, gp, "Guru Purnima", "Gauri Vrat Ends"); }
  addIf(M, y, findDay(y, 18, 3, ["sr", "md"]), "Jayaparvati Vrat Ends");
  addIf(M, y, findDay(y, 6, 4, ["sr", "md"]), "Kalki Jayanti");
  addIf(M, y, fest(y, "raksha"), "Raksha Bandhan");
  addIf(M, y, findDay(y, 20, 4, ["md", "sr"]), "Nag Pancham"); addIf(M, y, findDay(y, 21, 4, ["sr", "md"]), "Randhan Chhath"); addIf(M, y, findDay(y, 22, 4, ["sr", "md"]), "Shitala Satam");
  addIf(M, y, fest(y, "janmashtami"), "Krishna Janmashtami");
  addIf(M, y, findDay(y, 27, 4, ["pr", "md", "sr"]), "Bachha Baras Dwadashi");
  addIf(M, y, findDay(y, 3, 5, ["md", "sr"]), "Varaha Jayanti"); addIf(M, y, fest(y, "hartalika"), "Kevda Trij");
  addIf(M, y, fest(y, "ganesh"), "Ganesh Chaturthi", "Siddhivinayaka Chaturthi");
  addIf(M, y, findDay(y, 5, 5, ["md", "sr"]), "Rishi Panchami"); addIf(M, y, findDay(y, 8, 5, ["sr", "md"]), "Dharo Atham");
  addIf(M, y, fest(y, "radha"), "Radha Ashtami"); addIf(M, y, findDay(y, 12, 5, ["sr", "md"]), "Vamana Jayanti");
  addIf(M, y, fest(y, "anant"), "Ganesh Visarjan", "Anant Chaturdashi");
  { const ps = fest(y, "pitrustart"); if (ps) add(M, y, addDays(ps, 1), "Pitrupaksha Begins"); } addIf(M, y, fest(y, "sarvapitri"), "Sarva Pitru Amavasya");
  const nv = fest(y, "sharadnav"); if (nv) {
    add(M, y, nv, "Navratri Begins", "Ghatasthapana");
    const ml = nakInRange(nv, addDays(nv, 9), 18, ["sr", "md"]);
    if (ml) { add(M, y, addDays(ml, -1), "Saraswati Avahan"); add(M, y, ml, "Saraswati Puja"); add(M, y, addDays(ml, 1), "Saraswati Balidan"); add(M, y, addDays(ml, 2), "Saraswati Visarjan"); }
  }
  addIf(M, y, fest(y, "durgashtami"), "Durga Ashtami"); addIf(M, y, fest(y, "mahanavami"), "Maha Navami");
  addIf(M, y, fest(y, "dussehra"), "Vijayadashami", "Dussehra");
  { const sp = findDay(y, 15, 6, ["pr", "sr"]) || fest(y, "sharadpurnima"); if (sp) add(M, y, sp, "Kojagari Puja", "Sharad Purnima"); }
  addIf(M, y, fest(y, "karwa"), "Karwa Chauth");
  addIf(M, y, findDay(y, 27, 6, ["pr", "sr"]), "Vagh Baras");
  addIf(M, y, fest(y, "dhanteras"), "Dhanteras");
  const nk = fest(y, "narak"); if (nk) { add(M, y, addDays(nk, -1), "Kali Chaudas", "Hanuman Puja"); add(M, y, nk, "Roop Chaudas"); }
  addIf(M, y, fest(y, "diwali"), "Lakshmi Puja", "Diwali", "Chopda Puja", "Sharda Puja");
  addIf(M, y, fest(y, "govardhan"), "Govardhan Puja", "Annakut", "Bestu Varsh");
  addIf(M, y, fest(y, "bhaidooj"), "Bhai Beej", "Yama Dwitiya");
  addIf(M, y, findDay(y, 5, 7, ["sr", "md"]), "Labh Pancham"); addIf(M, y, findDay(y, 7, 7, ["sr", "md"]), "Jalaram Bapa Jayanti");
  addIf(M, y, findDay(y, 9, 7, ["sr", "md"]), "Akshaya Navami");
  addIf(M, y, fest(y, "tulsi"), "Tulasi Vivah"); addIf(M, y, fest(y, "kartikpurnima"), "Dev Diwali");
  addIf(M, y, findDay(y, 23, 7, ["pr", "sr"]), "Kalabhairav Jayanti");
  const gj = v.ekadashi.find(r => !r.adhik && r.en.startsWith("Mokshada")); if (gj) add(M, y, gj.date, "Gita Jayanti");
  addIf(M, y, fest(y, "datta"), "Dattatreya Jayanti");
  return finish(M);
}

// =====================================================================================================
// BENGALI (Panjika, solar months; Durga Puja season)
// =====================================================================================================
const BEN_SANK = { 9: "Makara", 10: "Kumbha", 11: "Meena", 0: "Mesha", 1: "Vrishabha", 2: "Mithuna", 3: "Karka", 4: "Simha", 5: "Kanya", 6: "Tula", 7: "Vrishchika", 8: "Dhanu" };
function bengali(y) {
  const { v } = base(y), M = blank();
  v.sankranti.forEach(r => add(M, y, r.date, BEN_SANK[r.rashi] + " Sankranti"));
  const mk = sankOf(v, 9); if (mk) addIf(M, y, addDays(mk.date, 1), "Magh Bihu");
  const me = sankOf(v, 0); if (me) { addIf(M, y, me.date, "Solar New Year"); addIf(M, y, addDays(me.date, 1), "Pohela Boishakha"); }
  const ka = sankOf(v, 3); if (ka) addIf(M, y, fest(y, "rath"), "Ratha Jatra");
  addIf(M, y, fest(y, "basant"), "Saraswati Puja");
  addIf(M, y, fest(y, "shivratri"), "Maha Shivaratri");
  addIf(M, y, fest(y, "holika"), "Dol Purnima");
  addIf(M, y, fest(y, "ramnavami"), "Rama Navami");
  addIf(M, y, fest(y, "akshaya"), "Akshaya Tritiya");
  addIf(M, y, fest(y, "buddha"), "Buddha Purnima");
  addIf(M, y, fest(y, "gangadussehra"), "Ganga Puja");
  addIf(M, y, findDay(y, 6, 2, ["sr", "md"]), "Jamai Shashti");
  addIf(M, y, fest(y, "guru"), "Guru Purnima");
  addIf(M, y, fest(y, "raksha"), "Rakhi Bandhan");
  addIf(M, y, findDay(y, 20, 4, ["md", "sr"]), "Nag Panchami");
  addIf(M, y, fest(y, "janmashtami"), "Krishna Janmashtami");
  addIf(M, y, fest(y, "ganesh"), "Ganesh Chaturthi");
  const kn = sankOf(v, 5); if (kn) addIf(M, y, kn.date, "Vishwakarma Puja");
  addIf(M, y, fest(y, "sarvapitri"), "Mahalaya");
  addIf(M, y, findDay(y, 6, 6, ["sr", "md"]), "Kalparambha", "Akal Bodhon");
  addIf(M, y, findDay(y, 7, 6, ["sr", "md"]), "Durga Saptami");
  addIf(M, y, fest(y, "durgashtami"), "Durga Ashtami");
  addIf(M, y, fest(y, "mahanavami"), "Maha Navami");
  addIf(M, y, fest(y, "dussehra"), "Vijayadashami");
  addIf(M, y, findDay(y, 15, 6, ["pr", "sr"]), "Lakshmi Puja");
  addIf(M, y, fest(y, "dhanteras"), "Dhanteras");
  addIf(M, y, fest(y, "diwali"), "Dipabali", "Kali Puja");
  addIf(M, y, fest(y, "bhaidooj"), "Bhai Phonta");
  addIf(M, y, fest(y, "chhath"), "Chhath Puja");
  addIf(M, y, findDay(y, 9, 7, ["sr", "md"]), "Jagaddhatri Puja");
  return finish(M);
}

// Hindu festivals in Hindi (same engine rules as the Hindu Calendar, Hindi names); all years including 2026
function hindiFest(y) {
  const { v } = base(y), M = blank();
  H.festEntries(y).forEach(({ iso, o }) => { if (o.civil) return; add(M, y, iso, o.hi); });
  // Durga Puja / Navratri days, Chandra Darshan and a few more named days (Ashwin = amanta month index 6)
  [["सिन्दूर तृतीया", 3], ["ललिता पंचमी", 5, "उपांग ललिता व्रत"], ["सरस्वती आवाहन", 6, "बिल्वा निमंत्रण", "कल्पारम्भा", "अकाल बोधों", "आमंत्रण और अधिवास"], ["सरस्वती पूजा", 7, "नवपत्रिका पूजा", "कोलाबोऊ पूजा"]]
    .forEach(([n, t, ...more]) => addIf(M, y, findDay(y, t, 6, ["sr", "md"]), n, ...more));
  addIf(M, y, fest(y, "durgashtami"), "संधि पूजा", "अन्नपूर्णा अष्टमी", "कुमारी पूजा");
  addIf(M, y, fest(y, "mahanavami"), "आयुध पूजा", "नवमी होम", "दुर्गा बलिदान");
  addIf(M, y, fest(y, "dussehra"), "दुर्गा विसर्जन", "सरस्वती विसर्जन", "सिन्दूर उत्सव");
  addIf(M, y, fest(y, "sharadpurnima"), "आश्विन पूर्णिमा", "कोजागरा पूजा");
  addIf(M, y, findDay(y, 23, 5, ["pr", "md"]), "महालक्ष्मी व्रत समाप्त");
  v.amavasya.forEach(r => addIf(M, y, addDays(r.date, 1), "चंद्र दर्शन"));
  return finish(M);
}

module.exports = { malayalam, tamil, gujarati, bengali, hindiFest };
