// Computes Purnima, Amavasya, Ekadashi, Pradosh, Sankashti Chaturthi, Vinayaka Chaturthi, Sankranti and Satyanarayan Puja dates + tithi timings for ANY year,
// directly from assets/panchang-engine.js (same astronomy as the panchang calendar).
// Nothing here is typed in by hand: add a year to YEARS in build.js and it just works.
// Location: New Delhi (28.6139 N, 77.2090 E), times in IST.
const P = require("./assets/panchang-engine.js");
const E = P._int;
const DEL = { lat: 28.6139, lon: 77.2090 };
const PRADOSH_MIN = 144; // pradosh kaal = sunset to sunset + 2h 24m (3 muhurtas)
// "pradoshkaal": vrat day = day on which Trayodashi is running in the evening Pradosh Kaal (Drik Panchang / shastra rule).
// "sunrise"   : vrat day = day on which Trayodashi is running at sunrise (what mPanchang's list follows; differs by one day on ~half the dates).
const PRADOSH_RULE = process.env.PRADOSH_RULE || "pradoshkaal";

const LM = { // Hindu months, index 0 = Chaitra
  hi: ["चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ़", "श्रावण", "भाद्रपद", "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"],
  en: ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashwin", "Kartik", "Margashirsha", "Pausha", "Magha", "Phalguna"]
};
// Ekadashi names by purnimanta month + paksha (S = shukla, K = krishna)
const EKA = {
  "0K": ["पापमोचनी एकादशी", "Papmochani Ekadashi"], "0S": ["कामदा एकादशी", "Kamada Ekadashi"],
  "1K": ["वरुथिनी एकादशी", "Varuthini Ekadashi"], "1S": ["मोहिनी एकादशी", "Mohini Ekadashi"],
  "2K": ["अपरा एकादशी", "Apara Ekadashi"], "2S": ["निर्जला एकादशी", "Nirjala Ekadashi"],
  "3K": ["योगिनी एकादशी", "Yogini Ekadashi"], "3S": ["देवशयनी एकादशी", "Devshayani Ekadashi"],
  "4K": ["कामिका एकादशी", "Kamika Ekadashi"], "4S": ["श्रावण पुत्रदा एकादशी", "Shravana Putrada Ekadashi"],
  "5K": ["अजा एकादशी", "Aja Ekadashi"], "5S": ["परिवर्तिनी एकादशी", "Parivartini Ekadashi"],
  "6K": ["इंदिरा एकादशी", "Indira Ekadashi"], "6S": ["पापांकुशा एकादशी", "Papankusha Ekadashi"],
  "7K": ["रमा एकादशी", "Rama Ekadashi"], "7S": ["देवउठनी एकादशी", "Devutthani Ekadashi"],
  "8K": ["उत्पन्ना एकादशी", "Utpanna Ekadashi"], "8S": ["मोक्षदा एकादशी (गीता जयंती)", "Mokshada Ekadashi (Gita Jayanti)"],
  "9K": ["सफला एकादशी", "Saphala Ekadashi"], "9S": ["पौष पुत्रदा एकादशी", "Pausha Putrada Ekadashi"],
  "10K": ["षटतिला एकादशी", "Shattila Ekadashi"], "10S": ["जया एकादशी", "Jaya Ekadashi"],
  "11K": ["विजया एकादशी", "Vijaya Ekadashi"], "11S": ["आमलकी एकादशी", "Amalaki Ekadashi"]
};
const RASHI = [ // index = rashi the Sun ENTERS (0 = Mesha)
  ["मेष", "Mesha", "Aries", "Vishu", "Mesha Sankranti (Baisakhi, Vishu, Puthandu)", "मेष संक्रांति (बैसाखी, विशु)"],
  ["वृषभ", "Vrishabha", "Taurus", "Vishnupadi", "Vrishabha Sankranti", "वृषभ संक्रांति"],
  ["मिथुन", "Mithuna", "Gemini", "Shadashitimukhi", "Mithuna Sankranti (Raja Parba in Odisha)", "मिथुन संक्रांति"],
  ["कर्क", "Karka", "Cancer", "Ayana", "Karka Sankranti (Dakshinayana begins)", "कर्क संक्रांति (दक्षिणायन आरंभ)"],
  ["सिंह", "Simha", "Leo", "Vishnupadi", "Simha Sankranti", "सिंह संक्रांति"],
  ["कन्या", "Kanya", "Virgo", "Shadashitimukhi", "Kanya Sankranti (Vishwakarma Puja)", "कन्या संक्रांति (विश्वकर्मा पूजा)"],
  ["तुला", "Tula", "Libra", "Vishu", "Tula Sankranti", "तुला संक्रांति"],
  ["वृश्चिक", "Vrishchika", "Scorpio", "Vishnupadi", "Vrishchika Sankranti", "वृश्चिक संक्रांति"],
  ["धनु", "Dhanu", "Sagittarius", "Shadashitimukhi", "Dhanu Sankranti (Kharmas begins)", "धनु संक्रांति (खरमास आरंभ)"],
  ["मकर", "Makar", "Capricorn", "Ayana", "Makar Sankranti (Pongal, Uttarayan, Magh Bihu)", "मकर संक्रांति (पोंगल, उत्तरायण)"],
  ["कुंभ", "Kumbha", "Aquarius", "Vishnupadi", "Kumbha Sankranti", "कुंभ संक्रांति"],
  ["मीन", "Meena", "Pisces", "Shadashitimukhi", "Meena Sankranti (Kharmas)", "मीन संक्रांति (खरमास)"]
];
const WD_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
const WD_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const pad = n => (n < 10 ? "0" : "") + n;
// JD (UT) -> IST wall clock fields
function ist(jd) {
  const d = new Date((jd - 2440587.5) * 864e5 + 330 * 60e3);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), n: d.getUTCMinutes(), iso: d.toISOString().slice(0, 16) };
}
const dateKey = (y, m, d) => y + "-" + pad(m) + "-" + pad(d);
const nextDay = (y, m, d, k) => { const t = new Date(Date.UTC(y, m - 1, d + (k || 1))); return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()]; };

