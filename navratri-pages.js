// /navratri/ + /navratri/<year>/         : Sharad Navratri dates (Ghatasthapana, Ashtami, Navami, Dussehra, 9 goddess pujas)
// /navratri-colors/ + /navratri-colors/<year>/ : the nine colours of Navratri, day by day
// Dates come from the same engine as the Hindu Calendar / Diwali pages (Delhi, IST), so pages never contradict each other.
// Add a year to YEARS in build.js and both page sets pick it up.
const V = require("./vrat-calc.js");
const G = require("./calendar-gen.js"), H = G._h;
const { wdOf, base } = H;

const WDH = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
const WDE = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONF = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONH = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];

// the nine forms of Durga, in order: [English key used by the engine, Hindi, tithi, what the form stands for]
const DEVI = [
  ["Shailputri", "शैलपुत्री", "प्रतिपदा", "daughter of the mountains; the first form"],
  ["Brahmacharini", "ब्रह्मचारिणी", "द्वितीया", "penance and self-discipline"],
  ["Chandraghanta", "चंद्रघंटा", "तृतीया", "courage and calm; a crescent moon on her forehead"],
  ["Kushmanda", "कूष्मांडा", "चतुर्थी", "the creator of the universe with her smile"],
  ["Skandamata", "स्कंदमाता", "पंचमी", "mother of Kartikeya (Skanda)"],
  ["Katyayani", "कात्यायनी", "षष्ठी", "the warrior form; worshipped for marriage and strength"],
  ["Kalaratri", "कालरात्रि", "सप्तमी", "the fiercest form, destroyer of fear and darkness"],
  ["Mahagauri", "महागौरी", "अष्टमी", "purity and peace"],
  ["Siddhidatri", "सिद्धिदात्री", "नवमी", "giver of siddhis (spiritual powers)"]
];
// colour of the day: days 1-7 follow the weekday of the date, days 8 and 9 are purple and peacock green
const WDCOL = [["नारंगी", "Orange", "#f28c28"], ["सफ़ेद", "White", "#f4f4f4"], ["लाल", "Red", "#d62828"], ["शाही नीला", "Royal Blue", "#2a4bb8"], ["पीला", "Yellow", "#f2c200"], ["हरा", "Green", "#2e9e4f"], ["स्लेटी", "Grey", "#8a8f98"]];
const LATE = [["बैंगनी", "Purple", "#7b2cbf"], ["मोर हरा", "Peacock Green", "#0f8f7d"]];
const colorOf = (dayNo, wd) => dayNo <= 7 ? WDCOL[wd] : LATE[dayNo - 8];

const CACHE = {};
function navratri(y) {
  if (CACHE[y] !== undefined) return CACHE[y];
  const { fest, byId } = base(y);
  if (!byId.sharadnav || !byId.dussehra) return (CACHE[y] = null);
  const entries = [];
  Object.keys(fest).forEach(k => { const [m, d] = k.split("-").map(Number); fest[k].forEach(o => entries.push({ iso: H.isoOf(y, m, d), o })); });
  const lo = byId.sharadnav, hi = byId.dussehra;
  const found = DEVI.map((dv, i) => { const hit = entries.find(e => e.iso >= lo && e.iso <= hi && e.o.en === `${dv[0]} Puja`); return hit ? hit.iso : (i === 0 ? lo : null); });
  // a skipped (kshaya) tithi has no date of its own: show it on the date of the next puja and say so
  const days = DEVI.map((dv, i) => {
    let iso = found[i], shared = false;
    if (!iso) { iso = found.slice(i + 1).find(Boolean); shared = !!iso; }
    return iso ? { no: i + 1, dv, iso, wd: wdOf(iso), col: colorOf(i + 1, wdOf(iso)), shared } : null;
  }).filter(Boolean);
  const p = iso => { const [a, b, c] = iso.split("-").map(Number); return { y: a, m: b, d: c, wd: wdOf(iso), iso }; };
  return (CACHE[y] = { y, days: days.map(x => Object.assign(x, p(x.iso), { no: x.no, shared: x.shared })), start: p(lo), ashtami: byId.durgashtami && p(byId.durgashtami), navami: byId.mahanavami && p(byId.mahanavami), dussehra: p(hi), purnima: byId.sharadpurnima && p(byId.sharadpurnima), diwali: byId.diwali && p(byId.diwali) });
}

