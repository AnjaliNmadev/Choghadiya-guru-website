// /diwali/ and /diwali/<year>/ : Diwali date, Lakshmi Puja muhurat (Pradosh Kaal + Sthira lagna) and the 7-day Diwali calendar.
// Everything is computed (Delhi, IST) by the same engine as the other pages, for every year in YEARS.
const P = require("./assets/panchang-engine.js");
const V = require("./vrat-calc.js");
const G = require("./calendar-gen.js"), H = G._h;
const DEL = V.DEL, E = P._int;
const { addDays, isoOf, parts, wdOf, base } = H;

const WDH = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
const WDE = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONF = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONH = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
const TITH = ["प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी"];
const tithiHi = n => n === 15 ? "पूर्णिमा" : n === 30 ? "अमावस्या" : TITH[(n - 1) % 15];
const HI = { "Govatsa Dwadashi": "गोवत्स द्वादशी", "Vasu Baras": "वसु बारस", "Dhanteras": "धनतेरस", "Dhanvantari Trayodashi": "धन्वंतरि त्रयोदशी", "Yama Deepam": "यम दीपम",
  "Kali Chaudas": "काली चौदस", "Hanuman Puja": "हनुमान पूजा", "Narak Chaturdashi": "नरक चतुर्दशी", "Diwali": "दिवाली", "Lakshmi Puja": "लक्ष्मी पूजा", "Kedar Gauri Vrat": "केदार गौरी व्रत",
  "Chopda Puja": "चोपड़ा पूजा", "Sharda Puja": "शारदा पूजा", "Diwali Snan": "दिवाली स्नान", "Diwali Devpuja": "दिवाली देवपूजा", "Dyuta Krida": "द्यूत क्रीड़ा", "Govardhan Puja": "गोवर्धन पूजा",
  "Annakut": "अन्नकूट", "Bali Pratipada": "बलि प्रतिपदा", "Gujarati New Year": "गुजराती नववर्ष", "Bhaiya Dooj": "भैया दूज", "Bhau Beej": "भाऊ बीज", "Yama Dwitiya": "यम द्वितीया" };
const lab = n => HI[n] ? `${HI[n]} / ${n}` : n;
const hm = m => { m = Math.round(m); return String(Math.floor(m / 60) % 24).padStart(2, "0") + ":" + String(((m % 60) + 60) % 60).padStart(2, "0"); };
const dur = m => { m = Math.round(m); return `${Math.floor(m / 60)} घंटे ${m % 60} मिनट / ${Math.floor(m / 60)} hr ${m % 60} min`; };

// sidereal ascendant (lagna) in degrees
function lagna(jd, lat, lon) {
  const T = (jd - 2451545) / 36525, g = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - T * T * T / 38710000;
  const lst = (((g + lon) % 360) + 360) % 360, eps = 23.4392911 - 0.0130042 * T, r = Math.PI / 180;
  let a = Math.atan2(Math.cos(lst * r), -(Math.sin(lst * r) * Math.cos(eps * r) + Math.tan(lat * r) * Math.sin(eps * r))) / r; a = ((a % 360) + 360) % 360;
  return (((a - E.ayanamsa(jd)) % 360) + 360) % 360;
}
const LAGNA_EN = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"];
const LAGNA_HI = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];
const STHIRA = [1, 4, 7, 10];

