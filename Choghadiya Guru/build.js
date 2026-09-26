const fs = require("fs"), path = require("path");
const ROOT = __dirname;
const SITE = "https://choghadiyaguru.example"; // <-- REPLACE with your real domain before deploy
const BRAND = "Choghadiya Guru";
const TODAY = new Date().toISOString().slice(0, 10);

// Each item: [href, label] for a plain link, or [href, label, children] for a dropdown.
// children: array of [href, label] — clicking any of these opens ONLY that tool's own page.
const NAV = [
  ["/", "Home", null, "होम"],
  ["/choghadiya/", "Choghadiya", [
    ["/choghadiya/", "Aaj ka Choghadiya", "आज का चौघड़िया"],
    ["/hora/", "Shubh Hora", "शुभ होरा"],
    ["/abhijit-muhurat/", "Abhijit Muhurat", "अभिजीत मुहूर्त"],
    ["/rahu-kaal/", "Rahu Kalam", "राहु काल"],
    ["/gowri-panchangam/", "Gowri Panchangam", "गौरी पंचांगम"]
  ], "चौघड़िया"],
  ["/shubh-muhurat/", "Shubh Muhurat", null, "शुभ मुहूर्त"],
  ["/what-is-choghadiya/", "Guide", null, "गाइड"]
];

// Top cities that get their own dedicated /choghadiya/<slug>/ landing page.
const TOP_CITIES = [
  "New Delhi|Delhi", "Mumbai|Maharashtra", "Bengaluru|Karnataka", "Hyderabad|Telangana", "Ahmedabad|Gujarat",
  "Chennai|Tamil Nadu", "Kolkata|West Bengal", "Pune|Maharashtra", "Jaipur|Rajasthan", "Surat|Gujarat",
  "Lucknow|Uttar Pradesh", "Kanpur|Uttar Pradesh", "Nagpur|Maharashtra", "Indore|Madhya Pradesh", "Bhopal|Madhya Pradesh",
  "Patna|Bihar", "Vadodara|Gujarat", "Ludhiana|Punjab", "Agra|Uttar Pradesh", "Nashik|Maharashtra",
  "Rajkot|Gujarat", "Varanasi|Uttar Pradesh", "Chandigarh|Chandigarh", "Jodhpur|Rajasthan", "Udaipur|Rajasthan"
];
const slugify = s => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// t(english, hindi) -> renders both; CSS shows only the active language (client-side toggle, no reload).
function t(en, hi) { return `<span class="t-en">${en}</span><span class="t-hi">${hi}</span>`; }

function faqSchema(pairs) {
  return JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: pairs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }))
  });
}
function breadcrumbSchema(urlPath, label) {
  const items = [{ "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" }];
  if (urlPath !== "/") items.push({ "@type": "ListItem", position: 2, name: label, item: SITE + urlPath });
  return JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items });
}

function layout({ urlPath, title, description, h1, crumbLabel, bodyHtml, extraJsonLd = [], defaultCity = null, lockCity = false, related = [] }) {
  const canonical = SITE + urlPath;
  const navHtml = NAV.map(([href, label, children, hiLabel]) => {
    if (children) {
      const childIsActive = children.some(c => c[0] === urlPath);
      const subHtml = children.map(([chref, chlabel, chhi]) =>
        `<li><a${urlPath === chref ? ' class="act"' : ""} href="${chref}">${t(chlabel, chhi)}</a></li>`).join("");
      return `<li class="has-drop${childIsActive ? " act" : ""}">
<a${urlPath === href ? ' class="act"' : ""} href="${href}" aria-haspopup="true" aria-expanded="false">${t(label, hiLabel)} <i class="caret">▾</i></a>
<ul class="dropmenu">${subHtml}</ul>
</li>`;
    }
    return `<li><a${urlPath === href ? ' class="act"' : ""} href="${href}">${t(label, hiLabel)}</a></li>`;
  }).join("");
  const jsonLd = [breadcrumbSchema(urlPath, crumbLabel)].concat(extraJsonLd)
    .map(j => `<script type="application/ld+json">${j}</script>`).join("\n");
  const relatedHtml = related.length ? `<div class="related"><h3>${t("Related pages", "संबंधित पृष्ठ")}</h3>${related.map(r => `<a href="${r[0]}">${r[1]}</a>`).join("")}</div>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<script>try{if(localStorage.getItem("chg_lang")==="hi"){document.documentElement.className="lang-hi";document.documentElement.lang="hi";}}catch(e){}</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%AA%94%3C/text%3E%3C/svg%3E">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
${jsonLd}
</head>
<body>
<nav class="navbar"><div class="wrap navwrap">
<a class="brand" href="/">🪔 <span>${BRAND}</span></a>
<div class="navright">
<button class="langbtn" id="langBtn" aria-label="Switch language / भाषा बदलें" aria-pressed="false">EN <span class="lsep">/</span> हिं</button>
<button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">☰</button>
</div>
<ul class="navlinks" id="navlinks">${navHtml}</ul>
</div></nav>
<main class="wrap" id="top">
<p class="crumb"><a href="/">${t("Home", "होम")}</a>${urlPath !== "/" ? ` &nbsp;/&nbsp; ${crumbLabel}` : ""}</p>
<section class="panel">
<div class="body">
<h1 style="margin:6px 0 4px">${h1}</h1>
${bodyHtml}
${relatedHtml}
</div>
</section>
</main>
<footer class="foot"><div class="wrap">
<div class="cols4">
<div><h4>${t("Panchang Tools", "पंचांग टूल्स")}</h4><a href="/choghadiya/">${t("Today's Choghadiya", "आज का चौघड़िया")}</a><a href="/hora/">${t("Shubh Hora", "शुभ होरा")}</a><a href="/gowri-panchangam/">${t("Gowri Panchangam", "गौरी पंचांगम")}</a><a href="/rahu-kaal/">${t("Rahu Kaal", "राहु काल")}</a><a href="/abhijit-muhurat/">${t("Abhijit Muhurat", "अभिजीत मुहूर्त")}</a></div>
<div><h4>${t("Shubh Muhurat", "शुभ मुहूर्त")}</h4><a href="/shubh-muhurat/">${t("Marriage", "विवाह")}</a><a href="/shubh-muhurat/">${t("New Vehicle", "नया वाहन")}</a><a href="/shubh-muhurat/">${t("New Property", "नई संपत्ति")}</a><a href="/shubh-muhurat/">${t("Business", "व्यापार")}</a><a href="/shubh-muhurat/">${t("Mundan", "मुंडन")}</a></div>
<div><h4>${t("Learn", "जानें")}</h4><a href="/what-is-choghadiya/">${t("What is Choghadiya", "चौघड़िया क्या है")}</a><a href="/what-is-choghadiya/#faq">${t("FAQs", "सामान्य प्रश्न")}</a></div>
<div><h4>${t("About " + BRAND, BRAND + " के बारे में")}</h4><p>${t("Simple, free choghadiya, hora, Gowri Panchangam, Rahu Kaal and Abhijit muhurat timings for Indian cities, calculated in your browser.", "भारतीय शहरों के लिए सरल, मुफ़्त चौघड़िया, होरा, गौरी पंचांगम, राहु काल और अभिजीत मुहूर्त — आपके ब्राउज़र में ही गणना।")}</p></div>
</div>
<p class="disc">${t("Times are computed with an astronomical formula (IST) and can differ by 1–3 minutes from other panchangs. Confirm important events with a pandit.", "समय की गणना खगोलीय सूत्र (IST) से की जाती है और अन्य पंचांगों से 1–3 मिनट का अंतर हो सकता है। ज़रूरी कार्यों से पहले अपने पंडितजी से पुष्टि करें।")}<br>© ${new Date().getFullYear()} ${BRAND}</p>
</div></footer>
${defaultCity ? `<script>var DEFAULT_CITY=${JSON.stringify(defaultCity)};var LOCK_CITY=${lockCity ? "true" : "false"};</script>` : ""}
<script src="/assets/app.js"></script>
</body>
</html>`;
}

