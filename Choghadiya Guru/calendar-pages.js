// Generates the calendar section:
//   /calendar/             hub linking the three calendars
//   /hindu-calendar/       Hindu calendar (festivals, vrats, tithi days) - Delhi/IST
//   /indian-holidays/      Indian holidays (national, Hindu, Christian, Sikh, Muslim, observances)
//   /telugu-festivals/     Telugu festivals (Amanta lunisolar calendar)
// Data lives in calendar-data.js. Add a year there (same shape) and it appears on the next build.
const D = require("./calendar-data.js");   // hand-checked 2026 data
const G = require("./calendar-gen.js");
const RD = require("./calendar-data-regional.js");   // hand-checked 2026 data for Malayalam / Tamil / Gujarati
const RG = require("./calendar-regional.js");    // every other year is computed from the panchang engine (nothing typed by hand)

module.exports = function ({ BRAND, layout, write, faqSchema, citiesBlock, YEARS }) {
  YEARS = (YEARS && YEARS.length ? YEARS : Object.keys(D.HINDU).map(Number)).slice().sort((a, b) => a - b);
  const FN = { HINDU: "hindu", HOLIDAYS: "holidays", TELUGU: "telugu", MALAYALAM: "malayalam", TAMIL: "tamil", GUJARATI: "gujarati", BENGALI: "bengali", HINDUFEST: "hindiFest" }, DC = {};
  const dataFor = (key, y) => (D[key] && D[key][y]) || (RD[key] && RD[key][y]) || (DC[key + y] = DC[key + y] || (G[FN[key]] || RG[FN[key]])(y));
  const MONF = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const MONH = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  const WDE = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const WDH = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
  const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const pad = n => String(n).padStart(2, "0");
  const wd = (y, m, d) => new Date(Date.UTC(y, m, d)).getUTCDay();
  const thisYear = +today.slice(0, 4), HUB_Y = YEARS.includes(thisYear) ? thisYear : YEARS[YEARS.length - 1];
  // find a festival by name in a year's data -> {mi, d, w} (used for the dynamic sentences below)
  const findFest = (key, y, name) => { const M = dataFor(key, y); for (let mi = 0; mi < 12; mi++) for (const [d, names] of M[mi]) if (names.some(n => n === name || n.startsWith(name))) return { mi, d, w: wd(y, mi, d) }; return null; };
  const dstr = f => f ? `${f.d} ${MONF[f.mi]}` : "";
  const adhikHi = (y) => { const a = G.adhik(y), n = G.nextAdhikYear(y); if (!a) return `<p lang="hi">${y} में कोई अधिक मास नहीं है, इसलिए सभी त्योहार अपने सामान्य चन्द्र मास में आते हैं।${n ? ` अगला अधिक मास ${n.year} में ${n.hi} मास में पड़ेगा।` : ""}</p>`; const s = parseInt(a.start.slice(8)), e = parseInt(a.end.slice(8)); return `<p lang="hi">${y} में ${a.hi} अधिक मास है, जो लगभग ${s} ${MONH[+a.start.slice(5, 7) - 1]} से ${e} ${MONH[+a.end.slice(5, 7) - 1]} तक चलता है। अधिक मास में सामान्यतः नए शुभ कार्य और व्रत-त्योहार नहीं होते, इसलिए इस महीने के मुख्य पर्व अधिक मास के बाद आते हैं।</p>`; };
  const adhikEn = (y) => { const a = G.adhik(y), n = G.nextAdhikYear(y); if (!a) return `<p>There is no Adhik Maas in ${y}, so every festival falls in its usual lunar month.${n ? ` The next Adhik Maas is Adhik ${n.en} in ${n.year}.` : ""}</p>`; return `<p>Because of the extra month, the main ${a.en} festivals fall after ${+a.end.slice(8)} ${MONF[+a.end.slice(5, 7) - 1]}. Between ${+a.start.slice(8)} ${MONF[+a.start.slice(5, 7) - 1]} and ${+a.end.slice(8)} ${MONF[+a.end.slice(5, 7) - 1]} the table shows the Adhik (extra month) vrats instead.</p>`; };
  const adhikShort = (y) => { const a = G.adhik(y), n = G.nextAdhikYear(y); return a ? `In ${y} it is Adhik ${a.en}, from about ${+a.start.slice(8)} ${MONF[+a.start.slice(5, 7) - 1]} to ${+a.end.slice(8)} ${MONF[+a.end.slice(5, 7) - 1]}.` : `There is no Adhik Maas in ${y}.${n ? ` The next one is Adhik ${n.en} in ${n.year}.` : ""}`; };

  const PAGES = [
    {
      slug: "/hindu-calendar/", key: "HINDU", crumb: "Hindu Calendar", emoji: "🕉️",
      title: y => `Hindu Calendar ${y} – Festivals, Vrat & Tithi Dates | ${BRAND}`,
      desc: y => `Hindu calendar ${y} (हिन्दू कैलेंडर ${y}) with every month's festivals, vrats, Ekadashi, Pradosh, Amavasya, Purnima and Sankashti dates. Delhi, IST.`,
      h1: y => `Hindu Calendar ${y} / हिन्दू कैलेंडर ${y}`,
      short: "Month-wise festivals, vrats and tithi days", shortHi: "हिन्दू कैलेंडर",
      colFest: "Festival / Vrat · त्योहार / व्रत",
      intro: y => `<p lang="hi">हिन्दू कैलेंडर चन्द्र-सौर पद्धति पर चलता है। महीने की गणना चन्द्रमा की कलाओं से और वर्ष की गणना सूर्य की गति से होती है, इसलिए त्योहारों की अंग्रेज़ी तारीखें हर साल बदलती हैं। नीचे ${y} के सभी प्रमुख त्योहार, व्रत और तिथि वाले दिन महीने के क्रम में दिए गए हैं।</p>
<p>The Hindu calendar is lunisolar: months follow the Moon's phases and the year is kept in step with the Sun. That is why festival dates move on the Gregorian calendar from year to year. This page lists the main festivals, vrats and tithi days of ${y} month by month, worked out for Delhi (IST). For city-wise tithi timings, see the <a href="/panchang/">Panchang Calendar</a>.</p>`,
      sections: y => `<h2>Hindu months and the Gregorian calendar / हिन्दू माह</h2>
<p>A lunar month runs from one new moon to the next and has two pakshas, Shukla (waxing) and Krishna (waning). The twelve months and the approximate Gregorian period they cover are listed below.</p>
<div class="tbl"><table class="ctbl"><thead><tr><th>Hindu month / माह</th><th>Approx. period</th><th>Hindu month / माह</th><th>Approx. period</th></tr></thead><tbody>
<tr><td><b>Chaitra / चैत्र</b></td><td>Mar – Apr</td><td><b>Ashwin / आश्विन</b></td><td>Sep – Oct</td></tr>
<tr><td><b>Vaishakha / वैशाख</b></td><td>Apr – May</td><td><b>Kartika / कार्तिक</b></td><td>Oct – Nov</td></tr>
<tr><td><b>Jyeshtha / ज्येष्ठ</b></td><td>May – Jun</td><td><b>Margashirsha / मार्गशीर्ष</b></td><td>Nov – Dec</td></tr>
<tr><td><b>Ashadha / आषाढ़</b></td><td>Jun – Jul</td><td><b>Pausha / पौष</b></td><td>Dec – Jan</td></tr>
<tr><td><b>Shravana / श्रावण</b></td><td>Jul – Aug</td><td><b>Magha / माघ</b></td><td>Jan – Feb</td></tr>
<tr><td><b>Bhadrapada / भाद्रपद</b></td><td>Aug – Sep</td><td><b>Phalguna / फाल्गुन</b></td><td>Feb – Mar</td></tr>
</tbody></table></div>
<h2>Adhik Maas in ${y} / अधिक मास</h2>
${adhikHi(y)}
${adhikEn(y)}
<h2>How to use this calendar</h2>
<p>Dates are given for Delhi. When a tithi runs across two sunrises, some festivals are observed on one day by Smarta families and on the next by Vaishnava traditions, so you may see two consecutive dates (for example Janmashtami). Where a tithi starts late in the evening, a city far from Delhi can see the festival a day earlier or later. Check the exact tithi timing for your city on the <a href="/panchang/">Panchang Calendar</a> or the vrat pages: <a href="/ekadashi-vrat/">Ekadashi</a>, <a href="/pradosh-vrat/">Pradosh</a>, <a href="/amavasya-dates/">Amavasya</a>, <a href="/purnima-vrat/">Purnima</a> and <a href="/sankashti-chaturthi/">Sankashti Chaturthi</a>.</p>`,
      faqs: y => [
        [`What is the Hindu calendar?`, `It is a lunisolar calendar in which months follow the lunar phases and the year follows the Sun. Extra (Adhik) months are added about every three years so that festivals stay in their seasons.`],
        [`Why do Hindu festival dates change every year?`, `Festivals are fixed by tithi (lunar day), not by the Gregorian date. A lunar year is about 11 days shorter than a solar year, so the same tithi lands on a different English date each year.`],
        [`What is Adhik Maas?`, `Adhik Maas is an extra lunar month added roughly every 32 months to keep the lunar and solar years aligned. ${adhikShort(y)}`],
        [`Why can the date differ from my local calendar or pandit?`, `Dates here are for Delhi. A tithi that spans two days, a different sunrise time at your city or a different regional tradition (Smarta, Vaishnava, Amanta, Purnimanta) can move the festival by a day. Confirm big festivals with your family pandit.`]
      ]
    },
    {
      slug: "/indian-holidays/", key: "HOLIDAYS", crumb: "Indian Holidays", emoji: "🇮🇳",
      title: y => `Indian Holidays ${y} – Festival & Public Holiday List | ${BRAND}`,
      desc: y => `Indian holidays ${y} (अवकाश कैलेंडर ${y}): Hindu, Christian, Sikh and Muslim festivals plus national days and observances, month by month.`,
      h1: y => `Indian Holidays ${y} / भारतीय अवकाश कैलेंडर ${y}`,
      short: "Public holidays, festivals and observances", shortHi: "भारतीय अवकाश",
      colFest: "Holiday / Festival · अवकाश / त्योहार",
      intro: y => `<p lang="hi">भारत में हिन्दू, मुस्लिम, ईसाई, सिख और अन्य समुदायों के त्योहारों के साथ राष्ट्रीय दिवस भी मनाए जाते हैं। नीचे ${y} की प्रमुख छुट्टियाँ और खास दिन महीने के हिसाब से दिए गए हैं।</p>
<p>This list covers the main festival days, national days and observances for ${y}, across Hindu, Christian, Sikh and Muslim traditions. Which of them is a public holiday depends on your state and employer, so treat it as a planning guide and check your official holiday notice.</p>`,
      sections: y => `<h2>Things to keep in mind / ध्यान दें</h2>
<ul><li>Only a few days, such as Republic Day (26 January), Independence Day (15 August) and Gandhi Jayanti (2 October), are observed as holidays across the whole country.</li><li>Most other public holidays are decided state by state, so the same festival can be a holiday in one state and a working day in another.</li><li>Islamic festivals follow local moon sighting, so the date can shift by a day. Dates marked "expected" in the table are the likely ones.</li><li>Central government holidays are notified every year by the Department of Personnel and Training. Banks follow the RBI holiday list for each state.</li></ul>
<p lang="hi">स्थानीय राज्य की छुट्टियाँ वहाँ की धार्मिक और सांस्कृतिक परंपराओं पर निर्भर करती हैं। अपने राज्य और संस्थान की आधिकारिक सूची ज़रूर देखें।</p>
<p>For the Hindu festival dates with their tithi, see the <a href="/hindu-calendar/">Hindu Calendar</a>. For South Indian festivals, see <a href="/telugu-festivals/">Telugu Festivals</a>.</p>`,
      faqs: y => [
        [`How many national holidays are there in India?`, `Three days are observed across the whole country: Republic Day on 26 January, Independence Day on 15 August and Gandhi Jayanti on 2 October. Other holidays are declared by the central government list or by each state.`],
        [`Why do Eid and Muharram dates change?`, `Islamic months start with the sighting of the new moon, so the date depends on when the moon is seen locally and can differ by a day.`],
        [`Is every festival in this list a holiday?`, `No. The list includes festivals, jayantis and observances. Whether an office, school or bank is closed depends on your state and organisation.`]
      ]
    },
    {
      slug: "/telugu-festivals/", key: "TELUGU", crumb: "Telugu Festivals", emoji: "🪔",
      title: y => `Telugu Festivals ${y} – Telugu Calendar & Panchangam Dates | ${BRAND}`,
      desc: y => `Telugu festivals ${y}: Ugadi, Varalakshmi Vratam, Nagula Chavithi, Ekadashi, Pradosh and Sankashtahara dates month by month, as per the Telugu panchangam.`,
      h1: y => `Telugu Festivals ${y} / తెలుగు పండుగలు ${y}`,
      short: "Telugu panchangam festival and vrat dates", shortHi: "तेलुगु त्योहार",
      colFest: "Festival / Vratam · పండుగ",
      intro: y => `<p lang="hi">तेलुगु पंचांग दक्षिणी अमान्त चन्द्र-सौर कैलेंडर पर आधारित है, जिसमें महीना अमावस्या से अमावस्या तक चलता है। इसका उपयोग आंध्र प्रदेश, तेलंगाना, कर्नाटक और महाराष्ट्र के कई समुदाय करते हैं। नीचे ${y} के तेलुगु त्योहार और व्रत की तारीखें हैं।</p>
<p>The Telugu panchangam (తెలుగు పంచాంగం) follows the Amanta lunisolar calendar, where each month runs from one new moon to the next. It is used across Andhra Pradesh and Telangana and by many Kannada and Marathi communities. The dates below are the festivals and vrats of ${y} in Telugu naming, worked out for Delhi (IST).</p>`,
      sections: y => `<h2>Telugu months / తెలుగు మాసాలు</h2>
<div class="tbl"><table class="ctbl"><thead><tr><th>Telugu month</th><th>Approx. period</th><th>Telugu month</th><th>Approx. period</th></tr></thead><tbody>
<tr><td><b>Chaitramu / చైత్రము</b></td><td>Mar – Apr</td><td><b>Ashvayujamu / ఆశ్వయుజము</b></td><td>Sep – Oct</td></tr>
<tr><td><b>Vaishakhamu / వైశాఖము</b></td><td>Apr – May</td><td><b>Karthikamu / కార్తీకము</b></td><td>Oct – Nov</td></tr>
<tr><td><b>Jyeshtamu / జ్యేష్ఠము</b></td><td>May – Jun</td><td><b>Margashiramu / మార్గశిరము</b></td><td>Nov – Dec</td></tr>
<tr><td><b>Ashadhamu / ఆషాఢము</b></td><td>Jun – Jul</td><td><b>Pushyamu / పుష్యము</b></td><td>Dec – Jan</td></tr>
<tr><td><b>Shravanamu / శ్రావణము</b></td><td>Jul – Aug</td><td><b>Maghamu / మాఘము</b></td><td>Jan – Feb</td></tr>
<tr><td><b>Bhadrapadamu / భాద్రపదము</b></td><td>Aug – Sep</td><td><b>Phalgunamu / ఫాల్గుణము</b></td><td>Feb – Mar</td></tr>
</tbody></table></div>
<h2>Telugu New Year (Ugadi) / ఉగాది</h2>
<p>The Telugu year begins on Chaitra Shukla Padyami, which is Ugadi. ${(f => f ? `In ${y} it falls on ${dstr(f)}.` : `Ugadi in ${y} is on Chaitra Shukla Padyami.`)(findFest("TELUGU", y, "Ugadi"))} Ugadi is welcomed with Ugadi pachadi, a mix of six tastes for the six moods of the year, and with the reading of the new year's panchangam.</p>
<h2>Popular Telugu festivals and vrats</h2>
<ul><li><b>Ugadi</b>: the Telugu New Year in March or April.</li><li><b>Varalakshmi Vratam</b>: observed by married women on the Friday before Shravana Purnima.</li><li><b>Nagula Chavithi</b>: Karthika Shukla Chaturthi, when snake deities are worshipped.</li><li><b>Atla Tadde</b>: a Gauri vrat kept on Ashvayuja Krishna Tadiya (third tithi).</li><li><b>Sankashtahara Chaturthi</b>: the monthly Ganesha fast after Purnima, named differently in each month.</li><li><b>Ekadashi and Pradosh</b>: the fortnightly Vishnu and Shiva vrats.</li></ul>
<p>For other regional and national dates, see the <a href="/hindu-calendar/">Hindu Calendar</a> and <a href="/indian-holidays/">Indian Holidays</a>. For Telugu daily timings, use <a href="/gowri-panchangam/">Gowri Panchangam</a> and <a href="/rahu-kaal/">Rahu Kalam</a>.</p>`,
      faqs: y => [
        [`Which calendar does the Telugu panchangam follow?`, `The Amanta lunisolar calendar, in which each month runs from one new moon to the next and has Shukla and Krishna pakshas.`],
        [`When is Ugadi in ${y}?`, `Ugadi, the Telugu New Year, falls on ${dstr(findFest("TELUGU", y, "Ugadi"))} ${y}.`],
        [`When is Varalakshmi Vratam in ${y}?`, `Varalakshmi Vratam is on Friday, ${dstr(findFest("TELUGU", y, "Varalakshmi Vratam"))} ${y}, the Friday before Shravana Purnima.`],
        [`Why do Telugu festival dates differ from the North Indian calendar?`, `The Telugu calendar names vrats differently (for example Sankashtahara for Sankashti), and a tithi that spans two days can put a festival one day apart in different traditions.`]
      ]
    }
    ,{
      slug: "/malayalam-festivals/", key: "MALAYALAM", crumb: "Malayalam Festivals", emoji: "🌺",
      title: y => `Malayalam Calendar ${y} – Festivals, Onam, Vishu & Sankramam Dates | ${BRAND}`,
      desc: y => `Malayalam calendar ${y} (മലയാളം കലണ്ടര്‍ ${y}): Onam, Vishu, Thiruvathira, Thrissur Pooram, Sankramam, Mandalakala and Guruvayur Ekadasi dates month by month.`,
      h1: y => `Malayalam Festivals ${y} / മലയാളം കലണ്ടര്‍ ${y}`,
      short: "Kollavarsham festivals: Onam, Vishu, Sankramam", shortHi: "मलयालम त्योहार",
      colFest: "Festival · ആഘോഷം",
      intro: y => `<p lang="hi">मलयालम कैलेंडर, जिसे कोल्लवर्षम कहते हैं, केरल का पारंपरिक सौर कैलेंडर है। इसके महीने सूर्य के राशि बदलने (संक्रमण) से शुरू होते हैं, और पहला महीना चिंगम है। नीचे ${y} के ओणम, विशु और अन्य त्योहारों की तारीखें हैं।</p>
<p>The Malayalam calendar (Kollavarsham, കൊല്ലവർഷം) is the traditional solar calendar of Kerala. Each month begins when the Sun enters a new zodiac sign (the Sankramam), and the year begins with Chingam, the month of Onam. The dates below are the festivals of ${y}, worked out for Delhi (IST).</p>`,
      sections: y => `<h2>Malayalam months / മലയാളം മാസങ്ങൾ</h2>
<div class="tbl"><table class="ctbl"><thead><tr><th>Malayalam month</th><th>Approx. period</th><th>Malayalam month</th><th>Approx. period</th></tr></thead><tbody>
<tr><td><b>Chingam / ചിങ്ങം</b></td><td>Aug – Sep</td><td><b>Makaram / മകരം</b></td><td>Jan – Feb</td></tr>
<tr><td><b>Kanni / കന്നി</b></td><td>Sep – Oct</td><td><b>Kumbham / കുംഭം</b></td><td>Feb – Mar</td></tr>
<tr><td><b>Thulam / തുലാം</b></td><td>Oct – Nov</td><td><b>Meenam / മീനം</b></td><td>Mar – Apr</td></tr>
<tr><td><b>Vrischikam / വൃശ്ചികം</b></td><td>Nov – Dec</td><td><b>Metam / മേടം</b></td><td>Apr – May</td></tr>
<tr><td><b>Dhanu / ധനു</b></td><td>Dec – Jan</td><td><b>Edavam / ഇടവം</b></td><td>May – Jun</td></tr>
<tr><td><b>Mithunam / മിഥുനം</b></td><td>Jun – Jul</td><td><b>Karkidakam / കർക്കടകം</b></td><td>Jul – Aug</td></tr>
</tbody></table></div>
<h2>Malayalam New Year and the Kollam year</h2>
<p>${(f => f ? `The Malayalam New Year falls on ${dstr(f)} ${y}, the first day of Chingam, and starts Kollavarsham ${y - 824}.` : "")(findFest("MALAYALAM", y, "Malayalam New Year"))} Kollavarsham counts from 825 CE, so the Kollam year is the Gregorian year minus 824 once Chingam begins. Karkidakam, the last month, is traditionally the month of the Ramayana reading.</p>
<h2>Popular Malayalam festivals</h2>
<ul><li><b>Onam</b>: Thiruvonam, when the Shravana nakshatra falls in Chingam.</li><li><b>Vishu</b>: the first day of Metam, with the Vishukkani ritual and Vishukkaineettam.</li><li><b>Thiruvathira</b>: the Ardra nakshatra in Dhanu, celebrated mainly by women.</li><li><b>Thrissur Pooram</b>: the Pooram nakshatra of Metam.</li><li><b>Makaravilakku</b>: Makara Sankramam at Sabarimala. <b>Mandalakala</b> is the 41-day season that begins on Vrischikam 1.</li><li><b>Sankramam</b>: the first day of each solar month.</li></ul>
<p>Eclipses are shown for 2026 only. For other regional dates, see the <a href="/tamil-festivals/">Tamil Festivals</a>, <a href="/telugu-festivals/">Telugu Festivals</a> and <a href="/hindu-calendar/">Hindu Calendar</a>.</p>`,
      faqs: y => [
        [`When is Onam in ${y}?`, `Onam (Thiruvonam) falls on ${dstr(findFest("MALAYALAM", y, "Onam"))} ${y}, the day the Shravana nakshatra rules in the month of Chingam.`],
        [`When is Vishu in ${y}?`, `Vishu is on ${dstr(findFest("MALAYALAM", y, "Vishu"))} ${y}, the first day of Metam. It moves between 14 and 15 April depending on when the Sun enters Mesha.`],
        [`When is the Malayalam New Year in ${y}?`, `The Malayalam New Year (Chingam 1) is on ${dstr(findFest("MALAYALAM", y, "Malayalam New Year"))} ${y}.`],
        [`Is the Malayalam calendar solar or lunar?`, `It is a solar calendar. Months start at the Sun's transit into a new sign (Sankramam), while festivals such as Onam and Vishu also use the nakshatra.`]
      ]
    }
    ,{
      slug: "/tamil-festivals/", key: "TAMIL", crumb: "Tamil Festivals", emoji: "🌾",
      title: y => `Tamil Calendar ${y} – Festivals, Pongal, Puthandu & Karthigai Deepam | ${BRAND}`,
      desc: y => `Tamil calendar ${y} (தமிழ் பஞ்சாங்கம் ${y}): Pongal, Puthandu, Thai Pusam, Chitra Pournami, Avani Avittam, Deepavali and Karthigai Deepam dates month by month.`,
      h1: y => `Tamil Festivals ${y} / தமிழ் காலண்டர் ${y}`,
      short: "Tamil panchangam: Pongal, Puthandu, Deepam", shortHi: "तमिल त्योहार",
      colFest: "Festival · பண்டிகை",
      intro: y => `<p lang="hi">तमिल पंचांग मुख्यतः सौर कैलेंडर है, जिसका उपयोग तमिलनाडु, पुदुचेरी, मलेशिया, सिंगापुर और श्रीलंका के तमिल समुदाय करते हैं। नए साल पुथांडु की शुरुआत चित्तिरई महीने से होती है। नीचे ${y} के तमिल त्योहार दिए गए हैं।</p>
<p>The Tamil calendar (தமிழ் பஞ்சாங்கம்) is a solar calendar used in Tamil Nadu, Puducherry, Malaysia, Singapore and Sri Lanka. Months begin when the Sun enters a new sign, and the new year, Puthandu, begins with Chithirai. The dates below are the festivals of ${y}, worked out for Delhi (IST).</p>`,
      sections: y => `<h2>Tamil months / தமிழ் மாதங்கள்</h2>
<div class="tbl"><table class="ctbl"><thead><tr><th>Tamil month</th><th>Approx. period</th><th>Tamil month</th><th>Approx. period</th></tr></thead><tbody>
<tr><td><b>Chithirai / சித்திரை</b></td><td>Apr – May</td><td><b>Aippasi / ஐப்பசி</b></td><td>Oct – Nov</td></tr>
<tr><td><b>Vaikasi / வைகாசி</b></td><td>May – Jun</td><td><b>Karthigai / கார்த்திகை</b></td><td>Nov – Dec</td></tr>
<tr><td><b>Aani / ஆனி</b></td><td>Jun – Jul</td><td><b>Margazhi / மார்கழி</b></td><td>Dec – Jan</td></tr>
<tr><td><b>Aadi / ஆடி</b></td><td>Jul – Aug</td><td><b>Thai / தை</b></td><td>Jan – Feb</td></tr>
<tr><td><b>Avani / ஆவணி</b></td><td>Aug – Sep</td><td><b>Maasi / மாசி</b></td><td>Feb – Mar</td></tr>
<tr><td><b>Purattasi / புரட்டாசி</b></td><td>Sep – Oct</td><td><b>Panguni / பங்குனி</b></td><td>Mar – Apr</td></tr>
</tbody></table></div>
<h2>Tamil New Year (Puthandu) / புத்தாண்டு</h2>
<p>${(f => f ? `Puthandu, the Tamil New Year, falls on ${dstr(f)} ${y}, the first day of Chithirai.` : "")(findFest("TAMIL", y, "Puthandu"))} It is marked with the mango pachadi, a visit to the temple and kolam at the doorstep. Pongal, the harvest festival, is on the first day of Thai.</p>
<h2>Popular Tamil festivals</h2>
<ul><li><b>Pongal</b>: Thai 1, with Bhogi the day before and Mattu Pongal the day after.</li><li><b>Thai Pusam</b> and <b>Panguni Uthiram</b>: star-based festivals of Murugan.</li><li><b>Chitra Pournami</b>, <b>Vaikasi Visakam</b> and <b>Aadi Perukku</b>: festivals of the Tamil months.</li><li><b>Avani Avittam</b>: the sacred thread change, on different days for Rigveda, Yajurveda and Samaveda.</li><li><b>Karthigai Deepam</b>: the festival of lamps, when the Krittika star rules in Karthigai.</li><li><b>Soora Samharam</b> and <b>Subrahmanya Sashti</b>: Skanda festivals on the Sashti tithi.</li></ul>
<p>Eclipses and the Smarta/ISKCON split of Rama Navami are shown for 2026 only. For other regional dates, see the <a href="/malayalam-festivals/">Malayalam Festivals</a>, <a href="/telugu-festivals/">Telugu Festivals</a> and <a href="/hindu-calendar/">Hindu Calendar</a>.</p>`,
      faqs: y => [
        [`When is Pongal in ${y}?`, `Pongal is on ${dstr(findFest("TAMIL", y, "Pongal"))} ${y}, the first day of Thai. Bhogi is the day before and Mattu Pongal the day after.`],
        [`When is Tamil New Year (Puthandu) in ${y}?`, `Puthandu falls on ${dstr(findFest("TAMIL", y, "Puthandu"))} ${y}, the first day of Chithirai.`],
        [`When is Karthigai Deepam in ${y}?`, `Karthigai Deepam is on ${dstr(findFest("TAMIL", y, "Karthigai Deepam"))} ${y}.`],
        [`Is the Tamil calendar solar or lunar?`, `The month cycle is solar, with each month starting when the Sun enters a new sign. Many festivals combine this with a tithi or a nakshatra.`]
      ]
    }
    ,{
      slug: "/gujarati-festivals/", key: "GUJARATI", crumb: "Gujarati Festivals", emoji: "🪁",
      title: y => `Gujarati Calendar ${y} – Festivals, Tithi, Ekadashi & Vrat Dates | ${BRAND}`,
      desc: y => `Gujarati calendar ${y} (ગુજરાતી કૅલેન્ડર ${y}): Uttarayana, Navratri, Diwali, Bestu Varas, Ekadashi, Sankashta Chaturthi and Chandra Darshana dates month by month.`,
      h1: y => `Gujarati Festivals ${y} / ગુજરાતી કૅલેન્ડર ${y}`,
      short: "Vikram Samvat festivals, Ekadashi and vrats", shortHi: "गुजराती त्योहार",
      colFest: "Festival / Vrat · તહેવાર",
      intro: y => `<p lang="hi">गुजराती कैलेंडर विक्रम संवत पर आधारित चन्द्र-सौर कैलेंडर है। इसका नया साल दिवाली के अगले दिन, कार्तिक शुक्ल प्रतिपदा (बेस्तु वरस) से शुरू होता है। नीचे ${y} के गुजराती त्योहार और व्रत हैं।</p>
<p>The Gujarati calendar (ગુજરાતી કૅલેન્ડર) is a lunisolar calendar based on Vikram Samvat. Months run from new moon to new moon (Amanta), and the year begins on Kartik Shukla Pratipada, the day after Diwali. The dates below are the festivals and vrats of ${y}, worked out for Delhi (IST).</p>`,
      sections: y => `<h2>Gujarati months / ગુજરાતી મહિના</h2>
<div class="tbl"><table class="ctbl"><thead><tr><th>Gujarati month</th><th>Approx. period</th><th>Gujarati month</th><th>Approx. period</th></tr></thead><tbody>
<tr><td><b>Kartak / કારતક</b></td><td>Oct – Nov</td><td><b>Vaishakh / વૈશાખ</b></td><td>Apr – May</td></tr>
<tr><td><b>Magshar / માગશર</b></td><td>Nov – Dec</td><td><b>Jeth / જેઠ</b></td><td>May – Jun</td></tr>
<tr><td><b>Posh / પોષ</b></td><td>Dec – Jan</td><td><b>Ashadh / અષાડ</b></td><td>Jun – Jul</td></tr>
<tr><td><b>Maha / મહા</b></td><td>Jan – Feb</td><td><b>Shravan / શ્રાવણ</b></td><td>Jul – Aug</td></tr>
<tr><td><b>Fagan / ફાગણ</b></td><td>Feb – Mar</td><td><b>Bhadarvo / ભાદરવો</b></td><td>Aug – Sep</td></tr>
<tr><td><b>Chaitra / ચૈત્ર</b></td><td>Mar – Apr</td><td><b>Aaso / આસો</b></td><td>Sep – Oct</td></tr>
</tbody></table></div>
<h2>Gujarati New Year (Bestu Varas) / બેસતું વર્ષ</h2>
<p>${(f => f ? `The Gujarati New Year falls on ${dstr(f)} ${y} and begins Vikram Samvat ${y + 57}.` : "")(findFest("GUJARATI", y, "Bestu Varsh"))} Vikram Samvat runs 57 years ahead of the Gregorian year, and the Gujarati year starts in Kartak instead of Chaitra. ${adhikShort(y)} An Adhik Mahino (extra month) is added about every 30 months to keep the lunar months in step with the seasons.</p>
<h2>Popular Gujarati festivals and vrats</h2>
<ul><li><b>Uttarayana</b>: Makara Sankranti, the kite festival.</li><li><b>Navratri</b> and <b>Sharad Purnima</b>: nine nights of garba, then the Kojagari full moon.</li><li><b>Diwali</b> and <b>Bestu Varas</b>: Dhanteras, Kali Chaudas, Lakshmi Puja and the new year on the next day.</li><li><b>Jaya Parvati and Gauri Vrat</b>: fasts of young girls in Ashadh.</li><li><b>Randhan Chhath, Shitala Satam and Nag Pancham</b>: the three days before Janmashtami.</li><li><b>Sankashta, Ekadashi and Chandra Darshana</b>: the monthly fasts and moon sightings.</li></ul>
<p>Where two traditions differ, an Ekadashi is shown on both days as Gauna and Vaishnava. Eclipses are shown for 2026 only. For other dates, see the <a href="/hindu-calendar/">Hindu Calendar</a>, <a href="/indian-holidays/">Indian Holidays</a> and the <a href="/aaj-ka-panchang/">Aaj ka Panchang</a>.</p>`,
      faqs: y => [
        [`When is the Gujarati New Year in ${y}?`, `The Gujarati New Year (Bestu Varas) is on ${dstr(findFest("GUJARATI", y, "Bestu Varsh"))} ${y}, the day after Diwali.`],
        [`When is Uttarayana in ${y}?`, `Uttarayana (Makara Sankranti) is on ${dstr(findFest("GUJARATI", y, "Makara Sankranti"))} ${y}.`],
        [`When is Diwali in ${y}?`, `Diwali (Lakshmi Puja) is on ${dstr(findFest("GUJARATI", y, "Diwali"))} ${y}.`],
        [`What is Chandra Darshana?`, `It is the first sighting of the new Moon after Amavasya, in the evening of Shukla Dwitiya. Many families offer prayers and some begin fasts on this day.`]
      ]
    }
    ,{
      slug: "/bengali-festivals/", key: "BENGALI", crumb: "Bengali Festivals", emoji: "🪷",
      title: y => `Bengali Calendar ${y} – Festivals, Durga Puja, Poila Boishakh & Kali Puja Dates | ${BRAND}`,
      desc: y => `Bengali calendar ${y} (বাঙালি ক্যালেন্ডার ${y}): Pohela Boishakha, Durga Puja, Lakshmi Puja, Kali Puja, Bhai Phonta, Jagaddhatri Puja and Sankranti dates month by month.`,
      h1: y => `Bengali Festivals ${y} / বাঙালি ক্যালেন্ডার ${y}`,
      short: "Bengali panjika: Poila Boishakh, Durga Puja, Kali Puja", shortHi: "बंगाली त्योहार",
      colFest: "Festival · উৎসব",
      intro: y => `<p lang="hi">बंगाली पंजिका मुख्यतः सौर कैलेंडर है, जिसका उपयोग पश्चिम बंगाल, त्रिपुरा, असम और बांग्लादेश के बंगाली समुदाय करते हैं। बंगाली नववर्ष पोइला बैशाख से शुरू होता है। नीचे ${y} के बंगाली त्योहारों की तारीखें हैं।</p>
<p>The Bengali calendar (Panjika, বাঙালি পঞ্জিকা) is a solar calendar used in West Bengal, Tripura, Assam and Bangladesh. The year begins with Boishakh, and the festival season peaks with Durga Puja in autumn. The dates below are the festivals of ${y}, worked out for Delhi (IST).</p>`,
      sections: y => `<h2>Bengali months / বাংলা মাস</h2>
<div class="tbl"><table class="ctbl"><thead><tr><th>Bengali month</th><th>Approx. period</th><th>Bengali month</th><th>Approx. period</th></tr></thead><tbody>
<tr><td><b>Boishakh / বৈশাখ</b></td><td>Apr – May</td><td><b>Kartik / কার্তিক</b></td><td>Oct – Nov</td></tr>
<tr><td><b>Joishtho / জ্যৈষ্ঠ</b></td><td>May – Jun</td><td><b>Ogrohayon / অগ্রহায়ণ</b></td><td>Nov – Dec</td></tr>
<tr><td><b>Asharh / আষাঢ়</b></td><td>Jun – Jul</td><td><b>Poush / পৌষ</b></td><td>Dec – Jan</td></tr>
<tr><td><b>Shrabon / শ্রাবণ</b></td><td>Jul – Aug</td><td><b>Magh / মাঘ</b></td><td>Jan – Feb</td></tr>
<tr><td><b>Bhadro / ভাদ্র</b></td><td>Aug – Sep</td><td><b>Falgun / ফাল্গুন</b></td><td>Feb – Mar</td></tr>
<tr><td><b>Ashwin / আশ্বিন</b></td><td>Sep – Oct</td><td><b>Choitro / চৈত্র</b></td><td>Mar – Apr</td></tr>
</tbody></table></div>
<h2>Bengali New Year (Pohela Boishakh) / পহেলা বৈশাখ</h2>
<p>${(f => f ? `Pohela Boishakha falls on ${dstr(f)} ${y} and begins the Bengali year ${y - 593} (Bangabda).` : "")(findFest("BENGALI", y, "Pohela Boishakha"))} The Bengali year is the Gregorian year minus 593 once Boishakh begins. The day is marked with new clothes, sweets and Halkhata, the opening of new account books.</p>
<h2>Durga Puja and the festival season</h2>
<p>${(f => f ? `Durga Puja ${y} runs from Kalparambha and Akal Bodhon on ${dstr(f)} to Vijayadashami on ${dstr(findFest("BENGALI", y, "Vijayadashami"))}.` : "")(findFest("BENGALI", y, "Kalparambha"))} It begins with Mahalaya, followed by Shashthi, Saptami, Ashtami (with Sandhi Puja), Navami and Dashami. Lakshmi Puja is on the next full moon, and Kali Puja falls on the Diwali amavasya, followed by Bhai Phonta.</p>
<h2>Popular Bengali festivals</h2>
<ul><li><b>Poila Boishakh</b>: the Bengali New Year, in mid-April.</li><li><b>Dol Purnima</b> and <b>Saraswati Puja</b>: the spring festivals of colour and learning.</li><li><b>Jamai Shashti</b>: honouring sons-in-law in Joishtho.</li><li><b>Ratha Jatra</b> and <b>Rakhi Bandhan</b>: the summer festivals.</li><li><b>Durga Puja</b>, <b>Lakshmi Puja</b>, <b>Kali Puja</b> and <b>Bhai Phonta</b>: the autumn festival season.</li><li><b>Sankranti</b>: the first day of each solar month, such as Poush Sankranti.</li></ul>
<p>Eclipses and the Smarta/ISKCON split of Rama Navami are shown for 2026 only. For other dates, see the <a href="/hindu-calendar/">Hindu Calendar</a> and <a href="/diwali/">Diwali</a>.</p>`,
      faqs: y => [
        [`When is Durga Puja in ${y}?`, `Durga Ashtami is on ${dstr(findFest("BENGALI", y, "Durga Ashtami"))} ${y} and Vijayadashami on ${dstr(findFest("BENGALI", y, "Vijayadashami"))} ${y}.`],
        [`When is Pohela Boishakh in ${y}?`, `The Bengali New Year (Pohela Boishakha) is on ${dstr(findFest("BENGALI", y, "Pohela Boishakha"))} ${y}.`],
        [`When is Kali Puja in ${y}?`, `Kali Puja (Dipabali) is on ${dstr(findFest("BENGALI", y, "Kali Puja"))} ${y}, with Bhai Phonta on ${dstr(findFest("BENGALI", y, "Bhai Phonta"))} ${y}.`],
        [`Is the Bengali calendar solar or lunar?`, `The months are solar, starting at each Sankranti, while Durga Puja, Lakshmi Puja and Dol Purnima follow the lunar tithi.`]
      ]
    }
    ,{
      slug: "/hindu-festivals/", key: "HINDUFEST", crumb: "Hindu Festivals", emoji: "🛕",
      title: y => `हिन्दू त्यौहार ${y} – Hindu Festivals ${y} List, Dates & Vrat Calendar | ${BRAND}`,
      desc: y => `हिन्दू त्यौहार ${y}: होली, राम नवमी, नवरात्रि, दशहरा, दीवाली, एकादशी, प्रदोष, संकष्टी और सभी हिन्दू व्रत-त्योहारों की तारीखें महीने के क्रम में। Hindu festivals ${y} in Hindi.`,
      h1: y => `हिन्दू त्यौहार ${y} / Hindu Festivals ${y}`,
      short: "हिन्दू त्यौहारों की महीनेवार सूची (हिन्दी)", shortHi: "हिन्दू त्यौहार",
      colFest: "त्यौहार / व्रत · Festival",
      intro: y => `<p lang="hi">${y} के सभी प्रमुख हिन्दू त्यौहार और व्रत महीने के क्रम में नीचे दिए गए हैं। इनमें होली, राम नवमी, नवरात्रि, दशहरा, दीवाली जैसे बड़े त्यौहारों के साथ एकादशी, प्रदोष, संकष्टी चतुर्थी, पूर्णिमा और अमावस्या भी शामिल हैं। तारीखें दिल्ली (IST) के लिए हैं।</p>
<p>This is the Hindi festival list for ${y}, month by month, worked out for Delhi (IST). For the English list with more regional names, see the <a href="/hindu-calendar/${y}/">Hindu Calendar ${y}</a>; for Diwali timings, see <a href="/diwali/${y}/">Diwali ${y}</a>.</p>`,
      sections: y => `<h2>प्रमुख त्यौहार ${y} / Major festivals of ${y}</h2>
<ul>${[["holi", "होली", "Holi"], ["ramnavami", "राम नवमी", "Ram Navami"], ["akshaya", "अक्षय तृतीया", "Akshaya Tritiya"], ["raksha", "रक्षा बंधन", "Raksha Bandhan"], ["janmashtami", "कृष्ण जन्माष्टमी", "Krishna Janmashtami"], ["ganesh", "गणेश चतुर्थी", "Ganesh Chaturthi"], ["sharadnav", "शारदीय नवरात्रि", "Sharad Navratri"], ["dussehra", "दशहरा", "Dussehra"], ["karwa", "करवा चौथ", "Karwa Chauth"], ["diwali", "दीवाली", "Diwali"]].map(([id, hi, en]) => { const iso = G._h.base(y).byId[id]; if (!iso) return ""; const [yy, m, d] = iso.split("-").map(Number); return `<li><b>${hi} / ${en}</b>: ${d} ${MONF[m - 1]} ${y}</li>`; }).join("")}</ul>
<p lang="hi">हिन्दू त्यौहार चन्द्र तिथि और सौर संक्रांति दोनों पर आधारित हैं, इसलिए अंग्रेज़ी तारीखें हर साल बदलती हैं। जब कोई तिथि दो दिन पड़ती है, तो अलग-अलग परंपराओं में त्यौहार एक दिन आगे-पीछे हो सकता है।</p>
<p>See also the <a href="/vrats/">vrat dates</a> (Ekadashi, Pradosh, Sankashti), the <a href="/diwali/${y}/">Diwali ${y}</a> calendar and the <a href="/indian-holidays/${y}/">Indian Holidays ${y}</a> list.</p>`,
      faqs: y => [
        [`${y} में दीवाली कब है? / When is Diwali in ${y}?`, `Diwali ${y} is on ${dstr(findFest("HINDUFEST", y, "दिवाली") || findFest("HINDUFEST", y, "दीपावली") || findFest("HINDUFEST", y, "दीवाली"))} ${y}. See the Diwali page for the Lakshmi Puja muhurat.`],
        [`${y} में होली कब है? / When is Holi in ${y}?`, `Holi (Dhulandi) is on ${dstr(findFest("HINDUFEST", y, "होली"))} ${y}, the day after Holika Dahan.`],
        [`Why do Hindu festival dates change every year?`, `Hindu festivals follow lunar tithis and the Sun's transit, which do not match the Gregorian calendar, so the date moves each year.`],
        [`क्या सभी त्यौहार छुट्टी होते हैं?`, `नहीं। इस सूची में त्यौहार, व्रत और तिथियाँ शामिल हैं। छुट्टी आपके राज्य और संस्थान की सूची पर निर्भर करती है।`]
      ]
    }
  ];

  const monthBlock = (key, y, mi) => {
    const rows = dataFor(key, y)[mi].map(([d, names]) => {
      const iso = `${y}-${pad(mi + 1)}-${pad(d)}`, w = wd(y, mi, d);
      const uniq = [...new Set(names)];
      return `<tr${iso < today ? ' class="past"' : ""}><td><b>${pad(d)}</b></td><td>${WDE[w]} / ${WDH[w]}</td><td>${uniq.map(esc).join(", ")}</td></tr>`;
    }).join("");
    return rows;
  };

  const nextUp = (key, y) => {
    const out = [];
    [y, y + 1].filter(yy => YEARS.includes(yy)).forEach(yy => dataFor(key, yy).forEach((m, mi) => m.forEach(([d, names]) => {
      const iso = `${yy}-${pad(mi + 1)}-${pad(d)}`;
      if (iso >= today && out.length < 3) out.push({ iso, y: yy, d, mi, names: [...new Set(names)] });
    })));
    return out;
  };

  const years = k => YEARS;
  const jump = y => `<div class="mjump">${MONF.map((m, i) => `<a href="#m-${i + 1}">${m.slice(0, 3)}</a>`).join("")}</div>`;

  const ynav = (P, cur, hub) => `<nav class="ynav" aria-label="Choose year">${YEARS.map(yy => `<a href="${P.slug}${yy}/"${!hub && yy === cur ? ' class="act" aria-current="page"' : ""}>${yy}</a>`).join("")}${hub ? "" : `<a href="${P.slug}">Upcoming</a>`}</nav>`;

  PAGES.forEach(P => {
    const render = (y, isHub) => {
      const faqs = P.faqs(y);
      const up = nextUp(P.key, y);
      const upHtml = up.length ? `<div class="mvu"><h4>Next up / आगामी</h4>${up.map(u => `<div><b>${u.d} ${MONF[u.mi].slice(0, 3)}${u.y !== y ? " " + u.y : ""}</b> (${WDE[wd(u.y, u.mi, u.d)].slice(0, 3)}) &ndash; ${u.names.map(esc).join(", ")}</div>`).join("")}</div>` : "";
      const months = MONF.map((m, mi) => dataFor(P.key, y)[mi].length ? `<h2 id="m-${mi + 1}" class="mh">${m} ${y} / ${MONH[mi]} ${y}</h2>
<div class="tbl"><table class="ctbl"><thead><tr><th style="width:70px">Date / तिथि</th><th style="width:190px">Day / वार</th><th>${P.colFest}</th></tr></thead><tbody>${monthBlock(P.key, y, mi)}</tbody></table></div>` : "").join("\n");
      const others = PAGES.filter(o => o !== P).map(o => [o.slug, `${o.crumb} ${y}`]);
      const urlPath = isHub ? P.slug : `${P.slug}${y}/`;
      write(urlPath, layout({
        urlPath, canonicalPath: !isHub && y === HUB_Y ? P.slug : null,
        title: P.title(y), description: P.desc(y), h1: P.h1(y), crumbLabel: isHub ? P.crumb : `${P.crumb} ${y}`,
        bodyHtml: `${P.intro(y)}${upHtml}\n${ynav(P, y, isHub)}\n${jump(y)}\n${months}\n${P.sections(y)}
<h2 id="faq">${P.crumb} FAQs</h2>
${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}
<p class="disc2">Dates are for Delhi (IST) and may differ by a day in other cities or traditions. Confirm important festivals with your family pandit.</p>
${citiesBlock}`,
        extraJsonLd: [faqSchema(faqs)],
        related: others.concat([["/panchang/", "Panchang Calendar"], ["/vrats/", "All Vrats"]])
      }));
    };
    YEARS.forEach(y => render(y, false));
    render(HUB_Y, true);   // /hindu-calendar/ etc. always show the current year (switches to the new year automatically)
  });

  // hub page
  const Y0 = HUB_Y;
  write("/calendar/", layout({
    urlPath: "/calendar/", title: `Calendar ${Y0} – Hindu, Telugu, Malayalam, Tamil, Gujarati Festivals | ${BRAND}`,
    description: `Festival calendars for ${Y0}: Hindu calendar, Indian holidays, and Telugu, Malayalam, Tamil and Gujarati festivals, month by month.`,
    h1: `Festival Calendars ${Y0} / कैलेंडर ${Y0}`, crumbLabel: "Calendar",
    bodyHtml: `<p>Pick a calendar to see the festivals, vrats and holidays of ${Y0} month by month. Other years (${YEARS[0]}–${YEARS[YEARS.length - 1]}) are linked at the top of each calendar.</p>
<div class="tiles">${PAGES.map(P => `<a class="tile" href="${P.slug}" style="text-decoration:none"><span>${P.emoji}</span>${P.crumb} ${Y0}<br><small>${P.short}</small></a>`).join("")}</div>
<p>Looking for daily timings instead? Try <a href="/aaj-ka-panchang/">Aaj ka Panchang</a>, <a href="/choghadiya/">Choghadiya</a> or the <a href="/vrats/">Vrat dates</a>.</p>
${citiesBlock}`,
    related: [["/panchang/", "Panchang Calendar"], ["/vrats/", "All Vrats"], ["/shubh-muhurat/", "Shubh Muhurat"]]
  }));
};
