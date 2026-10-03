// Generates /vivah-muhurat/ and /namkaran-muhurat/ from data/muhurat-YYYY.txt.
// Past dates drop out of the "upcoming" tables on every rebuild (daily via GitHub Action),
// and a tiny inline script also hides them in the browser between rebuilds.
const fs = require("fs"), path = require("path");

module.exports = function ({ ROOT, BRAND, layout, write, faqSchema, citiesBlock }) {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const nowIST = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  const D = { adhik: [], abujh: [], vivah: [], namkaran: [], vehicle: [], property: [], business: [], mundan: [] };

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
  const HI_NAK = { Ashwini:"अश्विनी", Rohini:"रोहिणी", Mrigashirsha:"मृगशिरा", Pushya:"पुष्य", "Uttara Phalguni":"उत्तरा फाल्गुनी", Hasta:"हस्त", Swati:"स्वाति", Anuradha:"अनुराधा", Shravana:"श्रवण", Dhanishta:"धनिष्ठा", "Uttara Ashadha":"उत्तराषाढ़ा", "Uttara Bhadrapada":"उत्तराभाद्रपद", Revati:"रेवती", Magha:"मघा", Moola:"मूल" };
  const HI_DAY = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];
  const HI_MONTH = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  const HI_OCC = { "Basant Panchami":"बसंत पंचमी", "Phulera Dooj":"फुलेरा दूज", "Akshaya Tritiya":"अक्षय तृतीया", "Janaki Navami":"जानकी नवमी", "Devutthani Ekadashi":"देवउठनी एकादशी" };
  Object.assign(HI_NAK, { Punarvasu:"पुनर्वसु", Chitra:"चित्रा", Ashlesha:"आश्लेषा", Vishakha:"विशाखा", "Purva Phalguni":"पूर्वा फाल्गुनी", "Purva Bhadrapada":"पूर्वा भाद्रपद", "Purva Ashadha":"पूर्वाषाढ़ा", Mrigashira:"मृगशिरा", Mula:"मूल", Krittika:"कृत्तिका", Bharani:"भरणी", Jyeshtha:"ज्येष्ठा", Shatabhisha:"शतभिषा" });
  const nk = n => n.split(", ").map(x => HI_NAK[x] ? `${x} (${HI_NAK[x]})` : x).join(", ");
  const NAMING_DAYS = [1, 3, 4, 5]; // Mon, Wed, Thu, Fri

  function monthTables(rows, cols, rowFn) {
    const by = {};
    rows.forEach(r => { const k = r.s.slice(0, 7); (by[k] = by[k] || []).push(r); });
    return Object.keys(by).sort().map(k => {
      const [y, m] = k.split("-");
      return `<h3>${MONTH_FULL[+m - 1]} ${y} (${HI_MONTH[+m - 1]})</h3><div class="tbl"><table><thead><tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${by[k].map(rowFn).join("")}</tbody></table></div>`;
    }).join("\n");
  }
  const rowAttr = r => "";
  const hideScript = "";
  const updated = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

  function section(rows, cols, rowFn, emptyMsg) {
    return rows.length ? monthTables(rows, cols, rowFn) : `<p class="sum">${emptyMsg}</p>`;
  }
  const srcNote = `<p class="disc2">Dates and times come from published Hindu panchang data (mPanchang, IST) and were last rebuilt on <b>${updated}</b>. Nakshatra windows can differ by a few minutes between cities, and local traditions differ, so confirm the final date and exact time with your family pandit.</p>`;

  /* ================= VIVAH ================= */
  const vUp = D.vivah.filter(r => !isPast(r));
  const next = vUp[0];
  const vRows = r => `<tr${rowAttr(r)}><td>${range(r)}</td><td>${nk(r.nak)}</td><td>${inAdhik(r) ? "Adhik Maas* (अधिक मास)" : ""}</td></tr>`;
  const hiV = ["विवाह मुहूर्त कैसे तय होता है?", "अबूझ मुहूर्त क्या है?", "अगस्त, सितंबर, अक्टूबर 2026 में विवाह मुहूर्त क्यों नहीं है?", "अधिक मास क्या है और क्या इसमें विवाह होते हैं?", "क्या अलग शहरों में तिथि अलग हो सकती है?", "क्या नक्षत्र की अवधि में अपनी पसंद का समय चुन सकते हैं?"];
  const hiN = ["नामकरण संस्कार कब करना चाहिए?", "नामकरण के लिए कौन से वार शुभ हैं?", "नामकरण के लिए कौन से नक्षत्र शुभ माने जाते हैं?", "किन तिथियों से बचना चाहिए?", "क्या नामकरण में मुहूर्त अनिवार्य है?", "बच्चे का पहला अक्षर कैसे तय होता है?"];
  const vivahFaqs = [
    ["How is a Vivah muhurat decided?", "A pandit usually checks the panchang (tithi, nakshatra, yoga, karana, weekday), the position of Jupiter and Venus, and whether the bride's and groom's kundalis agree. Only then is a date and a time window chosen. Choghadiya is a daily filter on top of that."],
    ["What is Abujh Muhurat?", "Abujh (or Abujh Sawa) days are dates traditionally treated as auspicious on their own, so a wedding is often held without a separate muhurat search. Common examples are Akshaya Tritiya, Basant Panchami, Phulera Dooj and Devutthani Ekadashi."],
    ["Why are there no marriage dates in August, September and October 2026?", "This stretch falls in Chaturmas, the four-month period from Devshayani Ekadashi to Devutthani Ekadashi, when weddings are traditionally not held. In 2026 Devutthani Ekadashi falls on 20 November, which is why the next window opens then."],
    ["What is Adhik Maas and does it affect weddings?", "Adhik Maas is the extra lunar month added about every three years. In 2026 it ran from 17 May to 15 June (Adhik Jyeshtha). Many traditions avoid weddings in this month, so dates inside it are marked with an asterisk in the tables."],
    ["Can the same date differ from city to city?", "Yes. Sunrise, and therefore the start and end of a nakshatra window, shifts with location, and some regions follow a different calendar (Amanta or Purnimanta). Treat the table as a guide and confirm with a local pandit."],
    ["Can I choose a time inside the nakshatra window?", "Usually yes, but the actual lagna (rising sign) and Rahu Kaal on that day matter too. Use the Choghadiya and Rahu Kaal pages on this site to avoid clearly unfavourable hours."]
  ];
  const abujhRows = D.abujh.map(a => `<tr${rowAttr(a)}><td>${dd(a.s)} ${a.s.slice(0, 4)}</td><td>${a.nak} (${HI_OCC[a.nak] || ""})</td></tr>`).join("");
  write("/vivah-muhurat/", layout({
    urlPath: "/vivah-muhurat/", title: `Vivah Muhurat ${lastYear} – विवाह मुहूर्त, Hindu Marriage Dates & Shubh Lagan | ${BRAND}`,
    description: `Vivah muhurat dates for ${lastYear} with nakshatra and timings, Abujh Muhurat days, Chaturmas and Adhik Maas notes. Updated daily.`,
    h1: `Vivah Muhurat ${lastYear} – विवाह मुहूर्त ${lastYear}`, crumbLabel: "Vivah Muhurat",
    bodyHtml: `
${next ? `<div class="sum"><b>Next marriage muhurat / अगला विवाह मुहूर्त:</b> ${range(next)} &middot; ${nk(next.nak)}</div>` : `<div class="sum">No further Vivah muhurat dates are listed for ${lastYear}. ${lastYear + 1} dates will be added once the data file is updated.</div>`}
<p lang="hi"><b>विवाह मुहूर्त</b> पंचांग की तिथि, नक्षत्र, योग और करण देखकर तय किया जाता है, और उसके बाद वर-वधू की कुंडली मिलान किया जाता है। नीचे आज से आगे की विवाह तिथियाँ नक्षत्र सहित दी गई हैं।</p>
<p>A Hindu wedding is not fixed on any random day. The date is picked from the Hindu panchang so that the tithi, nakshatra, yoga and karana are favourable, and families then match this with the couple's kundali. This page lists the marriage windows for ${lastYear}, with the nakshatra that governs each window.</p>
<h2>Marriage muhurat dates ${lastYear} / विवाह मुहूर्त ${lastYear}</h2>
${section(D.vivah, ["Muhurat window / मुहूर्त (IST)", "Nakshatra / नक्षत्र", "Note / टिप्पणी"], vRows, `No Vivah muhurat is listed for ${lastYear}.`)}
<p class="disc2">* Dates marked Adhik Maas fall in the extra lunar month (17 May to 15 June 2026), which many traditions avoid for weddings.</p>
<h2>Abujh Muhurat ${lastYear} / अबूझ मुहूर्त</h2>
<p>Abujh days are treated as self-sufficient auspicious dates. Families that follow this custom may hold a wedding on them without a separate muhurat search, though many still consult a pandit for the exact time.</p>
<div class="tbl"><table><thead><tr><th>Date / तिथि</th><th>Occasion / पर्व</th></tr></thead><tbody>${abujhRows}</tbody></table></div>
<h2>Why some months have no wedding dates / कुछ महीनों में विवाह मुहूर्त क्यों नहीं होते</h2>
<p>Marriages are traditionally paused during Chaturmas, from Devshayani Ekadashi to Devutthani Ekadashi. That is why 2026 has no dates in August, September or October and the season restarts in late November. Dates are also scarce when Jupiter or Venus is set (combust), and during Adhik Maas. A Vivah muhurat therefore has to clear several filters at once, which is why only a handful of windows exist in a year.</p>
<h2>How to use this list / इस सूची का उपयोग कैसे करें</h2>
<p>Start with the dates in the table, then check your own kundali match with a pandit, then pick the exact hour. For the hour, look at the day's Choghadiya (Amrit, Shubh and Labh are favoured) and keep clear of Rahu Kaal. Our <a href="/choghadiya/">Choghadiya</a>, <a href="/rahu-kaal/">Rahu Kaal</a> and <a href="/abhijit-muhurat/">Abhijit Muhurat</a> pages help with that.</p>
<h2 id="faq">Vivah Muhurat FAQs / अक्सर पूछे जाने वाले प्रश्न</h2>
${vivahFaqs.map(([q, a], i) => `<details><summary>${q} / ${hiV[i]}</summary><p>${a}</p></details>`).join("\n")}
${srcNote}${citiesBlock}${hideScript}`,
    extraJsonLd: [faqSchema(vivahFaqs)],
    related: [["/namkaran-muhurat/", "Namkaran Muhurat"], ["/shubh-muhurat/", "Shubh Muhurat Today"], ["/choghadiya/", "Choghadiya Today"]]
  }));

  /* ================= NAMKARAN ================= */
  const nUp = D.namkaran.filter(r => !isPast(r));
  const nextN = nUp[0];
  const nRows = r => `<tr${rowAttr(r)}><td>${range(r)}</td><td>${nk(r.nak)}</td><td>${NAMING_DAYS.includes(U(r.s).getUTCDay()) ? "✓ " : ""}${dayName(r.s)} (${HI_DAY[U(r.s).getUTCDay()]})</td></tr>`;
  const namFaqs = [
    ["When should Namkaran Sanskar be done?", "Traditionally on the 11th day after birth, once the Sutak (birth-related impurity) period ends. Many families do it on the 10th, 12th or 13th day, or later at a convenient time. Ask your family pandit which custom you follow."],
    ["Which days of the week are good for naming a baby?", "Monday, Wednesday, Thursday and Friday are commonly preferred. The tables mark these with a tick, and the weekday is worked out from the actual calendar date."],
    ["Which nakshatras are considered good for Namkaran?", "Commonly listed ones are Ashwini, Rohini, Mrigashirsha, Pushya, Uttara Phalguni, Hasta, Swati, Anuradha, Shravana, Shatabhisha, Uttara Ashadha, Uttara Bhadrapada and Revati. Lists vary slightly between traditions."],
    ["Which tithis should be avoided?", "Rikta tithis (Chaturthi, Navami and Chaturdashi) are generally avoided for auspicious ceremonies. Some sources list them differently, so confirm with your pandit."],
    ["Is a muhurat compulsory for naming?", "Not strictly. Many families simply choose a good day within the window after Sutak ends. A muhurat is a tradition-based preference, not a legal or medical requirement."],
    ["How is the baby's first letter chosen?", "Traditionally from the baby's birth nakshatra and charan, which gives a set of starting syllables. A pandit or a kundali report can tell you the right letters for your baby."]
  ];
  write("/namkaran-muhurat/", layout({
    urlPath: "/namkaran-muhurat/", title: `Namkaran Muhurat ${lastYear} – नामकरण मुहूर्त, Baby Naming Ceremony Dates | ${BRAND}`,
    description: `Namkaran Sanskar muhurat dates for ${lastYear} with nakshatra windows and good weekdays, plus tithi, nakshatra and Sutak guidance. Updated daily.`,
    h1: `Namkaran Muhurat ${lastYear} – नामकरण संस्कार मुहूर्त ${lastYear}`, crumbLabel: "Namkaran Muhurat",
    bodyHtml: `
${nextN ? `<div class="sum"><b>Next Namkaran muhurat / अगला नामकरण मुहूर्त:</b> ${range(nextN)} &middot; ${nk(nextN.nak)}</div>` : `<div class="sum">No further Namkaran dates are listed for ${lastYear}. ${lastYear + 1} dates will be added once the data file is updated.</div>`}
<p lang="hi"><b>नामकरण संस्कार</b> सोलह संस्कारों में से एक है। सामान्यतः यह जन्म के 11वें दिन, सूतक समाप्त होने के बाद किया जाता है, पर परंपराएँ अलग-अलग हैं। शुभ वार: सोम, बुध, गुरु और शुक्र।</p>
<p>Namkaran is the Hindu naming ceremony, one of the sixteen Sanskars. The child's name stays for life, so families like to hold the ceremony at a favourable time. The tables below list nakshatra windows suitable for Namkaran in ${lastYear}.</p>
<h2>Namkaran muhurat dates ${lastYear} / नामकरण मुहूर्त ${lastYear}</h2>
${section(D.namkaran, ["Muhurat window / मुहूर्त (IST)", "Nakshatra / नक्षत्र", "Start day / वार"], nRows, `No Namkaran muhurat is listed for ${lastYear}.`)}
<p class="disc2">✓ marks Monday, Wednesday, Thursday or Friday, the weekdays commonly preferred for naming. Weekdays are calculated from the calendar date.</p>
<h2>When to hold the ceremony / नामकरण कब करें</h2>
<p>The ceremony is usually held after the Sutak period following birth, most commonly around the 11th day, though customs vary. Pick the first suitable window after that, then confirm the exact hour with your pandit.</p>
<h2>Good days, tithis and nakshatras / शुभ वार, तिथि और नक्षत्र</h2>
<p><b>Weekdays:</b> Monday, Wednesday, Thursday and Friday. <b>Nakshatras:</b> Ashwini, Rohini, Mrigashirsha, Pushya, Uttara Phalguni, Hasta, Swati, Anuradha, Shravana, Shatabhisha, Uttara Ashadha, Uttara Bhadrapada and Revati are widely recommended. <b>Tithis:</b> Rikta tithis (Chaturthi, Navami, Chaturdashi) are generally avoided. For the hour itself, prefer Amrit, Shubh or Labh Choghadiya and stay clear of Rahu Kaal. See the <a href="/choghadiya/">Choghadiya</a> and <a href="/rahu-kaal/">Rahu Kaal</a> pages.</p>
<h2 id="faq">Namkaran Muhurat FAQs / अक्सर पूछे जाने वाले प्रश्न</h2>
${namFaqs.map(([q, a], i) => `<details><summary>${q} / ${hiN[i]}</summary><p>${a}</p></details>`).join("\n")}
${srcNote}${citiesBlock}${hideScript}`,
    extraJsonLd: [faqSchema(namFaqs)],
    related: [["/vivah-muhurat/", "Vivah Muhurat"], ["/shubh-muhurat/", "Shubh Muhurat Today"], ["/choghadiya/", "Choghadiya Today"]]
  }));

  /* ================= VEHICLE + PROPERTY ================= */
  const BEST_VEH_NAK = ["Swati", "Punarvasu", "Dhanishta", "Shatabhisha"];
  const VEH_DAYS = [0, 1, 3, 4, 5]; // Sun, Mon, Wed, Thu, Fri
  const nextBox = (rows, en, hi) => { const n = rows.filter(r => !isPast(r))[0]; return n ? `<div class="sum"><b>${en} / ${hi}:</b> ${range(n)} &middot; ${nk(n.nak)}</div>` : ""; };
  const faqBlock = (f, hi) => `<h2 id="faq">FAQs / ${hi}</h2>\n` + f.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n");

  const vehFaqs = [
    ["Which day of the week is best to buy a vehicle?", "Monday, Wednesday, Thursday, Friday and Sunday are commonly preferred. Friday (Venus) is popular for cars, and Sunday is often chosen for two-wheelers. The tables tick these weekdays, calculated from the calendar date."],
    ["Which nakshatras suit a vehicle purchase?", "Swati, Punarvasu, Dhanishta and Shatabhisha are the ones most often named. Other friendly nakshatras are used when these are not available, so a star mark in the table shows the first group."],
    ["Which tithis should I avoid?", "Amavasya (new moon) is avoided. Pratipada, Tritiya, Panchami, Shashthi, Dashami, Ekadashi, Trayodashi and Purnima are generally considered favourable."],
    ["Is Rahu Kaal important when taking delivery?", "Yes. Even on a good date, auspicious tasks such as taking delivery or the first drive are kept out of Rahu Kaal. Check the Rahu Kaal page for your city and pick a clean Choghadiya."],
    ["Which special days are good without a search?", "Akshaya Tritiya, Sarvartha Siddhi Yoga, Guru Pushya, Ravi Pushya and Amrit Siddhi Yoga are traditionally treated as strong days for buying a vehicle."],
    ["Do I need a muhurat for both booking and delivery?", "Most families prefer one for delivery or the first use, since that is when the vehicle is formally taken home and worshipped. Booking can be done earlier."]
  ];
  write("/vehicle-muhurat/", layout({
    urlPath: "/vehicle-muhurat/", title: `Vehicle Purchase Muhurat ${lastYear} – Car & Bike Buying Dates | ${BRAND}`,
    description: `Shubh muhurat dates to buy a car or bike in ${lastYear} with nakshatra windows, best weekdays and tithis, and Rahu Kaal guidance. Updated daily.`,
    h1: `Vehicle Purchase Muhurat ${lastYear} – वाहन खरीद मुहूर्त ${lastYear}`, crumbLabel: "Vehicle Muhurat",
    bodyHtml: `
${nextBox(D.vehicle, "Next vehicle muhurat", "अगला वाहन खरीद मुहूर्त")}
<p lang="hi">नई कार या बाइक की खरीद और डिलीवरी के लिए शुभ नक्षत्र और वार वाले मुहूर्त नीचे दिए गए हैं। डिलीवरी के समय राहु काल से बचें।</p>
<p>Many families like to bring a new car or bike home on a favourable day. The tables below list nakshatra windows suited to a vehicle purchase in ${lastYear}. A star marks the nakshatras most often recommended for vehicles.</p>
<h2>Vehicle purchase muhurat ${lastYear} / वाहन खरीद मुहूर्त ${lastYear}</h2>
${section(D.vehicle, ["Muhurat window / मुहूर्त (IST)", "Nakshatra / नक्षत्र", "Start day / वार"], r => `<tr${rowAttr(r)}><td>${range(r)}</td><td>${BEST_VEH_NAK.includes(r.nak) ? "★ " : ""}${nk(r.nak)}</td><td>${VEH_DAYS.includes(U(r.s).getUTCDay()) ? "✓ " : ""}${dayName(r.s)} / ${HI_DAY[U(r.s).getUTCDay()]}</td></tr>`, `No vehicle muhurat is listed for ${lastYear}.`)}
<p class="disc2">★ best-known vehicle nakshatras (Swati, Punarvasu, Dhanishta, Shatabhisha). ✓ preferred weekday (Sun, Mon, Wed, Thu, Fri).</p>
<h2>What makes a good vehicle muhurat / शुभ वाहन मुहूर्त के नियम</h2>
<p><b>Nakshatra:</b> Swati, Punarvasu, Dhanishta and Shatabhisha are the classic picks. <b>Weekday:</b> Sunday, Monday, Wednesday, Thursday and Friday. <b>Tithi:</b> Pratipada, Tritiya, Panchami, Shashthi, Dashami, Ekadashi, Trayodashi and Purnima; avoid Amavasya. <b>Lagna:</b> movable and dual-sign ascendants (Aries, Cancer, Libra, Capricorn, Gemini, Virgo, Sagittarius, Pisces) are preferred, and the Moon should not sit in the 6th, 8th or 12th house. <b>Special days:</b> Akshaya Tritiya, Sarvartha Siddhi, Guru Pushya, Ravi Pushya and Amrit Siddhi Yoga.</p>
<h2>Delivery day and vehicle puja / डिलीवरी और वाहन पूजा</h2>
<p>After the purchase, most families perform a short puja of the vehicle before first use. Choose an Amrit, Shubh or Labh Choghadiya and keep clear of Rahu Kaal. See <a href="/choghadiya/">today's Choghadiya</a> and <a href="/rahu-kaal/">Rahu Kaal</a>.</p>
${faqBlock(vehFaqs, "अक्सर पूछे जाने वाले प्रश्न")}
${srcNote}${citiesBlock}${hideScript}`,
    extraJsonLd: [faqSchema(vehFaqs)],
    related: [["/property-muhurat/", "Property Muhurat"], ["/vivah-muhurat/", "Vivah Muhurat"], ["/shubh-muhurat/", "Shubh Muhurat Today"]]
  }));

  const propFaqs = [
    ["Which nakshatras are favourable for buying property?", "Fixed (sthira) nakshatras, namely Rohini, Uttara Phalguni, Uttara Ashadha and Uttara Bhadrapada, are the ones most often recommended for land, foundations and construction. Other nakshatras are also used by some pandits, so confirm before booking."],
    ["Which planet is linked to property?", "Mars is the karaka of land and the 4th house of the chart governs home and property. Jupiter and Venus, as benefic planets, are also considered supportive."],
    ["Does the muhurat apply to registration or to booking?", "Families usually pick the muhurat for the registry or the formal agreement, and a separate muhurat for Griha Pravesh (moving in). Booking an advance can be done earlier."],
    ["Why do the windows differ from other panchangs?", "Nakshatra start and end times shift with location, and different texts apply different filters. Treat the table as a guide and confirm with your pandit."],
    ["Do these dates also apply to a flat or a plot?", "Yes, the same type of muhurat is used for a house, flat, plot or shop registration. For a business premises, also see the Business Muhurat page."]
  ];
  write("/property-muhurat/", layout({
    urlPath: "/property-muhurat/", title: `Property Purchase Muhurat ${lastYear} – Home, Flat & Land Registration Dates | ${BRAND}`,
    description: `Shubh muhurat dates for property, flat and land registration in ${lastYear} with nakshatra windows and guidance. Updated daily.`,
    h1: `Property Purchase Muhurat ${lastYear} – संपत्ति खरीद मुहूर्त ${lastYear}`, crumbLabel: "Property Muhurat",
    bodyHtml: `
${nextBox(D.property, "Next property muhurat", "अगला संपत्ति खरीद मुहूर्त")}
<p lang="hi">घर, फ्लैट या ज़मीन की रजिस्ट्री और खरीद के लिए शुभ नक्षत्र वाले मुहूर्त नीचे दिए गए हैं। अंतिम तिथि पंडित से पक्की कर लें।</p>
<p>Buying a home is one of the biggest decisions in a family, and many people prefer to sign or register on a favourable day. The tables below list nakshatra windows for property purchase and registration in ${lastYear}.</p>
<h2>Property purchase muhurat ${lastYear} / संपत्ति खरीद मुहूर्त ${lastYear}</h2>
${section(D.property, ["Muhurat window / मुहूर्त (IST)", "Nakshatra / नक्षत्र", "Start day / वार"], r => `<tr${rowAttr(r)}><td>${range(r)}</td><td>${nk(r.nak)}</td><td>${dayName(r.s)} / ${HI_DAY[U(r.s).getUTCDay()]}</td></tr>`, `No property muhurat is listed for ${lastYear}.`)}
<h2>Choosing a date / तिथि कैसे चुनें</h2>
<p>Start with the windows above, then check the tithi, the weekday and the family's kundali with a pandit. For the signing hour itself, prefer Amrit, Shubh or Labh Choghadiya and avoid Rahu Kaal. A separate muhurat is usually taken for Griha Pravesh. Our <a href="/choghadiya/">Choghadiya</a>, <a href="/rahu-kaal/">Rahu Kaal</a> and <a href="/abhijit-muhurat/">Abhijit Muhurat</a> pages help with the hour.</p>
${faqBlock(propFaqs, "अक्सर पूछे जाने वाले प्रश्न")}
${srcNote}${citiesBlock}${hideScript}`,
    extraJsonLd: [faqSchema(propFaqs)],
    related: [["/vehicle-muhurat/", "Vehicle Muhurat"], ["/vivah-muhurat/", "Vivah Muhurat"], ["/shubh-muhurat/", "Shubh Muhurat Today"]]
  }));

  /* ================= BUSINESS + MUNDAN ================= */
  const BIZ_DAY = 4; // Thursday (Jupiter)
  const bizFaqs = [
    [
      "Which day of the week is best to open a shop or start a business?",
      "Thursday is the day most often recommended, because it belongs to Jupiter, the planet of growth and prosperity. The tables tick Thursdays, worked out from the calendar date."
    ],
    [
      "Which nakshatras are considered good for starting a business?",
      "Pushya, Ashwini, Chitra, Revati and Anuradha are the ones named most often. The tithi of the day also matters, so a pandit usually looks at both before confirming a time."
    ],
    [
      "Which planets are linked with business?",
      "Mercury is the main business planet because it governs trade, communication and intelligence. Jupiter (growth) and Venus (wealth) are the other supporting planets."
    ],
    [
      "Which houses of the birth chart matter for business?",
      "The 10th house stands for career and achievement, and the 7th house for partnerships. Benefic planets in the 2nd, 5th, 9th, 10th or 11th houses are read as supportive."
    ],
    [
      "How do I find a business muhurat for today?",
      "Check the day's panchang for tithi, nakshatra and yoga, or ask a pandit. For the hour, Abhijit Muhurat is the best-known window, and Amrit, Shubh or Labh Choghadiya are good picks. Keep clear of Rahu Kaal."
    ]
  ];
  write("/business-muhurat/", layout({
    urlPath: "/business-muhurat/", title: `Business & Shop Opening Muhurat ${lastYear} – दुकान उद्घाटन मुहूर्त | ${BRAND}`,
    description: `Shubh muhurat dates to open a shop or start a new business in ${lastYear} with nakshatra windows, best weekday and Rahu Kaal guidance. Updated daily.`,
    h1: `Business & Shop Opening Muhurat ${lastYear} – नया व्यापार मुहूर्त ${lastYear}`, crumbLabel: "Business Muhurat",
    bodyHtml: `
${nextBox(D.business, "Next business muhurat", "अगला व्यापार शुरू करने का मुहूर्त")}
<p lang="hi">नई दुकान खोलने या नया व्यापार शुरू करने के लिए शुभ नक्षत्र और समय नीचे दिए गए हैं। उद्घाटन का समय राहु काल से बाहर रखें और अंतिम समय पंडित से पक्का कर लें।</p>
<p>Many people open a shop, office or new venture on a favourable day. The tables below list the muhurat windows for ${lastYear}, month by month. Some dates have two windows in the same day.</p>
<h2>Business muhurat ${lastYear} / व्यापार मुहूर्त ${lastYear}</h2>
${section(D.business, ["Muhurat window / मुहूर्त (IST)", "Nakshatra / नक्षत्र", "Day / वार"], r => `<tr${rowAttr(r)}><td>${range(r)}</td><td>${nk(r.nak)}</td><td>${U(r.s).getUTCDay() === BIZ_DAY ? "✓ " : ""}${dayName(r.s)} / ${HI_DAY[U(r.s).getUTCDay()]}</td></tr>`, `No business muhurat is listed for ${lastYear}.`)}
<p class="disc2">✓ marks Thursday, the weekday most often preferred for starting a business.</p>
<h2>What makes a good business muhurat / शुभ व्यापार मुहूर्त के नियम</h2>
<p><b>Weekday:</b> Thursday (Jupiter). <b>Nakshatra:</b> Pushya, Ashwini, Chitra, Revati and Anuradha are the classic picks. <b>Planets:</b> Mercury for trade, with Jupiter and Venus supporting. <b>Birth chart:</b> the 10th house (career) and 7th house (partnership), with benefics in the 2nd, 5th, 9th, 10th or 11th. <b>Hour:</b> Abhijit Muhurat or an Amrit, Shubh or Labh Choghadiya, outside Rahu Kaal.</p>
<h2>Picking the opening hour / उद्घाटन का समय</h2>
<p>After you choose a date, pick the hour from that day's slots. Our <a href="/abhijit-muhurat/">Abhijit Muhurat</a>, <a href="/choghadiya/">Choghadiya</a> and <a href="/rahu-kaal/">Rahu Kaal</a> pages show the exact times for your city.</p>
${faqBlock(bizFaqs, "अक्सर पूछे जाने वाले प्रश्न")}
${srcNote}${citiesBlock}${hideScript}`,
    extraJsonLd: [faqSchema(bizFaqs)],
    related: [[ "/property-muhurat/", "Property Muhurat" ], [ "/vehicle-muhurat/", "Vehicle Muhurat" ], [ "/abhijit-muhurat/", "Abhijit Muhurat" ]]
  }));

  const MUN_DAYS = [1, 3, 4, 5]; // Mon, Wed, Thu, Fri
  const munFaqs = [
    [
      "What is Mundan Sanskar?",
      "Mundan, also called Chudakarana, is the ceremony in which a child's head is shaved for the first time. It is counted among the sixteen Hindu Sanskars and is traditionally done at an auspicious time."
    ],
    [
      "Why is Mundan performed?",
      "Traditionally it is seen as cleansing the child of the past and welcoming good fortune. Many families also value it for practical reasons, such as even hair growth afterwards."
    ],
    [
      "At what age is Mundan done?",
      "Customs differ by family and region. It is commonly done in the first, third or fifth year, though some families choose other ages. Ask your family pandit which tradition you follow."
    ],
    [
      "Why are there no Mundan dates from August to December 2026?",
      "The source panchang lists no Mundan muhurat for those months. Mundan is generally not done in Chaturmas, and other filters (Jupiter or Venus being set, for example) also remove dates. Consult a pandit for any special exception."
    ],
    [
      "Can I set the time myself within a nakshatra window?",
      "Usually yes, but pick the hour carefully: prefer Amrit, Shubh or Labh Choghadiya and avoid Rahu Kaal. Some windows run past midnight, so check the end date in the table."
    ]
  ];
  write("/mundan-muhurat/", layout({
    urlPath: "/mundan-muhurat/", title: `Mundan Muhurat ${lastYear} – मुंडन मुहूर्त, Chudakarana Sanskar Dates | ${BRAND}`,
    description: `Mundan (Chudakarana) muhurat dates for ${lastYear} with nakshatra windows and good weekdays, plus what the ceremony means. Updated daily.`,
    h1: `Mundan Muhurat ${lastYear} – मुंडन मुहूर्त ${lastYear}`, crumbLabel: "Mundan Muhurat",
    bodyHtml: `
${nextBox(D.mundan, "Next Mundan muhurat", "अगला मुंडन मुहूर्त")}
<p lang="hi"><b>मुंडन संस्कार</b> (चूड़ाकरण) सोलह संस्कारों में से एक है, जिसमें बच्चे के सिर के बाल पहली बार उतारे जाते हैं। इसे शुभ मुहूर्त में करने की परंपरा है। नीचे 2026 के मुंडन मुहूर्त नक्षत्र सहित दिए गए हैं।</p>
<p>Mundan is the child's first haircut ceremony and one of the sixteen Hindu Sanskars. Families choose a favourable date for it, and the windows below show when a suitable nakshatra is running in ${lastYear}. Some windows end after midnight, and the end date is shown.</p>
<h2>Mundan muhurat ${lastYear} / मुंडन मुहूर्त ${lastYear}</h2>
${section(D.mundan, ["Muhurat window / मुहूर्त (IST)", "Nakshatra / नक्षत्र", "Start day / वार"], r => `<tr${rowAttr(r)}><td>${range(r)}</td><td>${nk(r.nak)}</td><td>${MUN_DAYS.includes(U(r.s).getUTCDay()) ? "✓ " : ""}${dayName(r.s)} / ${HI_DAY[U(r.s).getUTCDay()]}</td></tr>`, `No Mundan muhurat is listed for ${lastYear}.`)}
<p class="disc2"><b>August to December ${lastYear} / अगस्त से दिसंबर:</b> no Mundan muhurat is listed for these months, so consult an astrologer if you need a date. ✓ marks Monday, Wednesday, Thursday or Friday, weekdays commonly preferred for Mundan. Weekdays are calculated from the calendar date.</p>
<h2>Why Mundan matters / मुंडन का महत्व</h2>
<p>In Hindu tradition the ceremony symbolises a fresh start for the child, and a good muhurat is believed to bring wisdom, strength and good fortune. Because a child's horoscope also matters, many families confirm the final date with an astrologer using the child's birth details.</p>
<h2>Choosing the hour / समय कैसे चुनें</h2>
<p>Once you have a date, pick an Amrit, Shubh or Labh Choghadiya and stay out of Rahu Kaal. See <a href="/choghadiya/">today's Choghadiya</a> and <a href="/rahu-kaal/">Rahu Kaal</a> for your city.</p>
${faqBlock(munFaqs, "अक्सर पूछे जाने वाले प्रश्न")}
${srcNote}${citiesBlock}${hideScript}`,
    extraJsonLd: [faqSchema(munFaqs)],
    related: [[ "/namkaran-muhurat/", "Namkaran Muhurat" ], [ "/vivah-muhurat/", "Vivah Muhurat" ], [ "/choghadiya/", "Choghadiya Today" ]]
  }));
};