const CACHE = {};
function diwali(y) {
  if (CACHE[y]) return CACHE[y];
  const { byId } = base(y), D = byId.diwali; if (!D) return (CACHE[y] = null);
  const [yy, m, d] = parts(D), x = P.dayData(yy, m, d, DEL.lat, DEL.lon);
  const pradosh = [x.sunset, x.sunset + V.PRADOSH_MIN];
  const am = (x.tithi.find(t => t.n === 30) || { s: -1e9, e: 1e9 }), amWin = [Math.max(am.s, x.sunrise), Math.min(am.e, x.nextSunrise)];
  // lagna windows from before sunset to late night
  const win = []; let cur = null;
  for (let t = x.sunset - 240; t <= x.sunset + 600; t++) {
    const sg = Math.floor(lagna(E.jdIST(yy, m, d, t), DEL.lat, DEL.lon) / 30);
    if (!cur || cur.sg !== sg) { if (cur) { cur.e = t; win.push(cur); } cur = { sg, s: t }; }
  }
  if (cur) { cur.e = x.sunset + 600; win.push(cur); }
  const lo = Math.max(pradosh[0], amWin[0]), hi = Math.min(pradosh[1], amWin[1]);
  const ov = w => Math.max(0, Math.min(w.e, hi) - Math.max(w.s, lo));
  const vr = win.filter(w => w.sg === 1).sort((a, b) => ov(b) - ov(a) || Math.abs(a.s - pradosh[0]) - Math.abs(b.s - pradosh[0]))[0] || null;
  let best = vr && ov(vr) >= 10 ? vr : win.filter(w => STHIRA.includes(w.sg)).sort((a, b) => ov(b) - ov(a))[0];
  const muh = best && ov(best) > 0 ? { s: Math.max(best.s, lo), e: Math.min(best.e, hi), sg: best.sg } : { s: lo, e: hi, sg: -1 };
  // 7-day calendar
  const N = byId.narak, T = byId.dhanteras, G1 = byId.govardhan, B = byId.bhaidooj, kali = addDays(N || D, -1);
  const R = {}, put = (iso, ...n) => { if (iso) (R[iso] = R[iso] || []).push(...n); };
  put(addDays(T, -1), "Govatsa Dwadashi", "Vasu Baras");
  put(T, "Dhanteras", "Dhanvantari Trayodashi", "Yama Deepam");
  put(kali, "Kali Chaudas", "Hanuman Puja");
  if (N && N !== D) put(N, "Narak Chaturdashi");
  put(D, ...(N === D ? ["Narak Chaturdashi"] : []), "Diwali", "Lakshmi Puja", "Kedar Gauri Vrat", "Chopda Puja", "Sharda Puja");
  const nx = addDays(D, 1), xn = P.dayData(...parts(nx), DEL.lat, DEL.lon);
  if (xn.tithi[0].n === 30 && nx !== G1) put(nx, "Diwali Snan", "Diwali Devpuja");
  put(G1, "Dyuta Krida", "Govardhan Puja", "Annakut", "Bali Pratipada", "Gujarati New Year");
  put(B, "Bhaiya Dooj", "Bhau Beej", "Yama Dwitiya");
  const rows = Object.keys(R).sort().map(iso => { const [a, b, c] = parts(iso), o = P.dayData(a, b, c, DEL.lat, DEL.lon); const pm = o.sunset + 30, tp = o.tithi.find(z => z.s <= pm && pm < z.e); // evening tithi up to Diwali, sunrise tithi after it
      return { iso, y: a, m: b, d: c, wd: wdOf(iso), tithi: (iso <= D && tp ? tp : o.tithi[0]).n, names: [...new Set(R[iso])] }; });
  return (CACHE[y] = { y, iso: D, wd: wdOf(D), d, m, pradosh, vrishabha: vr, muh, rows });
}