function write(urlPath, html) {
  const dir = path.join(ROOT, "dist", urlPath.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  URLS.push(urlPath);
}

const URLS = [];

/* ---------------- Shared blocks ---------------- */
const cityTools = `
<div class="tools">
<div class="share"><button data-share="wa">WhatsApp</button><button data-share="fb">Facebook</button><button data-share="x">X</button><button data-share="copy">${t("Copy link", "लिंक कॉपी करें")}</button></div>
<label class="fld">📍 <span class="t-en">Location</span><span class="t-hi">स्थान</span><input id="city" list="cl" autocomplete="off" placeholder="Enter city name / शहर का नाम डालें"><datalist id="cl"></datalist></label>
</div>`;

const btnsBlock = `<div class="btns"><label class="cal">${t("Calendar", "कैलेंडर")} ▾ <input type="date" id="dt" aria-label="Pick a date"></label><button data-day="0">${t("TODAY", "आज")}</button><button data-day="1">${t("TOMORROW", "कल")}</button></div>`;

const legend = `<div class="legend"><span><i class="rk">☊</i>${t("Rahu Kaal", "राहु काल")}</span><span><i class="g"></i>${t("Most Auspicious", "सबसे शुभ")}</span><span><i class="b"></i>${t("Good", "अच्छा")}</span><span><i class="r"></i>${t("Inauspicious Time", "अशुभ समय")}</span></div>`;

const citiesBlock = `<div class="cities"><h3>${t("Frequently searched cities", "अक्सर खोजे जाने वाले शहर")}</h3><ul>
${TOP_CITIES.slice(0, 12).map(c => { const [name] = c.split("|"); return `<li><a href="/choghadiya/${slugify(name)}/">${t("Choghadiya for " + name, name + " का चौघड़िया")}</a></li>`; }).join("")}
</ul></div>`;

/* ---------------- Home / Choghadiya (flagship) ---------------- */
const rulingPlanetByWeekday = [
  ["Sunday", "Sun", "रविवार", "सूर्य"], ["Monday", "Moon", "सोमवार", "चंद्रमा"], ["Tuesday", "Mars", "मंगलवार", "मंगल"], ["Wednesday", "Mercury", "बुधवार", "बुध"],
  ["Thursday", "Jupiter", "गुरुवार", "बृहस्पति"], ["Friday", "Venus", "शुक्रवार", "शुक्र"], ["Saturday", "Saturn", "शनिवार", "शनि"]
];
const homeFaqs = [
  ["What does choghadiya mean?", "Choghadiya combines chau (four) and ghadi (a 24-minute unit), so one slot is about four ghadis, or roughly 96 minutes. Sunrise to sunset gives 8 day slots and sunset to next sunrise gives 8 night slots.",
    "चौघड़िया का मतलब क्या है?", "चौघड़िया दो शब्दों से बना है — चौ (चार) और घड़ी (24 मिनट की इकाई)। यानी एक चौघड़िया लगभग चार घड़ी, यानी करीब 96 मिनट की होती है। सूर्योदय से सूर्यास्त तक 8 दिन के स्लॉट और सूर्यास्त से अगले सूर्योदय तक 8 रात के स्लॉट बनते हैं।"],
  ["What are the different types of choghadiya?", "There are seven: Amrit, Shubh and Labh are the most favourable and are best for important work. Char is a good, secondary slot. Udveg, Kaal and Rog are inauspicious and are usually avoided for new beginnings.",
    "चौघड़िया के कितने प्रकार होते हैं?", "कुल सात प्रकार होते हैं: अमृत, शुभ और लाभ सबसे शुभ माने जाते हैं और ज़रूरी काम के लिए सबसे अच्छे हैं। चर एक ठीक-ठाक विकल्प है। उद्वेग, काल और रोग अशुभ माने जाते हैं और नई शुरुआत के लिए आमतौर पर टाले जाते हैं।"],
  ["What are Vaar Vela, Kaal Vela and Kaal Ratri?", "These are additional periods, alongside Rahu Kaal, that tradition marks as unsuitable for starting anything auspicious. Vaar Vela and Kaal Vela fall during the day, while Kaal Ratri falls at night.",
    "वार वेला, काल वेला और काल रात्रि क्या हैं?", "ये राहु काल के अलावा वे अतिरिक्त समय हैं जिन्हें परंपरा शुभ कार्य शुरू करने के लिए उपयुक्त नहीं मानती। वार वेला और काल वेला दिन में आते हैं, जबकि काल रात्रि रात में आती है।"],
  ["What if a good choghadiya overlaps Rahu Kaal or a similar inauspicious period?", "Classical guidance says to skip it even if the slot is otherwise Amrit or Shubh, and pick the next clean, favourable window instead.",
    "अगर शुभ चौघड़िया राहु काल जैसे अशुभ समय से टकरा जाए तो?", "पारंपरिक मान्यता कहती है कि उस स्लॉट को छोड़ दें, भले ही वह अमृत या शुभ ही क्यों न हो, और अगले साफ़-सुथरे शुभ समय को चुनें।"],
  ["How is a choghadiya judged auspicious or inauspicious?", "It depends on the planet ruling that slot: benefic planets (Moon, Jupiter, Mercury, Venus) make a favourable slot, while malefic planets (Sun, Saturn, Mars) make it unfavourable. The very first slot of the day also follows the ruling planet of that weekday, after which the rest follow in a fixed order.",
    "चौघड़िया को शुभ या अशुभ कैसे तय किया जाता है?", "यह उस स्लॉट के स्वामी ग्रह पर निर्भर करता है: शुभ ग्रह (चंद्रमा, बृहस्पति, बुध, शुक्र) शुभ स्लॉट बनाते हैं, जबकि अशुभ ग्रह (सूर्य, शनि, मंगल) उसे अशुभ बनाते हैं। दिन का पहला स्लॉट उस वार के स्वामी ग्रह से शुरू होता है, बाकी एक तय क्रम में चलते हैं।"],
  ["Why do the same seven choghadiyas repeat through the day?", "Since there are 8 day slots and 8 night slots but only 7 choghadiya types, one type has to repeat once during the day and once during the night to fill all 16 slots.",
    "एक ही सातों चौघड़िया दिन में दोबारा क्यों आती हैं?", "क्योंकि दिन में 8 और रात में 8 स्लॉट होते हैं, पर चौघड़िया के प्रकार सिर्फ़ 7 हैं, इसलिए एक प्रकार दिन में एक बार और रात में एक बार दोहराया जाता है ताकि सभी 16 स्लॉट भर सकें।"]
];
const guideFaqsHomeExtra = [
  ["Why can my local pandit's timing differ?", "Sunrise definitions and location details vary slightly. Expect a difference of a few minutes and confirm important events with your pandit.",
    "मेरे पंडितजी का समय अलग क्यों हो सकता है?", "सूर्योदय की परिभाषा और स्थान की गणना में मामूली अंतर होता है। कुछ मिनट का फ़र्क़ सामान्य है, ज़रूरी कार्यों के लिए अपने पंडितजी से पुष्टि ज़रूर करें।"]
];
function choghadiyaBody() {
  return `<p class="sub" id="sub"></p>
${cityTools}
${btnsBlock}
${legend}
<div id="now" role="status"></div>
<div class="cols">
<div class="dcard" id="dcard"></div>
<div class="col dayc"><h3>${t("Day Choghadiya", "दिन का चौघड़िया")}</h3><div class="hdr"><span>${t("Muhurat Time", "मुहूर्त समय")}</span><span>${t("Recommended Activity", "अनुशंसित कार्य")}</span></div><div id="day"></div></div>
<div class="col nightc"><h3>${t("Night Choghadiya", "रात का चौघड़िया")}</h3><div class="hdr"><span>${t("Muhurat Time", "मुहूर्त समय")}</span><span>${t("Recommended Activity", "अनुशंसित कार्य")}</span></div><div id="night"></div></div>
</div>
<div class="sum" id="sum"></div>
<h2>${t("Today Choghadiya | Shubh Choghadiya", "आज का चौघड़िया | शुभ चौघड़िया")}</h2>
<p id="intro"></p>
<h2>${t("Today's important shubh muhurat", "आज के ज़रूरी शुभ मुहूर्त")}</h2>
<p>${t("Planning a wedding, naming ceremony, new vehicle, new property, a new business or a mundan? Pick an occasion below to see the cleanest slots for that purpose, drawn from today's choghadiya and with Rahu Kaal already excluded.", "शादी, नामकरण, नया वाहन, नई संपत्ति, नया व्यापार या मुंडन की योजना बना रहे हैं? नीचे अपना अवसर चुनें और आज के चौघड़िया से चुने गए सबसे बेहतर समय देखें — राहु काल पहले ही हटाया जा चुका है।")}</p>
<div class="tiles">
<a class="tile" href="/shubh-muhurat/"><span>💍</span>${t("Shubh Muhurat For Marriage", "विवाह के लिए शुभ मुहूर्त")}</a>
<a class="tile" href="/shubh-muhurat/"><span>👶</span>${t("Shubh Muhurat For Name Giving", "नामकरण के लिए शुभ मुहूर्त")}</a>
<a class="tile" href="/shubh-muhurat/"><span>🚗</span>${t("Shubh Muhurat For New Vehicle", "नए वाहन के लिए शुभ मुहूर्त")}</a>
<a class="tile" href="/shubh-muhurat/"><span>🏠</span>${t("Shubh Muhurat For New Property", "नई संपत्ति के लिए शुभ मुहूर्त")}</a>
<a class="tile" href="/shubh-muhurat/"><span>💼</span>${t("Shubh Muhurat For New Business", "नए व्यापार के लिए शुभ मुहूर्त")}</a>
<a class="tile" href="/shubh-muhurat/"><span>✂️</span>${t("Shubh Muhurat For Mundan", "मुंडन के लिए शुभ मुहूर्त")}</a>
</div>
<h2>${t("Auspicious time today", "आज का शुभ समय")}</h2>
<p>${t("Shubh, Labh, Char and Amrit are the choghadiyas people check first. Amrit is treated as the most auspicious period for any kind of work, Labh suits anyone starting a new business or a course, Shubh is the classic pick for weddings, puja and religious activities, and Char favours travel, dance and cultural work.", "शुभ, लाभ, चर और अमृत — ये चौघड़िया लोग सबसे पहले देखते हैं। अमृत को हर तरह के काम के लिए सबसे शुभ माना जाता है, लाभ नया व्यापार या कोर्स शुरू करने वालों के लिए अच्छा है, शुभ शादी-पूजा जैसे धार्मिक कार्यों के लिए पारंपरिक पसंद है, और चर यात्रा, नृत्य व सांस्कृतिक कार्यों के लिए अनुकूल है।")}</p>
<div class="notice">${t('Auspicious work is best avoided during Rahu Kaal. See today\'s', "शुभ कार्य राहु काल में न करें। आज का")} <a href="/rahu-kaal/">${t("Rahu Kaal", "राहु काल")}</a> ${t("— the exact start and end time for your city, and how to plan around it.", "देखें — आपके शहर का सटीक शुरू व खत्म होने का समय, और उसके आसपास योजना कैसे बनाएं।")}</div>
${citiesBlock}
<h2 id="guide">${t("What is Choghadiya? — Full Guide", "चौघड़िया क्या है? — पूरी गाइड")}</h2>
<p>${t("Choghadiya is a Vedic time-keeping method that grades every part of the day as favourable or unfavourable. The stretch from sunrise to sunset makes the day choghadiya; sunset to the next sunrise makes the night choghadiya. Seven kinds of slot rotate through these sixteen divisions, so one kind repeats. The starting slot depends on the weekday, which is why the pattern is fixed for each weekday but shifts from one weekday to the next.", "चौघड़िया एक वैदिक समय-पद्धति है जो दिन के हर हिस्से को शुभ या अशुभ बताती है। सूर्योदय से सूर्यास्त तक का समय दिन का चौघड़िया कहलाता है, और सूर्यास्त से अगले सूर्योदय तक रात का चौघड़िया। सात तरह के स्लॉट इन सोलह भागों में घूमते हैं, इसलिए एक प्रकार दोहराया जाता है। शुरुआती स्लॉट उस वार पर निर्भर करता है, इसलिए हर वार के लिए यह क्रम तय है पर अगले वार में बदल जाता है।")}</p>
<p>${t('The word joins <i>chau</i> (four) and <i>ghadi</i> (a unit of 24 minutes), so one slot is roughly four ghadis, or 96 minutes on a 12-hour day.', "यह शब्द <i>चौ</i> (चार) और <i>घड़ी</i> (24 मिनट की इकाई) से मिलकर बना है, यानी 12 घंटे के दिन में एक स्लॉट लगभग चार घड़ी, यानी 96 मिनट का होता है।")}</p>
<h3 class="sec">${t("Good uses for each choghadiya", "हर चौघड़िया के लिए अच्छे कार्य")}</h3>
<p>${t("Because each slot carries a fixed planetary mood every single day, choghadiya works best for everyday decisions — starting a journey, opening a shop for the day, a first phone call, or a small ceremony — rather than once-in-a-lifetime events, which classically call for a full muhurat calculated from tithi and nakshatra.", "क्योंकि हर स्लॉट का ग्रह-स्वभाव हर दिन तय रहता है, चौघड़िया रोज़मर्रा के फ़ैसलों — यात्रा शुरू करना, दुकान खोलना, पहला फ़ोन कॉल, या छोटा समारोह — के लिए सबसे उपयुक्त है, न कि जीवन के बड़े मौक़ों के लिए, जिनके लिए परंपरागत रूप से तिथि और नक्षत्र से पूरा मुहूर्त निकाला जाता है।")}</p>
<h3 class="sec">${t("Why your local pandit's timing may differ", "आपके पंडितजी का समय अलग क्यों हो सकता है")}</h3>
<p>${t("Sunrise definitions and exact location details vary slightly between sources, so a difference of a few minutes from other panchangs is normal — always confirm important events with your family pandit.", "सूर्योदय की परिभाषा और सटीक स्थान अलग-अलग स्रोतों में थोड़े भिन्न होते हैं, इसलिए दूसरे पंचांगों से कुछ मिनट का अंतर सामान्य है — ज़रूरी कार्यों के लिए हमेशा अपने पारिवारिक पंडितजी से पुष्टि करें।")}</p>
<h2>${t("What today's choghadiya tells you", "आज का चौघड़िया आपको क्या बताता है")}</h2>
<p>${t("Choghadiya splits the daylight and the night into eight slots each, about 90 minutes apiece. Every slot carries the mood of one planet, so you can quickly see which stretch suits a fresh start, a journey or a celebration, and which is better left alone.", "चौघड़िया दिन और रात को आठ-आठ स्लॉट में बांटता है, हर एक लगभग 90 मिनट का। हर स्लॉट किसी एक ग्रह का स्वभाव लिए होता है, जिससे आप तुरंत देख सकते हैं कि कौन-सा समय नई शुरुआत, यात्रा या उत्सव के लिए सही है और कौन-सा टालना बेहतर है।")}</p>
<h2>${t("The seven choghadiyas", "सातों चौघड़िया")}</h2>
<div class="meaning">
<div class="good"><b>${t("Amrit", "अमृत")}</b> ${t("Moon. The best slot of the day; good for almost anything.", "चंद्रमा। दिन का सबसे अच्छा स्लॉट; लगभग हर काम के लिए शुभ।")}</div>
<div class="good"><b>${t("Shubh", "शुभ")}</b> ${t("Jupiter. Ideal for weddings, puja, yagya and religious work.", "बृहस्पति। शादी, पूजा, यज्ञ और धार्मिक कार्यों के लिए आदर्श।")}</div>
<div class="good"><b>${t("Labh", "लाभ")}</b> ${t("Mercury. Profitable; ideal for opening a business or starting to learn something.", "बुध। लाभदायक; व्यापार शुरू करने या कुछ नया सीखने के लिए आदर्श।")}</div>
<div class="ok"><b>${t("Char", "चर")}</b> ${t("Venus. Movement; favoured for travel, art and dance.", "शुक्र। गति; यात्रा, कला और नृत्य के लिए अनुकूल।")}</div>
<div class="bad"><b>${t("Udveg", "उद्वेग")}</b> ${t("Sun. Restless; avoid fresh starts, though official work goes well.", "सूर्य। बेचैन; नई शुरुआत टालें, पर सरकारी काम अच्छा चलता है।")}</div>
<div class="bad"><b>${t("Kaal", "काल")}</b> ${t("Saturn. Heavy; mostly avoided, except for work tied to building wealth.", "शनि। भारी; ज़्यादातर टाला जाता है, सिवाय धन-संचय से जुड़े काम के।")}</div>
<div class="bad"><b>${t("Rog", "रोग")}</b> ${t("Mars. Conflict-prone; avoid new work and medical starts.", "मंगल। विवाद-प्रवण; नया काम और इलाज शुरू करने से बचें।")}</div>
</div>
<h2>${t("Choghadiya meanings, explained", "चौघड़िया के अर्थ, विस्तार से")}</h2>
<p><b>${t("Amrit", "अमृत")}</b> ${t("is ruled by the Moon, considered a benefic planet, which makes this the single most favourable slot of the day — any kind of work started in it tends to go well.", "चंद्रमा द्वारा शासित है, जो एक शुभ ग्रह माना जाता है — इसलिए यह दिन का सबसे शुभ स्लॉट है और इसमें शुरू किया गया कोई भी काम अच्छा चलता है।")}</p>
<p><b>${t("Shubh", "शुभ")}</b> ${t("is ruled by Jupiter, another benefic. It is the classic pick for weddings, worship, yagya and other religious ceremonies.", "बृहस्पति द्वारा शासित है, जो एक और शुभ ग्रह है। यह शादी, पूजा, यज्ञ और अन्य धार्मिक कार्यों के लिए पारंपरिक पसंद है।")}</p>
<p><b>${t("Labh", "लाभ")}</b> ${t("is ruled by Mercury. Since Mercury favours intellect and trade, this slot is especially good for starting a business, a course, or learning a new skill.", "बुध द्वारा शासित है। बुध बुद्धि और व्यापार का कारक है, इसलिए यह स्लॉट व्यापार शुरू करने, कोर्स करने या नया हुनर सीखने के लिए ख़ास तौर पर अच्छा है।")}</p>
<p><b>${t("Char", "चर")}</b> ${t("is ruled by Venus. Venus governs movement, so this slot is the traditional choice for travel, and also suits art, dance and cultural activity.", "शुक्र द्वारा शासित है। शुक्र गति का कारक है, इसलिए यह स्लॉट यात्रा के लिए पारंपरिक पसंद है, और कला, नृत्य व सांस्कृतिक कार्यों के लिए भी उपयुक्त है।")}</p>
<p><b>${t("Udveg", "उद्वेग")}</b> ${t("is ruled by the Sun, a malefic planet here, which is why fresh starts are avoided during it — though government-related work is considered to do well in this slot.", "सूर्य द्वारा शासित है, जो यहां अशुभ ग्रह माना जाता है — इसलिए इसमें नई शुरुआत टाली जाती है, हालांकि सरकारी काम इस स्लॉट में अच्छा माना जाता है।")}</p>
<p><b>${t("Kaal", "काल")}</b> ${t("is ruled by Saturn. It is generally avoided for auspicious work, with one exception: activity aimed purely at accumulating wealth is thought to fare well here.", "शनि द्वारा शासित है। इसे आमतौर पर शुभ कार्यों के लिए टाला जाता है, सिवाय एक अपवाद के: शुद्ध रूप से धन-संचय से जुड़ा काम इसमें अच्छा माना जाता है।")}</p>
<p><b>${t("Rog", "रोग")}</b> ${t("is ruled by Mars, associated with conflict. Auspicious work and medical consultations are avoided in this slot, though it has traditionally been noted for anything involving competition or confronting a rival.", "मंगल द्वारा शासित है, जो विवाद से जुड़ा है। इस स्लॉट में शुभ कार्य और इलाज टाला जाता है, हालांकि प्रतिस्पर्धा या प्रतिद्वंद्वी से जुड़े कामों के लिए इसे पारंपरिक रूप से नोट किया गया है।")}</p>
<h2>${t("Choghadiya vs shubh muhurat — what's the difference?", "चौघड़िया बनाम शुभ मुहूर्त — क्या फ़र्क़ है?")}</h2>
<p>${t("A shubh muhurat is calculated from planetary positions for one specific event, and a favourable one may be rare — a month can have several, or sometimes none on a given day. Choghadiya, on the other hand, is available every single day: it simply divides that day into 8 auspicious-or-not day slots and 8 night slots. For a big life event, use choghadiya as a first filter, then confirm the exact muhurat with a pandit.", "शुभ मुहूर्त किसी ख़ास घटना के लिए ग्रहों की स्थिति से निकाला जाता है, और यह दुर्लभ हो सकता है — एक महीने में कई हो सकते हैं, या किसी दिन एक भी नहीं। वहीं चौघड़िया हर दिन उपलब्ध है: यह बस दिन को 8 शुभ/अशुभ दिन के स्लॉट और 8 रात के स्लॉट में बांटता है। बड़े मौक़े के लिए, पहले चौघड़िया से छांटें, फिर पंडितजी से सटीक मुहूर्त की पुष्टि करें।")}</p>
<h2>${t("How is today's choghadiya calculated?", "आज का चौघड़िया कैसे निकाला जाता है?")}</h2>
<p>${t("The daylight period (sunrise to sunset) and the night period (sunset to next sunrise) are each split into eight equal parts. Since there are only seven choghadiya types, one type repeats once in the day and once at night. The very first slot of the day is always ruled by that weekday's own ruling planet, and the remaining slots follow a fixed planetary sequence after that — which is why the order is identical every Monday, every Tuesday, and so on, but different from one weekday to the next.", "दिन (सूर्योदय से सूर्यास्त) और रात (सूर्यास्त से अगले सूर्योदय) — दोनों को आठ बराबर हिस्सों में बांटा जाता है। चूंकि चौघड़िया के प्रकार सिर्फ़ सात हैं, इसलिए एक प्रकार दिन में एक बार और रात में एक बार दोहराया जाता है। दिन का पहला स्लॉट हमेशा उस वार के स्वामी ग्रह से शुरू होता है, बाकी स्लॉट एक तय ग्रह-क्रम में चलते हैं — इसलिए हर सोमवार, हर मंगलवार का क्रम एक जैसा रहता है, पर अगले वार में बदल जाता है।")}</p>
<h3>${t("Ruling planet by weekday", "वार अनुसार स्वामी ग्रह")}</h3>
<div class="tbl"><table><thead><tr><th>${t("Weekday", "वार")}</th><th>${t("Ruling planet", "स्वामी ग्रह")}</th></tr></thead><tbody>
${rulingPlanetByWeekday.map(([d, p, dh, ph]) => `<tr><td>${t(d, dh)}</td><td>${t(p, ph)}</td></tr>`).join("")}
</tbody></table></div>
<h2>${t("More panchang tools", "अन्य पंचांग टूल्स")}</h2>
<p>${t('Along with choghadiya, check', "चौघड़िया के साथ-साथ")} <a href="/hora/">${t("Shubh Hora", "शुभ होरा")}</a>, <a href="/gowri-panchangam/">${t("Gowri Panchangam", "गौरी पंचांगम")}</a>, <a href="/rahu-kaal/">${t("Rahu Kaal", "राहु काल")}</a> ${t("and", "और")} <a href="/abhijit-muhurat/">${t("Abhijit Muhurat", "अभिजीत मुहूर्त")}</a> ${t("for your city — all calculated live for the date and location you pick.", "अपने शहर के लिए भी देखें — सभी की गणना आपकी चुनी हुई तारीख़ और जगह के लिए तुरंत होती है।")}</p>
<h2 id="tables">${t("Weekly choghadiya tables", "साप्ताहिक चौघड़िया तालिका")}</h2>
<p class="small">${t("*Assuming sunrise at 6:00 AM. Today's weekday is highlighted.", "*सूर्योदय सुबह 6:00 बजे मानते हुए। आज का वार हाइलाइट किया गया है।")}</p>
<div class="tbl day"><table id="dgrid"></table></div>
<h3>${t("Night table", "रात की तालिका")}</h3><p class="small">${t("*Assuming sunset at 6:00 PM.", "*सूर्यास्त शाम 6:00 बजे मानते हुए।")}</p>
<div class="tbl night"><table id="ngrid"></table></div>
<h2 id="faq">${t("Choghadiya FAQs", "चौघड़िया से जुड़े सवाल")}</h2>
${homeFaqs.concat(guideFaqsHomeExtra).map(([q, a, qh, ah]) => `<details><summary>${t(q, qh)}</summary><p>${t(a, ah)}</p></details>`).join("\n")}`;
}

write("/", layout({
  urlPath: "/", title: `Aaj Ka Choghadiya – Today's Shubh Muhurat, Hora & Rahu Kaal | ${BRAND}`,
  description: "Free daily Choghadiya, Shubh Hora, Gowri Panchangam, Rahu Kaal and Abhijit Muhurat for 150+ Indian cities. Calculated live for your exact location.",
  h1: t("Aaj Ka Choghadiya", "आज का चौघड़िया"), crumbLabel: "Home", bodyHtml: choghadiyaBody(),
  extraJsonLd: [faqSchema(homeFaqs.concat(guideFaqsHomeExtra))],
  related: [["/hora/", "Shubh Hora"], ["/gowri-panchangam/", "Gowri Panchangam"], ["/rahu-kaal/", "Rahu Kaal"], ["/abhijit-muhurat/", "Abhijit Muhurat"]]
}));

write("/choghadiya/", layout({
  urlPath: "/choghadiya/", title: `Choghadiya Today – Day & Night Muhurat Timings | ${BRAND}`,
  description: "Check today's Day and Night Choghadiya for your city: Amrit, Shubh, Labh, Char, Udveg, Kaal and Rog timings with Rahu Kaal.",
  h1: t("Choghadiya Today", "आज का चौघड़िया"), crumbLabel: "Choghadiya", bodyHtml: choghadiyaBody(),
  extraJsonLd: [faqSchema(homeFaqs.concat(guideFaqsHomeExtra))],
  related: [["/hora/", "Shubh Hora"], ["/gowri-panchangam/", "Gowri Panchangam"], ["/rahu-kaal/", "Rahu Kaal"]]
}));

/* per-city choghadiya pages */
for (const c of TOP_CITIES) {
  const [name, state_] = c.split("|"), slug = slugify(name), cityFull = `${name}, ${state_}`;
  write(`/choghadiya/${slug}/`, layout({
    urlPath: `/choghadiya/${slug}/`,
    title: `Choghadiya Today for ${name} – Shubh Muhurat & Rahu Kaal | ${BRAND}`,
    description: `Today's Day and Night Choghadiya for ${name}, ${state_}: Amrit, Shubh, Labh, Char, Udveg, Kaal, Rog timings with sunrise, sunset and Rahu Kaal.`,
    h1: t(`Choghadiya Today for ${name}`, `${name} का आज का चौघड़िया`), crumbLabel: `Choghadiya for ${name}`, bodyHtml: choghadiyaBody(),
    defaultCity: cityFull, lockCity: true,
    related: [["/hora/", "Shubh Hora"], ["/gowri-panchangam/", "Gowri Panchangam"], ["/rahu-kaal/", "Rahu Kaal"], ["/choghadiya/", "All cities"]]
  }));
}

/* ---------------- Hora ---------------- */
write("/hora/", layout({
  urlPath: "/hora/", title: `Shubh Hora Today – Planetary Hours (Hora Muhurat) | ${BRAND}`,
  description: "Today's Day and Night Hora: 12+12 planetary hours ruled by Sun, Venus, Mercury, Moon, Saturn, Jupiter and Mars, with the best time for each task.",
  h1: t("Shubh Hora Today", "आज का शुभ होरा"), crumbLabel: "Shubh Hora",
  bodyHtml: `<p class="sub" id="sub"></p>${cityTools}
<p>${t("Hora splits the day into 12 planetary hours from sunrise to sunset and 12 more from sunset to the next sunrise. Each hora belongs to one planet, and the first hora of the day belongs to the ruler of the weekday. Green slots are shubh hora, the best windows to begin something new.", "होरा दिन को सूर्योदय से सूर्यास्त तक 12 और सूर्यास्त से अगले सूर्योदय तक 12 — यानी कुल 24 ग्रह-होरा में बांटता है। हर होरा एक ग्रह की होती है, और दिन की पहली होरा उस वार के स्वामी ग्रह की होती है। हरे स्लॉट शुभ होरा हैं — कुछ नया शुरू करने के लिए सबसे अच्छे समय।")}</p>
${btnsBlock}
<div class="cols2"><div class="col dayc"><h3>${t("Day Hora", "दिन की होरा")}</h3><div class="hdr"><span>${t("Hora & time", "होरा व समय")}</span><span>${t("Best used for", "सबसे अच्छा उपयोग")}</span></div><div id="hday"></div></div>
<div class="col nightc"><h3>${t("Night Hora", "रात की होरा")}</h3><div class="hdr"><span>${t("Hora & time", "होरा व समय")}</span><span>${t("Best used for", "सबसे अच्छा उपयोग")}</span></div><div id="hnight"></div></div></div>
<h2>${t("What each hora means", "हर होरा का अर्थ")}</h2>
<div class="meaning">
<div class="good"><b>${t("Guru", "गुरु")}</b> ${t("Jupiter. The most benevolent hora: puja, teaching, weddings, financial advice, starting learning.", "बृहस्पति। सबसे शुभ होरा: पूजा, शिक्षा, विवाह, वित्तीय सलाह, पढ़ाई शुरू करना।")}</div>
<div class="good"><b>${t("Shukra", "शुक्र")}</b> ${t("Venus. Comfort and beauty: marriage talks, romance, jewellery, vehicles, art and entertainment.", "शुक्र। आराम और सुंदरता: विवाह की बात, प्रेम, गहने, वाहन, कला और मनोरंजन।")}</div>
<div class="good"><b>${t("Budh", "बुध")}</b> ${t("Mercury. Intelligence and trade: business deals, exams, contracts, writing, accounts.", "बुध। बुद्धि और व्यापार: व्यापारिक सौदे, परीक्षा, अनुबंध, लेखन, हिसाब-किताब।")}</div>
<div class="ok"><b>${t("Chandra", "चंद्र")}</b> ${t("Moon. Gentle and fluid: travel, dairy, water-related work, family and emotional matters.", "चंद्रमा। कोमल और तरल: यात्रा, डेयरी, जल से जुड़े काम, पारिवारिक व भावनात्मक मामले।")}</div>
<div class="ok"><b>${t("Surya", "सूर्य")}</b> ${t("Sun. Authority and vitality: government work, meeting seniors, health routines. Fine for official tasks, not for soft ones.", "सूर्य। अधिकार और ऊर्जा: सरकारी कार्य, वरिष्ठों से मिलना, स्वास्थ्य दिनचर्या। सरकारी कामों के लिए ठीक, कोमल कामों के लिए नहीं।")}</div>
<div class="bad"><b>${t("Mangal", "मंगल")}</b> ${t("Mars. Energetic and forceful: property, sports, surgery, repairs. Avoid disputes and auspicious rites.", "मंगल। ऊर्जावान और तीव्र: संपत्ति, खेल, शल्य चिकित्सा, मरम्मत। विवाद और शुभ कार्यों से बचें।")}</div>
<div class="bad"><b>${t("Shani", "शनि")}</b> ${t("Saturn. Slow and heavy: iron, oil, labour, legal delays. Avoid fresh starts and celebrations.", "शनि। धीमा और भारी: लोहा, तेल, मज़दूरी, कानूनी देरी। नई शुरुआत और उत्सवों से बचें।")}</div>
</div>
<h2>${t("How to use hora", "होरा का उपयोग कैसे करें")}</h2>
<p>${t("Pick the task, find its friendly planet, then choose a slot ruled by that planet on the day you need. Shubh hora works best when it does not overlap Rahu Kaal. For a wedding or housewarming, hora is only a helper: the main muhurat comes from tithi and nakshatra.", "अपना काम चुनें, उसका अनुकूल ग्रह पहचानें, फिर उसी ग्रह की होरा जिस दिन चाहिए वो चुनें। शुभ होरा तब सबसे अच्छी काम करती है जब वह राहु काल से न टकराए। शादी या गृह प्रवेश के लिए होरा सिर्फ़ एक सहायक है: असली मुहूर्त तिथि और नक्षत्र से निकलता है।")}</p>
<p>${t("The planetary order never changes: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars, then it repeats. Because sunrise and sunset move through the year, a hora is rarely exactly 60 minutes long. It is one twelfth of the day (or night) in your city, so it stretches in summer days and shrinks in winter days.", "ग्रहों का क्रम कभी नहीं बदलता: सूर्य, शुक्र, बुध, चंद्र, शनि, गुरु, मंगल — फिर यह दोहराता है। चूंकि सूर्योदय-सूर्यास्त साल भर बदलते हैं, इसलिए होरा शायद ही ठीक 60 मिनट की हो। यह आपके शहर के दिन (या रात) का बारहवां हिस्सा है, इसलिए गर्मियों में लंबी और सर्दियों में छोटी होती है।")}</p>
<h2>${t("Which planet opens each weekday's hora", "हर वार की पहली होरा किस ग्रह की होती है")}</h2>
<p>${t("Every day's very first hora — right at sunrise — is ruled by that weekday's own planet, and the same Sun–Venus–Mercury–Moon–Saturn–Jupiter–Mars order then repeats right through to the next sunrise. So once you know the day's ruler, you can count forward to find any later hora without a calculator:", "हर दिन की पहली होरा — सूर्योदय के समय — उस वार के अपने ग्रह की होती है, फिर वही सूर्य–शुक्र–बुध–चंद्र–शनि–गुरु–मंगल क्रम अगले सूर्योदय तक दोहराता रहता है। एक बार दिन का स्वामी ग्रह पता चल जाए तो बिना कैलकुलेटर के आगे गिनकर कोई भी होरा निकाली जा सकती है:")}</p>
<div class="tbl"><table>
<tr><th>${t("Weekday", "वार")}</th><th>${t("First hora (from sunrise)", "पहली होरा (सूर्योदय से)")}</th></tr>
<tr><td>${t("Sunday", "रविवार")}</td><td>${t("Surya (Sun)", "सूर्य")}</td></tr>
<tr><td>${t("Monday", "सोमवार")}</td><td>${t("Chandra (Moon)", "चंद्र")}</td></tr>
<tr><td>${t("Tuesday", "मंगलवार")}</td><td>${t("Mangal (Mars)", "मंगल")}</td></tr>
<tr><td>${t("Wednesday", "बुधवार")}</td><td>${t("Budh (Mercury)", "बुध")}</td></tr>
<tr><td>${t("Thursday", "गुरुवार")}</td><td>${t("Guru (Jupiter)", "गुरु")}</td></tr>
<tr><td>${t("Friday", "शुक्रवार")}</td><td>${t("Shukra (Venus)", "शुक्र")}</td></tr>
<tr><td>${t("Saturday", "शनिवार")}</td><td>${t("Shani (Saturn)", "शनि")}</td></tr>
</table></div>
<h2>${t("Matching a hora to a task", "काम के अनुसार होरा चुनना")}</h2>
<p>${t("A quick way to use hora: Guru or Shukra hora for anything you want to start on a good note (agreements, courtship, big purchases), Budh hora for anything needing a sharp mind (interviews, exams, negotiations), Chandra hora for travel or family matters, and Surya hora when you specifically need to deal with authority or officialdom. Mangal and Shani horas are usually kept for routine or physically demanding work rather than fresh, auspicious beginnings.", "एक आसान तरीका: अच्छी शुरुआत (अनुबंध, प्रेम-प्रस्ताव, बड़ी खरीद) के लिए गुरु या शुक्र होरा, तेज़ दिमाग़ वाले काम (इंटरव्यू, परीक्षा, बातचीत) के लिए बुध होरा, यात्रा या पारिवारिक मामलों के लिए चंद्र होरा, और अधिकारियों से जुड़े काम के लिए सूर्य होरा। मंगल और शनि होरा आमतौर पर नियमित या मेहनत वाले काम के लिए रखी जाती हैं, नई शुभ शुरुआत के लिए नहीं।")}</p>
<h2 id="faq">${t("Shubh Hora FAQs", "शुभ होरा से जुड़े सवाल")}</h2>
<details><summary>${t("Which hora is the best?", "सबसे अच्छी होरा कौन-सी है?")}</summary><p>${t("Jupiter (Guru) is usually treated as the best, followed by Venus and Mercury. The Moon hora is good for gentle work. Mars and Saturn horas are best avoided for new beginnings.", "गुरु (बृहस्पति) को आमतौर पर सबसे अच्छा माना जाता है, उसके बाद शुक्र और बुध। चंद्र होरा कोमल कामों के लिए अच्छी है। मंगल और शनि होरा नई शुरुआत के लिए टालना बेहतर है।")}</p></details>
<details><summary>${t("Is hora the same as choghadiya?", "क्या होरा और चौघड़िया एक ही हैं?")}</summary><p>${t("No. Hora has 24 slots per day, each ruled by one planet. Choghadiya has 16 slots with its own names (Amrit, Shubh, Labh and so on). Many people check both and pick a time that looks good in each.", "नहीं। होरा में एक दिन में 24 स्लॉट होते हैं, हर एक किसी ग्रह का। चौघड़िया में 16 स्लॉट होते हैं जिनके अपने नाम हैं (अमृत, शुभ, लाभ आदि)। कई लोग दोनों देखकर वह समय चुनते हैं जो दोनों में अच्छा दिखे।")}</p></details>
<details><summary>${t("How do I find the hora ruling right now without an app?", "बिना ऐप के अभी की होरा कैसे पता करें?")}</summary><p>${t("Note today's weekday ruler from the table above, then count forward through the Sun–Venus–Mercury–Moon–Saturn–Jupiter–Mars cycle in roughly equal steps from sunrise to sunset (and again from sunset to next sunrise) until you reach the current time.", "ऊपर तालिका से आज के वार का स्वामी ग्रह नोट करें, फिर सूर्योदय से सूर्यास्त तक (और फिर सूर्यास्त से अगले सूर्योदय तक) सूर्य–शुक्र–बुध–चंद्र–शनि–गुरु–मंगल क्रम में लगभग बराबर हिस्सों में गिनते हुए वर्तमान समय तक पहुंचें।")}</p></details>
${citiesBlock}`,
  extraJsonLd: [faqSchema([
    ["Which hora is the best?", "Jupiter (Guru) is usually treated as the best, followed by Venus and Mercury. The Moon hora is good for gentle work. Mars and Saturn horas are best avoided for new beginnings."],
    ["Is hora the same as choghadiya?", "No. Hora has 24 slots per day, each ruled by one planet. Choghadiya has 16 slots with its own names (Amrit, Shubh, Labh and so on)."],
    ["How do I find the hora ruling right now without an app?", "Note today's weekday ruler, then count forward through the Sun-Venus-Mercury-Moon-Saturn-Jupiter-Mars cycle in equal steps from sunrise until you reach the current time."]
  ])],
  related: [["/choghadiya/", "Choghadiya Today"], ["/rahu-kaal/", "Rahu Kaal"], ["/abhijit-muhurat/", "Abhijit Muhurat"]]
}));

/* ---------------- Gowri Panchangam ---------------- */
write("/gowri-panchangam/", layout({
  urlPath: "/gowri-panchangam/", title: `Gowri Panchangam Today – Nalla Neram (Day & Night) | ${BRAND}`,
  description: "Today's Day and Night Gowri Panchangam / Nalla Neram: Amirdha, Uthi, Laabam, Dhanam, Sugam, Visham, Rogam and Soram timings for your city.",
  h1: t("Gowri Panchangam Today (Nalla Neram)", "आज का गौरी पंचांगम (नल्ला नेरम)"), crumbLabel: "Gowri Panchangam",
  bodyHtml: `<p class="sub" id="sub"></p>${cityTools}
<p>${t('Gowri Panchangam is the South Indian way of finding a good time. Like choghadiya, it splits the day and the night into eight equal parts. Amirdha, Uthi, Laabam, Sugam and Dhanam are the five good slots (Nalla Neram). Visham, Rogam and Soram are the three to avoid.', "गौरी पंचांगम शुभ समय जानने की दक्षिण भारतीय पद्धति है। चौघड़िया की तरह, यह भी दिन और रात को आठ बराबर हिस्सों में बांटता है। अमृत, उठी, लाभम, सुगम और धनम — ये पांच अच्छे स्लॉट (नल्ला नेरम) हैं। विषम, रोगम और सोरम — ये तीन टालने वाले हैं।")}</p>
${btnsBlock}
${legend}
<div class="cols2"><div class="col dayc"><h3>${t("Day Gowri Panchangam", "दिन का गौरी पंचांगम")}</h3><div class="hdr"><span>${t("Time", "समय")}</span><span>${t("Result", "फल")}</span></div><div id="gday"></div></div>
<div class="col nightc"><h3>${t("Night Gowri Panchangam", "रात का गौरी पंचांगम")}</h3><div class="hdr"><span>${t("Time", "समय")}</span><span>${t("Result", "फल")}</span></div><div id="gnight"></div></div></div>
<h2>${t("Understanding Nalla Neram", "नल्ला नेरम को समझना")}</h2>
<p>${t('Nalla Neram means "good time" in Tamil. The idea is simple: an activity started in a good slot is expected to give a better result. While choghadiya is popular in North India, Nalla Neram from the Gowri Panchangam is what many families in Tamil Nadu, Karnataka, Andhra Pradesh and Kerala check before a start.', 'तमिल में नल्ला नेरम का मतलब है "अच्छा समय"। विचार सीधा है: अच्छे स्लॉट में शुरू किया गया काम बेहतर परिणाम देता है। चौघड़िया उत्तर भारत में लोकप्रिय है, वहीं तमिलनाडु, कर्नाटक, आंध्र प्रदेश और केरल के कई परिवार शुरुआत से पहले गौरी पंचांगम का नल्ला नेरम देखते हैं।')}</p>
<p>${t("The time between sunrise and sunset forms the Day Gowri Panchangam, and sunset to the next sunrise forms the Night Gowri Panchangam. The first slot changes with the weekday, and the order for each weekday is fixed.", "सूर्योदय से सूर्यास्त तक का समय दिन का गौरी पंचांगम बनाता है, और सूर्यास्त से अगले सूर्योदय तक रात का। पहला स्लॉट वार के साथ बदलता है, और हर वार के लिए क्रम तय है।")}</p>
<div class="meaning">
<div class="good"><b>${t("Amirdha", "अमृत")}</b> ${t("Nectar. The best slot: suits nearly every new beginning.", "अमृत। सबसे अच्छा स्लॉट: लगभग हर नई शुरुआत के लिए उपयुक्त।")}</div>
<div class="ok"><b>${t("Uthi", "उठी")}</b> ${t("Good for official and professional work, interviews and formal starts.", "सरकारी व व्यावसायिक कार्य, इंटरव्यू और औपचारिक शुरुआत के लिए अच्छा।")}</div>
<div class="ok"><b>${t("Laabam", "लाभम")}</b> ${t("Gain. Favours trade, deals and anything meant to grow.", "लाभ। व्यापार, सौदे और बढ़ने वाले कामों के लिए अनुकूल।")}</div>
<div class="ok"><b>${t("Dhanam", "धनम")}</b> ${t("Wealth. Good for banking, accounts, investment and purchases.", "धन। बैंकिंग, हिसाब, निवेश और खरीदारी के लिए अच्छा।")}</div>
<div class="ok"><b>${t("Sugam", "सुगम")}</b> ${t("Comfort. Good for travel, home matters and everyday starts.", "आराम। यात्रा, घरेलू मामलों और रोज़मर्रा की शुरुआत के लिए अच्छा।")}</div>
<div class="bad"><b>${t("Visham", "विषम")}</b> ${t("Poison. Avoid: work begun now tends to hit obstacles.", "विष। बचें: अभी शुरू किया काम बाधाओं में फंस सकता है।")}</div>
<div class="bad"><b>${t("Rogam", "रोगम")}</b> ${t("Disease. Avoid: linked with health trouble and delays.", "रोग। बचें: स्वास्थ्य समस्या और देरी से जुड़ा।")}</div>
<div class="bad"><b>${t("Soram", "सोरम")}</b> ${t("Loss. Avoid: linked with quarrels and money loss.", "हानि। बचें: झगड़े और धन-हानि से जुड़ा।")}</div>
</div>
<h2>${t("Which Gowri opens each weekday", "हर वार की पहली गौरी कौन-सी है")}</h2>
<p>${t("Just like hora and choghadiya, the very first daytime slot after sunrise follows a fixed order that depends on the weekday, and the rest of the eight slots follow on from it in the standard Amirdha–Uthi–Laabam–Rogam–Sugam–Dhanam–Visham–Soram type rotation used in Tamil almanacs:", "होरा और चौघड़िया की तरह, सूर्योदय के बाद का पहला दिन का स्लॉट वार पर निर्भर एक तय क्रम में आता है, और बाकी सात स्लॉट तमिल पंचांगों में प्रयुक्त सामान्य अमृत–उठी–लाभम–रोगम–सुगम–धनम–विषम–सोरम क्रम में उसके बाद आते हैं:")}</p>
<div class="tbl"><table>
<tr><th>${t("Weekday", "वार")}</th><th>${t("First daytime slot", "पहला दिन का स्लॉट")}</th></tr>
<tr><td>${t("Sunday", "रविवार")}</td><td>${t("Uthi", "उठी")}</td></tr>
<tr><td>${t("Monday", "सोमवार")}</td><td>${t("Amirdha", "अमृत")}</td></tr>
<tr><td>${t("Tuesday", "मंगलवार")}</td><td>${t("Rogam", "रोगम")}</td></tr>
<tr><td>${t("Wednesday", "बुधवार")}</td><td>${t("Laabam", "लाभम")}</td></tr>
<tr><td>${t("Thursday", "गुरुवार")}</td><td>${t("Sugam", "सुगम")}</td></tr>
<tr><td>${t("Friday", "शुक्रवार")}</td><td>${t("Dhanam", "धनम")}</td></tr>
<tr><td>${t("Saturday", "शनिवार")}</td><td>${t("Visham", "विषम")}</td></tr>
</table></div>
<p class="small">${t("The exact slot pattern can vary slightly between regional almanacs — use this as a general guide and the calculator above for your city's precise timings.", "क्षेत्रीय पंचांगों में स्लॉट क्रम थोड़ा भिन्न हो सकता है — इसे सामान्य मार्गदर्शन मानें और अपने शहर के सटीक समय के लिए ऊपर दिया कैलकुलेटर उपयोग करें।")}</p>
<h2>${t("If a task can't wait for a good Nalla Neram", "अगर कोई काम अच्छे नल्ला नेरम का इंतज़ार नहीं कर सकता")}</h2>
<p>${t("When an inauspicious slot can't be avoided, the common practice is a short prayer — often to Ganesha or the family deity — before starting, along with lighting a lamp. As with any regional custom, it's best to follow what your own family or temple priest recommends.", "जब अशुभ स्लॉट टाला न जा सके, तो आमतौर पर शुरू करने से पहले एक छोटी प्रार्थना — अक्सर गणेश जी या कुलदेवता को — और दीप जलाने की प्रथा है। किसी भी क्षेत्रीय रीति की तरह, अपने परिवार या मंदिर के पुजारी की सलाह मानना सबसे बेहतर है।")}</p>
<h2 id="faq">${t("Gowri Panchangam FAQs", "गौरी पंचांगम से जुड़े सवाल")}</h2>
<details><summary>${t("Should I avoid Rahu Kaal even in a good Gowri slot?", "क्या अच्छे गौरी स्लॉट में भी राहु काल टालना चाहिए?")}</summary><p>${t("Yes. Most families treat Rahu Kaal as a veto, so if a good slot overlaps it, wait for the next clean Nalla Neram.", "हां। ज़्यादातर परिवार राहु काल को पूर्ण निषेध मानते हैं, इसलिए अगर अच्छा स्लॉट उससे टकराए तो अगले साफ़ नल्ला नेरम का इंतज़ार करें।")}</p></details>
<details><summary>${t("How is Gowri Panchangam different from Choghadiya?", "गौरी पंचांगम, चौघड़िया से कैसे अलग है?")}</summary><p>${t("Both split day and night into eight parts, but use different names and a different weekday rotation. Choghadiya is common in North India; Gowri Panchangam is followed mainly in Tamil Nadu and neighbouring states.", "दोनों दिन-रात को आठ हिस्सों में बांटते हैं, पर नाम और वार-क्रम अलग हैं। चौघड़िया उत्तर भारत में आम है; गौरी पंचांगम मुख्यतः तमिलनाडु और आसपास के राज्यों में माना जाता है।")}</p></details>
<details><summary>${t("Does the Gowri Panchangam order change with sunrise time?", "क्या सूर्योदय के समय के साथ गौरी पंचांगम का क्रम बदलता है?")}</summary><p>${t("The order of the eight names for a given weekday stays fixed, but the clock time of each slot shifts with your city's actual sunrise and sunset, which is why the calculator above needs your location.", "किसी वार के आठ नामों का क्रम तय रहता है, पर हर स्लॉट का घड़ी-समय आपके शहर के असली सूर्योदय-सूर्यास्त के साथ बदलता है, इसीलिए ऊपर के कैलकुलेटर को आपकी जगह चाहिए होती है।")}</p></details>
${citiesBlock}`,
  extraJsonLd: [faqSchema([
    ["Should I avoid Rahu Kaal even in a good Gowri slot?", "Yes. Most families treat Rahu Kaal as a veto, so if a good slot overlaps it, wait for the next clean Nalla Neram."],
    ["How is Gowri Panchangam different from Choghadiya?", "Both split day and night into eight parts, but use different names and a different weekday rotation. Choghadiya is common in North India; Gowri Panchangam is followed mainly in Tamil Nadu and neighbouring states."],
    ["Does the Gowri Panchangam order change with sunrise time?", "The order of the eight names for a given weekday stays fixed, but the clock time of each slot shifts with your city's actual sunrise and sunset."]
  ])],
  related: [["/choghadiya/", "Choghadiya Today"], ["/hora/", "Shubh Hora"], ["/rahu-kaal/", "Rahu Kaal"]]
}));

/* ---------------- Rahu Kaal ---------------- */
write("/rahu-kaal/", layout({
  urlPath: "/rahu-kaal/", title: `Rahu Kaal Today – Timing with Yamaganda & Gulika Kaal | ${BRAND}`,
  description: "Today's Rahu Kaal, Yamaganda and Gulika Kaal timings for your city, plus a 7-day table. Avoid starting new work during these periods.",
  h1: t("Rahu Kaal Today", "आज का राहु काल"), crumbLabel: "Rahu Kaal",
  bodyHtml: `<p class="sub" id="sub"></p>${cityTools}
<p>${t("Rahu Kaal is a stretch of about 90 minutes every day that tradition marks as unsuitable for starting anything auspicious. It is one of eight equal parts of the daylight period, and the part changes with the weekday. Yamaganda and Gulika Kaal work the same way and are watched alongside it.", "राहु काल हर दिन लगभग 90 मिनट का वह समय है जिसे परंपरा शुभ कार्य शुरू करने के लिए अनुपयुक्त मानती है। यह दिन के आठ बराबर हिस्सों में से एक है, और यह हिस्सा वार के साथ बदलता है। यमगण्ड और गुलिक काल भी इसी तरह काम करते हैं और इसके साथ देखे जाते हैं।")}</p>
${btnsBlock}
<div class="notice"><b>${t("Avoid starting anything new during Rahu Kaal.", "राहु काल में कोई नया काम शुरू न करें।")}</b> <span id="rkline"></span></div>
<div class="sum" id="rkSum"></div>
<h2>${t("Rahu Kaal for the next 7 days", "अगले 7 दिनों का राहु काल")}</h2>
<div class="tbl"><table id="rkTbl"></table></div>
<h2>${t("What Rahu Kaal means", "राहु काल का अर्थ")}</h2>
<p>${t("Rahu is a shadow planet in Vedic astrology, linked with confusion, delay and the unexpected. The period named after it is considered a poor moment to begin a wedding, a purchase, a journey, a business launch or a signature. Work that is already under way can carry on, and routine tasks like cooking or office work need not stop.", "राहु वैदिक ज्योतिष में एक छाया ग्रह है, जो भ्रम, देरी और अनहोनी से जुड़ा है। इसके नाम पर इस अवधि को शादी, खरीदारी, यात्रा, व्यापार शुरू करने या हस्ताक्षर के लिए ख़राब समय माना जाता है। पहले से चल रहा काम जारी रह सकता है, और खाना बनाना या दफ़्तर का सामान्य काम रोकने की ज़रूरत नहीं।")}</p>
<p>${t("Timings are worked out from local sunrise and sunset. So Rahu Kaal in Mumbai differs from Delhi on the same day, and it also shifts as seasons change.", "समय स्थानीय सूर्योदय-सूर्यास्त से निकाला जाता है। इसलिए एक ही दिन मुंबई का राहु काल दिल्ली से अलग होता है, और मौसम बदलने के साथ भी बदलता है।")}</p>
<div class="meaning"><div class="bad"><b>${t("Rahu Kaal", "राहु काल")}</b> ${t("Avoid new beginnings, weddings, purchases and travel starts.", "नई शुरुआत, विवाह, खरीदारी और यात्रा शुरू करने से बचें।")}</div><div class="bad"><b>${t("Yamaganda", "यमगण्ड")}</b> ${t("Ruled by Yama. Avoid auspicious starts, especially for health and family matters.", "यम द्वारा शासित। शुभ शुरुआत से बचें, ख़ासकर स्वास्थ्य और पारिवारिक मामलों में।")}</div><div class="ok"><b>${t("Gulika", "गुलिक")}</b> ${t("Ruled by Saturn's son. Good for repeating tasks, poor for new starts.", "शनि पुत्र द्वारा शासित। दोहराए जाने वाले कामों के लिए अच्छा, नई शुरुआत के लिए ख़राब।")}</div></div>
<h2>${t("Which segment of the day each period falls in", "हर अवधि दिन के किस हिस्से में आती है")}</h2>
<p>${t("The daylight period is split into eight equal segments, and Rahu Kaal, Yamaganda and Gulika each sit in a fixed segment that depends only on the weekday — the segment number stays the same everywhere, only its clock time shifts with local sunrise. This table shows which of the eight segments (1st = right after sunrise, 8th = just before sunset) belongs to each period:", "दिन के उजाले को आठ बराबर हिस्सों में बांटा जाता है, और राहु काल, यमगण्ड व गुलिक हर एक एक तय हिस्से में आते हैं जो केवल वार पर निर्भर है — हिस्से का क्रमांक हर जगह वही रहता है, केवल घड़ी-समय स्थानीय सूर्योदय के साथ बदलता है। यह तालिका दिखाती है कि आठ हिस्सों (पहला = सूर्योदय के ठीक बाद, आठवां = सूर्यास्त से ठीक पहले) में से कौन-सा किस अवधि का है:")}</p>
<div class="tbl"><table>
<tr><th>${t("Weekday", "वार")}</th><th>${t("Rahu Kaal segment", "राहु काल हिस्सा")}</th><th>${t("Yamaganda segment", "यमगण्ड हिस्सा")}</th><th>${t("Gulika segment", "गुलिक हिस्सा")}</th></tr>
<tr><td>${t("Monday", "सोमवार")}</td><td>${t("2nd", "दूसरा")}</td><td>${t("4th", "चौथा")}</td><td>${t("6th", "छठा")}</td></tr>
<tr><td>${t("Tuesday", "मंगलवार")}</td><td>${t("7th", "सातवां")}</td><td>${t("3rd", "तीसरा")}</td><td>${t("5th", "पांचवां")}</td></tr>
<tr><td>${t("Wednesday", "बुधवार")}</td><td>${t("5th", "पांचवां")}</td><td>${t("2nd", "दूसरा")}</td><td>${t("4th", "चौथा")}</td></tr>
<tr><td>${t("Thursday", "गुरुवार")}</td><td>${t("6th", "छठा")}</td><td>${t("1st", "पहला")}</td><td>${t("3rd", "तीसरा")}</td></tr>
<tr><td>${t("Friday", "शुक्रवार")}</td><td>${t("4th", "चौथा")}</td><td>${t("7th", "सातवां")}</td><td>${t("2nd", "दूसरा")}</td></tr>
<tr><td>${t("Saturday", "शनिवार")}</td><td>${t("3rd", "तीसरा")}</td><td>${t("6th", "छठा")}</td><td>${t("1st", "पहला")}</td></tr>
<tr><td>${t("Sunday", "रविवार")}</td><td>${t("8th", "आठवां")}</td><td>${t("5th", "पांचवां")}</td><td>${t("7th", "सातवां")}</td></tr>
</table></div>
<p class="small">${t("Example: on Friday the Rahu Kaal segment is the 4th of the day, so with a 6:00 AM sunrise and 6:00 PM sunset it falls around 10:30 AM–12:00 PM. The tool above works this out automatically for your city's real sunrise and sunset.", "उदाहरण: शुक्रवार को राहु काल दिन का चौथा हिस्सा है, तो सुबह 6:00 सूर्योदय और शाम 6:00 सूर्यास्त होने पर यह लगभग सुबह 10:30–दोपहर 12:00 बजे पड़ता है। ऊपर दिया टूल आपके शहर के असली सूर्योदय-सूर्यास्त से यह अपने आप निकाल देता है।")}</p>
<h2>${t("If an important task can't be moved out of Rahu Kaal", "अगर ज़रूरी काम राहु काल से बाहर नहीं टाला जा सकता")}</h2>
<p>${t("Where postponing genuinely isn't possible, most family priests suggest a short prayer before starting — many people recite the Hanuman Chalisa or offer a simple prasad of jaggery and ghee, then go ahead with the task. This is a matter of personal or family tradition rather than a fixed rule, so it's worth checking what your own household usually follows.", "जहां टालना सच में संभव न हो, ज़्यादातर पारिवारिक पुजारी शुरू करने से पहले एक छोटी प्रार्थना का सुझाव देते हैं — कई लोग हनुमान चालीसा पढ़ते हैं या गुड़-घी का सामान्य प्रसाद चढ़ाते हैं, फिर काम शुरू करते हैं। यह तय नियम नहीं बल्कि व्यक्तिगत या पारिवारिक परंपरा का विषय है, इसलिए अपने घर की प्रथा पूछ लेना बेहतर है।")}</p>
<h2 id="faq">${t("Rahu Kaal FAQs", "राहु काल से जुड़े सवाल")}</h2>
<details><summary>${t("Which day has Rahu Kaal in the morning?", "किस दिन राहु काल सुबह पड़ता है?")}</summary><p>${t("Monday's Rahu Kaal falls in the second part of the day, which is early morning. Saturday's falls in the third part, Friday's in the fourth and Wednesday's near midday. Sunday's is the last part, in the late afternoon.", "सोमवार का राहु काल दिन के दूसरे हिस्से यानी सुबह जल्दी पड़ता है। शनिवार का तीसरे हिस्से में, शुक्रवार का चौथे में और बुधवार का दोपहर के आसपास। रविवार का आख़िरी हिस्से यानी देर दोपहर में पड़ता है।")}</p></details>
<details><summary>${t("Can I travel during Rahu Kaal?", "क्या राहु काल में यात्रा कर सकते हैं?")}</summary><p>${t("Travel that has already begun is fine. Tradition only suggests not setting out at the start of Rahu Kaal.", "पहले से चल रही यात्रा जारी रखना ठीक है। परंपरा केवल राहु काल की शुरुआत में यात्रा न शुरू करने का सुझाव देती है।")}</p></details>
<details><summary>${t("What can I do if I must start something important during Rahu Kaal?", "अगर राहु काल में ज़रूरी काम शुरू करना ही पड़े तो क्या करें?")}</summary><p>${t("Many families recite the Hanuman Chalisa or offer a small prasad of jaggery and ghee before going ahead, as Hanuman worship is traditionally believed to soften Rahu's effect. This varies by family, so it helps to ask what yours usually follows.", "कई परिवार शुरू करने से पहले हनुमान चालीसा पढ़ते हैं या गुड़-घी का प्रसाद चढ़ाते हैं, क्योंकि माना जाता है कि हनुमान पूजा राहु के प्रभाव को कम करती है। यह परिवार-दर-परिवार अलग होता है, इसलिए अपने घर की प्रथा पूछना बेहतर है।")}</p></details>
${citiesBlock}`,
  extraJsonLd: [faqSchema([
    ["Which day has Rahu Kaal in the morning?", "Monday's Rahu Kaal falls in the second part of the day, which is early morning. Saturday's falls in the third part, Friday's in the fourth and Wednesday's near midday. Sunday's is the last part, in the late afternoon."],
    ["Can I travel during Rahu Kaal?", "Travel that has already begun is fine. Tradition only suggests not setting out at the start of Rahu Kaal."],
    ["What can I do if I must start something important during Rahu Kaal?", "Many families recite the Hanuman Chalisa or offer a small prasad of jaggery and ghee before going ahead. This varies by family tradition."]
  ])],
  related: [["/choghadiya/", "Choghadiya Today"], ["/abhijit-muhurat/", "Abhijit Muhurat"], ["/hora/", "Shubh Hora"]]
}));

/* ---------------- Abhijit Muhurat ---------------- */
write("/abhijit-muhurat/", layout({
  urlPath: "/abhijit-muhurat/", title: `Abhijit Muhurat Today – Timing for Your City | ${BRAND}`,
  description: "Today's Abhijit Muhurat timing (the 8th of 15 daily muhurats, around local noon) for your city, plus a 7-day table. Not observed on Wednesday.",
  h1: t("Abhijit Muhurat Today", "आज का अभिजीत मुहूर्त"), crumbLabel: "Abhijit Muhurat",
  bodyHtml: `<p class="sub" id="sub"></p>${cityTools}
<p>${t('Abhijit means "victorious". This muhurat sits at the middle of the day, around local noon, and lasts about 48 minutes. It is considered strong enough to reduce the effect of many minor doshas.', 'अभिजीत का अर्थ है "विजयी"। यह मुहूर्त दिन के बीच, स्थानीय दोपहर के आसपास आता है, और लगभग 48 मिनट का होता है। इसे इतना शक्तिशाली माना जाता है कि यह कई छोटे दोषों का प्रभाव कम कर देता है।')}</p>
${btnsBlock}
<div class="sum" id="abSum"></div>
<h2>${t("Abhijit Muhurat for the next 7 days", "अगले 7 दिनों का अभिजीत मुहूर्त")}</h2>
<div class="tbl"><table id="abTbl"></table></div>
<h2>${t("How Abhijit Muhurat is found", "अभिजीत मुहूर्त कैसे निकाला जाता है")}</h2>
<p>${t("The daylight period is divided into 15 muhurats, and the eighth one is Abhijit. It therefore centres on the midpoint between sunrise and sunset, and it moves with your city and the season. In many traditions it is skipped on Wednesday, and this page follows that rule.", "दिन के उजाले को 15 मुहूर्तों में बांटा जाता है, और आठवां मुहूर्त अभिजीत है। इसलिए यह सूर्योदय-सूर्यास्त के बीचोंबीच केंद्रित होता है, और आपके शहर व मौसम के साथ बदलता है। कई परंपराओं में बुधवार को इसे छोड़ दिया जाता है, और यह पृष्ठ भी वही नियम मानता है।")}</p>
<p>${t("People choose it for short, important starts: signing papers, buying a vehicle, entering a new home, opening an account, beginning a journey or a new job. For a marriage, a full muhurat based on tithi and nakshatra still comes first.", "लोग इसे छोटी पर ज़रूरी शुरुआत के लिए चुनते हैं: कागज़ात पर हस्ताक्षर, वाहन ख़रीदना, नए घर में प्रवेश, खाता खोलना, यात्रा या नई नौकरी शुरू करना। विवाह के लिए तिथि-नक्षत्र पर आधारित पूरा मुहूर्त अब भी पहले आता है।")}</p>
<h2>${t("Good uses for Abhijit Muhurat", "अभिजीत मुहूर्त के अच्छे उपयोग")}</h2>
<p>${t("Because it is short, strong and repeats every single day (barring Wednesday), Abhijit works best for things that need a quick, favourable window rather than an elaborate ceremony: a first bite of medicine, launching a small task, a job interview, starting a course, or making an important phone call. It is not usually treated as a substitute for a full wedding or griha pravesh muhurat, which factor in far more variables.", "चूंकि यह छोटा, शक्तिशाली है और (बुधवार को छोड़कर) हर दिन दोहराता है, अभिजीत उन कामों के लिए सबसे अच्छा है जिन्हें बड़े समारोह की नहीं बल्कि तुरंत एक शुभ पल की ज़रूरत है: दवा की पहली खुराक, छोटा काम शुरू करना, नौकरी का इंटरव्यू, कोर्स शुरू करना, या ज़रूरी फ़ोन कॉल। इसे पूरे विवाह या गृह प्रवेश मुहूर्त का विकल्प नहीं माना जाता, जिनमें कहीं ज़्यादा बातें देखी जाती हैं।")}</p>
<h2>${t("Abhijit Muhurat and other doshas", "अभिजीत मुहूर्त और अन्य दोष")}</h2>
<p>${t("One reason this window is popular is that classical texts describe it as strong enough to override many minor doshas that would otherwise make a moment unfavourable — though it does not override Rahu Kaal itself when the two genuinely overlap. If your day's Abhijit window and Rahu Kaal coincide, it is safer to pick the next available Abhijit period the following day or another well-rated choghadiya slot instead.", "यह समय इसलिए लोकप्रिय है क्योंकि शास्त्रों में इसे इतना शक्तिशाली बताया गया है कि यह कई छोटे दोषों को दूर कर देता है — पर जब यह वाक़ई राहु काल से टकराए तो उसे नहीं हटाता। अगर आपके दिन का अभिजीत और राहु काल एक साथ पड़ें, तो अगले दिन का अभिजीत या कोई और अच्छा चौघड़िया स्लॉट चुनना ज़्यादा सुरक्षित है।")}</p>
<h2 id="faq">${t("Abhijit Muhurat FAQs", "अभिजीत मुहूर्त से जुड़े सवाल")}</h2>
<details><summary>${t("Does Abhijit Muhurat cancel Rahu Kaal?", "क्या अभिजीत मुहूर्त राहु काल को रद्द कर देता है?")}</summary><p>${t("Not by tradition. If the two overlap, most guidance says to wait or use the next favourable slot. The two overlap on Wednesday, which is why Abhijit is not counted that day.", "परंपरा के अनुसार नहीं। अगर दोनों टकराएं, तो ज़्यादातर सलाह इंतज़ार करने या अगला शुभ स्लॉट लेने की है। बुधवार को दोनों टकराते हैं, इसीलिए उस दिन अभिजीत नहीं गिना जाता।")}</p></details>
<details><summary>${t("Why is Abhijit Muhurat not used on Wednesday?", "बुधवार को अभिजीत मुहूर्त क्यों नहीं माना जाता?")}</summary><p>${t("Several traditions say it is weakened on Wednesday. If you follow a different school, ask your family pandit.", "कई परंपराओं में इसे बुधवार को कमज़ोर माना गया है। अगर आप किसी अलग परंपरा को मानते हैं, तो अपने पारिवारिक पंडितजी से पूछें।")}</p></details>
<details><summary>${t("How long does Abhijit Muhurat usually last?", "अभिजीत मुहूर्त आमतौर पर कितनी देर रहता है?")}</summary><p>${t("Roughly 48 minutes on an average day, since it is one of 15 equal divisions of daylight centred on local midday. It runs a little longer on long summer days and a little shorter in winter.", "औसत दिन में लगभग 48 मिनट, क्योंकि यह स्थानीय दोपहर के आसपास दिन के उजाले के 15 बराबर हिस्सों में से एक है। लंबे गर्मी के दिनों में थोड़ा ज़्यादा और सर्दियों में थोड़ा कम रहता है।")}</p></details>
${citiesBlock}`,
  extraJsonLd: [faqSchema([
    ["Does Abhijit Muhurat cancel Rahu Kaal?", "Not by tradition. If the two overlap, most guidance says to wait or use the next favourable slot. The two overlap on Wednesday, which is why Abhijit is not counted that day."],
    ["Why is Abhijit Muhurat not used on Wednesday?", "Several traditions say it is weakened on Wednesday. If you follow a different school, ask your family pandit."],
    ["How long does Abhijit Muhurat usually last?", "Roughly 48 minutes on an average day, since it is one of 15 equal divisions of daylight centred on local midday."]
  ])],
  related: [["/choghadiya/", "Choghadiya Today"], ["/rahu-kaal/", "Rahu Kaal"], ["/gowri-panchangam/", "Gowri Panchangam"]]
}));

/* ---------------- Shubh Muhurat ---------------- */
write("/shubh-muhurat/", layout({
  urlPath: "/shubh-muhurat/", title: `Shubh Muhurat Today – Marriage, Vehicle, Property, Business | ${BRAND}`,
  description: "Today's shubh muhurat for marriage, name giving, new vehicle, new property, business and mundan, picked from the day's choghadiya.",
  h1: t("Shubh Muhurat Today", "आज का शुभ मुहूर्त"), crumbLabel: "Shubh Muhurat",
  bodyHtml: `<p class="sub" id="sub"></p>${cityTools}
<p>${t("Tap an occasion to see the cleanest daytime slots for the selected date and city, based on today's choghadiya.", "चुनी गई तारीख़ और शहर के लिए आज के चौघड़िया के आधार पर सबसे साफ़ दिन के स्लॉट देखने के लिए कोई अवसर चुनें।")}</p>
${btnsBlock}
<div class="tiles">
<button class="tile" data-tile="marriage"><span>💍</span>${t("Shubh Muhurat For Marriage", "विवाह के लिए शुभ मुहूर्त")}</button>
<button class="tile" data-tile="naming"><span>👶</span>${t("Shubh Muhurat For Name Giving", "नामकरण के लिए शुभ मुहूर्त")}</button>
<button class="tile" data-tile="vehicle"><span>🚗</span>${t("Shubh Muhurat For New Vehicle", "नए वाहन के लिए शुभ मुहूर्त")}</button>
<button class="tile" data-tile="property"><span>🏠</span>${t("Shubh Muhurat For New Property", "नई संपत्ति के लिए शुभ मुहूर्त")}</button>
<button class="tile" data-tile="business"><span>💼</span>${t("Shubh Muhurat For Business", "व्यापार के लिए शुभ मुहूर्त")}</button>
<button class="tile" data-tile="mundan"><span>✂️</span>${t("Shubh Muhurat For Mundan", "मुंडन के लिए शुभ मुहूर्त")}</button>
</div>
<div id="tileOut" role="status"></div>
<h2>${t("How this works", "यह कैसे काम करता है")}</h2>
<p>${t("Each occasion favours a different set of choghadiya: Amrit suits nearly any task, Labh favours trade and study, Shubh is the pick for ceremonies and worship, and Char is best for travel and the arts. Rahu Kaal slots are excluded automatically.", "हर अवसर के लिए अलग चौघड़िया अनुकूल होते हैं: अमृत लगभग हर काम के लिए ठीक है, लाभ व्यापार-पढ़ाई के लिए अनुकूल है, समारोह-पूजा के लिए शुभ पसंद किया जाता है, और चर यात्रा-कला के लिए सबसे अच्छा है। राहु काल के स्लॉट अपने आप हटा दिए जाते हैं।")}</p>
<p>${t("For a wedding, mundan or other major rite, treat this as a first filter. Also check tithi, nakshatra and the couple's or child's chart with a pandit before finalising a date.", "शादी, मुंडन या किसी और बड़े संस्कार के लिए, इसे पहला फ़िल्टर मानें। तारीख़ तय करने से पहले पंडितजी से तिथि, नक्षत्र और वर-वधू या बच्चे की कुंडली भी ज़रूर दिखाएं।")}</p>
<div id="day" style="display:none"></div><div id="night" style="display:none"></div>
${citiesBlock}`,
  related: [["/choghadiya/", "Choghadiya Today"], ["/rahu-kaal/", "Rahu Kaal"], ["/abhijit-muhurat/", "Abhijit Muhurat"]]
}));

/* ---------------- Guide / FAQ ---------------- */
const guideFaqs = [
  ["What does choghadiya mean?", "It is a Vedic method of splitting day and night into eight parts each. There are 8 day slots and 8 night slots, each lasting about 1.5 hours."],
  ["Which choghadiyas are auspicious?", "Amrit, Shubh and Labh are considered favourable for important work. Char is good for movement and creative pursuits. Udveg, Kaal and Rog are generally avoided for auspicious tasks."],
  ["What are Vaar Vela, Kaal Vela and Kaal Ratri?", "They are periods traditionally considered unsuitable for auspicious work. Vaar Vela and Kaal Vela fall in the day, Kaal Ratri at night."],
  ["What if a good choghadiya overlaps Rahu Kaal?", "Tradition advises waiting. Rahu Kaal, Yamaganda and Gulika are avoided even inside a favourable slot, so pick the next clean one."],
  ["How is a choghadiya judged good or bad?", "By the nature of its ruling planet: benefic planets (Moon, Jupiter, Mercury, Venus) make friendly slots, malefic ones (Sun, Saturn, Mars) make unfriendly slots."],
  ["Why can my local pandit's timing differ?", "Sunrise definitions and location details vary slightly. Expect a difference of a few minutes and confirm important events with your pandit."]
];
const guideFaqsHi = [
  ["चौघड़िया का मतलब क्या है?", "यह दिन और रात को आठ-आठ हिस्सों में बांटने की एक वैदिक विधि है। 8 दिन के स्लॉट और 8 रात के स्लॉट होते हैं, हर एक लगभग 1.5 घंटे का।"],
  ["कौन-सी चौघड़िया शुभ मानी जाती हैं?", "अमृत, शुभ और लाभ को ज़रूरी काम के लिए अनुकूल माना जाता है। चर गति और रचनात्मक कामों के लिए अच्छा है। उद्वेग, काल और रोग को आमतौर पर शुभ कार्यों के लिए टाला जाता है।"],
  ["वार वेला, काल वेला और काल रात्रि क्या हैं?", "ये परंपरागत रूप से शुभ कार्य के लिए अनुपयुक्त मानी जाने वाली अवधियां हैं। वार वेला और काल वेला दिन में, काल रात्रि रात में पड़ती है।"],
  ["अगर अच्छी चौघड़िया राहु काल से टकराए तो?", "परंपरा इंतज़ार करने की सलाह देती है। राहु काल, यमगण्ड और गुलिक को शुभ स्लॉट के भीतर भी टाला जाता है, इसलिए अगला साफ़ स्लॉट चुनें।"],
  ["चौघड़िया को अच्छा या बुरा कैसे तय किया जाता है?", "उसके स्वामी ग्रह के स्वभाव से: शुभ ग्रह (चंद्र, बृहस्पति, बुध, शुक्र) अनुकूल स्लॉट बनाते हैं, अशुभ ग्रह (सूर्य, शनि, मंगल) प्रतिकूल स्लॉट बनाते हैं।"],
  ["मेरे पंडितजी का समय अलग क्यों हो सकता है?", "सूर्योदय की परिभाषा और स्थान की जानकारी में मामूली अंतर होता है। कुछ मिनट का फ़र्क़ सामान्य है, ज़रूरी कार्यों के लिए अपने पंडितजी से पुष्टि ज़रूर करें।"]
];
write("/what-is-choghadiya/", layout({
  urlPath: "/what-is-choghadiya/", title: `What is Choghadiya? Complete Guide & FAQs | ${BRAND}`,
  description: "Learn what choghadiya is, how it's calculated, the seven types explained, choghadiya vs shubh muhurat, and answers to common questions.",
  h1: t("What is Choghadiya?", "चौघड़िया क्या है?"), crumbLabel: "Guide",
  bodyHtml: `<p>${t("Choghadiya is a Vedic time-keeping method that grades every part of the day as favourable or unfavourable. The stretch from sunrise to sunset makes the day choghadiya; sunset to the next sunrise makes the night choghadiya. Seven kinds of slot rotate through these sixteen divisions, so one kind repeats. The starting slot depends on the weekday, which is why the pattern is fixed for each weekday but shifts from one weekday to the next.", "चौघड़िया एक वैदिक समय-पद्धति है जो दिन के हर हिस्से को शुभ या अशुभ बताती है। सूर्योदय से सूर्यास्त तक दिन का चौघड़िया बनता है; सूर्यास्त से अगले सूर्योदय तक रात का। सात तरह के स्लॉट इन सोलह भागों में घूमते हैं, इसलिए एक प्रकार दोहराया जाता है। शुरुआती स्लॉट वार पर निर्भर करता है, इसलिए हर वार के लिए यह क्रम तय है पर अगले वार में बदल जाता है।")}</p>
<p>${t('The word joins <i>chau</i> (four) and <i>ghadi</i> (a unit of 24 minutes), so one slot is roughly four ghadis, or 96 minutes on a 12-hour day.', "यह शब्द <i>चौ</i> (चार) और <i>घड़ी</i> (24 मिनट की इकाई) से मिलकर बना है, यानी 12 घंटे के दिन में एक स्लॉट लगभग चार घड़ी, यानी 96 मिनट का होता है।")}</p>
<h2>${t("Choghadiya vs shubh muhurat", "चौघड़िया बनाम शुभ मुहूर्त")}</h2>
<p>${t("A shubh muhurat is worked out from planetary positions for a specific event and may be rare. Choghadiya is a daily guide: it is available every day and simply tells you which slots lean favourable. When the two disagree for something major, the muhurat calculated for that event should win.", "शुभ मुहूर्त किसी ख़ास घटना के लिए ग्रहों की स्थिति से निकाला जाता है और दुर्लभ हो सकता है। चौघड़िया रोज़ाना का मार्गदर्शक है: यह हर दिन उपलब्ध है और बस बताता है कि कौन-सा स्लॉट अनुकूल है। बड़े मौक़े पर दोनों में मतभेद हो तो उस घटना के लिए निकाला मुहूर्त प्राथमिकता पाता है।")}</p>
<h2>${t("How choghadiya is calculated", "चौघड़िया कैसे निकाला जाता है")}</h2>
<p>${t('The day (sunrise to sunset) and the night (sunset to next sunrise) are each divided by eight. The first slot belongs to the ruler of the weekday, and the rest follow a fixed planetary order. Because sunrise and sunset differ by city and season, use the <a href="/choghadiya/">choghadiya tool</a> for your exact location.', 'दिन (सूर्योदय से सूर्यास्त) और रात (सूर्यास्त से अगले सूर्योदय) — दोनों को आठ-आठ हिस्सों में बांटा जाता है। पहला स्लॉट उस वार के स्वामी ग्रह का होता है, बाकी एक तय ग्रह-क्रम में चलते हैं। चूंकि सूर्योदय-सूर्यास्त शहर व मौसम के अनुसार बदलते हैं, अपनी सटीक जगह के लिए <a href="/choghadiya/">चौघड़िया टूल</a> उपयोग करें।')}</p>
<h2 id="faq">${t("Choghadiya FAQs", "चौघड़िया से जुड़े सवाल")}</h2>
${guideFaqs.map(([q, a], i) => `<details><summary>${t(q, guideFaqsHi[i][0])}</summary><p>${t(a, guideFaqsHi[i][1])}</p></details>`).join("\n")}
${citiesBlock}`,
  extraJsonLd: [faqSchema(guideFaqs)],
  related: [["/choghadiya/", "Choghadiya Today"], ["/hora/", "Shubh Hora"], ["/gowri-panchangam/", "Gowri Panchangam"]]
}));

/* ---------------- 404 ---------------- */
fs.writeFileSync(path.join(ROOT, "dist", "404.html"), layout({
  urlPath: "/404/", title: `Page Not Found | ${BRAND}`, description: "This page could not be found.",
  h1: t("Page not found", "पृष्ठ नहीं मिला"), crumbLabel: "404",
  bodyHtml: `<p>${t("The page you're looking for doesn't exist. Try one of these instead:", "जिस पृष्ठ को आप ढूंढ रहे हैं वह मौजूद नहीं है। इनमें से कोई एक आज़माएं:")}</p>${citiesBlock}`,
  related: [["/", "Home"], ["/choghadiya/", "Choghadiya Today"]]
}));

/* ---------------- robots.txt + sitemap.xml ---------------- */
fs.writeFileSync(path.join(ROOT, "dist", "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  URLS.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod><changefreq>daily</changefreq></url>`).join("\n") +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, "dist", "sitemap.xml"), sitemap);

/* copy assets */
fs.mkdirSync(path.join(ROOT, "dist", "assets"), { recursive: true });
fs.copyFileSync(path.join(ROOT, "assets", "style.css"), path.join(ROOT, "dist", "assets", "style.css"));
fs.copyFileSync(path.join(ROOT, "assets", "app.js"), path.join(ROOT, "dist", "assets", "app.js"));

console.log("Generated", URLS.length, "pages.");
