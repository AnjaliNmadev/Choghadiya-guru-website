// Generates 8 vrat sections, each with a hub page and one page per year in YEARS:
//   /purnima-vrat/   /purnima-vrat/2027/   ...
//   /amavasya-dates/ /ekadashi-vrat/       /pradosh-vrat/
//   /sankashti-chaturthi/  /vinayaka-chaturthi/  /sankranti-dates/  /satyanarayan-puja/
// plus the /vrats/ index page that links to all of them.
// All dates and tithi timings come from vrat-calc.js (panchang-engine astronomy, New Delhi, IST).
// Nothing is typed in by hand: add a year to YEARS in build.js and its pages appear on the next build.
const V = require("./vrat-calc.js");
const P = require("./assets/panchang-engine.js");

module.exports = function ({ BRAND, layout, write, faqSchema, citiesBlock, YEARS }) {
  const nowIST = new Date(Date.now() + 5.5 * 3600e3);
  const today = nowIST.toISOString().slice(0, 10), thisYear = +today.slice(0, 4);
  const HUB_Y = YEARS.includes(thisYear) ? thisYear : YEARS[YEARS.length - 1];
  const MONF = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const HI_MONTH = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  const tm = iso => { let h = +iso.slice(11, 13); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${iso.slice(14, 16)} ${ap}`; };
  const dm = iso => `${+iso.slice(8, 10)} ${MONF[+iso.slice(5, 7) - 1].slice(0, 3)}`;
  const fdt = iso => `${dm(iso)}, ${tm(iso)}`;
  const dlong = d => `${+d.slice(8, 10)} ${MONF[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`;
  const wdOf = d => new Date(d + "T00:00:00Z").getUTCDay();
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  const DATA = {}, FEST = {};
  YEARS.forEach(y => { DATA[y] = V.compute(y); FEST[y] = P.festivals(y, 28.61, 77.21); });
  const ALL = t => [].concat(...YEARS.map(y => DATA[y][t]));
  const firstUpcoming = t => ALL(t).filter(r => r.date >= today)[0];

  // named festivals (Hanuman Jayanti, Guru Purnima, Dhanteras, ...) that fall on a vrat date
  const festOn = date => {
    const [y, m, d] = date.split("-").map(Number);
    return ((FEST[y] || {})[m + "-" + d] || []).filter(o => o.id && !o.civil && !o.sank);
  };
  const festHtml = (date, skip) => { const f = festOn(date).filter(o => !(skip || []).includes(o.id)); return f.length ? `<br><small>${f.map(o => `${esc(o.en)} / ${esc(o.hi)}`).join(" · ")}</small>` : ""; };

  const SPEC = {
    purnima: {
      slug: "/purnima-vrat/", en: "Purnima", hi: "पूर्णिमा", emoji: "🌕", file: "Purnima Vrat",
      label: r => `<b>${r.month.en} Purnima / ${r.month.hi} पूर्णिमा</b>`,
      cols: ["Date / तिथि", "Day / वार", "Purnima / पूर्णिमा व्रत", "Purnima tithi (IST) / तिथि समय"],
      cells: r => [`<b>${r.month.en} Purnima / ${r.month.hi} पूर्णिमा</b>${festHtml(r.date)}`, tithiCell(r.run)]
    },
    amavasya: {
      slug: "/amavasya-dates/", en: "Amavasya", hi: "अमावस्या", emoji: "🌑", file: "Amavasya",
      cols: ["Date / तिथि", "Day / वार", "Amavasya / अमावस्या", "Amavasya tithi (IST) / तिथि समय"],
      cells: r => {
        const wd = wdOf(r.date), tag = wd === 1 ? "Somvati Amavasya / सोमवती अमावस्या" : wd === 6 ? "Shani Amavasya / शनि अमावस्या" : "";
        const f = festHtml(r.date);
        return [`<b>${r.month.en} Amavasya / ${r.month.hi} अमावस्या</b>${tag ? `<br><small>${tag}</small>` : ""}${f}`, tithiCell(r.run)];
      }
    },
    ekadashi: {
      slug: "/ekadashi-vrat/", en: "Ekadashi", hi: "एकादशी", emoji: "🪷", file: "Ekadashi Vrat",
      cols: ["Date / तिथि", "Day / वार", "Ekadashi / एकादशी", "Ekadashi tithi (IST) / तिथि समय", "Parana (next day) / पारण"],
      cells: r => [`<b>${r.en} / ${r.hi}</b><br><small>${r.paksha === "S" ? "Shukla Paksha / शुक्ल पक्ष" : "Krishna Paksha / कृष्ण पक्ष"}</small>${festHtml(r.date)}`, tithiCell(r.run),
        r.parana ? `${dm(r.parana.s)}, ${tm(r.parana.s)} – ${tm(r.parana.e)}<br><small>Dwadashi ends ${fdt(r.parana.dwEnd)}</small>` : "—"]
    },
    pradosh: {
      slug: "/pradosh-vrat/", en: "Pradosh", hi: "प्रदोष", emoji: "🔱", file: "Pradosh Vrat",
      cols: ["Date / तिथि", "Day / वार", "Pradosh Vrat / प्रदोष व्रत", "Pradosh Kaal (IST) / प्रदोष काल", "Trayodashi tithi (IST) / त्रयोदशी"],
      cells: r => {
        const T = [["Ravi (Bhanu) Pradosh / रवि प्रदोष"], ["Som Pradosh / सोम प्रदोष"], ["Bhauma Pradosh / भौम प्रदोष"], ["Budha Pradosh / बुध प्रदोष"], ["Guru Pradosh / गुरु प्रदोष"], ["Shukra Pradosh / शुक्र प्रदोष"], ["Shani Pradosh / शनि प्रदोष"]][r.wd][0];
        return [`<b>${T}</b><br><small>${r.paksha === "S" ? "Shukla Paksha / शुक्ल पक्ष" : "Krishna Paksha / कृष्ण पक्ष"}</small>${festHtml(r.date)}`,
          `${tm(r.pradosh.s)} – ${tm(r.pradosh.e)}`, tithiCell(r.run)];
      }
    }
  };
  SPEC.sankashti = {
    slug: "/sankashti-chaturthi/", en: "Sankashti Chaturthi", hi: "संकष्टी चतुर्थी", emoji: "🐘", file: "Sankashti Chaturthi",
    cols: ["Date / तिथि", "Day / वार", "Sankashti Chaturthi / संकष्टी चतुर्थी", "Moonrise (Delhi) / चंद्रोदय", "Chaturthi tithi (IST) / चतुर्थी तिथि"],
    cells: r => [`<b>${r.en} / ${r.hi}</b><br><small>${r.month.en} Krishna Paksha / ${r.month.hi} कृष्ण पक्ष</small>${festHtml(r.date, ["karwa"])}`,
      r.moonrise ? `<b>${tm(r.moonrise)}</b><br><small>Arghya to the Moon</small>` : "—", tithiCell(r.run)]
  };
  SPEC.vinayaka = {
    slug: "/vinayaka-chaturthi/", en: "Vinayaka Chaturthi", hi: "विनायक चतुर्थी", emoji: "🪔", file: "Vinayaka Chaturthi",
    cols: ["Date / तिथि", "Day / वार", "Vinayaka Chaturthi / विनायक चतुर्थी", "Puja muhurat (Madhyahna) / पूजा मुहूर्त", "Chaturthi tithi (IST) / चतुर्थी तिथि"],
    cells: r => [`<b>${r.en} / ${r.hi}</b><br><small>${r.month.en} Shukla Paksha / ${r.month.hi} शुक्ल पक्ष</small>${festHtml(r.date, ["ganesh"])}`,
      r.puja ? `${tm(r.puja.s)} – ${tm(r.puja.e)}` : "—", tithiCell(r.run)]
  };
  SPEC.sankranti = {
    slug: "/sankranti-dates/", en: "Sankranti", hi: "संक्रांति", emoji: "☀️", file: "Sankranti",
    cols: ["Date / तिथि", "Day / वार", "Sankranti / संक्रांति", "Sun enters / सूर्य प्रवेश (IST)"],
    cells: r => [`<b>${r.en} / ${r.hi}</b><br><small>Sun enters ${r.rashiEn} (${r.sign}) / सूर्य ${r.rashiHi} राशि में &middot; ${r.kind} Sankranti</small>${festHtml(r.date)}`,
      `<b>${fdt(r.moment)}</b>${r.afterSunset ? "<br><small>After sunset: many pandits do snan-daan next morning</small>" : ""}`]
  };
  SPEC.satyanarayan = {
    slug: "/satyanarayan-puja/", en: "Satyanarayan Puja", hi: "सत्यनारायण पूजा", emoji: "🙏", file: "Satyanarayan Puja",
    cols: ["Date / तिथि", "Day / वार", "Satyanarayan Vrat / सत्यनारायण व्रत", "Evening puja on / सायं पूजा", "Purnima tithi (IST) / पूर्णिमा तिथि"],
    cells: r => [`<b>${r.en} / ${r.hi}</b>${festHtml(r.date)}`,
      !r.eveningDate || r.eveningDate === r.date ? "Same day / उसी दिन" : `${dlong(r.eveningDate)}<br><small>Purnima has ended before the evening on the vrat day</small>`, tithiCell(r.run)]
  };
  function tithiCell(run) { return `<small>Start</small> ${fdt(run.s)}<br><small>End</small> ${fdt(run.e)}`; }

  const rowHtml = (t, r) => {
    const wd = r.wd !== undefined ? r.wd : wdOf(r.date), y = +r.date.slice(0, 4);
    const cells = SPEC[t].cells(r);
    return `<tr${r.date < today ? ' class="past"' : ""}><td><a href="/panchang/${y}/#${r.date}">${dlong(r.date)}</a></td><td>${V.WD_EN[wd]} / ${V.WD_HI[wd]}</td>${cells.map(c => `<td>${c}</td>`).join("")}</tr>`;
  };
  const head = t => `<thead><tr>${SPEC[t].cols.map(c => `<th>${c}</th>`).join("")}</tr></thead>`;
  const table = (t, rows) => `<div class="tbl"><table>${head(t)}<tbody>${rows.map(r => rowHtml(t, r)).join("")}</tbody></table></div>`;

  function monthSections(t, y) {
    const by = {};
    DATA[y][t].forEach(r => { const m = +r.date.slice(5, 7); (by[m] = by[m] || []).push(r); });
    const ms = Object.keys(by).map(Number).sort((a, b) => a - b);
    const chips = `<nav class="ynav" aria-label="Jump to month">${ms.map(m => `<a href="#m${m}">${MONF[m - 1].slice(0, 3)}</a>`).join("")}</nav>`;
    return chips + ms.map(m => `<h3 id="m${m}" class="sec">${SPEC[t].en} in ${MONF[m - 1]} ${y} / ${HI_MONTH[m - 1]} ${y}</h3>${table(t, by[m])}`).join("\n");
  }

  const yearNav = (t, cur, hub) => `<nav class="ynav" aria-label="Choose year">${YEARS.map(y => `<a href="${SPEC[t].slug}${y}/"${!hub && y === cur ? ' class="act" aria-current="page"' : ""}>${y}</a>`).join("")}${hub ? "" : `<a href="${SPEC[t].slug}">Upcoming</a>`}</nav>`;

  const nextLine = (t, en, hi) => {
    const n = firstUpcoming(t); if (!n) return "";
    const wd = n.wd !== undefined ? n.wd : wdOf(n.date), name = n.en ? `${n.en} / ${n.hi}` : t === "pradosh" ? "" : `${n.month.en} ${SPEC[t].en} / ${n.month.hi} ${SPEC[t].hi}`;
    const when = n.date === today ? "Today / आज" : "";
    return `<div class="sum"><b>${en} / ${hi}:</b> ${when ? `<b>${when}</b> · ` : ""}${V.WD_EN[wd]}, ${dlong(n.date)} (${V.WD_HI[wd]})${name ? ` · ${name}` : ""} &middot; ${n.run ? `tithi ${fdt(n.run.s)} → ${fdt(n.run.e)}` : `Sun enters ${n.rashiEn} at ${fdt(n.moment)}`}</div>`;
  };
  const nextText = t => { const n = firstUpcoming(t); if (!n) return ""; const wd = n.wd !== undefined ? n.wd : wdOf(n.date); return `${V.WD_EN[wd]}, ${dlong(n.date)}${n.en ? ` (${n.en})` : t === "pradosh" ? "" : ` (${n.month.en} ${SPEC[t].en})`}`; };

  const srcNote = t => `<p class="disc2">Dates and tithi timings are calculated for <b>New Delhi (IST)</b> by this site's panchang engine and rebuilt daily${t === "sankranti" ? ". A Sankranti is the moment the Sun enters a new rashi (Nirayana, Lahiri); the date shown is the date in India of that moment, and the Sankranti time can differ by a few minutes between panchangs" : t === "satyanarayan" ? ". The vrat date is the Purnima day, the same as on the Purnima Vrat page. Because the katha is preferably read in the evening, the table also shows the day on which Purnima is actually running in the evening, which can be the day before" : ""}${t === "sankashti" ? ". The Sankashti date is the day on which Chaturthi is running at moonrise in Delhi; the moonrise time shown is for New Delhi and moves by several minutes in other cities, so check your own city's moonrise before breaking the fast" : t === "vinayaka" ? ". The Vinayaka date is the day on which Shukla Chaturthi covers the middle of the day (Madhyahna), the traditional Ganesh puja time. Some calendars pick the day by sunrise, so they can show the neighbouring date" : ""}${t === "pradosh" ? ". The Pradosh date is the day on which Trayodashi is running during the evening Pradosh Kaal; a few calendars pick the day by sunrise instead, so they can show the neighbouring date" : ""}. Times can differ by a few minutes between panchangs and between cities, and a vrat date can occasionally move by a day, so confirm important vrats with your family pandit. Click any date to open its full daily panchang.</p>`;

  /* ---------------------- static content ---------------------- */
  const PUR_FEST = [["Pausha", "पौष", "Pausha Purnima, Shakambhari Purnima; holy dips at Prayag and Haridwar"], ["Magha", "माघ", "Magha Purnima, Guru Ravidas Jayanti; Magh Snan ends"], ["Phalguna", "फाल्गुन", "Holika Dahan (Holi) and Vasanta Purnima"], ["Chaitra", "चैत्र", "Hanuman Jayanti"], ["Vaishakha", "वैशाख", "Buddha Purnima, Kurma Jayanti"], ["Jyeshtha", "ज्येष्ठ", "Vat Purnima Vrat (Maharashtra and Gujarat), Jyeshtha Purnima"], ["Ashadha", "आषाढ़", "Guru Purnima (Vyasa Puja)"], ["Shravana", "श्रावण", "Raksha Bandhan, Shravani Purnima"], ["Bhadrapada", "भाद्रपद", "Bhadrapada Purnima, Purnima Shraddha; Pitru Paksha begins"], ["Ashwin", "आश्विन", "Sharad (Kojagari) Purnima"], ["Kartik", "कार्तिक", "Kartik Purnima, Dev Deepawali, Guru Nanak Jayanti"], ["Margashirsha", "मार्गशीर्ष", "Dattatreya Jayanti, Margashirsha Purnima"]];
  const purTable = `<div class="tbl"><table><thead><tr><th>Month / माह</th><th>Main observance / प्रमुख पर्व</th></tr></thead><tbody>${PUR_FEST.map(([e, h, f]) => `<tr><td>${e} / ${h}</td><td>${f}</td></tr>`).join("")}</tbody></table></div>`;
  const MONTH_ROWS = V.LM.en.map((e, i) => [e, V.LM.hi[i], V.EKA[i + "K"], V.EKA[i + "S"]]);
  const ekaTable = `<div class="tbl"><table><thead><tr><th>Month / माह</th><th>Krishna Paksha / कृष्ण पक्ष</th><th>Shukla Paksha / शुक्ल पक्ष</th></tr></thead><tbody>${MONTH_ROWS.map(([e, h, k, s]) => `<tr><td>${e} / ${h}</td><td>${k[1]} / ${k[0]}</td><td>${s[1]} / ${s[0]}</td></tr>`).join("")}</tbody></table></div>
<p class="disc2">Month names follow the Purnimanta calendar used in North India. In an Adhik Maas year the extra month adds two more: Padmini Ekadashi (Shukla) and Parama Ekadashi (Krishna).</p>`;
  const pdTable = `<div class="tbl"><table><thead><tr><th>Day / वार</th><th>Name / नाम</th><th>Traditionally associated with / मान्यता</th></tr></thead><tbody>
<tr><td>Sunday / रविवार</td><td>Ravi (Bhanu) Pradosh / रवि प्रदोष</td><td>Good health and long life</td></tr>
<tr><td>Monday / सोमवार</td><td>Som Pradosh / सोम प्रदोष</td><td>Fulfilment of wishes, peace of mind</td></tr>
<tr><td>Tuesday / मंगलवार</td><td>Bhauma Pradosh / भौम प्रदोष</td><td>Relief from illness and debts</td></tr>
<tr><td>Wednesday / बुधवार</td><td>Budha Pradosh / बुध प्रदोष</td><td>Fulfilment of wishes, learning</td></tr>
<tr><td>Thursday / गुरुवार</td><td>Guru Pradosh / गुरु प्रदोष</td><td>Blessings of elders, protection from obstacles</td></tr>
<tr><td>Friday / शुक्रवार</td><td>Shukra Pradosh / शुक्र प्रदोष</td><td>Harmony in married life and good fortune</td></tr>
<tr><td>Saturday / शनिवार</td><td>Shani Pradosh / शनि प्रदोष</td><td>Blessings for children; relief in Saturn-related troubles</td></tr></tbody></table></div>`;
  const amTable = `<div class="tbl"><table><thead><tr><th>Amavasya / अमावस्या</th><th>Why it is special / विशेष</th></tr></thead><tbody>
<tr><td>Somvati Amavasya / सोमवती अमावस्या</td><td>Amavasya that falls on a Monday; fasting, holy dip and Shiva puja are popular</td></tr>
<tr><td>Shani Amavasya / शनि अमावस्या</td><td>Amavasya on a Saturday; devotees worship Shani Dev and give oil and black sesame in daan</td></tr>
<tr><td>Mauni Amavasya / मौनी अमावस्या</td><td>Magha Amavasya; silence (maun), holy bath and daan, especially at Prayagraj</td></tr>
<tr><td>Vat Savitri Vrat / वट सावित्री व्रत</td><td>Jyeshtha Amavasya (North India); married women fast for their husband's long life</td></tr>
<tr><td>Hariyali Amavasya / हरियाली अमावस्या</td><td>Shravana Amavasya; planting trees and worship of nature</td></tr>
<tr><td>Pithori Amavasya / पिठोरी अमावस्या</td><td>Bhadrapada Amavasya; worship of Matrikas, and a day of tarpan</td></tr>
<tr><td>Sarva Pitru Amavasya / सर्वपितृ अमावस्या</td><td>Last day of Pitru Paksha; Shraddha for all ancestors, including those whose date is unknown</td></tr>
<tr><td>Diwali (Kartik Amavasya) / दिवाली</td><td>Lakshmi Puja is done in the evening on the Amavasya night</td></tr></tbody></table></div>`;

  const BASE = {
    purnima: {
      introHi: y => `<b>पूर्णिमा</b> वह तिथि है जब चंद्रमा अपनी पूरी कला में दिखाई देता है और शुक्ल पक्ष का समापन होता है। इस दिन व्रत, पवित्र स्नान, सत्यनारायण कथा, दान और चंद्रमा को अर्घ्य देने की परंपरा है। नीचे ${y} की हर पूर्णिमा की तारीख, वार, तिथि का आरंभ-समाप्ति समय और उस दिन के पर्व दिए गए हैं।`,
      introEn: y => `Purnima is the full-moon day, when the bright fortnight (Shukla Paksha) comes to an end. Families fast, bathe in holy water, hear the Satyanarayan katha, give daan and offer water to the Moon. The tables below list every Purnima of ${y} with the weekday, the exact tithi start and end time (IST) and any festival that falls on that day.`,
      sections: y => `<h2>What is Purnima? / पूर्णिमा क्या है?</h2>
<p lang="hi">जब सूर्य और चंद्रमा के बीच की दूरी 180° हो जाती है तब पूर्णिमा तिथि लगती है। उत्तर भारत के पूर्णिमांत पंचांग में हर हिंदू माह पूर्णिमा पर पूरा होता है। हर माह एक पूर्णिमा आती है, पर अधिक मास वाले वर्ष में 13 पूर्णिमा होती हैं।</p>
<p>Purnima starts when the Moon is exactly opposite the Sun in the sky, once every lunar month, so a year normally has 12 Purnimas (13 in a year with an Adhik Maas). In the Purnimanta calendar followed in North India, the lunar month ends on Purnima, and each Purnima carries the name of its month.</p>
<h2>Purnima vrat vidhi / पूर्णिमा व्रत और पूजा विधि</h2>
<p lang="hi">सुबह जल्दी उठकर पवित्र जल से स्नान करें, फिर व्रत का संकल्प लें। भगवान विष्णु या सत्यनारायण की पूजा करें, कथा सुनें और दान दें। शाम को चंद्रोदय के बाद चंद्रमा को अर्घ्य देकर, अपने परिवार की परंपरा के अनुसार व्रत खोलें।</p>
<ul><li>Bathe before sunrise (a Ganga snan if possible) and take the vrat sankalp.</li><li>Worship Lord Vishnu or Satyanarayan; many families also worship Shiva and Goddess Lakshmi.</li><li>Fast through the day, with fruit and milk if the fast is a light one, as your family custom allows.</li><li>After moonrise, offer water (arghya) to the Moon and break the fast.</li><li>Give food, clothes or money to the needy; this is the heart of Purnima daan.</li></ul>
<h2>Purnima festivals through the year / साल भर की पूर्णिमा के पर्व</h2>
${purTable}`,
      faqs: n => [
        [`When is the next Purnima?`, `The next Purnima is ${nextText("purnima")}. The table above shows the exact tithi start and end time, since Purnima often starts on the evening before.`, "अगली पूर्णिमा कब है?"],
        [`How many Purnima days are there in a year?`, `A normal year has 12 Purnimas, one per lunar month. A year that has an Adhik Maas (extra month) has 13.`, "साल में कितनी पूर्णिमा होती हैं?"],
        [`Which Purnima is the most important?`, `Guru Purnima (Ashadha), Sharad Purnima (Ashwin), Kartik Purnima and Buddha Purnima (Vaishakha) are among the most widely observed, along with Holika Dahan on Phalguna Purnima and Raksha Bandhan on Shravana Purnima.`, "सबसे महत्वपूर्ण पूर्णिमा कौन सी है?"],
        [`What should I eat on Purnima Vrat?`, `Customs differ. Many families keep a fast till moonrise and eat fruit, milk, sabudana or other satvik food without grains and onion-garlic. Follow your family tradition.`, "पूर्णिमा व्रत में क्या खाना चाहिए?"],
        [`Why does the date differ on other calendars?`, `This page uses the day on which Purnima prevails at sunrise in New Delhi. If the tithi starts late on one evening or ends early the next morning, panchangs and cities can disagree by a day, so check the start and end time and ask your pandit when in doubt.`, "दूसरे पंचांग में तारीख अलग क्यों होती है?"]
      ]
    },
    amavasya: {
      introHi: y => `<b>अमावस्या</b> वह तिथि है जब चंद्रमा आकाश में दिखाई नहीं देता और कृष्ण पक्ष का अंत होता है। यह दिन पितरों के स्मरण, तर्पण, श्राद्ध, दान और जप-ध्यान के लिए जाना जाता है। नीचे ${y} की सभी अमावस्या तिथियाँ वार और तिथि समय सहित दी गई हैं।`,
      introEn: y => `Amavasya is the new-moon day, when the Moon cannot be seen and the dark fortnight (Krishna Paksha) ends. It is the traditional day for remembering ancestors through tarpan and shraddha, and for daan, japa and quiet prayer. The tables below list every Amavasya of ${y} with the weekday and the exact tithi start and end time (IST).`,
      sections: y => `<h2>Why Amavasya matters / अमावस्या का महत्व</h2>
<p lang="hi">अमावस्या पितरों को याद करने का दिन माना जाता है। इस दिन पवित्र नदी में स्नान, पितरों के नाम से तर्पण, ज़रूरतमंदों को भोजन और दान करने की परंपरा है। कई परिवार इस तिथि पर नया काम शुरू करने से बचते हैं, जबकि पूजा, जप और ध्यान के लिए इसे अच्छा माना जाता है।</p>
<p>Amavasya is the day families remember their ancestors. A holy bath, tarpan in the names of the pitrs, feeding the needy and daan are the usual practices. Many families avoid starting a new venture on this tithi, while prayer, japa and meditation are considered fitting.</p>
<h2>Special Amavasya days / विशेष अमावस्या</h2>
${amTable}
<h2>What to do on Amavasya / अमावस्या पर क्या करें</h2>
<ul><li>Take a bath early, ideally in a river or with a little Ganga jal in the water.</li><li>Offer water and sesame (tarpan) to ancestors, or do Shraddha as your family tradition says.</li><li>Feed the poor, cows and birds, and give daan of food, clothes or sesame.</li><li>Do japa of your ishta mantra or Vishnu Sahasranama, and light a diya in the evening.</li></ul>`,
      faqs: n => [
        [`When is the next Amavasya?`, `The next Amavasya is ${nextText("amavasya")}. Check the tithi start and end time in the table: the Amavasya tithi often begins on the previous day.`, "अगली अमावस्या कब है?"],
        [`How many Amavasya days are there in a year?`, `There are 12 or 13 Amavasya days in a year, one for each lunar month, and 13 in a year with an Adhik Maas.`, "साल में कितनी अमावस्या होती हैं?"],
        [`What is Somvati Amavasya?`, `An Amavasya that falls on a Monday is called Somvati Amavasya. Many people fast, take a holy dip and worship Shiva and Parvati on this day. The weekday shown in the table is calculated from the date.`, "सोमवती अमावस्या क्या है?"],
        [`Is Amavasya inauspicious?`, `Many families avoid starting big new ventures on Amavasya, but it is a day of great importance for pitru puja, tarpan, daan and prayer. Diwali itself is celebrated on the Amavasya night of Kartik.`, "क्या अमावस्या अशुभ होती है?"],
        [`What is Sarva Pitru Amavasya?`, `It is the Amavasya that ends Pitru Paksha, the fortnight for ancestors. Shraddha done on this day is meant for all ancestors, including those whose tithi of passing is not known.`, "सर्वपितृ अमावस्या क्या है?"]
      ]
    },
    ekadashi: {
      introHi: y => `<b>एकादशी</b> हर पक्ष की ग्यारहवीं तिथि है और भगवान विष्णु को समर्पित है। साल में आमतौर पर 24 एकादशी आती हैं (अधिक मास वाले वर्ष में 26)। नीचे ${y} की हर एकादशी की तारीख, वार, तिथि का समय और अगले दिन का पारण समय दिया गया है।`,
      introEn: y => `Ekadashi is the 11th tithi of each lunar fortnight and is dedicated to Lord Vishnu. A year normally has 24 Ekadashis (26 when there is an Adhik Maas). The tables below list every Ekadashi of ${y} with its name, weekday, tithi timing and the parana (fast-breaking) window on the next day.`,
      sections: y => `<h2>How to observe Ekadashi Vrat / एकादशी व्रत विधि</h2>
<p lang="hi">दशमी की शाम हल्का सात्विक भोजन करें। एकादशी की सुबह स्नान कर संकल्प लें, भगवान विष्णु की पूजा करें और तुलसी, फूल, पंचामृत अर्पित करें। व्रत निर्जल या फलाहार रूप में रखा जा सकता है। अगले दिन द्वादशी को सूर्योदय के बाद पारण करें।</p>
<ul><li>Take a light, grain-free meal on Dashami and rise early on Ekadashi for a bath and the vrat sankalp.</li><li>Worship Lord Vishnu with tulsi, flowers and panchamrit; chant Om Namo Bhagavate Vasudevaya and read the Ekadashi katha.</li><li>Fast either without food and water (nirjala) or on fruit, milk, nuts, sabudana and other phalahar.</li><li>Avoid rice, wheat, pulses and other grains, and also onion, garlic, alcohol and non-vegetarian food.</li><li>Stay awake for bhajan and kirtan in the evening if you can.</li></ul>
<h2>Parana rules / पारण के नियम</h2>
<p lang="hi">पारण यानी व्रत खोलना केवल द्वादशी तिथि में और सूर्योदय के बाद करना चाहिए। द्वादशी का पहला चौथाई भाग (हरि वासर) बीतने के बाद ही पारण करें। यदि द्वादशी सूर्योदय से पहले समाप्त हो जाए तो पारण उससे पहले करना होता है।</p>
<p>Parana must be done on Dwadashi, after sunrise and after Hari Vasara (the first quarter of Dwadashi) is over, and before Dwadashi ends. The parana window in the table follows that rule and also stays within the first part of the morning. Feeding a Brahmin or helping the needy after parana is an old custom.</p>
<h2>Smarta and Vaishnava Ekadashi / स्मार्त और वैष्णव एकादशी</h2>
<p>When Ekadashi runs across two sunrises, Smarta families keep the vrat on the first day and Vaishnava sampradayas (ISKCON and others) often keep it on the second. The dates here follow the Smarta rule. If you follow a Vaishnava tradition, check with your guru or temple, as your date can be one day later on some Ekadashis.</p>
<h2>All 24 Ekadashi names / सभी 24 एकादशी के नाम</h2>
${ekaTable}`,
      faqs: n => [
        [`When is the next Ekadashi?`, `The next Ekadashi is ${nextText("ekadashi")}. The table lists the exact tithi start and end time and the parana window on the next day.`, "अगली एकादशी कब है?"],
        [`How many Ekadashi vrats are there in a year?`, `There are 24, two in every lunar month, one in each paksha. In a year with an Adhik Maas there are 26 because Padmini and Parama Ekadashi are added.`, "साल में कितने एकादशी व्रत होते हैं?"],
        [`What can I eat on Ekadashi?`, `Fruits, milk and milk products, nuts, potatoes, sabudana and kuttu or singhara flour are the usual choices. Grains, rice, pulses, onion, garlic and non-vegetarian food are avoided, and salt is avoided in a strict vrat.`, "एकादशी पर क्या खा सकते हैं?"],
        [`What is Ekadashi parana and when should I do it?`, `Parana is breaking the fast. It is done on Dwadashi after sunrise and after Hari Vasara, and before Dwadashi ends. See the parana column in the table for the window.`, "एकादशी का पारण कब करें?"],
        [`Why do some sites show a different Ekadashi date?`, `When Ekadashi spans two sunrises, Smarta and Vaishnava traditions can keep the vrat on different days. This page follows the Smarta rule. City and ayanamsa differences can also move the date.`, "एकादशी की तारीख अलग क्यों दिखती है?"]
      ]
    },
    pradosh: {
      introHi: y => `<b>प्रदोष व्रत</b> हर पक्ष की त्रयोदशी तिथि को भगवान शिव और माता पार्वती के लिए रखा जाता है। पूजा का समय सूर्यास्त के आसपास का प्रदोष काल है। नीचे ${y} के सभी प्रदोष व्रत, प्रदोष काल और त्रयोदशी तिथि का समय दिया गया है।`,
      introEn: y => `Pradosh Vrat is kept on the Trayodashi (13th tithi) of each lunar fortnight and is dedicated to Lord Shiva and Goddess Parvati. The puja is done in the twilight Pradosh Kaal around sunset. The tables below list every Pradosh Vrat of ${y} with the Pradosh Kaal window and the Trayodashi start and end time (IST).`,
      sections: y => `<h2>What is Pradosh Kaal? / प्रदोष काल क्या है?</h2>
<p lang="hi">सूर्यास्त के बाद लगभग 2 घंटे 24 मिनट (तीन मुहूर्त) का समय प्रदोष काल कहलाता है। शिव पूजा इसी समय की जाती है, इसलिए व्रत उसी दिन माना जाता है जिस दिन प्रदोष काल में त्रयोदशी तिथि हो।</p>
<p>Pradosh Kaal is the twilight stretch that begins at sunset and lasts about 2 hours 24 minutes (three muhurtas). Shiva puja is done in this window, so the vrat belongs to the day on which Trayodashi is running during Pradosh Kaal. That is why the Pradosh Kaal column is shown for every date.</p>
<h2>Types of Pradosh by weekday / वार के अनुसार प्रदोष</h2>
${pdTable}
<h2>Pradosh puja vidhi / प्रदोष पूजा विधि</h2>
<p lang="hi">दिन भर व्रत रखें, शाम को स्नान कर प्रदोष काल में शिवलिंग का जल, दूध और बेलपत्र से अभिषेक करें। "ॐ नमः शिवाय" का जप करें, प्रदोष व्रत कथा सुनें और आरती करें।</p>
<ul><li>Fast during the day, with water or fruit if needed.</li><li>Bathe and begin the puja in the evening, within Pradosh Kaal.</li><li>Do abhishek of the Shivling with water, milk and bel leaves, and offer flowers and incense.</li><li>Chant Om Namah Shivaya, listen to the Pradosh Vrat katha and finish with aarti.</li><li>Break the fast after the puja with satvik food.</li></ul>
<h2>How the Pradosh date is chosen / प्रदोष की तारीख कैसे तय होती है</h2>
<p>The date here is the day on which Trayodashi is present during the evening Pradosh Kaal, which is the shastra rule used by Drik Panchang and most pandits. Some calendars simply take the day on which Trayodashi is running at sunrise. The two rules agree on about half the dates and differ by one day on the rest, which happens when Trayodashi begins in the afternoon and ends before the next evening. If your calendar shows a different date, compare the Trayodashi start and end time in the table with the Pradosh Kaal.</p>`,
      faqs: n => [
        [`When is the next Pradosh Vrat?`, `The next Pradosh Vrat is ${nextText("pradosh")}. The table gives the Pradosh Kaal window for that evening.`, "अगला प्रदोष व्रत कब है?"],
        [`How many Pradosh vrats are there in a year?`, `Usually 24 to 26, since there is one in each paksha of every lunar month. Some years have 25 or 26 because of an Adhik Maas.`, "साल में कितने प्रदोष व्रत होते हैं?"],
        [`What is Pradosh Kaal and what is the puja time?`, `It is the evening twilight, from sunset for about 2 hours 24 minutes. Shiva puja is best done within this window.`, "प्रदोष काल और पूजा का समय क्या है?"],
        [`What is Som Pradosh and Shani Pradosh?`, `A Pradosh that falls on a Monday is Som Pradosh, one on a Saturday is Shani Pradosh, and one on a Tuesday is Bhauma Pradosh. They are traditionally seen as especially fruitful. The weekday is calculated from the actual date.`, "सोम प्रदोष और शनि प्रदोष क्या हैं?"],
        [`Why does this page show a different date from another calendar?`, `This page picks the day on which Trayodashi covers the evening Pradosh Kaal. Some sites use the Trayodashi at sunrise, which can be a day earlier or later. Compare the tithi timings in the table to see why.`, "दूसरे पंचांग में प्रदोष की तारीख अलग क्यों है?"]
      ]
    },
    sankashti: {
      introHi: y => `<b>संकष्टी चतुर्थी</b> हर माह के कृष्ण पक्ष की चतुर्थी को भगवान गणेश के लिए रखा जाने वाला व्रत है। भक्त दिन भर उपवास रखते हैं और शाम को चंद्रमा के दर्शन और अर्घ्य के बाद व्रत खोलते हैं। मंगलवार को पड़ने वाली संकष्टी को अंगारकी चतुर्थी कहा जाता है। नीचे ${y} की हर संकष्टी चतुर्थी की तारीख, वार, चंद्रोदय का समय और चतुर्थी तिथि का समय दिया गया है।`,
      introEn: y => `Sankashti Chaturthi is the fast kept for Lord Ganesha on the Chaturthi (4th tithi) of the dark fortnight, Krishna Paksha, every lunar month. Devotees fast through the day and break the fast in the evening after seeing the Moon and offering arghya. When it falls on a Tuesday it is called Angarki Sankashti. The tables below list every Sankashti Chaturthi of ${y} with the weekday, the moonrise time for New Delhi and the exact Chaturthi tithi start and end time (IST).`,
      sections: y => `<h2>What is Sankashti Chaturthi? / संकष्टी चतुर्थी क्या है?</h2>
<p lang="hi">संकष्टी शब्द का अर्थ है कठिन समय से मुक्ति। मान्यता है कि इस दिन विघ्नहर्ता गणेश की पूजा करने से बाधाएँ दूर होती हैं। पूर्णिमा के बाद कृष्ण पक्ष में आने वाली चतुर्थी संकष्टी कहलाती है, जबकि अमावस्या के बाद शुक्ल पक्ष की चतुर्थी विनायक चतुर्थी है। उत्तर और दक्षिण भारत, विशेषकर महाराष्ट्र और तमिलनाडु में यह व्रत बहुत प्रचलित है।</p>
<p>The word sankashti means deliverance from difficulty. Devotees believe that worshipping Ganesha, the remover of obstacles, on this day helps clear troubles. The Chaturthi after the full moon (Krishna Paksha) is Sankashti, while the Chaturthi after the new moon (Shukla Paksha) is <a href="/vinayaka-chaturthi/">Vinayaka Chaturthi</a>. The vrat is popular across North and South India, especially in Maharashtra and Tamil Nadu, where it is also called Sankata Hara Chaturthi.</p>
<h2>Sankashti Chaturthi vrat vidhi / व्रत और पूजा विधि</h2>
<p lang="hi">सुबह स्नान कर व्रत का संकल्प लें। दिन में फल, साबूदाना, मूंगफली और आलू जैसा फलाहार लें, या अपनी परंपरा के अनुसार निराहार रहें। शाम को गणेश जी की प्रतिमा को ताज़े फूल और दूर्वा से सजाकर पूजा करें, व्रत कथा सुनें। चंद्रमा के दर्शन कर अर्घ्य देने के बाद ही व्रत खोलें।</p>
<ul><li>Bathe in the morning and take the vrat sankalp before Ganesha.</li><li>Keep a fast on fruit, sabudana, peanuts and potatoes, or a stricter fast as your family custom says.</li><li>In the evening decorate the idol with fresh flowers and durva grass, offer modak or laddu, and read the Sankashti katha.</li><li>Wait for moonrise, offer water (arghya) to the Moon, and then break the fast. The moonrise column in the table gives the time for New Delhi.</li></ul>
<h2>Angarki Sankashti and other special days / अंगारकी और विशेष संकष्टी</h2>
<div class="tbl"><table><thead><tr><th>Day / दिन</th><th>Why it is special / विशेष</th></tr></thead><tbody>
<tr><td>Angarki Sankashti / अंगारकी संकष्टी</td><td>Sankashti that falls on a Tuesday (Angaraka is Mars); considered especially fruitful, and one Angarki vrat is said to equal many ordinary ones</td></tr>
<tr><td>Sakat Chauth / सकट चौथ</td><td>Sankashti of the Magha month (January or February); mothers fast for their children, with til and jaggery offerings</td></tr>
<tr><td>Karwa Chauth / करवा चौथ</td><td>Falls on the Sankashti of the Kartik month in North India; married women fast till moonrise for their husband's long life</td></tr></tbody></table></div>
<h2>Why the Moon matters / चंद्र दर्शन का महत्व</h2>
<p>Unlike most vrats, Sankashti is completed only after moonrise, so the date is decided by the day on which Chaturthi is running when the Moon rises, not by sunrise. That is why the table shows the moonrise time. A year has 12 Sankashti Chaturthis, and 13 in a year with an Adhik Maas.</p>`,
      faqs: n => [
        [`When is the next Sankashti Chaturthi?`, `The next Sankashti Chaturthi is ${nextText("sankashti")}. The table shows the moonrise time for New Delhi and the Chaturthi start and end time.`, "अगली संकष्टी चतुर्थी कब है?"],
        [`How many Sankashti Chaturthi vrats are there in a year?`, `There are 12, one in every lunar month, and 13 in a year that has an Adhik Maas.`, "साल में कितने संकष्टी चतुर्थी व्रत होते हैं?"],
        [`What is the difference between Sankashti and Vinayaka Chaturthi?`, `Sankashti Chaturthi falls in Krishna Paksha (after the full moon) and the fast is broken after moonrise. Vinayaka Chaturthi falls in Shukla Paksha (after the new moon) and the puja is done at midday.`, "संकष्टी और विनायक चतुर्थी में क्या अंतर है?"],
        [`What is Angarki Chaturthi?`, `A Sankashti Chaturthi that falls on a Tuesday is called Angarki Chaturthi and is believed to be especially auspicious. The weekday in the table is calculated from the date.`, "अंगारकी चतुर्थी क्या है?"],
        [`When do I break the Sankashti fast?`, `After you have seen the Moon and offered arghya. The moonrise column gives the time for New Delhi; in other cities the moon rises a few minutes earlier or later.`, "संकष्टी का व्रत कब खोलें?"],
        [`Why does the date differ on other calendars?`, `This page uses the day on which Chaturthi is running at moonrise. If Chaturthi starts in the evening or ends before moonrise, calendars and cities can differ by a day, so compare the tithi time with the moonrise time and ask your pandit when in doubt.`, "दूसरे पंचांग में तारीख अलग क्यों है?"]
      ]
    },
    vinayaka: {
      introHi: y => `<b>विनायक चतुर्थी</b> हर माह के शुक्ल पक्ष की चतुर्थी को भगवान गणेश की पूजा के लिए मनाई जाती है। भाद्रपद माह की विनायक चतुर्थी गणेश चतुर्थी कहलाती है, जो साल का सबसे बड़ा गणेश उत्सव है। नीचे ${y} की हर विनायक चतुर्थी की तारीख, वार, मध्याह्न पूजा मुहूर्त और चतुर्थी तिथि का समय दिया गया है।`,
      introEn: y => `Vinayaka Chaturthi is the Chaturthi (4th tithi) of the bright fortnight, Shukla Paksha, every lunar month, observed with puja of Lord Ganesha. The one in the month of Bhadrapada is Ganesh Chaturthi, the biggest Ganesha festival of the year. The tables below list every Vinayaka Chaturthi of ${y} with the weekday, the Madhyahna puja muhurat and the exact Chaturthi tithi start and end time (IST).`,
      sections: y => `<h2>What is Vinayaka Chaturthi? / विनायक चतुर्थी क्या है?</h2>
<p lang="hi">अमावस्या के बाद शुक्ल पक्ष में आने वाली चतुर्थी विनायक चतुर्थी कहलाती है। इसे वरद विनायक चतुर्थी भी कहते हैं। भक्त इस दिन गणेश जी की पूजा कर बुद्धि, समृद्धि और सफलता की कामना करते हैं। पूजा के लिए दोपहर का मध्याह्न काल शुभ माना जाता है, इसलिए तारीख उसी दिन की ली जाती है जिस दिन चतुर्थी मध्याह्न में हो।</p>
<p>The Chaturthi that follows the new moon is Vinayaka Chaturthi, also called Varad Vinayaka Chaturthi. Devotees worship Ganesha for wisdom, prosperity and success. Midday (Madhyahna) is the preferred time for the puja, so the vrat falls on the day on which Chaturthi covers Madhyahna. The dark-fortnight Chaturthi is <a href="/sankashti-chaturthi/">Sankashti Chaturthi</a>.</p>
<h2>Vinayaka Chaturthi puja vidhi / पूजा विधि</h2>
<ul><li>Bathe early and take the vrat sankalp; many families fast till the puja is over.</li><li>Do the puja in the Madhyahna muhurat shown in the table. Place a Ganesha idol or picture on a clean platform.</li><li>Offer durva grass, red flowers, modak, laddu and coconut; light a diya and incense.</li><li>Chant Om Gam Ganapataye Namah or the Ganapati Atharvashirsha and finish with aarti.</li><li>Traditionally the Moon is not looked at on Shukla Chaturthi (see the FAQ below).</li></ul>
<h2>Ganesh Chaturthi / गणेश चतुर्थी</h2>
<p lang="hi">भाद्रपद शुक्ल चतुर्थी को गणेश चतुर्थी मनाई जाती है। इस दिन घरों और पंडालों में गणपति की प्रतिमा स्थापित की जाती है और कई स्थानों पर दस दिन बाद अनंत चतुर्दशी पर विसर्जन किया जाता है। महाराष्ट्र, गोवा, गुजरात, कर्नाटक, तेलंगाना और आंध्र प्रदेश में यह सबसे धूमधाम से मनाया जाता है।</p>
<p>Ganesh Chaturthi falls on Shukla Chaturthi of Bhadrapada (August or September). Idols of Ganapati are installed at homes and in community pandals, and are immersed after one, three, five, seven or ten days, most often on Anant Chaturdashi. It is celebrated on the largest scale in Maharashtra, Goa, Gujarat, Karnataka, Telangana and Andhra Pradesh.</p>
<h2>Vinayaka and Sankashti compared / विनायक और संकष्टी की तुलना</h2>
<div class="tbl"><table><thead><tr><th></th><th>Vinayaka Chaturthi</th><th>Sankashti Chaturthi</th></tr></thead><tbody>
<tr><td>Paksha / पक्ष</td><td>Shukla (bright fortnight)</td><td>Krishna (dark fortnight)</td></tr>
<tr><td>Date decided by / तारीख का आधार</td><td>Chaturthi at midday (Madhyahna)</td><td>Chaturthi at moonrise</td></tr>
<tr><td>Fast ends / व्रत समाप्ति</td><td>After the midday puja</td><td>After moonrise and arghya</td></tr></tbody></table></div>`,
      faqs: n => [
        [`When is the next Vinayaka Chaturthi?`, `The next Vinayaka Chaturthi is ${nextText("vinayaka")}. The table gives the Madhyahna puja muhurat and the Chaturthi start and end time.`, "अगली विनायक चतुर्थी कब है?"],
        [`How many Vinayaka Chaturthi days are there in a year?`, `Usually 12, one in each lunar month, and 13 in a year with an Adhik Maas.`, "साल में कितनी विनायक चतुर्थी होती हैं?"],
        [`Which is the main Vinayaka Chaturthi?`, `The Vinayaka Chaturthi of Bhadrapada month is Ganesh Chaturthi, the main festival, celebrated with idol installation and a ten-day utsav in many places.`, "मुख्य विनायक चतुर्थी कौन सी है?"],
        [`What is the best time for Vinayaka Chaturthi puja?`, `Madhyahna, the middle part of the day, is the preferred time. See the puja muhurat column for each date.`, "विनायक चतुर्थी पूजा का सही समय क्या है?"],
        [`Should the Moon be avoided on Vinayaka Chaturthi?`, `Tradition says not to look at the Moon on Shukla Chaturthi, especially on Ganesh Chaturthi. Sankashti Chaturthi is the opposite, where the Moon is worshipped to end the fast.`, "क्या विनायक चतुर्थी पर चंद्रमा नहीं देखना चाहिए?"],
        [`Why does the date differ on other calendars?`, `This page picks the day on which Chaturthi covers Madhyahna. Some calendars use the tithi at sunrise, which can be a day earlier or later. Compare the tithi timings in the table.`, "दूसरे पंचांग में तारीख अलग क्यों है?"]
      ]
    },
    sankranti: {
      introHi: y => `<b>संक्रांति</b> वह क्षण है जब सूर्य एक राशि से दूसरी राशि में प्रवेश करता है। साल में 12 संक्रांति होती हैं, हर राशि की अपनी संक्रांति। इनमें मकर संक्रांति सबसे प्रसिद्ध है। नीचे ${y} की सभी संक्रांति की तारीख, वार और सूर्य के राशि प्रवेश का सही समय दिया गया है।`,
      introEn: y => `Sankranti is the moment the Sun moves from one rashi (zodiac sign) into the next. There are 12 Sankrantis in a year, one for each rashi, and Makar Sankranti is the best known. The tables below list every Sankranti of ${y} with the weekday and the exact time the Sun enters the new rashi (IST).`,
      sections: y => `<h2>What is Sankranti? / संक्रांति क्या है?</h2>
<p lang="hi">संक्रांति का अर्थ है सूर्य का संक्रमण यानी एक राशि से दूसरी में जाना। हिंदू सौर पंचांग में हर सौर मास संक्रांति से शुरू होता है। संक्रांति का दिन स्नान, दान और सूर्य उपासना के लिए शुभ माना जाता है, पर इस दिन सभी शुभ कार्य नहीं किए जाते।</p>
<p>The word means the transit of the Sun. Every solar month in the Hindu calendar begins on a Sankranti. The day is considered good for a holy bath, daan and worship of the Sun, although not every auspicious activity is begun on it. Panchang dates here use the Nirayana (sidereal) Sun, as most Indian panchangs do.</p>
<h2>The four kinds of Sankranti / चार मुख्य प्रकार</h2>
<div class="tbl"><table><thead><tr><th>Kind / प्रकार</th><th>Sankrantis</th></tr></thead><tbody>
<tr><td>Ayana / अयन</td><td>Makar (Uttarayana begins) and Karka (Dakshinayana begins)</td></tr>
<tr><td>Vishu / विषुव</td><td>Mesha and Tula</td></tr>
<tr><td>Vishnupadi / विष्णुपदी</td><td>Vrishabha, Simha, Vrishchika and Kumbha</td></tr>
<tr><td>Shadashitimukhi / षडशीतिमुखी</td><td>Mithuna, Kanya, Dhanu and Meena</td></tr></tbody></table></div>
<h2>The 12 Sankrantis / 12 संक्रांति</h2>
<div class="tbl"><table><thead><tr><th>Sankranti</th><th>Known for / विशेष</th></tr></thead><tbody>
<tr><td>Makar / मकर</td><td>Uttarayana begins; Pongal, Uttarayan, Magh Bihu and Maghi; Lohri is the evening before; til-gud and khichdi daan</td></tr>
<tr><td>Kumbha / कुंभ</td><td>Sun enters Aquarius; a traditional day for a holy bath and daan</td></tr>
<tr><td>Meena / मीन</td><td>Kharmas (Malmas) begins in North India, so weddings and housewarmings pause till Mesha Sankranti</td></tr>
<tr><td>Mesha / मेष</td><td>Solar new year: Baisakhi in Punjab, Vishu in Kerala, Puthandu in Tamil Nadu, Pana Sankranti in Odisha</td></tr>
<tr><td>Vrishabha / वृषभ</td><td>Sun enters Taurus; a day for charity and Surya puja</td></tr>
<tr><td>Mithuna / मिथुन</td><td>Raja Parba begins in Odisha</td></tr>
<tr><td>Karka / कर्क</td><td>Dakshinayana begins; the Sun starts its southward journey</td></tr>
<tr><td>Simha / सिंह</td><td>Sun enters Leo; Malayalam new year (Chingam 1) falls here</td></tr>
<tr><td>Kanya / कन्या</td><td>Vishwakarma Puja is observed by workers, artisans and factories</td></tr>
<tr><td>Tula / तुला</td><td>Sun enters Libra; Tula Sankramana is a holy bath day in the Kaveri region</td></tr>
<tr><td>Vrishchika / वृश्चिक</td><td>Sun enters Scorpio; the Sabarimala pilgrimage season begins in Kerala</td></tr>
<tr><td>Dhanu / धनु</td><td>Dhanur masa and Kharmas begin; early morning worship in many South Indian temples</td></tr></tbody></table></div>
<h2>What to do on Sankranti / संक्रांति पर क्या करें</h2>
<ul><li>Take a bath early, ideally in a river or with a little Ganga jal in the bath water.</li><li>Offer water (arghya) to the Sun and chant the Surya mantra or Aditya Hridaya Stotra.</li><li>Give daan of grain, clothes, til, jaggery, ghee or blankets to the needy.</li><li>If the Sankranti moment is after sunset, many families do the snan and daan the next morning; check with your pandit for your own family custom.</li></ul>`,
      faqs: n => [
        [`When is the next Sankranti?`, `The next Sankranti is ${nextText("sankranti")}. The table shows the exact time the Sun enters the new rashi.`, "अगली संक्रांति कब है?"],
        [`How many Sankrantis are there in a year?`, `There are 12, one in each solar month, when the Sun enters Mesha, Vrishabha, Mithuna, Karka, Simha, Kanya, Tula, Vrishchika, Dhanu, Makar, Kumbha and Meena.`, "साल में कितनी संक्रांति होती हैं?"],
        [`Which is the most important Sankranti?`, `Makar Sankranti, which marks the start of Uttarayana, is the most widely celebrated. Mesha Sankranti (the solar new year) and Karka Sankranti (start of Dakshinayana) are also important.`, "सबसे महत्वपूर्ण संक्रांति कौन सी है?"],
        [`Why is Makar Sankranti usually on 14 or 15 January?`, `Sankranti follows the Sun's position, which shifts by a few hours each year, so the date stays on 14 January for several years and sometimes moves to 15 January. The table gives the exact date and time for each year.`, "मकर संक्रांति 14 या 15 जनवरी को क्यों होती है?"],
        [`What is Kharmas?`, `Kharmas (Malmas) is the month when the Sun is in Dhanu or Meena. Many North Indian families avoid weddings, housewarmings and similar new beginnings in this period, which ends on Makar or Mesha Sankranti.`, "खरमास क्या है?"],
        [`Why is the Sankranti time different on other calendars?`, `Panchangs can use slightly different ayanamsa values and city, so the exact time can differ by a few minutes. The date follows the date in India of the moment the Sun enters the rashi.`, "दूसरे पंचांग में समय अलग क्यों है?"]
      ]
    },
    satyanarayan: {
      introHi: y => `<b>सत्यनारायण पूजा</b> भगवान विष्णु के सत्यनारायण स्वरूप की पूजा और कथा है, जो आमतौर पर पूर्णिमा के दिन की जाती है। इस दिन भक्त उपवास रखकर पंचामृत और प्रसाद के साथ पूजा करते हैं। नीचे ${y} की हर पूर्णिमा पर सत्यनारायण व्रत की तारीख, सायंकाल पूजा का दिन और पूर्णिमा तिथि का समय दिया गया है।`,
      introEn: y => `Satyanarayan Puja is the worship and katha of Lord Vishnu in his Satyanarayan form, usually done on Purnima. Devotees fast and offer panchamrit and prasad. The tables below list the Satyanarayan Vrat of every Purnima of ${y}, the day for the preferred evening puja, and the Purnima tithi start and end time (IST).`,
      sections: y => `<h2>What is Satyanarayan Puja? / सत्यनारायण पूजा क्या है?</h2>
<p lang="hi">सत्यनारायण का अर्थ है सत्य के रूप में नारायण। इस पूजा में भगवान विष्णु की प्रतिमा या चित्र का पंचामृत से अभिषेक कर कथा सुनी जाती है और आरती के बाद प्रसाद बाँटा जाता है। कई परिवार इसे पूर्णिमा के अलावा विवाह, गृह प्रवेश या किसी मनोकामना पूरी होने पर भी करवाते हैं।</p>
<p>Satyanarayan means Narayana as Truth. The idol or picture of Lord Vishnu is bathed with panchamrit, the katha is heard, and prasad is shared after the aarti. Many families also hold it on other occasions such as a wedding, a housewarming or when a wish is fulfilled, but Purnima is the traditional day.</p>
<h2>Which day should I choose? / कौन सा दिन चुनें?</h2>
<p lang="hi">सुबह और शाम दोनों समय पूजा हो सकती है, पर सायंकाल की पूजा को अधिक श्रेष्ठ माना जाता है। कभी पूर्णिमा तिथि सूर्योदय के बाद सुबह या दोपहर में ही समाप्त हो जाती है। तब शाम की पूजा के लिए एक दिन पहले का दिन लिया जाता है, जब पूर्णिमा शाम को लगी हो।</p>
<p>The vrat date in the table is the Purnima day, the same as on the <a href="/purnima-vrat/">Purnima Vrat page</a>. The katha is preferably read in the evening. When Purnima ends in the morning or afternoon of the vrat day, the previous evening is the one on which Purnima is actually running, so the "Evening puja on" column shows that day. If you do the puja in the morning, use the vrat date.</p>
<h2>Satyanarayan Puja vidhi / पूजा विधि</h2>
<ul><li>Bathe, take the vrat sankalp and keep a fast through the day.</li><li>Place an idol or picture of Lord Vishnu or Satyanarayan on a clean chowki with a kalash, and invoke Ganesha first.</li><li>Bathe the idol with panchamrit (milk, curd, honey, ghee, sugar), then offer tulsi leaves, flowers, fruit and incense.</li><li>Read or listen to the five chapters of the Satyanarayan katha with everyone present.</li><li>Finish with aarti using a camphor flame, share the prasad and break the fast.</li></ul>
<h2>Prasad / प्रसाद</h2>
<p>The traditional prasad is made from wheat flour or semolina, sugar or jaggery, ghee and banana, with tulsi leaves added, and is served along with panchamrit. It is distributed to all present before the family eats.</p>`,
      faqs: n => [
        [`When is the next Satyanarayan Puja?`, `The next Satyanarayan Vrat is ${nextText("satyanarayan")}. The table also shows the evening puja day, which can be one day earlier.`, "अगली सत्यनारायण पूजा कब है?"],
        [`Is Satyanarayan Puja only done on Purnima?`, `Purnima is the traditional day, but families also hold it for weddings, housewarmings and other happy occasions, and on Sankranti or Ekadashi in some traditions.`, "क्या सत्यनारायण पूजा केवल पूर्णिमा को होती है?"],
        [`Should the puja be done in the morning or evening?`, `Both are accepted, and the evening puja is considered better. Use the "Evening puja on" column if you want the day when Purnima is running in the evening.`, "पूजा सुबह करें या शाम को?"],
        [`What is the prasad of Satyanarayan Puja?`, `Panchamrit and a sweet made from wheat flour or semolina, sugar, ghee and banana, with tulsi leaves, is the traditional prasad.`, "सत्यनारायण पूजा का प्रसाद क्या है?"],
        [`Why does the date differ from the Purnima date on another calendar?`, `Purnima often spans two days. This page uses the day on which Purnima is present at sunrise for the vrat and also shows the evening day separately, so compare the tithi times with your pandit's panchang.`, "तारीख अलग क्यों दिखती है?"]
      ]
    }
  };

  const ORDER = ["purnima", "amavasya", "ekadashi", "pradosh", "sankashti", "vinayaka", "sankranti", "satyanarayan"];
  const related = t => ORDER.filter(x => x !== t).map(x => [SPEC[x].slug, nm(x)[0]]).concat([["/vrats/", "All Vrats"], [`/panchang/${HUB_Y}/`, `Panchang ${HUB_Y}`]]);
  const descText = { purnima: "with tithi start and end time, Sharad, Guru, Buddha and Kartik Purnima, puja vidhi and FAQs", amavasya: "with tithi start and end time, Somvati, Shani and Mauni Amavasya, Sarva Pitru Amavasya, tarpan and FAQs", ekadashi: "with all 24 Ekadashi names, tithi timings, parana time, fasting rules and FAQs", pradosh: "with Pradosh Kaal, Trayodashi timing, Som, Bhauma and Shani Pradosh, puja vidhi and FAQs", sankashti: "with moonrise time, Chaturthi tithi timing, Angarki Sankashti, Sakat Chauth, Karwa Chauth, vrat vidhi and FAQs", vinayaka: "with Madhyahna puja muhurat, Chaturthi tithi timing, Ganesh Chaturthi, puja vidhi and FAQs", sankranti: "with the exact time the Sun enters each rashi, Makar Sankranti, Mesha Sankranti, Kharmas, daan and FAQs", satyanarayan: "with the Purnima vrat day, evening puja day, tithi timing, puja vidhi, prasad and FAQs" };
  const nm = t => ({ purnima: ["Purnima Vrat", "पूर्णिमा व्रत"], amavasya: ["Amavasya Dates", "अमावस्या तिथियाँ"], ekadashi: ["Ekadashi Vrat", "एकादशी व्रत"], pradosh: ["Pradosh Vrat", "प्रदोष व्रत"], sankashti: ["Sankashti Chaturthi", "संकष्टी चतुर्थी"], vinayaka: ["Vinayaka Chaturthi", "विनायक चतुर्थी"], sankranti: ["Sankranti Dates", "संक्रांति तिथियाँ"], satyanarayan: ["Satyanarayan Puja", "सत्यनारायण पूजा"] }[t]);

  ORDER.forEach(t => {
    const S = SPEC[t], B = BASE[t], [en, hi] = nm(t);
    const faqs = B.faqs();
    const faqHtml = `<h2 id="faq">${en} FAQs / अक्सर पूछे जाने वाले प्रश्न</h2>\n` + faqs.map(([q, a, h]) => `<details><summary>${q} / ${h}</summary><p>${a}</p></details>`).join("\n");

    YEARS.forEach(y => {
      const isCur = y === HUB_Y;
      write(`${S.slug}${y}/`, layout({
        urlPath: `${S.slug}${y}/`, canonicalPath: isCur ? S.slug : null,
        title: `${en} ${y} – ${hi} ${y}, All Dates with Tithi Time | ${BRAND}`,
        description: `${en} ${y} (${hi} ${y}) dates for every month ${descText[t]}. Updated daily.`,
        h1: `${en} ${y} – ${hi} ${y}`, crumbLabel: `${en} ${y}`,
        bodyHtml: `
<p lang="hi">${B.introHi(y)}</p>
<p>${B.introEn(y)}</p>
${yearNav(t, y, false)}
<h2>${en} ${y} month-wise list / माह के अनुसार ${hi} ${y}</h2>
${monthSections(t, y)}
${srcNote(t)}
${B.sections(y)}
${faqHtml}
${citiesBlock}`,
        extraJsonLd: [faqSchema(faqs.map(f => [f[0], f[1]]))],
        related: related(t)
      }));
    });

    // hub: upcoming dates + full table for the current year
    const upcoming = ALL(t).filter(r => r.date >= today).slice(0, 6);
    write(S.slug, layout({
      urlPath: S.slug,
      title: `${en} ${HUB_Y} – ${hi} कब है? Dates, Tithi Time & Puja Vidhi | ${BRAND}`,
      description: `${en} ${HUB_Y} (${hi} ${HUB_Y}): next date and the full month-wise list ${descText[t]}. Updated daily.`,
      h1: `${en} ${HUB_Y} – ${hi} ${HUB_Y}`, crumbLabel: en,
      bodyHtml: `
${nextLine(t, `Next ${S.en}`, `अगली ${S.hi}`)}
<p lang="hi">${B.introHi(HUB_Y)}</p>
<p>${B.introEn(HUB_Y)}</p>
${yearNav(t, HUB_Y, true)}
${upcoming.length ? `<h2>Upcoming ${S.en} dates / आने वाली ${S.hi}</h2>${table(t, upcoming)}` : ""}
<h2>${en} ${HUB_Y} month-wise list / माह के अनुसार ${hi} ${HUB_Y}</h2>
${monthSections(t, HUB_Y)}
${srcNote(t)}
${B.sections(HUB_Y)}
${faqHtml}
${citiesBlock}`,
      extraJsonLd: [faqSchema(faqs.map(f => [f[0], f[1]]))],
      related: related(t)
    }));
  });

  // ---- /vrats/ index: one row per vrat with a short description and the next date ----
  const HUBDESC = {
    purnima: ["Full-moon vrat with holy bath, daan and Chandra arghya", "पूर्णिमा व्रत, स्नान और दान"],
    amavasya: ["New-moon day for tarpan, shraddha and daan", "अमावस्या, पितृ तर्पण और दान"],
    ekadashi: ["Fast for Lord Vishnu twice a month, with parana time", "विष्णु एकादशी व्रत और पारण"],
    pradosh: ["Evening Shiva vrat on Trayodashi with Pradosh Kaal", "शिव प्रदोष व्रत और प्रदोष काल"],
    sankashti: ["Ganesha fast on Krishna Chaturthi, broken after moonrise", "गणेश संकष्टी व्रत, चंद्रोदय के बाद पारण"],
    vinayaka: ["Ganesha puja on Shukla Chaturthi, including Ganesh Chaturthi", "शुक्ल पक्ष की गणेश पूजा"],
    sankranti: ["The 12 days the Sun enters a new rashi, with exact timing", "सूर्य के राशि परिवर्तन की 12 संक्रांति"],
    satyanarayan: ["Satyanarayan katha and puja on Purnima, with the evening day", "पूर्णिमा पर सत्यनारायण पूजा"]
  };
  const hubFaqs = [
    ["What is a vrat?", "A vrat is a fast or vow kept for a deity or a tithi. Devotees usually avoid grains and some foods, eat fruit, milk and dry fruit if the fast is a light one, and do puja or read the katha.", "व्रत क्या है?"],
    ["Which vrats come every month?", "Purnima, Amavasya, Ekadashi (twice), Pradosh (twice), Sankashti Chaturthi and Vinayaka Chaturthi come every lunar month, and a Sankranti comes every solar month.", "कौन से व्रत हर महीने आते हैं?"],
    ["How are these dates calculated?", "All dates and timings are calculated by this site's panchang engine for New Delhi (IST) and rebuilt daily. Each vrat page explains the rule it follows, such as sunrise, moonrise, midday or Pradosh Kaal.", "तारीखें कैसे निकाली जाती हैं?"],
    ["Why does a date differ from another calendar?", "A tithi often spans two days, so panchangs that use a different rule or city can show a neighbouring date. Check the tithi start and end time on each page and confirm important vrats with your family pandit.", "दूसरे पंचांग से तारीख अलग क्यों है?"]
  ];
  const hubRows = ORDER.map(t => {
    const n = firstUpcoming(t), S = SPEC[t], [en, hi] = nm(t), d = HUBDESC[t];
    const wd = n ? (n.wd !== undefined ? n.wd : wdOf(n.date)) : 0;
    const nextCell = n ? `<a href="/panchang/${n.date.slice(0, 4)}/#${n.date}">${dlong(n.date)}</a><br><small>${V.WD_EN[wd]} / ${V.WD_HI[wd]}${n.en && t !== "purnima" ? ` &middot; ${esc(n.en)}` : ""}</small>` : "—";
    return `<tr><td><a href="${S.slug}"><b>${S.emoji} ${en}</b></a><br><small>${hi}</small></td><td>${d[0]}<br><small lang="hi">${d[1]}</small></td><td>${nextCell}</td></tr>`;
  }).join("");
  const hubFaqHtml = `<h2 id="faq">Vrat FAQs / अक्सर पूछे जाने वाले प्रश्न</h2>\n` + hubFaqs.map(([q, a, h]) => `<details><summary>${q} / ${h}</summary><p>${a}</p></details>`).join("\n");
  write("/vrats/", layout({
    urlPath: "/vrats/",
    title: `Vrat Dates ${HUB_Y} – Purnima, Amavasya, Ekadashi, Pradosh, Sankashti, Sankranti | ${BRAND}`,
    description: `All important vrat dates for ${HUB_Y}: Purnima, Amavasya, Ekadashi, Pradosh, Sankashti Chaturthi, Vinayaka Chaturthi, Sankranti and Satyanarayan Puja with tithi timings. Updated daily.`,
    h1: `Vrat Dates ${HUB_Y} – व्रत और उपवास`, crumbLabel: "Vrats",
    bodyHtml: `
<p lang="hi">व्रत यानी उपवास, जो देवी-देवताओं की कृपा के लिए रखा जाता है। नीचे हर प्रमुख व्रत का पेज है, जिसमें पूरे साल की तारीखें, तिथि का समय, नियम और पूजा विधि दी गई है। साथ में हर व्रत की अगली तारीख भी दिखाई गई है।</p>
<p>A vrat is a fast kept to honour a deity or a tithi. Open any page below for the full list of dates, tithi timings, rules and puja vidhi for the year, and see the next date for each vrat at a glance.</p>
<h2>Vrat list / व्रत सूची</h2>
<div class="tbl"><table><thead><tr><th>Vrat / व्रत</th><th>What it is / विवरण</th><th>Next date / अगली तारीख</th></tr></thead><tbody>${hubRows}</tbody></table></div>
<p class="disc2">Dates are calculated for <b>New Delhi (IST)</b> and rebuilt daily. Click any date to open its full daily panchang. Confirm important vrats with your family pandit.</p>
${hubFaqHtml}
${citiesBlock}`,
    extraJsonLd: [faqSchema(hubFaqs.map(f => [f[0], f[1]]))],
    related: ORDER.map(t => [SPEC[t].slug, nm(t)[0]]).concat([[`/panchang/${HUB_Y}/`, `Panchang ${HUB_Y}`]])
  }));
};
