// Generates /panchang/ and /panchang/<year>/ — a 12-month Hindu calendar with festivals, vrats and a click-for-details daily panchang.
// Festival dates are computed (New Delhi) by assets/panchang-engine.js at build time for SEO; the browser recomputes for the visitor's city.
const P = require("./assets/panchang-engine.js");

module.exports = function ({ BRAND, layout, write, faqSchema, citiesBlock, YEARS, SITE }) {
  const LAT = 28.61, LON = 77.21;                     // New Delhi (build-time default)
  const nowIST = new Date(Date.now() + 5.5 * 3600e3), thisYear = nowIST.getUTCFullYear();
  const WD_E = P.T.wd.en, MON_E = P.T.mon.en;

  const faqs = year => [
    ["What is a Panchang?", "Panchang (Panchangam) is the Hindu almanac built on five limbs: tithi (lunar day), vaar (weekday), nakshatra (lunar mansion), yoga and karana. It is used to choose auspicious dates and times for festivals, vrats and ceremonies."],
    [`How do I see the panchang for a particular date in ${year}?`, "Tap or click any date in the calendar. The daily panchang opens at the top with tithi, nakshatra, yoga, karana, sunrise, sunset, moonrise, moonset, Rahu Kaal, Abhijit Muhurat and more for the city you have selected."],
    ["What do the colours on the calendar mean?", "Green dates have a festival, vrat or observance (for example Ekadashi, Purnima, Amavasya, Pradosh, Sankashti Chaturthi). Red dates are Saturdays and Sundays. Greyed numbers belong to the previous or next month."],
    ["Why can a festival date differ from another calendar?", "Festivals follow the tithi that prevails at a specific time of day (sunrise, midday, pradosh or midnight, depending on the festival), so the date can shift by a day between cities and between panchang traditions. Change the city above to see dates for your location, and confirm important dates with your family pandit."],
    ["Which lunar month system does this panchang use?", "It shows both Amanta (month ends on Amavasya, used in Gujarat, Maharashtra and South India) and Purnimanta (month ends on Purnima, used in North India). Adhik Maas (the extra month) is detected automatically."]
  ];
  const faqBlock = year => `<h2>Panchang calendar FAQs / अक्सर पूछे जाने वाले प्रश्न</h2>` + faqs(year).map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n");

  function bigTable(y, F) {
    const keys = Object.keys(F).sort((a, b) => { const [m1, d1] = a.split("-"), [m2, d2] = b.split("-"); return m1 - m2 || d1 - d2; });
    let rows = "";
    keys.forEach(k => {
      const [m, d] = k.split("-").map(Number);
      F[k].filter(o => o.big && !o.civil && !(o.sank && o.id !== "sank9")).forEach(o => {
        const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
        rows += `<tr><td>${d} ${MON_E[m - 1]} ${y}</td><td>${WD_E[wd]} / ${P.T.wd.hi[wd]}</td><td>${o.en} / ${o.hi}</td></tr>`;
      });
    });
    return `<div class="tbl"><table><thead><tr><th>Date</th><th>Day / वार</th><th>Festival / त्योहार</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  const yearNav = (cur) => `<nav class="ynav" aria-label="Choose year">` + YEARS.map(y => `<a href="/panchang/${y}/"${y === cur ? ' class="act" aria-current="page"' : ""}>${y}</a>`).join("") + `<a href="/aaj-ka-panchang/">Aaj ka Panchang</a><a href="/month-panchang/">Month Panchang</a></nav>`;

  function page(urlPath, y, canonicalPath) {
    const F = P.festivals(y, LAT, LON);
    const body = `
<div class="pc" id="pc" data-year="${y}" data-lang="hi">
<p class="intro">Hindu Panchang calendar ${y} with festivals, vrats, tithi, nakshatra, Rahu Kaal and muhurat for every day. <span lang="hi">हिन्दू पंचांग कैलेंडर ${y}: त्योहार, व्रत, तिथि, नक्षत्र और हर दिन का पूरा पंचांग। किसी भी तारीख पर क्लिक करें।</span></p>
${yearNav(y)}
<div class="tools">
<div class="views" role="group" aria-label="View"><button type="button" data-view="year" aria-pressed="true"><span class="hi">वार्षिक कैलेंडर</span><span class="en">Year calendar</span></button><button type="button" data-view="month" aria-pressed="false"><span class="hi">महीनेवार पंचांग</span><span class="en">Month panchang</span></button></div>
<div class="lang" role="group" aria-label="Language"><button type="button" data-lang="hi" aria-pressed="true">हिन्दी</button><button type="button" data-lang="en" aria-pressed="false">English</button></div>
<label class="fld">📍 Location<input id="city" list="cl" autocomplete="off" placeholder="Enter city name"><datalist id="cl"></datalist></label>
</div>
<section id="pDay" class="pday" aria-live="polite"><noscript><p>Please enable JavaScript to see the daily panchang for a date. The calendar and festival list below work without it.</p></noscript></section>
<section id="pMonthView" class="mview" hidden></section>
<div class="plegend" id="pLegend"><span><i class="lf"></i><b class="hi">त्योहार / व्रत</b><b class="en">Festival / vrat</b></span><span><i class="lw"></i><b class="hi">शनिवार–रविवार</b><b class="en">Weekend</b></span><span><i class="lt"></i><b class="hi">आज</b><b class="en">Today</b></span></div>
<div class="pmonths" id="pMonths">${P.calendarHTML(y, F)}</div>
<h2>Major festivals in ${y} / ${y} के प्रमुख त्योहार</h2>
<p class="small">Dates calculated for New Delhi. Change the location above to recalculate the calendar for your city.</p>
${bigTable(y, F)}
${faqBlock(y)}
</div>
${citiesBlock}`;
    write(urlPath, layout({
      urlPath, canonicalPath, title: `Hindu Panchang Calendar ${y} – पंचांग ${y}, Festivals, Tithi, Vrat Dates | ${BRAND}`,
      description: `Hindu Panchang calendar ${y} (पंचांग ${y}) with all festivals, Ekadashi, Purnima, Amavasya, Pradosh and Sankashti dates. Tap any date for tithi, nakshatra, yoga, karana, Rahu Kaal and sunrise-sunset.`,
      h1: `Hindu Panchang Calendar ${y} – पंचांग ${y}`, crumbLabel: `Panchang ${y}`,
      bodyHtml: body, extraScripts: ["/assets/panchang-engine.js", "/assets/panchang.js"], extraJsonLd: [faqSchema(faqs(y))],
      defaultCity: "New Delhi, Delhi", lockCity: false,
      related: [["/choghadiya/", "Today's Choghadiya"], ["/rahu-kaal/", "Rahu Kaal"], ["/abhijit-muhurat/", "Abhijit Muhurat"], ["/shubh-muhurat/", "Shubh Muhurat"]]
    }));
  }


  /* ---------- /aaj-ka-panchang/ (any date) and /month-panchang/ (any month & year) ---------- */
  const cityTool = `<label class="fld">📍 Location<input id="city" list="cl" autocomplete="off" placeholder="Enter city name"><datalist id="cl"></datalist></label>`;
  const langTool = `<div class="lang" role="group" aria-label="Language"><button type="button" data-lang="hi" aria-pressed="true">हिन्दी</button><button type="button" data-lang="en" aria-pressed="false">English</button></div>`;
  const yearLinks = `<div class="related"><h3>Panchang calendar by year / वर्षवार पंचांग</h3>${YEARS.map(y => `<a href="/panchang/${y}/">${y}</a>`).join("")}</div>`;
  const nowD = new Date(Date.now() + 5.5 * 3600e3);
  const ty = nowD.getUTCFullYear(), tm = nowD.getUTCMonth() + 1, td = nowD.getUTCDate();

  const todayFaqs = [
    ["What is Aaj ka Panchang?", "Aaj ka Panchang is the Hindu almanac for today. It lists the tithi, nakshatra, yoga, karana and weekday, along with sunrise, sunset, moonrise, moonset, the lunar month, Shaka and Vikram samvat, and the auspicious and inauspicious periods of the day."],
    ["Can I see the panchang for any other date?", "Yes. Use the date box to pick any day, month and year, or use the Previous day and Next day buttons. The Today button brings you back to the current date."],
    ["Why do some timings go past 24:00?", "A tithi, nakshatra or karana that ends after midnight is shown with hours beyond 24, for example 26:00 means 2:00 AM the next morning. The panchang day runs from sunrise to the next sunrise."],
    ["Is the panchang the same for every city?", "No. Sunrise, sunset, moonrise and every muhurat that depends on them change from city to city. Select your city above to get timings for your location."],
    ["What is Rahu Kaal and Abhijit Muhurat?", "Rahu Kaal is a daily period of about 90 minutes that is avoided for starting new work. Abhijit Muhurat is the auspicious middle muhurta of the day, usually around midday. Both are shown in the daily panchang above."]
  ];
  const monthFaqs = [
    ["What is the month-wise panchang?", "It shows every day of a month in one grid with the tithi and paksha at sunrise, the tithi number and the festivals and vrats of that day, so you can plan the whole month at a glance."],
    ["How do I see another month or year?", "Use the Previous and Next buttons, or pick any month and year from the drop-downs. Any year from 2000 to 2100 can be opened."],
    ["What is the difference between Amanta and Purnimanta months?", "In the Amanta system the month ends on Amavasya (new moon), as in Gujarat, Maharashtra and South India. In the Purnimanta system it ends on Purnima (full moon), as in North India. The two differ only in the name of the month during the dark fortnight. Use the switch to change the system."],
    ["Why does a cell show two tithi numbers?", "When a tithi starts and ends between two sunrises it is skipped at sunrise (a kshaya tithi). The grid then shows both numbers, such as 7, 8, for that day."],
    ["Tap a date for details", "Click any day in the grid to open its full panchang (tithi, nakshatra, yoga, karana, sunrise, Rahu Kaal, Abhijit and more) at the top of the page."]
  ];
  const faq = (title, list) => `<h2>${title}</h2>` + list.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n");

  // build-time snapshot of today's panchang (New Delhi) so crawlers see real content; replaced by the live panel in the browser
  const dd = P.dayData(ty, tm, td, LAT, LON), f = P.fmt24, fl = v => f(Math.floor(v + 1e-6));
  const tnm = n => n === 30 ? P.T.tithi.hi[15] : P.T.tithi.hi[(n - 1) % 15], tne = n => n === 30 ? P.T.tithi.en[15] : P.T.tithi.en[(n - 1) % 15];
  const snap = `<div class="snap"><h2>Today's Panchang, New Delhi – ${td} ${MON_E[tm - 1]} ${ty} / आज का पंचांग</h2><div class="tbl"><table><tbody>
<tr><th>Tithi / तिथि</th><td>${tne(dd.tithi[0].n)} / ${tnm(dd.tithi[0].n)} (until ${f(dd.tithi[0].e)})</td></tr>
<tr><th>Nakshatra / नक्षत्र</th><td>${P.T.nak.en[dd.nak[0].i]} / ${P.T.nak.hi[dd.nak[0].i]} (until ${f(dd.nak[0].e)})</td></tr>
<tr><th>Yoga / योग</th><td>${P.T.yoga.en[dd.yoga[0].i]} / ${P.T.yoga.hi[dd.yoga[0].i]} (until ${f(dd.yoga[0].e)})</td></tr>
<tr><th>Weekday / वार</th><td>${WD_E[dd.wd]} / ${P.T.wd.hi[dd.wd]}</td></tr>
<tr><th>Sunrise / Sunset</th><td>${fl(dd.sunrise)} / ${fl(dd.sunset)}</td></tr>
<tr><th>Rahu Kaal / राहु काल</th><td>${fl(dd.rahu[0])} – ${fl(dd.rahu[1])}</td></tr>
<tr><th>Abhijit Muhurat / अभिजीत</th><td>${dd.abhijit ? fl(dd.abhijit[0]) + " – " + fl(dd.abhijit[1]) : "Not observed on Wednesday"}</td></tr>
</tbody></table></div><p class="small">Static snapshot for New Delhi at build time. The live panchang for your city and date loads below when JavaScript is on.</p></div>`;

  const quick = `<div class="related"><h3>More panchang / और पंचांग</h3><a href="/panchang/">Panchang Calendar</a><a href="/month-panchang/">Month Panchang / महीनेवार पंचांग</a><a href="/choghadiya/">Today's Choghadiya</a><a href="/rahu-kaal/">Rahu Kaal</a><a href="/abhijit-muhurat/">Abhijit Muhurat</a></div>`;

  write("/aaj-ka-panchang/", layout({
    urlPath: "/aaj-ka-panchang/", title: `Aaj Ka Panchang – आज का पंचांग, Today's Tithi, Nakshatra, Rahu Kaal | ${BRAND}`,
    description: "Aaj ka panchang (आज का पंचांग) for your city: today's tithi, nakshatra, yoga, karana, sunrise, sunset, moonrise, Rahu Kaal, Abhijit Muhurat. Pick any date, month or year.",
    h1: "Aaj Ka Panchang – आज का पंचांग", crumbLabel: "Aaj ka Panchang",
    bodyHtml: `<div class="pc" id="pc" data-mode="today" data-lang="hi">
<p class="intro">Today's Hindu panchang with tithi, nakshatra, yoga, karana, sunrise, sunset, moonrise and muhurat for your city. Pick any date, month or year. <span lang="hi">आज का पंचांग: तिथि, नक्षत्र, योग, करण, सूर्योदय, चन्द्रोदय, राहु काल और अभिजीत मुहूर्त। किसी भी तारीख, महीने या साल का पंचांग देखें।</span></p>
<div class="tools">${langTool}<label class="fld">📅 Date / तारीख<input type="date" id="pdate" min="1900-01-01" max="2200-12-31"></label><button type="button" class="todaybtn" data-today="1">Today / आज</button>${cityTool}</div>
<section id="pDay" class="pday" aria-live="polite">${snap}</section>
</div>
${yearLinks}${quick}
${faq("Aaj ka Panchang FAQs / अक्सर पूछे जाने वाले प्रश्न", todayFaqs)}
${citiesBlock}`,
    extraScripts: ["/assets/panchang-engine.js", "/assets/panchang.js"], extraJsonLd: [faqSchema(todayFaqs)], defaultCity: "New Delhi, Delhi", lockCity: false,
    related: [["/panchang/", "Panchang Calendar"], ["/month-panchang/", "Month Panchang"], ["/choghadiya/", "Choghadiya Today"]]
  }));

  write("/month-panchang/", layout({
    urlPath: "/month-panchang/", title: `Month Panchang – महीनेवार पंचांग, Tithi, Festivals & Vrat for Every Month | ${BRAND}`,
    description: "Month-wise Hindu panchang (महीनेवार पंचांग) for any month and year: daily tithi, paksha, festivals and vrats, with Amanta and Purnimanta months. Click a date for the full panchang.",
    h1: "Month Panchang – महीनेवार पंचांग", crumbLabel: "Month Panchang",
    bodyHtml: `<div class="pc" id="pc" data-mode="month" data-lang="hi">
<p class="intro">Month-wise Hindu panchang for any month and year with daily tithi, festivals and vrats. <span lang="hi">महीनेवार पंचांग: किसी भी महीने और साल की तिथि, त्योहार और व्रत। तारीख पर क्लिक करके पूरा पंचांग देखें।</span></p>
<div class="tools">${langTool}${cityTool}</div>
<section id="pDay" class="pday" aria-live="polite"><noscript><p>Please enable JavaScript to use the month panchang.</p></noscript></section>
<section id="pMonthView" class="mview"></section>
</div>
${yearLinks}${quick}
${faq("Month Panchang FAQs / अक्सर पूछे जाने वाले प्रश्न", monthFaqs)}
${citiesBlock}`,
    extraScripts: ["/assets/panchang-engine.js", "/assets/panchang.js"], extraJsonLd: [faqSchema(monthFaqs)], defaultCity: "New Delhi, Delhi", lockCity: false,
    related: [["/panchang/", "Panchang Calendar"], ["/aaj-ka-panchang/", "Aaj ka Panchang"], ["/choghadiya/", "Choghadiya Today"]]
  }));

  YEARS.forEach(y => page(`/panchang/${y}/`, y, null));
  const main = YEARS.includes(thisYear) ? thisYear : YEARS[0];
  page("/panchang/", main, `/panchang/${main}/`);
};