module.exports = function ({ BRAND, layout, write, faqSchema, citiesBlock, YEARS }) {
  const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
  const have = YEARS.filter(y => diwali(y));
  if (!have.length) return;
  const HUB_Y = have.find(y => diwali(y).iso >= today) || have[have.length - 1];
  const ymd = (r) => `${r.d} ${MONF[r.m - 1]} ${r.y}`;
  const ynav = (cur, hub) => `<nav class="ynav" aria-label="Choose year">${have.map(yy => `<a href="/diwali/${yy}/"${!hub && yy === cur ? ' class="act" aria-current="page"' : ""}>${yy}</a>`).join("")}${hub ? "" : '<a href="/diwali/">Upcoming</a>'}</nav>`;

  const render = (y, isHub) => {
    const w = diwali(y), urlPath = isHub ? "/diwali/" : `/diwali/${y}/`;
    const dl = `${String(w.d).padStart(2, "0")} ${MONH[w.m - 1]}, ${y}`, den = `${w.d} ${MONF[w.m - 1]} ${y}`;
    const vrs = w.vrishabha ? `${hm(w.vrishabha.s)} – ${hm(w.vrishabha.e)}` : "—";
    const lg = w.muh.sg >= 0 ? `${LAGNA_HI[w.muh.sg]} / ${LAGNA_EN[w.muh.sg]} lagna` : "";
    const rows = w.rows.map(r => `<tr><td><b>${r.d} ${MONH[r.m - 1]} ${r.y}</b><br>${WDH[r.wd]} / ${WDE[r.wd]}</td><td>${tithiHi(r.tithi)}</td><td>${r.names.map(lab).join(", ")}</td></tr>`).join("");
    const faqs = [
      [`Diwali ${y} kab hai? / When is Diwali in ${y}?`, `Diwali (Lakshmi Puja) is on ${WDE[w.wd]}, ${den}. Dhanteras is two days before and Bhai Dooj follows after Govardhan Puja.`],
      [`Lakshmi Puja muhurat ${y} / What is the Lakshmi Puja muhurat in ${y}?`, `For Delhi, the Lakshmi Puja muhurat on ${den} is ${hm(w.muh.s)} to ${hm(w.muh.e)} (${dur(w.muh.e - w.muh.s)}), within Pradosh Kaal ${hm(w.pradosh[0])} to ${hm(w.pradosh[1])}.`],
      [`Why is Lakshmi Puja done in Pradosh Kaal?`, `Lakshmi Puja is done on the Amavasya evening, after sunset (Pradosh Kaal), and preferably in a Sthira lagna such as Vrishabha, so that Lakshmi is believed to stay in the home.`],
      [`How many days is Diwali celebrated?`, `The main celebration is five days: Dhanteras, Narak Chaturdashi (Chhoti Diwali), Diwali, Govardhan Puja and Bhai Dooj. Some regions also begin on Govatsa Dwadashi, so this page lists seven days.`]
    ];
    write(urlPath, layout({
      urlPath, canonicalPath: !isHub && y === HUB_Y ? "/diwali/" : null,
      title: `दीवाली ${y} – Diwali ${y} Date, Lakshmi Puja Muhurat & 5-Day Calendar | ${BRAND}`,
      description: `Diwali ${y} (दीपावली ${y}) is on ${den}. Lakshmi Puja muhurat ${hm(w.muh.s)}–${hm(w.muh.e)}, Pradosh Kaal, Dhanteras, Narak Chaturdashi, Govardhan Puja and Bhai Dooj dates for Delhi.`,
      h1: `दीपावली ${y} / Diwali ${y}`, crumbLabel: isHub ? "Diwali" : `Diwali ${y}`,
      bodyHtml: `<p lang="hi"><b>दिवाली कब है : ${dl}</b> (${WDH[w.wd]}). दीपावली कार्तिक अमावस्या की शाम को मनाई जाती है, जब प्रदोष काल में लक्ष्मी पूजा की जाती है। नीचे दिल्ली (IST) के लिए ${y} का लक्ष्मी पूजा मुहूर्त और दीपावली के सभी दिनों की तारीखें हैं।</p>
<p><b>Diwali ${y} is on ${WDE[w.wd]}, ${den}.</b> Times are for New Delhi (IST) and change by a few minutes in other cities.</p>
${ynav(y, isHub)}
<div class="tbl"><table class="ctbl"><thead><tr><th style="width:42%">Lakshmi Puja ${y} / लक्ष्मी पूजा</th><th>Delhi (IST)</th></tr></thead><tbody>
<tr><td><b>लक्ष्मी पूजा मुहूर्त / Lakshmi Puja Muhurat</b></td><td><b>${hm(w.muh.s)} – ${hm(w.muh.e)}</b></td></tr>
<tr><td>अवधि / Duration</td><td>${dur(w.muh.e - w.muh.s)}</td></tr>
<tr><td>प्रदोष काल / Pradosh Kaal</td><td>${hm(w.pradosh[0])} – ${hm(w.pradosh[1])}</td></tr>
<tr><td>वृषभ काल / Vrishabha Kaal</td><td>${vrs}</td></tr>${lg && w.muh.sg !== 1 ? `<tr><td>मुहूर्त का लग्न / Lagna used</td><td>${lg}</td></tr>` : ""}
</tbody></table></div>
<h2>दिवाली कैलेंडर ${y} / Diwali Calendar ${y}</h2>
<div class="tbl"><table class="ctbl"><thead><tr><th style="width:190px">Date / तारीख</th><th style="width:110px">Tithi / तिथि</th><th>Festival / त्योहार</th></tr></thead><tbody>${rows}</tbody></table></div>
<h2>दीपावली के पाँच दिन / The five days of Diwali</h2>
<ul><li><b>Dhanteras (धनतेरस)</b>: Trayodashi, buying metal or utensils and worshipping Dhanvantari and Kubera.</li><li><b>Narak Chaturdashi / Kali Chaudas (नरक चतुर्दशी)</b>: Chaturdashi, early bath and lamps; called Chhoti Diwali.</li><li><b>Diwali / Lakshmi Puja (दीपावली)</b>: Amavasya evening, worship of Lakshmi and Ganesha in Pradosh Kaal.</li><li><b>Govardhan Puja / Annakut (गोवर्धन पूजा)</b>: Pratipada, also the Gujarati New Year and Bali Pratipada.</li><li><b>Bhai Dooj (भैया दूज)</b>: Dwitiya, sisters apply tilak to their brothers.</li></ul>
<h2>Lakshmi Puja in short / लक्ष्मी पूजा की सरल विधि</h2>
<p>Clean the house and light lamps at the doorway. In the muhurat, set up Lakshmi and Ganesha on a clean cloth, light a ghee lamp, offer flowers, sweets and coins, and read the Lakshmi aarti. Keep the lamps burning through the evening.</p>
<p>See also <a href="/hindu-calendar/${y}/">Hindu Calendar ${y}</a>, <a href="/choghadiya/">Choghadiya</a> and <a href="/shubh-muhurat/">Shubh Muhurat</a>.</p>
<h2>FAQs</h2>
${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}
<p class="disc2">Muhurat is worked out from Pradosh Kaal, the Amavasya tithi and the Sthira lagna for Delhi. Check the final timing with your family pandit.</p>
${citiesBlock}`,
      extraJsonLd: [faqSchema(faqs)],
      related: [["/hindu-calendar/", "Hindu Calendar"], ["/hindu-festivals/", "Hindu Festivals"], ["/panchang/", "Panchang Calendar"], ["/shubh-muhurat/", "Shubh Muhurat"]]
    }));
  };
  have.forEach(y => render(y, false));
  render(HUB_Y, true);
};
module.exports.diwali = diwali;
