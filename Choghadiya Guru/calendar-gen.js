// Computes the data for /hindu-calendar/, /indian-holidays/ and /telugu-festivals/ for ANY year.
// Nothing here is typed in by hand per year: add a year to YEARS in build.js and the three calendars pick it up.
// (2026 stays as the hand-checked data in calendar-data.js; every other year comes from here.)
//
// Sources of truth (same engine as the Panchang and Vrat pages, so the pages never contradict each other):
//   - vrat-calc.js        -> Purnima, Amavasya, Ekadashi, Pradosh, Sankashti, Vinayaka Chaturthi, Sankranti
//   - panchang-engine.js  -> named festivals (Holi, Diwali, Navratri, Janmashtami ...) via festivals()
//   - Islamic dates       -> tabular Hijri calendar (shown as "expected": real dates depend on moon sighting)
//   - Easter / Good Friday-> standard Gregorian computus
//   - Fixed civil days, Mother's Day etc. -> fixed rules below
// Output shape is identical to calendar-data.js: 12 months, each [[day, [names...]], ...].
const V = require("./vrat-calc.js");
const P = require("./assets/panchang-engine.js");
const E = P._int;
const DEL = V.DEL;

const pad = n => String(n).padStart(2, "0");
const dim = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const addDays = (iso, k) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + k)).toISOString().slice(0, 10); };
const wdOf = iso => new Date(iso + "T00:00:00Z").getUTCDay();
const isoOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const parts = iso => iso.split("-").map(Number);

function blank() { return Array.from({ length: 12 }, () => ({})); }
function add(M, y, iso, ...names) {
  const [yy, m, d] = parts(iso); if (yy !== y) return;
  names.forEach(n => { if (n) (M[m - 1][d] = M[m - 1][d] || []).push(n); });
}
function finish(M) { return M.map(mo => Object.keys(mo).map(Number).sort((a, b) => a - b).map(d => [d, [...new Set(mo[d])]])); }

// ---------- shared computed data (cached per year) ----------
const cache = {};
function base(y) {
  if (cache[y]) return cache[y];
  const v = V.compute(y), fest = P.festivals(y, DEL.lat, DEL.lon), byId = {};
  Object.keys(fest).forEach(k => { const [m, d] = k.split("-").map(Number); fest[k].forEach(o => { if (o.id) byId[o.id] = isoOf(y, m, d); }); });
  return (cache[y] = { v, fest, byId });
}
const festEntries = (y) => { const { fest } = base(y), out = []; Object.keys(fest).forEach(k => { const [m, d] = k.split("-").map(Number); fest[k].forEach(o => out.push({ iso: isoOf(y, m, d), o })); }); return out; };

// ---------- Adhik Maas ----------
const MONTH_EN = V.LM.en, MONTH_HI = V.LM.hi;
function adhikRuns(y) { // Adhik months that overlap year y: [{idx, start, end}] (ISO dates, Delhi sunrise)
  const runs = []; let cur = null;
  for (let i = -40; i < (dim(y, 2) === 29 ? 366 : 365) + 40; i++) {
    const iso = addDays(isoOf(y, 1, 1), i), [yy, m, d] = parts(iso);
    const mi = E.monthInfo(E.jdIST(yy, m, d, 360));
    if (mi.adhik) { if (!cur) cur = { idx: mi.idx, start: iso, end: iso }; else cur.end = iso; }
    else if (cur) { runs.push(cur); cur = null; }
  }
  if (cur) runs.push(cur);
  return runs.filter(r => r.end.slice(0, 4) >= String(y) && r.start.slice(0, 4) <= String(y));
}
function adhik(y) { // first Adhik month that starts inside y, or null
  const r = adhikRuns(y).filter(x => x.start.slice(0, 4) === String(y))[0];
  return r ? Object.assign({ en: MONTH_EN[r.idx], hi: MONTH_HI[r.idx] }, r) : null;
}
function nextAdhikYear(y) { for (let k = 1; k <= 4; k++) { const a = adhik(y + k); if (a) return { year: y + k, en: a.en, hi: a.hi }; } return null; }

