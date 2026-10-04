// Generates 4 vrat sections, each with a hub page and one page per year in YEARS:
//   /purnima-vrat/   /purnima-vrat/2027/   ...
//   /amavasya-dates/ /ekadashi-vrat/       /pradosh-vrat/
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
  const festHtml = date => { const f = festOn(date); return f.length ? `<br><small>${f.map(o => `${esc(o.en)} / ${esc(o.hi)}`).join(" · ")}</small>` : ""; };

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
    return `<div class="sum"><b>${en} / ${hi}:</b> ${when ? `<b>${when}</b> · ` : ""}${V.WD_EN[wd]}, ${dlong(n.date)} (${V.WD_HI[wd]})${name ? ` · ${name}` : ""} &middot; tithi ${fdt(n.run.s)} → ${fdt(n.run.e)}</div>`;
  };
  const nextText = t => { const n = firstUpcoming(t); if (!n) return ""; const wd = n.wd !== undefined ? n.wd : wdOf(n.date); return `${V.WD_EN[wd]}, ${dlong(n.date)}${n.en ? ` (${n.en})` : t === "pradosh" ? "" : ` (${n.month.en} ${SPEC[t].en})`}`; };

  const srcNote = t => `<p class="disc2">Dates and tithi timings are calculated for <b>New Delhi (IST)</b> by this site's panchang engine and rebuilt daily${t === "pradosh" ? ". The Pradosh date is the day on which Trayodashi is running during the evening Pradosh Kaal; a few calendars pick the day by sunrise instead, so they can show the neighbouring date" : ""}. Times can differ by a few minutes between panchangs and between cities, and a vrat date can occasionally move by a day, so confirm important vrats with your family pandit. Click any date to open its full daily panchang.</p>`;

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
    }
  };

  const ORDER = ["purnima", "amavasya", "ekadashi", "pradosh"];
  const related = t => ORDER.filter(x => x !== t).map(x => [SPEC[x].slug, `${SPEC[x].en} ${x === "amavasya" ? "Dates" : "Vrat"}`]).concat([[`/panchang/${HUB_Y}/`, `Panchang ${HUB_Y}`]]);
  const descText = { purnima: "with tithi start and end time, Sharad, Guru, Buddha and Kartik Purnima, puja vidhi and FAQs", amavasya: "with tithi start and end time, Somvati, Shani and Mauni Amavasya, Sarva Pitru Amavasya, tarpan and FAQs", ekadashi: "with all 24 Ekadashi names, tithi timings, parana time, fasting rules and FAQs", pradosh: "with Pradosh Kaal, Trayodashi timing, Som, Bhauma and Shani Pradosh, puja vidhi and FAQs" };
  const nm = t => ({ purnima: ["Purnima Vrat", "पूर्णिमा व्रत"], amavasya: ["Amavasya Dates", "अमावस्या तिथियाँ"], ekadashi: ["Ekadashi Vrat", "एकादशी व्रत"], pradosh: ["Pradosh Vrat", "प्रदोष व्रत"] }[t]);

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
};