module.exports = function ({ BRAND, layout, write, faqSchema, citiesBlock, YEARS }) {
  const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
  const have = YEARS.filter(y => navratri(y));
  if (!have.length) return;
  const HUB_Y = have.find(y => navratri(y).dussehra.iso >= today) || have[have.length - 1];
  const en = o => `${o.d} ${MONF[o.m - 1]} ${o.y}`, hi = o => `${o.d} ${MONH[o.m - 1]} ${o.y}`;
  const dayEn = o => `${WDE[o.wd]}, ${en(o)}`;
  const ynav = (base_, cur, isHub) => `<nav class="ynav" aria-label="Choose year">${have.map(yy => `<a href="${base_}${yy}/"${!isHub && yy === cur ? ' class="act" aria-current="page"' : ""}>${yy}</a>`).join("")}${isHub ? "" : `<a href="${base_}">Upcoming</a>`}</nav>`;
  const dot = c => `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${c};border:1px solid #8884;vertical-align:-2px;margin-right:6px"></span>`;
  const gap = n => n.days.some(x => x.shared) ? `<p class="disc2">In ${n.y} a tithi is skipped, so ${n.days.filter(x => x.shared).map(x => x.dv[0]).join(", ")} puja is done on the same date as the next day. Dates here follow the sunrise tithi for Delhi.</p>` : "";
  const related = [["/navratri/", "Sharad Navratri Dates"], ["/navratri-colors/", "Navratri Colors"], ["/diwali/", "Diwali"], ["/hindu-calendar/", "Hindu Calendar"], ["/shubh-muhurat/", "Shubh Muhurat"]];

  /* ---------------- Sharad Navratri dates ---------------- */
  const renderDates = (y, isHub) => {
    const n = navratri(y), urlPath = isHub ? "/navratri/" : `/navratri/${y}/`;
    const rows = n.days.map(x => `<tr><td><b>${x.no}</b> · ${x.dv[2]}</td><td><b>${x.d} ${MONH[x.m - 1]} ${x.y}</b><br>${WDH[x.wd]} / ${WDE[x.wd]}</td><td>${x.dv[1]} पूजा / ${x.dv[0]} Puja${x.no === 1 ? "<br>घटस्थापना / Ghatasthapana" : ""}${n.ashtami && x.iso === n.ashtami.iso ? "<br>दुर्गा अष्टमी / Durga Ashtami" : ""}${n.navami && x.iso === n.navami.iso ? "<br>महा नवमी / Maha Navami" : ""}</td></tr>`).join("");
    const faqs = [
      [`Sharad Navratri ${y} kab se hai? / When does Sharad Navratri ${y} start?`, `Sharad Navratri ${y} begins on ${dayEn(n.start)} with Ghatasthapana and ends with Vijayadashami (Dussehra) on ${dayEn(n.dussehra)}.`],
      [`Durga Ashtami ${y} kab hai?`, n.ashtami ? `Durga Ashtami in ${y} is on ${dayEn(n.ashtami)}${n.navami ? `, and Maha Navami is on ${dayEn(n.navami)}` : ""}.` : `See the table above for the Ashtami and Navami dates.`],
      [`Dussehra ${y} kab hai? / When is Dussehra in ${y}?`, `Dussehra (Vijayadashami) ${y} is on ${dayEn(n.dussehra)}.${n.diwali ? ` Diwali follows on ${en(n.diwali)}.` : ""}`],
      [`Sharad Navratri aur Chaitra Navratri mein kya fark hai?`, `Sharad Navratri falls in the month of Ashwin (autumn) and ends with Dussehra. Chaitra Navratri falls in spring and ends with Ram Navami. Sharad Navratri is the more widely celebrated of the two.`],
      [`Navratri mein kitne din hote hain?`, `Navratri has nine nights and nine forms of Durga. Because the tithi can be repeated or skipped, the festival sometimes runs over eight or ten calendar dates.`]
    ];
    write(urlPath, layout({
      urlPath, canonicalPath: !isHub && y === HUB_Y ? "/navratri/" : null,
      title: `शरद नवरात्रि ${y} – Sharad Navratri ${y} Dates, Ghatasthapana & Dussehra | ${BRAND}`,
      description: `Sharad Navratri ${y} starts on ${en(n.start)} and Dussehra is on ${en(n.dussehra)}. Nine-day Navratri calendar with Ghatasthapana, Durga Ashtami, Maha Navami and daily Devi puja dates.`,
      h1: `शरद नवरात्रि ${y} / Sharad Navratri ${y}`, crumbLabel: isHub ? "Sharad Navratri" : `Sharad Navratri ${y}`,
      bodyHtml: `<p lang="hi"><b>शारदीय नवरात्रि ${y}: ${hi(n.start)} से ${hi(n.dussehra)} तक।</b> नवरात्रि अश्विन शुक्ल प्रतिपदा से शुरू होती है। पहले दिन घटस्थापना होती है और नौ दिन माँ दुर्गा के नौ रूपों की पूजा की जाती है। दशमी को विजयादशमी (दशहरा) मनाया जाता है।</p>
<p><b>Sharad Navratri ${y} begins on ${dayEn(n.start)} and Dussehra is on ${dayEn(n.dussehra)}.</b> Dates are for New Delhi (IST).</p>
${ynav("/navratri/", y, isHub)}
<div class="tbl"><table class="ctbl"><thead><tr><th style="width:110px">Day / दिन</th><th style="width:190px">Date / तारीख</th><th>Puja / पूजा</th></tr></thead><tbody>${rows}
<tr><td><b>10</b> · दशमी</td><td><b>${hi(n.dussehra)}</b><br>${WDH[n.dussehra.wd]} / ${WDE[n.dussehra.wd]}</td><td>विजयादशमी (दशहरा) / Vijayadashami, नवरात्रि पारणा / Navratri Parana, दुर्गा विसर्जन / Durga Visarjan</td></tr></tbody></table></div>
${gap(n)}
<h2>नवरात्रि के नौ रूप / The nine forms of Durga</h2>
<ul>${DEVI.map(d => `<li><b>${d[1]} (${d[0]})</b>, ${d[2]}: ${d[3]}.</li>`).join("")}</ul>
<h2>घटस्थापना और व्रत / Ghatasthapana and fasting</h2>
<p>On the first day a kalash (pot) is installed in a clean place and barley is sown beside it. The kalash is worshipped for nine days, and many families fast, eat only satvik food, or fast on the first and last day. Durga Ashtami and Maha Navami are the main days for Kanya Pujan. Check the Ghatasthapana time with your pandit, as it depends on the Pratipada tithi at your place.</p>
<p>The colour for each day is on the <a href="/navratri-colors/${isHub ? "" : y + "/"}">Navratri Colors ${y}</a> page. Diwali dates are on the <a href="/diwali/${y}/">Diwali ${y}</a> page.</p>
<h2>FAQs</h2>
${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}
<p class="disc2">Dates are worked out for Delhi (IST) from the sunrise tithi. They can differ by a day in other cities or in other panchang traditions.</p>
${citiesBlock}`,
      extraJsonLd: [faqSchema(faqs)], related
    }));
  };

  /* ---------------- Navratri colours ---------------- */
  const renderColors = (y, isHub) => {
    const n = navratri(y), urlPath = isHub ? "/navratri-colors/" : `/navratri-colors/${y}/`;
    const rows = n.days.map(x => `<tr><td><b>${x.no}</b></td><td><b>${x.d} ${MONH[x.m - 1]} ${x.y}</b><br>${WDH[x.wd]} / ${WDE[x.wd]}</td><td>${dot(x.col[2])}<b>${x.col[0]} / ${x.col[1]}</b></td><td>${x.dv[1]} / ${x.dv[0]}</td></tr>`).join("");
    const first = n.days[0].col;
    const faqs = [
      [`Navratri ${y} ka pehle din ka rang kya hai? / What is the colour of day 1 in ${y}?`, `Day 1 of Sharad Navratri ${y} falls on ${dayEn(n.start)}, so the colour is ${first[1]} (${first[0]}).`],
      [`Navratri ke 9 rang kaise tay hote hain?`, `A common practice is to follow the weekday of each day: orange (Sunday), white (Monday), red (Tuesday), royal blue (Wednesday), yellow (Thursday), green (Friday) and grey (Saturday). The last two days are purple and peacock green. Some regions and temples follow a different order.`],
      [`Navratri colours ${y} list`, n.days.map(x => `Day ${x.no} (${en(x)}): ${x.col[1]}`).join("; ") + "."]
    ];
    write(urlPath, layout({
      urlPath, canonicalPath: !isHub && y === HUB_Y ? "/navratri-colors/" : null,
      title: `नवरात्रि रंग ${y} – Navratri Colors ${y}, 9 Days Colour List | ${BRAND}`,
      description: `Navratri colours ${y}: day-wise list of the nine colours from ${en(n.start)} with dates, weekday and the Devi worshipped each day.`,
      h1: `नवरात्रि रंग ${y} / Navratri Colors ${y}`, crumbLabel: isHub ? "Navratri Colors" : `Navratri Colors ${y}`,
      bodyHtml: `<p lang="hi"><b>नवरात्रि ${y} के नौ रंग</b>: शारदीय नवरात्रि ${hi(n.start)} से शुरू होती है। हर दिन एक रंग पहना जाता है, जो उस दिन की देवी और वार से जुड़ा माना जाता है। पहला दिन ${WDH[n.start.wd]} को है, इसलिए पहले दिन का रंग ${first[0]} है।</p>
<p><b>Day 1 of Navratri ${y} is ${dayEn(n.start)}, colour: ${first[1]}.</b> Colours follow the weekday of each day; the last two days are purple and peacock green.</p>
${ynav("/navratri-colors/", y, isHub)}
<div class="tbl"><table class="ctbl"><thead><tr><th style="width:60px">Day</th><th style="width:190px">Date / तारीख</th><th>Colour / रंग</th><th>Devi / देवी</th></tr></thead><tbody>${rows}</tbody></table></div>
${gap(n)}
<h2>नवरात्रि रंगों का महत्व / Why colours matter</h2>
<p>Wearing the colour of the day is a custom, not a rule of scripture. It is most popular in Gujarat and Maharashtra, where groups of women dress in the same colour each day for garba and puja. The colours listed here follow the weekday scheme most calendars use; if your family or temple follows another order, keep that one.</p>
<p>For the full date list including Ghatasthapana, Durga Ashtami and Dussehra, see <a href="/navratri/${isHub ? "" : y + "/"}">Sharad Navratri ${y}</a>.</p>
<h2>FAQs</h2>
${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}
<p class="disc2">Dates are for Delhi (IST). Colour schemes differ by region and tradition.</p>
${citiesBlock}`,
      extraJsonLd: [faqSchema(faqs)], related
    }));
  };

  have.forEach(y => { renderDates(y, false); renderColors(y, false); });
  renderDates(HUB_Y, true); renderColors(HUB_Y, true);
};
module.exports.navratri = navratri;