// ---------- generic tithi finder (for festivals the engine does not name) ----------
function tithiAt(jd) { return Math.floor(E.elong(jd) / 12) + 1; }
function findDay(y, tithi, amIdx, anchors) { // amIdx = amanta month index (0 = Chaitra); anchors tried in order
  for (const at of anchors) {
    for (let i = 0; i < 366; i++) {
      const iso = addDays(isoOf(y, 1, 1), i), [yy, m, d] = parts(iso); if (yy !== y) break;
      const s = P.sun(yy, m, d, DEL.lat, DEL.lon);
      let min;
      if (at === "sr") min = s.r + 1; else if (at === "md") min = (s.r + s.s) / 2; else if (at === "pr") min = s.s + 30;
      else if (at === "mr") { const mr = P.moonRiseSet(yy, m, d, DEL.lat, DEL.lon).rise; if (mr === null || mr >= 1440) continue; min = mr; }
      const jd = E.jdIST(yy, m, d, min), mi = E.monthInfo(jd);
      if (tithiAt(jd) === tithi && mi.idx === amIdx && !mi.adhik) return iso;
    }
  }
  return null;
}

// ---------- Islamic (tabular Hijri) ----------
const islToJDN = (y, m, d) => d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + 1948439.5 - 1;
function jdnToIso(jd) {
  const z = Math.floor(jd + 0.5), a = Math.floor((z - 1867216.25) / 36524.25), aa = z + 1 + a - Math.floor(a / 4), b = aa + 1524,
    c = Math.floor((b - 122.1) / 365.25), dd = Math.floor(365.25 * c), e = Math.floor((b - dd) / 30.6001),
    day = b - dd - Math.floor(30.6001 * e), mon = e < 14 ? e - 1 : e - 13, yr = mon > 2 ? c - 4716 : c - 4715;
  return isoOf(yr, mon, day);
}
const EXP = " (expected, depends on moon sighting)";
function islamic(y) { // [{iso, name}]
  const out = [], h0 = Math.floor((y - 622) * 33 / 32);
  for (let h = h0 - 1; h <= h0 + 2; h++) {
    [[10, 1, "Eid ul-Fitr" + EXP], [12, 10, "Eid al-Adha, Bakrid" + EXP], [1, 1, "Islamic New Year" + EXP], [1, 10, "Muharram / Ashura" + EXP],
      [3, 12, "Eid-e-Milad / Milad-un-Nabi" + EXP], [7, 13, "Hazarat Ali's Birthday" + EXP]].forEach(([m, d, name]) => {
      const iso = jdnToIso(islToJDN(h, m, d)); if (iso.slice(0, 4) === String(y)) out.push({ iso, name });
    });
  }
  return out;
}

// ---------- Easter ----------
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
  return isoOf(y, mo, da);
}

