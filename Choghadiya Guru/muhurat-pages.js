// Generates /vivah-muhurat/ and /namkaran-muhurat/ from data/muhurat-YYYY.txt.
// Past dates drop out of the "upcoming" tables on every rebuild (daily via GitHub Action),
// and a tiny inline script also hides them in the browser between rebuilds.
const fs = require("fs"), path = require("path");

module.exports = function ({ ROOT, BRAND, layout, write, faqSchema, citiesBlock }) {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const nowIST = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  const D = { adhik: [], abujh: [], vivah: [], namkaran: [] };

  // ---- load every data/muhurat-YYYY.txt ----
  const dir = path.join(ROOT, "data");
  const years = [];
  for (const f of fs.readdirSync(dir).filter(f => /^muhurat-\d{4}\.txt$/.test(f)).sort()) {
    const y = f.match(/\d{4}/)[0]; years.push(+y);
    let sec = null;
    for (const raw of fs.readFileSync(path.join(dir, f), "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line[0] === "#") continue;
      if (line[0] === "[") { sec = line.slice(1, -1); continue; }
      let m;
      if ((m = line.match(/^(\d\d)-(\d\d) (\d\d:\d\d) > (\d\d)-(\d\d) (\d\d:\d\d) (.+)$/))) {
        D[sec].push({ s: `${y}-${m[1]}-${m[2]}T${m[3]}`, e: `${y}-${m[4]}-${m[5]}T${m[6]}`, nak: m[7] });
      } else if ((m = line.match(/^(\d\d)-(\d\d) > (\d\d)-(\d\d) (.+)$/))) {
        D.adhik.push({ s: `${y}-${m[1]}-${m[2]}T00:00`, e: `${y}-${m[3]}-${m[4]}T23:59`, nak: m[5] });
      } else if ((m = line.match(/^(\d\d)-(\d\d) (.+)$/))) {
        D.abujh.push({ s: `${y}-${m[1]}-${m[2]}T00:00`, e: `${y}-${m[1]}-${m[2]}T23:59`, nak: m[3] });
      }
    }
  }
  const lastYear = Math.max(...years);
  const U = d => new Date(d + ":00Z"); // treat string as wall-clock; always read with getUTC*
  const dayName = s => DAYS[U(s).getUTCDay()];
  const dd = s => `${dayName(s)}, ${+s.slice(8, 10)} ${MONTHS[+s.slice(5, 7) - 1]}`;
  const tm = s => { let h = +s.slice(11, 13); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${s.slice(14, 16)} ${ap}`; };
  const range = r => `${dd(r.s)}, ${tm(r.s)} → ${r.s.slice(0, 10) === r.e.slice(0, 10) ? "" : dd(r.e) + ", "}${tm(r.e)}`;
  const isPast = r => r.e < nowIST;
  const inAdhik = r => D.adhik.some(a => r.s.slice(0, 10) <= a.e.slice(0, 10) && r.e.slice(0, 10) >= a.s.slice(0, 10));
  const NAMING_DAYS = [1, 3, 4, 5]; // Mon, Wed, Thu, Fri

  function monthTables(rows, cols, rowFn) {
    const by = {};
    rows.forEach(r => { const k = r.s.slice(0, 7); (by[k] = by[k] || []).push(r); });
    return Object.keys(by).sort().map(k => {
      const [y, m] = k.split("-");
      return `<h3>${MONTH_FULL[+m - 1]} ${y}</h3><div class="tbl"><table><thead><tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${by[k].map(rowFn).join("")}</tbody></table></div>`;
    }).join("\n");
  }
  const rowAttr = r => ` data-e="${r.e}"`;
  const hideScript = `<script>(function(){try{var n=new Date(Date.now()+19800000).toISOString().slice(0,16);document.querySelectorAll("tr[data-e]").forEach(function(r){if(r.dataset.e<n)r.style.display="none"})}catch(e){}})();</script>`;
  const updated = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

  function section(rows, cols, rowFn, emptyMsg, archiveTitle) {
    const up = rows.filter(r => !isPast(r)), past = rows.filter(isPast);
    return (up.length ? monthTables(up, cols, rowFn) : `<p class="sum">${emptyMsg}</p>`) +
      (past.length ? `<details><summary>${archiveTitle} (${past.length})</summary>${monthTables(past, cols, rowFn)}</details>` : "");
  }
  const srcNote = `<p class="disc2">Dates and times come from published Hindu panchang data (mPanchang, IST) and were last rebuilt on <b>${updated}</b>. Nakshatra windows can differ by a few minutes between cities, and local traditions differ, so confirm the final date and exact time with your family pandit.</p>`;

  /* ================= VIVAH ================= */
  const vUp = D.vivah.filter(r => !isPast(r));
  const next = vUp[0];
  const vRows = r => `<tr${rowAttr(r)}><td>${range(r)}</td><td>${r.nak}</td><td>${inAdhik(r) ? "Adhik Maas*" : ""}</td></tr>`;
  const vivahFaqs = [
    ["How is a Vivah muhurat decided?", "A pandit usually checks the panchang (tithi, nakshatra, yoga, karana, weekday), the position of Jupiter and Venus, and whether the bride's and groom's kundalis agree. Only then is a date and a time window chosen. Choghadiya is a daily filter on top of that."],
    ["What is Abujh Muhurat?", "Abujh (or Abujh Sawa) days are dates traditionally treated as auspicious on their own, so a wedding is often held without a separate muhurat search. Common examples are Akshaya Tritiya, Basant Panchami, Phulera Dooj and Devutthani Ekadashi."],
    ["Why are there no marriage dates in August, September and October 2026?", "This stretch falls in Chaturmas, the four-month period from Devshayani Ekadashi to Devutthani Ekadashi, when weddings are traditionally not held. In 2026 Devutthani Ekadashi falls on 20 November, which is why the next window opens then."],
    ["What is Adhik Maas and does it affect weddings?", "Adhik Maas is the extra lunar month added about every three years. In 2026 it ran from 17 May to 15 June (Adhik Jyeshtha). Many traditions avoid weddings in this month, so dates inside it are marked with an asterisk in the tables."],
    ["Can the same date differ from city to city?", "Yes. Sunrise, and therefore the start and end of a nakshatra window, shifts with location, and some regions follow a different calendar (Amanta or Purnimanta). Treat the table as a guide and confirm with a local pandit."],
    ["Can I choose a time inside the nakshatra window?", "Usually yes, but the actual lagna (rising sign) and Rahu Kaal on that day matter too. Use the Choghadiya and Rahu Kaal pages on this site to avoid clearly unfavourable hours."]
  ];
  const abujhRows = D.abujh.map(a => `<tr${rowAttr(a)}><td>${dd(a.s)} ${a.s.slice(0, 4)}</td><td>${a.nak}</td></tr>`).join("");
  write("/vivah-muhurat/", layout({
    urlPath: "/vivah-muhurat/", title: `Vivah Muhurat ${lastYear} – Hindu Marriage Dates & Shubh Lagan Calendar | ${BRAND}`,
    description: `Upcoming Vivah muhurat dates for ${lastYear} with nakshatra and timings, Abujh Muhurat days, Chaturmas and Adhik Maas notes. Updated daily.`,
    h1: `Vivah Muhurat ${lastYear} – Shubh Lagan Dates`, crumbLabel: "Vivah Muhurat",
    bodyHtml: `
${next ? `<div class="sum"><b>Next marriage muhurat:</b> ${range(next)} &middot; ${next.nak} nakshatra</div>` : `<div class="sum">No further Vivah muhurat dates are listed for ${lastYear}. ${lastYear + 1} dates will be added once the data file is updated.</div>`}
<p>A Hindu wedding is not fixed on any random day. The date is picked from the Hindu panchang so that the tithi, nakshatra, yoga and karana are favourable, and families then match this with the couple's kundali. This page lists the marriage windows for ${lastYear}, starting from today, with the nakshatra that governs each window.</p>
<h2>Upcoming marriage muhurat dates</h2>
${section(D.vivah, ["Muhurat window (IST)", "Nakshatra", "Note"], vRows, `No upcoming Vivah muhurat is listed for the rest of ${lastYear}.`, "Past dates this year")}
<p class="disc2">* Dates marked Adhik Maas fall in the extra lunar month (17 May to 15 June 2026), which many traditions avoid for weddings.</p>
<h2>Abujh Muhurat ${lastYear}</h2>
<p>Abujh days are treated as self-sufficient auspicious dates. Families that follow this custom may hold a wedding on them without a separate muhurat search, though many still consult a pandit for the exact time.</p>
<div class="tbl"><table><thead><tr><th>Date</th><th>Occasion</th></tr></thead><tbody>${abujhRows}</tbody></table></div>
<h2>Why some months have no wedding dates</h2>
<p>Marriages are traditionally paused during Chaturmas, from Devshayani Ekadashi to Devutthani Ekadashi. That is why 2026 has no dates in August, September or October and the season restarts in late November. Dates are also scarce when Jupiter or Venus is set (combust), and during Adhik Maas. A Vivah muhurat therefore has to clear several filters at once, which is why only a handful of windows exist in a year.</p>
<h2>How to use this list</h2>
<p>Start with the dates in the table, then check your own kundali match with a pandit, then pick the exact hour. For the hour, look at the day's Choghadiya (Amrit, Shubh and Labh are favoured) and keep clear of Rahu Kaal. Our <a href="/choghadiya/">Choghadiya</a>, <a href="/rahu-kaal/">Rahu Kaal</a> and <a href="/abhijit-muhurat/">Abhijit Muhurat</a> pages help with that.</p>
<h2 id="faq">Vivah Muhurat FAQs</h2>
${vivahFaqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}
${srcNote}${citiesBlock}${hideScript}`,
    extraJsonLd: [faqSchema(vivahFaqs)],
    related: [["/namkaran-muhurat/", "Namkaran Muhurat"], ["/shubh-muhurat/", "Shubh Muhurat Today"], ["/choghadiya/", "Choghadiya Today"]]
  }));

  /* ================= NAMKARAN ================= */
  const nUp = D.namkaran.filter(r => !isPast(r));
  const nextN = nUp[0];
  const nRows = r => `<tr${rowAttr(r)}><td>${range(r)}</td><td>${r.nak}</td><td>${NAMING_DAYS.includes(U(r.s).getUTCDay()) ? "✓ " : ""}${dayName(r.s)}</td></tr>`;
  const namFaqs = [
    ["When should Namkaran Sanskar be done?", "Traditionally on the 11th day after birth, once the Sutak (birth-related impurity) period ends. Many families do it on the 10th, 12th or 13th day, or later at a convenient time. Ask your family pandit which custom you follow."],
    ["Which days of the week are good for naming a baby?", "Monday, Wednesday, Thursday and Friday are commonly preferred. The tables mark these with a tick, and the weekday is worked out from the actual calendar date."],
    ["Which nakshatras are considered good for Namkaran?", "Commonly listed ones are Ashwini, Rohini, Mrigashirsha, Pushya, Uttara Phalguni, Hasta, Swati, Anuradha, Shravana, Shatabhisha, Uttara Ashadha, Uttara Bhadrapada and Revati. Lists vary slightly between traditions."],
    ["Which tithis should be avoided?", "Rikta tithis (Chaturthi, Navami and Chaturdashi) are generally avoided for auspicious ceremonies. Some sources list them differently, so confirm with your pandit."],
    ["Is a muhurat compulsory for naming?", "Not strictly. Many families simply choose a good day within the window after Sutak ends. A muhurat is a tradition-based preference, not a legal or medical requirement."],
    ["How is the baby's first letter chosen?", "Traditionally from the baby's birth nakshatra and charan, which gives a set of starting syllables. A pandit or a kundali report can tell you the right letters for your baby."]
  ];
  write("/namkaran-muhurat/", layout({
    urlPath: "/namkaran-muhurat/", title: `Namkaran Muhurat ${lastYear} – Baby Naming Ceremony Dates | ${BRAND}`,
    description: `Upcoming Namkaran Sanskar muhurat dates for ${lastYear} with nakshatra windows and good weekdays, plus tithi, nakshatra and Sutak guidance. Updated daily.`,
    h1: `Namkaran Muhurat ${lastYear} – Baby Naming Dates`, crumbLabel: "Namkaran Muhurat",
    bodyHtml: `
${nextN ? `<div class="sum"><b>Next Namkaran muhurat:</b> ${range(nextN)} &middot; ${nextN.nak} nakshatra</div>` : `<div class="sum">No further Namkaran dates are listed for ${lastYear}. ${lastYear + 1} dates will be added once the data file is updated.</div>`}
<p>Namkaran is the Hindu naming ceremony, one of the sixteen Sanskars. The child's name stays for life, so families like to hold the ceremony at a favourable time. The tables below list nakshatra windows suitable for Namkaran in ${lastYear}, starting from today.</p>
<h2>Upcoming Namkaran muhurat dates</h2>
${section(D.namkaran, ["Muhurat window (IST)", "Nakshatra", "Start day"], nRows, `No upcoming Namkaran muhurat is listed for the rest of ${lastYear}.`, "Past dates this year")}
<p class="disc2">✓ marks Monday, Wednesday, Thursday or Friday, the weekdays commonly preferred for naming. Weekdays are calculated from the calendar date.</p>
<h2>When to hold the ceremony</h2>
<p>The ceremony is usually held after the Sutak period following birth, most commonly around the 11th day, though customs vary. Pick the first suitable window after that, then confirm the exact hour with your pandit.</p>
<h2>Good days, tithis and nakshatras</h2>
<p><b>Weekdays:</b> Monday, Wednesday, Thursday and Friday. <b>Nakshatras:</b> Ashwini, Rohini, Mrigashirsha, Pushya, Uttara Phalguni, Hasta, Swati, Anuradha, Shravana, Shatabhisha, Uttara Ashadha, Uttara Bhadrapada and Revati are widely recommended. <b>Tithis:</b> Rikta tithis (Chaturthi, Navami, Chaturdashi) are generally avoided. For the hour itself, prefer Amrit, Shubh or Labh Choghadiya and stay clear of Rahu Kaal. See the <a href="/choghadiya/">Choghadiya</a> and <a href="/rahu-kaal/">Rahu Kaal</a> pages.</p>
<h2 id="faq">Namkaran Muhurat FAQs</h2>
${namFaqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}
${srcNote}${citiesBlock}${hideScript}`,
    extraJsonLd: [faqSchema(namFaqs)],
    related: [["/vivah-muhurat/", "Vivah Muhurat"], ["/shubh-muhurat/", "Shubh Muhurat Today"], ["/choghadiya/", "Choghadiya Today"]]
  }));
};