const sunCache = {};
function sunJD(y, m, d) { // {rise, set} as JD(UT)
  const k = dateKey(y, m, d);
  if (!sunCache[k]) { const s = P.sun(y, m, d, DEL.lat, DEL.lon); sunCache[k] = { rise: E.jdIST(y, m, d, s.r), set: E.jdIST(y, m, d, s.s) }; }
  return sunCache[k];
}

// all occurrences of tithi n (1..30) that overlap [from - 2d, to + 2d]  -> [{s, e}] JD
function tithiRuns(n, jdFrom, jdTo) {
  const a = ((n - 1) * 12) % 360, b = (n * 12) % 360, out = [];
  let g = jdFrom - 3 + (((a - E.elong(jdFrom - 3)) % 360 + 360) % 360) / 12.19;
  while (g < jdTo + 3) {
    const s = E.cross(E.elong, a, g), e = E.cross(E.elong, b, s + 0.9);
    out.push({ s, e });
    g = s + 29.53;
  }
  return out;
}

function monthName(mi, krishnaEnd) { // returns {hi,en,adhik}
  // Shukla-paksha tithis (Purnima, Shukla Ekadashi): the amanta month idx is the name.
  // Krishna-paksha tithis: purnimanta name is the NEXT month (unless the month itself is adhik).
  if (mi.adhik) return { hi: "अधिक " + LM.hi[mi.idx], en: "Adhik " + LM.en[mi.idx], adhik: true };
  const i = krishnaEnd ? (mi.idx + 1) % 12 : mi.idx;
  return { hi: LM.hi[i], en: LM.en[i], adhik: false, i };
}

function fmtRun(run) { return { s: ist(run.s).iso, e: ist(run.e).iso }; }