// ---------- equinox / solstice (Meeus ch. 27) ----------
function season(y, k) { // k: 0 Mar equinox, 1 Jun solstice, 2 Sep equinox, 3 Dec solstice -> IST ISO date
  const Y = (y - 2000) / 1000, C = [
    [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057], [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030],
    [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078], [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032]][k];
  const j0 = C[0] + C[1] * Y + C[2] * Y * Y + C[3] * Y ** 3 + C[4] * Y ** 4, T = (j0 - 2451545) / 36525, W = 35999.373 * T - 2.47, rad = x => x * Math.PI / 180;
  const dl = 1 + 0.0334 * Math.cos(rad(W)) + 0.0007 * Math.cos(rad(2 * W));
  const A = [485, 203, 199, 182, 156, 136, 77, 74, 70, 58, 52, 50, 45, 44, 29, 18, 17, 16, 14, 12, 12, 12, 9, 8];
  const B = [324.96, 337.23, 342.08, 27.85, 73.14, 171.52, 222.54, 296.72, 243.58, 119.81, 297.17, 21.02, 247.54, 325.15, 60.93, 155.12, 288.79, 198.04, 199.76, 95.39, 287.11, 320.81, 227.73, 15.45];
  const Cc = [1934.136, 32964.467, 20.186, 445267.112, 45036.886, 22518.443, 65928.934, 3034.906, 9037.513, 33718.147, 150.678, 2281.226, 29929.562, 31555.956, 4443.417, 67555.328, 4562.452, 62894.029, 31436.921, 14577.848, 31931.756, 34777.259, 1222.114, 16859.074];
  let S = 0; for (let i = 0; i < 24; i++) S += A[i] * Math.cos(rad(B[i] + Cc[i] * T));
  const jde = j0 + 0.00001 * S / dl, ms = (jde - 2440587.5) * 864e5 + 330 * 60e3; // ignoring dT (~1 min)
  return new Date(ms).toISOString().slice(0, 10);
}
const nthWeekday = (y, m, wd, n) => { const first = wdOf(isoOf(y, m, 1)); return isoOf(y, m, 1 + ((wd - first + 7) % 7) + 7 * (n - 1)); };

// ---------- name helpers ----------
const PRADOSH_DAY = { 1: "Som ", 2: "Bhauma ", 6: "Shani " };
const PRADOSH_TE = ["Ravi ", "Soma ", "Bhauma ", "Budha ", "Guru ", "Shukra ", "Shani "];
const splitNames = s => s.split(" / ").map(x => x.trim()).filter(Boolean);
const SKIP_GENERIC = new Set(["lohri"]); // handled with the Sankranti entries below

// =====================================================================================================
// HINDU CALENDAR
// =====================================================================================================
// [name, amanta month idx (0 = Chaitra), tithi (1-30), anchors tried in order]
const HINDU_EXTRA = [
  ["Bhishma Ashtami", 10, 8, ["md", "sr"]], ["Ranga Panchami", 11, 20, ["sr", "md"]], ["Sheetala Saptami", 11, 22, ["sr"]], ["Basoda, Sheetala Ashtami", 11, 23, ["sr"]],
  ["Gangaur", 0, 3, ["sr", "pr"]], ["Skanda Sashti", 0, 6, ["sr", "md"]], ["Ganga Saptami", 1, 7, ["md", "sr"]], ["Baglamukhi Jayanti", 1, 8, ["sr", "md"]],
  ["Narasimha Jayanti", 1, 14, ["pr", "sr"]], ["Kajari Teej", 4, 18, ["sr", "md"]], ["Rishi Panchami", 5, 5, ["md", "sr"]], ["Vamana Jayanti", 5, 12, ["sr", "md"]],
  ["Jivitputrika Vrat", 5, 23, ["sr"]], ["Govatsa Dwadashi, Vasu Baras", 6, 27, ["pr", "sr"]], ["Labh Panchami", 7, 5, ["sr"]], ["Gopashtami", 7, 8, ["sr", "md"]],
  ["Akshaya Navami", 7, 9, ["sr", "md"]], ["Kansa Vadh", 7, 10, ["sr"]], ["Champa Shashthi", 8, 6, ["sr", "md"]], ["Kalabhairav Jayanti", 7, 23, ["pr", "sr"]],
  ["Surdas Jayanti, Shankaracharya Jayanti", 1, 5, ["sr", "md"]], ["Ramakrishna Jayanti", 11, 2, ["sr"]]
];
function hindu(y) {
  const { v } = base(y), M = blank();
  v.purnima.forEach(r => add(M, y, r.date, r.month.en + " Purnima"));
  v.amavasya.forEach(r => add(M, y, r.date, r.month.en + " Amavasya"));
  v.ekadashi.forEach(r => add(M, y, r.date, r.en));
  v.pradosh.forEach(r => add(M, y, r.date, (PRADOSH_DAY[r.wd] || "") + "Pradosh Vrat"));
  v.sankashti.forEach(r => add(M, y, r.date, r.en));
  v.vinayaka.forEach(r => add(M, y, r.date, r.en));
  v.sankranti.forEach(r => add(M, y, r.date, r.en));
  festEntries(y).forEach(({ iso, o }) => {
    if (o.civil || o.sank) return;
    if (o.id) { splitNames(o.en).forEach(n => add(M, y, iso, n)); return; }
    if (o.g === "navratri" || o.en === "Masik Shivratri") add(M, y, iso, o.en);
  });
  // Chandra Darshan (day after every Amavasya) and Gupta Navratri (Magha / Ashadha Shukla Pratipada)
  v.amavasya.forEach(r => { const nd = addDays(r.date, 1); add(M, y, nd, "Chandra Darshan"); if (!r.month.adhik && (r.month.en === "Magha" || r.month.en === "Ashadha")) add(M, y, nd, "Gupta Navratri Begins"); });
  v.amavasya.forEach(r => { if (!r.month.adhik && r.month.en === "Jyeshtha") add(M, y, r.date, "Shani Jayanti"); });
  HINDU_EXTRA.forEach(([name, am, t, anchors]) => { const d = findDay(y, t, am, anchors); if (d) add(M, y, d, ...name.split(", ")); });
  if (base(y).byId.akshaya) add(M, y, base(y).byId.akshaya, "Parashurama Jayanti");
  const a = adhik(y); // Adhik Maas start / end markers (only the one that starts in y)
  if (a) { add(M, y, a.start, "Adhik " + a.en + " Maas Begins"); add(M, y, a.end, "Adhik " + a.en + " Maas Ends"); }
  return finish(M);
}

