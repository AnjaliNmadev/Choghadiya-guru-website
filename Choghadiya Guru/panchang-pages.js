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

  const yearNav = (cur) => `<nav class="ynav" aria-label="Choose year">` + YEARS.map(y => `<a href="/panchang/${y}/"${y === cur ? ' class="act" aria-current="page"' : ""}>${y}</a>`).join("") + `</nav>`;

  function page(urlPath, y, canonicalPath) {
    const F = P.festivals(y, LAT, LON);
    const body = `
<div class="pc" id="pc" data-year="${y}" data-lang="hi">
<p class="intro">Hindu Panchang calendar ${y} with festivals, vrats, tithi, nakshatra, Rahu Kaal and muhurat for every day. <span lang="hi">हिन्दू पंचांग कैलेंडर ${y}: त्योहार, व्रत, तिथि, नक्षत्र और हर दिन का पूरा पंचांग। किसी भी तारीख पर क्लिक करें।</span></p>
${yearNav(y)}
<div class="tools">
<div class="lang" role="group" aria-label="Language"><button type="button" data-lang="hi" aria-pressed="true">हिन्दी</button><button type="button" data-lang="en" aria-pressed="false">English</button></div>
<label class="fld">📍 Location<input id="city" list="cl" autocomplete="off" placeholder="Enter city name"><datalist id="cl"></datalist></label>
</div>
<section id="pDay" class="pday" aria-live="polite"><noscript><p>Please enable JavaScript to see the daily panchang for a date. The calendar and festival list below work without it.</p></noscript></section>
<div class="plegend"><span><i class="lf"></i><b class="hi">त्योहार / व्रत</b><b class="en">Festival / vrat</b></span><span><i class="lw"></i><b class="hi">शनिवार–रविवार</b><b class="en">Weekend</b></span><span><i class="lt"></i><b class="hi">आज</b><b class="en">Today</b></span></div>
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

  YEARS.forEach(y => page(`/panchang/${y}/`, y, null));
  const main = YEARS.includes(thisYear) ? thisYear : YEARS[0];
  page("/panchang/", main, `/panchang/${main}/`);
};