function compute(year) {
  const jdFrom = E.jd0(year, 1, 1), jdTo = E.jd0(year, 12, 31);
  const res = { purnima: [], amavasya: [], ekadashi: [], pradosh: [], sankashti: [], vinayaka: [], sankranti: [], satyanarayan: [] };

  // ---- sunrise-based vrats: day on which the tithi is running at sunrise (first such day; kshaya -> day before) ----
  function sunriseDay(run) {
    const t0 = ist(run.s); let [y, m, d] = [t0.y, t0.m, t0.d];
    [y, m, d] = nextDay(y, m, d, -1);
    for (let k = 0; k < 4; k++) {
      const sr = sunJD(y, m, d).rise;
      if (sr >= run.s && sr < run.e) return { y, m, d, kshaya: false };
      const [ny, nm, nd] = nextDay(y, m, d, 1);
      if (sr < run.s && sunJD(ny, nm, nd).rise >= run.e) return { y, m, d, kshaya: true };
      [y, m, d] = [ny, nm, nd];
    }
    return null;
  }
  const inYear = x => x && x.y === year;

  [[15, "purnima"], [30, "amavasya"]].forEach(([n, key]) => {
    tithiRuns(n, jdFrom, jdTo).forEach(run => {
      const x = sunriseDay(run); if (!inYear(x)) return;
      const mi = E.monthInfo(sunJD(x.y, x.m, x.d).rise);
      const nm = monthName(mi, key === "amavasya");
      const wd = new Date(Date.UTC(x.y, x.m - 1, x.d)).getUTCDay();
      res[key].push({ date: dateKey(x.y, x.m, x.d), wd, month: nm, paksha: key === "purnima" ? "S" : "K", run: fmtRun(run), kshaya: x.kshaya });
    });
  });

  [[11, "S"], [26, "K"]].forEach(([n, pk]) => {
    tithiRuns(n, jdFrom - 1, jdTo + 1).forEach(run => {
      const x = sunriseDay(run); if (!inYear(x)) return;
      const sr = sunJD(x.y, x.m, x.d).rise, mi = E.monthInfo(sr);
      const wd = new Date(Date.UTC(x.y, x.m - 1, x.d)).getUTCDay();
      let name;
      if (mi.adhik) name = pk === "S" ? ["पद्मिनी एकादशी", "Padmini Ekadashi"] : ["परमा एकादशी", "Parama Ekadashi"];
      else name = EKA[(pk === "S" ? mi.idx : (mi.idx + 1) % 12) + pk];
      const nm = monthName(mi, pk === "K");
      // Dwadashi (next tithi): parana timing
      const dw = tithiRuns(n === 11 ? 12 : 27, run.e - 2, run.e + 2).filter(r => Math.abs(r.s - run.e) < 0.05)[0] || { s: run.e, e: run.e + 1 };
      const [py, pm, pd] = nextDay(x.y, x.m, x.d, 1), ps = sunJD(py, pm, pd), pss = sunJD(x.y, x.m, x.d);
      const hari = dw.s + (dw.e - dw.s) / 4;                       // Hari Vasara = first quarter of Dwadashi
      let pStart = Math.max(ps.rise, hari), pEnd = Math.min(dw.e, ps.rise + (ps.set - ps.rise) / 5); // within Pratahkal (first fifth of day)
      let parana = null;
      if (dw.e > ps.rise && pStart < pEnd) parana = { date: dateKey(py, pm, pd), s: ist(pStart).iso, e: ist(pEnd).iso, dwEnd: ist(dw.e).iso };
      else if (dw.e > ps.rise) parana = { date: dateKey(py, pm, pd), s: ist(pStart).iso, e: ist(Math.min(dw.e, ps.set)).iso, dwEnd: ist(dw.e).iso };
      res.ekadashi.push({ date: dateKey(x.y, x.m, x.d), wd, hi: name[0], en: name[1], adhik: mi.adhik, month: nm, paksha: pk, run: fmtRun(run), kshaya: x.kshaya, parana });
    });
  });

  // ---- Pradosh: the day on which Trayodashi is running during Pradosh Kaal (sunset .. sunset+144 min) ----
  [[13, "S"], [28, "K"]].forEach(([n, pk]) => {
    tithiRuns(n, jdFrom - 1, jdTo + 1).forEach(run => {
      const t0 = ist(run.s); let [y, m, d] = nextDay(t0.y, t0.m, t0.d, -1), best = null;
      for (let k = 0; k < 4; k++) {
        const ss = sunJD(y, m, d).set, ov = Math.min(run.e, ss + PRADOSH_MIN / 1440) - Math.max(run.s, ss);
        if (ov > 0 && (!best || ov > best.ov + 1e-9)) best = { y, m, d, ov, ss };
        [y, m, d] = nextDay(y, m, d, 1);
      }
      if (!best) { // Trayodashi does not touch pradosh kaal: use the day it is running at sunset
        [y, m, d] = nextDay(t0.y, t0.m, t0.d, -1);
        for (let k = 0; k < 4 && !best; k++) { const ss = sunJD(y, m, d).set; if (ss >= run.s && ss < run.e) best = { y, m, d, ov: 0, ss }; [y, m, d] = nextDay(y, m, d, 1); }
      }
      if (PRADOSH_RULE === "sunrise") { const x = sunriseDay(run); if (x) best = { y: x.y, m: x.m, d: x.d, ov: 0, ss: sunJD(x.y, x.m, x.d).set }; }
      if (!best || best.y !== year) return;
      const wd = new Date(Date.UTC(best.y, best.m - 1, best.d)).getUTCDay();
      const mi = E.monthInfo(best.ss - 0.3);
      res.pradosh.push({ date: dateKey(best.y, best.m, best.d), wd, paksha: pk, month: monthName(mi, pk === "K"), run: fmtRun(run), pradosh: { s: ist(best.ss).iso, e: ist(best.ss + PRADOSH_MIN / 1440).iso } });
    });
  });


  // ---- Sankashti Chaturthi (Krishna Chaturthi, tithi 19): the day on which Chaturthi is running at MOONRISE (Delhi).
  //      If it runs at moonrise on two days, the first day is taken. If it never touches a moonrise, the day it is running at sunrise.
  const hhmm = (y, m, d, min) => dateKey(y, m, d) + "T" + pad(Math.floor(min / 60)) + ":" + pad(Math.floor(min % 60));
  tithiRuns(19, jdFrom - 1, jdTo + 1).forEach(run => {
    const t0 = ist(run.s); let [y, m, d] = nextDay(t0.y, t0.m, t0.d, -1), best = null;
    for (let k = 0; k < 4 && !best; k++) {
      const mr = P.moonRiseSet(y, m, d, DEL.lat, DEL.lon).rise;
      if (mr !== null && mr < 1440) { const jd = E.jdIST(y, m, d, mr); if (jd >= run.s && jd < run.e) best = { y, m, d, mr }; }
      [y, m, d] = nextDay(y, m, d, 1);
    }
    if (!best) { const x = sunriseDay(run); if (x) best = { y: x.y, m: x.m, d: x.d, mr: null }; }
    if (!best || best.y !== year) return;
    if (best.mr === null) { const q = P.moonRiseSet(best.y, best.m, best.d, DEL.lat, DEL.lon).rise; if (q !== null && q < 1440) best.mr = q; }
    const mi = E.monthInfo(sunJD(best.y, best.m, best.d).rise), nm = monthName(mi, true);
    const wd = new Date(Date.UTC(best.y, best.m - 1, best.d)).getUTCDay();
    const ang = wd === 2, extra = [];
    if (!mi.adhik && nm.i === 10) extra.push(["सकट चौथ", "Sakat Chauth"]);   // Magha Krishna Chaturthi
    if (!mi.adhik && nm.i === 7) extra.push(["करवा चौथ", "Karwa Chauth"]);   // Kartik (Purnimanta) Krishna Chaturthi
    const en = (ang ? "Angarki " : nm.en + " ") + "Sankashti Chaturthi" + (extra.length ? " (" + extra.map(x => x[1]).join(", ") + ")" : "");
    const hi = (ang ? "अंगारकी " : nm.hi + " ") + "संकष्टी चतुर्थी" + (extra.length ? " (" + extra.map(x => x[0]).join(", ") + ")" : "");
    res.sankashti.push({ date: dateKey(best.y, best.m, best.d), wd, en, hi, month: nm, paksha: "K", angarki: ang, run: fmtRun(run), moonrise: best.mr === null ? null : hhmm(best.y, best.m, best.d, best.mr) });
  });

  // ---- Vinayaka Chaturthi (Shukla Chaturthi, tithi 4): the day on which Chaturthi covers the most of MADHYAHNA
  //      (the middle fifth of the daytime, the Ganesh puja time). If it misses madhyahna on both days, the day it is running at sunrise.
  tithiRuns(4, jdFrom - 1, jdTo + 1).forEach(run => {
    const t0 = ist(run.s); let [y, m, d] = nextDay(t0.y, t0.m, t0.d, -1), best = null;
    for (let k = 0; k < 4; k++) {
      const sj = sunJD(y, m, d), len = sj.set - sj.rise, ms = sj.rise + 2 * len / 5, me = sj.rise + 3 * len / 5;
      const ov = Math.min(run.e, me) - Math.max(run.s, ms);
      if (ov > 1e-6 && (!best || ov > best.ov + 1e-9)) best = { y, m, d, ov, ms, me };
      [y, m, d] = nextDay(y, m, d, 1);
    }
    if (!best) { const x = sunriseDay(run); if (x) { const sj = sunJD(x.y, x.m, x.d), len = sj.set - sj.rise; best = { y: x.y, m: x.m, d: x.d, ov: 0, ms: sj.rise + 2 * len / 5, me: sj.rise + 3 * len / 5 }; } }
    if (!best || best.y !== year) return;
    const mi = E.monthInfo(sunJD(best.y, best.m, best.d).rise), nm = monthName(mi, false);
    const wd = new Date(Date.UTC(best.y, best.m - 1, best.d)).getUTCDay();
    const ganesh = !mi.adhik && nm.i === 5;                                    // Bhadrapada Shukla Chaturthi
    const en = ganesh ? "Ganesh Chaturthi (Bhadrapada Vinayaka Chaturthi)" : nm.en + " Vinayaka Chaturthi";
    const hi = ganesh ? "गणेश चतुर्थी (भाद्रपद विनायक चतुर्थी)" : nm.hi + " विनायक चतुर्थी";
    // puja muhurat = madhyahna clipped to the tithi
    const ps = Math.max(best.ms, run.s), pe = Math.min(best.me, run.e);
    res.vinayaka.push({ date: dateKey(best.y, best.m, best.d), wd, en, hi, month: nm, paksha: "S", ganesh, run: fmtRun(run), puja: pe > ps ? { s: ist(ps).iso, e: ist(pe).iso } : null });
  });


  // ---- Sankranti: the moment the Sun (sidereal / Nirayana) enters a new rashi. Date = IST date of that moment.
  for (let r = 0; r < 12; r++) {
    let g = null; const yd = E.jd0(year, 1, 1);
    for (let q = 0; q < 366; q += 10) { const jj = yd + q; if (Math.floor(E.sunSid(jj) / 30) === (r + 11) % 12 && Math.floor(E.sunSid(jj + 10) / 30) === r) { g = jj + 5; break; } }
    if (g === null) continue;
    const c = E.cross(E.sunSid, r * 30, g), t = ist(c);
    if (t.y !== year) continue;
    const wd = new Date(Date.UTC(t.y, t.m - 1, t.d)).getUTCDay(), R = RASHI[r];
    res.sankranti.push({ date: dateKey(t.y, t.m, t.d), wd, rashi: r, en: R[4], hi: R[5], rashiHi: R[0], rashiEn: R[1], sign: R[2], kind: R[3], moment: t.iso, afterSunset: c > sunJD(t.y, t.m, t.d).set, run: null });
  }

  // ---- Satyanarayan Puja (Purnima): the Purnima day (same day as the Purnima vrat, Purnima at sunrise) plus the
  //      day on which Purnima is running in the EVENING (the preferred time for the katha), which can be the day before.
  tithiRuns(15, jdFrom - 1, jdTo + 1).forEach(run => {
    const x = sunriseDay(run); if (!inYear(x)) return;
    const mi = E.monthInfo(sunJD(x.y, x.m, x.d).rise), nm = monthName(mi, false);
    const wd = new Date(Date.UTC(x.y, x.m - 1, x.d)).getUTCDay();
    const t0 = ist(run.s); let [y, m, d] = nextDay(t0.y, t0.m, t0.d, -1), best = null;
    for (let k = 0; k < 4; k++) {
      const ss = sunJD(y, m, d).set, ov = Math.min(run.e, ss + PRADOSH_MIN / 1440) - Math.max(run.s, ss);
      if (ov > 0 && (!best || ov > best.ov + 1e-9)) best = { y, m, d, ov };
      [y, m, d] = nextDay(y, m, d, 1);
    }
    res.satyanarayan.push({ date: dateKey(x.y, x.m, x.d), wd, month: nm, en: nm.en + " Purnima Satyanarayan Vrat", hi: nm.hi + " पूर्णिमा सत्यनारायण व्रत", run: fmtRun(run), eveningDate: best ? dateKey(best.y, best.m, best.d) : null });
  });

  Object.keys(res).forEach(k => res[k].sort((a, b) => a.date < b.date ? -1 : 1));
  // drop accidental duplicates (same date)
  Object.keys(res).forEach(k => res[k] = res[k].filter((r, i, a) => !i || r.date !== a[i - 1].date));
  return res;
}

module.exports = { RASHI, EKA, PRADOSH_RULE, PRADOSH_MIN, compute, LM, WD_HI, WD_EN, DEL };