// =====================================================================================================
// INDIAN HOLIDAYS
// =====================================================================================================
const FIXED = [
  [1, 1, "English New Year"], [1, 12, "Swami Vivekananda Jayanti, National Youth Day"], [1, 23, "Subhas Chandra Bose Jayanti"], [1, 26, "Republic Day"],
  [1, 30, "Martyrs' Day"], [2, 4, "World Cancer Day"], [2, 14, "Valentine's Day"], [3, 8, "International Women's Day"], [3, 23, "Shaheed Diwas"],
  [4, 1, "Bank's Holiday"], [4, 14, "Ambedkar Jayanti"], [4, 22, "Earth Day"], [5, 1, "Labour Day"], [5, 7, "Rabindranath Tagore Jayanti"],
  [6, 5, "World Environment Day"], [6, 21, "International Yoga Day"], [8, 15, "Independence Day"], [9, 5, "Teachers' Day"], [9, 14, "Hindi Diwas"],
  [9, 15, "Engineers' Day"], [10, 2, "Gandhi Jayanti"], [11, 14, "Children's Day"], [12, 1, "World AIDS Day"], [12, 25, "Christmas"]
];
const HOL_NAMES = { // engine festival id -> names shown in the Indian Holidays list
  shivratri: ["Maha Shivaratri"], holika: ["Holika Dahan"], holi: ["Holi"], ugadi: ["Ugadi", "Gudi Padwa"], mahavir: ["Mahavir Jayanti"],
  ramnavami: ["Rama Navami"], hanuman: ["Hanuman Jayanti"], akshaya: ["Akshaya Tritiya"], buddha: ["Buddha Purnima"], rath: ["Jagannath Rathyatra"],
  guru: ["Guru Purnima"], raksha: ["Raksha Bandhan", "Rakhi"], janmashtami: ["Krishna Janmashtami"], ganesh: ["Ganesh Chaturthi"],
  sharadnav: ["Navratri Begins"], durgashtami: ["Durga Ashtami"], mahanavami: ["Maha Navami"], dussehra: ["Dussehra"], karwa: ["Karwa Chauth"],
  dhanteras: ["Dhanteras"], narak: ["Narak Chaturdashi"], diwali: ["Lakshmi Puja", "Diwali"], govardhan: ["Govardhan Puja"], bhaidooj: ["Bhaiya Dooj"],
  chhath: ["Chhath Puja"], kartikpurnima: ["Guru Nanak Jayanti"], basant: ["Vasant Panchami"]
};
function holidays(y) {
  const { v } = base(y), M = blank();
  FIXED.forEach(([m, d, n]) => add(M, y, isoOf(y, m, d), n));
  add(M, y, nthWeekday(y, 5, 0, 1), "World Laughter Day"); add(M, y, nthWeekday(y, 5, 0, 2), "Mother's Day"); add(M, y, nthWeekday(y, 8, 0, 1), "Friendship Day");
  add(M, y, season(y, 2), "Autumnal Equinox"); add(M, y, season(y, 3), "Shortest Day of Year");
  const e = easter(y); add(M, y, addDays(e, -2), "Good Friday"); add(M, y, e, "Easter");
  islamic(y).forEach(x => add(M, y, x.iso, x.name));
  add(M, y, isoOf(y, 2, 19), "Chhatrapati Shivaji Maharaj Jayanti"); add(M, y, isoOf(y, 5, 31), "World No Tobacco Day");
  festEntries(y).forEach(({ iso, o }) => { if (o.id && HOL_NAMES[o.id]) add(M, y, iso, ...HOL_NAMES[o.id]); });
  v.purnima.forEach(r => { if (r.month.adhik) return; if (r.month.en === "Magha") add(M, y, r.date, "Guru Ravidas Jayanti"); if (r.month.en === "Ashwin") add(M, y, r.date, "Valmiki Jayanti", "Meerabai Jayanti"); if (r.month.en === "Jyeshtha") add(M, y, r.date, "Kabirdas Jayanti"); });
  v.ekadashi.forEach(r => { if (!r.adhik && r.en === "Varuthini Ekadashi") add(M, y, r.date, "Vallabhacharya Jayanti"); });
  [["Maharishi Dayanand Saraswati Jayanti", 10, 25, ["sr"]], ["Ramakrishna Jayanti", 11, 2, ["sr"]], ["Tulsidas Jayanti", 4, 7, ["sr", "md"]], ["Surdas Jayanti, Shankaracharya Jayanti", 1, 5, ["sr", "md"]], ["Maharaja Agrasen Jayanti", 6, 1, ["sr"]]]
    .forEach(([n, am, t, an]) => { const d = findDay(y, t, am, an); if (d) add(M, y, d, ...n.split(", ")); });
  v.sankranti.forEach(r => {
    if (r.rashi === 9) { add(M, y, r.date, "Makara Sankranti", "Pongal"); add(M, y, addDays(r.date, -1), "Lohri"); }
    if (r.rashi === 0) add(M, y, r.date, "Solar New Year", "Baisakhi");
  });
  return finish(M);
}

// =====================================================================================================
// TELUGU FESTIVALS (Amanta panchangam)
// =====================================================================================================
const SANKASHTAHARA = ["Vikata", "Ekadanta", "Krishnapingala", "Gajanana", "Heramba", "Vighnaraja", "Vakratunda", "Ganadhipa", "Akhuratha", "Lambodara", "Dwijapriya", "Bhalachandra"]; // by amanta month, Chaitra first
const TE_EKA = s => s.replace("Papmochani", "Papamochani").replace("Devutthani", "Devutthana").replace("Parivartini", "Parivartani").replace("Mokshada Ekadashi (Gita Jayanti)", "Mokshada Ekadashi")
  .replace("Pausha Putrada Ekadashi", "Pausha Putrada Ekadashi (Mukkoti / Vaikuntha Ekadashi)");
function telugu(y) {
  const { v, byId } = base(y), M = blank();
  v.ekadashi.forEach(r => add(M, y, r.date, TE_EKA(r.en)));
  v.pradosh.forEach(r => { add(M, y, r.date, PRADOSH_TE[r.wd] + "Pradosh Vrat"); if (r.wd === 6) add(M, y, r.date, "Shani Trayodashi"); });
  v.sankashti.forEach(r => {
    const am = r.month.adhik ? null : (r.month.i + 11) % 12;
    add(M, y, r.date, (am === null ? "Vibhuvana" : SANKASHTAHARA[am]) + " Sankashtahara");
  });
  const one = (id, ...names) => { if (byId[id]) add(M, y, byId[id], ...names); };
  one("shivratri", "Maha Shivaratri"); one("holika", "Chhoti Holi, Holika Dahan".split(", ")[1]); one("holi", "Holi");
  one("ugadi", "Ugadi"); one("ramnavami", "Shree Ramanavami"); one("akshaya", "Akshaya Trutiya"); one("janmashtami", "Krishna Janmashtami");
  one("ganesh", "Ganesh Chaturthi"); one("anant", "Ganesh Visarjan"); one("sharadnav", "Navratri Begins"); one("mahanavami", "Maha Navami"); one("durgashtami", "Durga Ashtami");
  one("dussehra", "Dussehra"); one("diwali", "Lakshmi Puja", "Diwali"); one("kartikpurnima", "Karthika Pournami"); one("raksha", "Raksha Bandhan");
  // Varalakshmi Vratam: the Friday on or before Shravana Purnima
  if (byId.raksha) { let d = byId.raksha; while (wdOf(d) !== 5) d = addDays(d, -1); add(M, y, d, "Varalakshmi Vratam"); }
  // Hanuman Jayanthi (Telugu): Vaishakha Krishna Dashami; Nagula Chavithi: Karthika Shukla Chaturthi; Atla Tadde: Ashwayuja Krishna Tadiya
  const hj = findDay(y, 25, 1, ["sr", "md"]); if (hj) add(M, y, hj, "Hanuman Jayanthi");
  const nc = findDay(y, 4, 7, ["md", "sr"]); if (nc) add(M, y, nc, "Nagula Chavithi");
  const at = findDay(y, 18, 6, ["mr", "sr"]); if (at) add(M, y, at, "Atla Tadde");
  // Dwadashi names (same day as the Shukla Ekadashi), Telugu-only vratams
  const DW = ["Vamana", "Parashurama", "Ramalakshmana", "Vasudeva", "Damodara", "Kalki", "Padmanabha", "Yogeshwara", "", "", "Bhishma", "Narasimha"]; // by Shukla Ekadashi's month
  v.ekadashi.forEach(r => { if (r.paksha !== "S") return; const n = r.month.adhik ? "Adhika Ramalakshmana" : DW[r.month.i]; if (n) add(M, y, r.parana ? r.parana.date : addDays(r.date, 1), n + " Dwadashi"); });
  v.purnima.forEach(r => { if (!r.month.adhik && r.month.en === "Chaitra") add(M, y, r.date, "Madana Pournami"); });
  [["Dola Gowri Vratam, Andolana Trutiya", 0, 3, ["sr", "pr"]], ["Naga Panchami", 8, 5, ["sr", "md"]]].forEach(([n, am, t, an]) => { const d = findDay(y, t, am, an); if (d) add(M, y, d, ...n.split(", ")); });
  // Sankranti trio (Makara Sankranti falls on the day its moment is reached; after sunset -> next day)
  v.sankranti.forEach(r => { if (r.rashi === 9) { const d = r.afterSunset ? addDays(r.date, 1) : r.date; add(M, y, addDays(d, -1), "Bhogi"); add(M, y, d, "Makara Sankranti"); add(M, y, addDays(d, 1), "Kanuma"); } });
  return finish(M);
}

module.exports = { hindu, holidays, telugu, adhik, adhikRuns, nextAdhikYear, easter, islamic, season };
