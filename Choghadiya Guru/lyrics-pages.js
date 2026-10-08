// /aarti/, /chalisa/, /stotram/, /mantra/, /ashtakam/ hubs and /<type>/<slug>/ item pages
// The catalogue below lists every aarti and chalisa. A page is generated for an item only when its text file exists:
//   data/lyrics/aarti/<slug>.txt   and   data/lyrics/chalisa/<slug>.txt
// File format: plain text. A blank line starts a new verse. A line starting with "# " is a small heading (e.g. "# दोहा").
// Only add texts you have the right to publish (traditional works in the public domain, or text you wrote / have permission for).
// Items without a file are listed on the hub as "जल्द आ रहा है" and get no page, so there are no empty pages.
const fs = require("fs"), path = require("path");
const ROOT = __dirname;

// [slug, Hindi title, English title]
const AARTI = [
  ["Ganesh Aarti / गणेश आरती", [
    ["ganesh-ji", "श्री गणेशजी की आरती", "Shri Ganesh Ji Ki Aarti"], ["ganpati-ji", "आरती श्री गणपति जी", "Aarti Shri Ganpati Ji"], ["gajbadan-vinayak", "आरती गजबदन विनायक की", "Aarti Gajbadan Vinayak Ki"]]],
  ["Goddess Aarti / देवी आरती", [
    ["ahoi-mata", "आरती अहोई माता की", "Ahoi Mata Aarti"], ["amba-ji", "आरती श्री अम्बा जी", "Amba Ji Aarti"], ["durga-ji", "आरती श्री दुर्गाजी", "Durga Ji Aarti"], ["ekadashi-mata", "एकादशी माता की आरती", "Ekadashi Mata Aarti"],
    ["ganga-ji", "आरती श्री गंगाजी", "Ganga Ji Aarti"], ["gayatri-ji", "श्री गायत्रीजी की आरती", "Gayatri Ji Aarti"], ["lakshmi-ji", "आरती श्री लक्ष्मी जी", "Lakshmi Ji Aarti"], ["lalita-mata", "आरती ललिता माता की", "Lalita Mata Aarti"],
    ["shailputri-mata", "शैलपुत्री माता की आरती", "Shailputri Mata Aarti"], ["parvati-mata", "श्री पार्वती माता जी की आरती", "Parvati Mata Aarti"], ["santoshi-maa", "आरती श्री सन्तोषी माँ", "Santoshi Maa Aarti"],
    ["saraswati-ji", "आरती श्री सरस्वती जी", "Saraswati Ji Aarti"], ["sheetla-mata", "श्री शीतला माता की आरती", "Sheetla Mata Aarti"], ["tulsi-ji", "श्री तुलसी जी की आरती", "Tulsi Ji Aarti"], ["vaishno-devi", "आरती श्री वैष्णो देवी", "Vaishno Devi Aarti"]]],
  ["Gods Aarti / देवता आरती", [
    ["chitragupt-ji", "श्री चित्रगुप्त जी की आरती", "Chitragupt Ji Aarti"], ["jagdish-ji", "ॐ जय जगदीश हरे आरती", "Om Jai Jagdish Hare Aarti"], ["narsingh-bhagwan", "श्री नरसिंह भगवान की आरती", "Narsingh Bhagwan Aarti"],
    ["purushottam-dev", "श्री पुरुषोत्तम देव की आरती", "Purushottam Dev Aarti"], ["satyanarayan-ji", "आरती श्री सत्यनारायणजी", "Satyanarayan Ji Aarti"], ["shani-dev", "शनिदेव की आरती", "Shani Dev Aarti"], ["shiv-ji", "शिवजी की आरती", "Shiv Ji Aarti"],
    ["surya-ji", "आरती श्री सूर्य जी", "Surya Ji Aarti"], ["shivshankar-ji", "श्री शिवशंकरजी की आरती", "Shivshankar Ji Aarti"], ["banke-bihari", "श्री बाँकेबिहारी की आरती", "Banke Bihari Aarti"],
    ["govardhan-maharaj", "आरती श्री गोवर्धन महाराज की", "Govardhan Maharaj Aarti"], ["hanuman-ji", "आरती श्री हनुमानजी", "Hanuman Ji Aarti"], ["kunj-bihari", "आरती कुंजबिहारी की", "Aarti Kunj Bihari Ki"],
    ["ramchandra-ji", "आरती श्री रामचन्द्रजी", "Ramchandra Ji Aarti"], ["ramayan-ji", "श्री रामायणजी की आरती", "Ramayan Ji Aarti"]]],
  ["Sants Aarti / संत आरती", [["khatu-shyam", "श्री खाटू श्यामजी की आरती", "Khatu Shyam Ji Aarti"]]],
  ["Weekdays Aarti / वार की आरती", [["krishna-aarti", "श्री कृष्ण की आरती", "Shri Krishna Aarti"], ["brihaspativar", "बृहस्पतिवार की आरती", "Brihaspativar (Thursday) Aarti"], ["shanivar", "शनिवार की आरती", "Shanivar (Saturday) Aarti"]]]
];
const CHALISA = [
  ["Goddess Chalisa / देवी चालीसा", [
    ["durga-chalisa", "श्री दुर्गा चालीसा", "Durga Chalisa"], ["ganga-chalisa", "श्री गंगा चालीसा", "Ganga Chalisa"], ["gayatri-chalisa", "श्री गायत्री चालीसा", "Gayatri Chalisa"], ["lakshmi-chalisa", "श्री लक्ष्मी चालीसा", "Lakshmi Chalisa"],
    ["lalita-chalisa", "श्री ललिता माता चालीसा", "Lalita Mata Chalisa"], ["saraswati-chalisa", "श्री सरस्वती चालीसा", "Saraswati Chalisa"], ["sheetla-chalisa", "श्री शीतला चालीसा", "Sheetla Chalisa"], ["tulsi-chalisa", "श्री तुलसी चालीसा", "Tulsi Chalisa"]]],
  ["Gods Chalisa / देवता चालीसा", [
    ["shiv-chalisa", "श्री शिव चालीसा", "Shiv Chalisa"], ["bajrang-baan", "श्री बजरंग बाण", "Bajrang Baan"], ["ganesh-chalisa", "श्री गणेश चालीसा", "Ganesh Chalisa"], ["hanuman-chalisa", "श्री हनुमान चालीसा", "Hanuman Chalisa"],
    ["krishna-chalisa", "श्री कृष्ण चालीसा", "Krishna Chalisa"], ["ram-chalisa", "श्री राम चालीसा", "Ram Chalisa"], ["shani-chalisa", "श्री शनि चालीसा", "Shani Chalisa"], ["surya-chalisa", "श्री सूर्य देव चालीसा", "Surya Dev Chalisa"]]],
  ["Sants Chalisa / संत चालीसा", [["sai-chalisa", "श्री साईं चालीसा", "Sai Chalisa"]]]
];

const STOTRAM = [
  ["Goddess Stotram / देवी स्तोत्रम्", [["saraswati-stotram", "श्री सरस्वती स्तोत्रम्", "Saraswati Stotram"], ["ashtalakshmi-stotram", "अष्टलक्ष्मी स्तोत्रम्", "Ashtalakshmi Stotram"], ["dhanlakshmi-stotram", "धनलक्ष्मी स्तोत्रम्", "Dhanlakshmi Stotram"], ["kanakdhara-stotram", "कनकधारा स्तोत्रम्", "Kanakdhara Stotram"],
    ["mahalakshmyashtakam", "महालक्ष्म्यष्टकम्", "Mahalakshmyashtakam"], ["navdurga-stotram", "नवदुर्गा स्तोत्रम्", "Navdurga Stotram"], ["shri-suktam", "वैभव प्रदाता श्री सूक्त", "Shri Suktam"]]],
  ["Gods Stotram / देवता स्तोत्रम्", [["nag-stotram", "नाग स्तोत्रम्", "Nag Stotram"], ["rinharta-ganesh-stotram", "ऋणहर्ता श्री गणेश स्तोत्रम्", "Rinharta Ganesh Stotram"], ["rinmukti-ganesh-stotram", "ऋणमुक्ति श्री गणेश स्तोत्रम्", "Rinmukti Ganesh Stotram"], ["shivramashtak-stotram", "श्रीशिवरामाष्टकस्तोत्रम्", "Shivramashtak Stotram"]]],
  ["Mangal Stotram / मंगल स्तोत्रम्", [["rinmochan-mangal-stotra", "ऋणमोचन मंगल स्तोत्र", "Rinmochan Mangal Stotra"]]]
];
const MANTRA = [
  ["Goddess Dasha Mahavidya Mantra / दस महाविद्या मंत्र", [["bagalamukhi-mantra", "बगलामुखी मंत्र", "Bagalamukhi Mantra"], ["bhairavi-mantra", "भैरवी मंत्र", "Bhairavi Mantra"], ["bhuvaneshvari-mantra", "भुवनेश्वरी मंत्र", "Bhuvaneshvari Mantra"], ["chhinnamasta-mantra", "छिन्नमस्ता मंत्र", "Chhinnamasta Mantra"],
    ["dhumavati-mantra", "धूमावती मंत्र", "Dhumavati Mantra"], ["kali-mantra", "काली मंत्र", "Kali Mantra"], ["kamala-mantra", "कमला मंत्र", "Kamala Mantra"], ["matangi-mantra", "मातंगी मंत्र", "Matangi Mantra"], ["shodashi-mantra", "षोडशी मंत्र", "Shodashi Mantra"], ["tara-mantra", "तारा मंत्र", "Tara Mantra"]]],
  ["Goddess Mantra / देवी मंत्र", [["gayatri-mantra", "गायत्री मंत्र", "Gayatri Mantra"], ["saraswati-mantra", "श्री सरस्वती मंत्र", "Shri Saraswati Mantra"], ["mahalakshmi-mantra", "श्री महालक्ष्मी मंत्र", "Shri Mahalakshmi Mantra"]]],
  ["Gods Mantra / देवता मंत्र", [["ganesh-mantra", "श्री गणेश मंत्र", "Shri Ganesha Mantra"], ["hanuman-mantra", "श्री हनुमान मंत्र", "Shri Hanuman Mantra"], ["kubera-mantra", "श्री कुबेर मंत्र", "Shri Kubera Mantra"], ["rama-mantra", "श्री राम मंत्र", "Shri Rama Mantra"],
    ["shiv-mantra", "शिव मंत्र", "Lord Shiva Mantra"], ["mahamrityunjaya-mantra", "महामृत्युंजय मंत्र", "Mahamrityunjaya Mantra"], ["vishnu-mantra", "श्री विष्णु मंत्र", "Shri Vishnu Mantra"]]],
  ["Other Vedic Mantra / अन्य वैदिक मंत्र", [["diwali-puja-mantra", "दीपावली पूजा मंत्र", "Diwali Puja Mantra"], ["lakshmi-ganesh-mantra", "श्री लक्ष्मी-गणेश मंत्र", "Lakshmi-Ganesh Mantra"], ["shanti-path", "शान्ति पाठ मंत्र", "Shanti Path Mantra"]]]
];
const ASHTAKAM = [
  ["Goddess Ashtakam / देवी अष्टकम्", [["saraswati-ashtakam", "श्री सरस्वती अष्टकम्", "Saraswati Ashtakam"]]],
  ["Gods Ashtakam / देवता अष्टकम्", [["ganeshashtakam", "श्री गणेशाष्टकम्", "Ganeshashtakam"], ["krishnashtakam", "श्री कृष्णाष्टकम्", "Krishnashtakam"], ["shivashtakam", "शिवाष्टकम्", "Shivashtakam"], ["shri-shivashtakam", "श्री शिवाष्टकम् (दूसरा पाठ)", "Shri Shivashtakam (second text)"]]]
];

// Long single-text pages: /sunderkand/ and /nama-ramayanam/. Text lives in data/lyrics/path/<slug>.txt.
// A file whose first line starts with "#draft" is NOT published (use it while the text is incomplete).
const PATHS = [
  ["sunderkand", "श्री राम चरित मानस – सुन्दरकाण्ड", "Sunderkand (Ramcharitmanas, Fifth Sopan)", "सुन्दरकाण्ड गोस्वामी तुलसीदास कृत श्रीरामचरितमानस का पाँचवाँ सोपान है, जिसमें हनुमान जी की लंका यात्रा और सीता जी की खोज का वर्णन है। मंगलवार और शनिवार को इसका पाठ करने की परंपरा है।"],
  ["nama-ramayanam", "नाम रामायणम्", "Nama Ramayanam", ""]
];
function loadPath(slug) {
  const f = path.join(ROOT, "data", "lyrics", "path", slug + ".txt");
  if (!fs.existsSync(f)) return null;
  const raw = fs.readFileSync(f, "utf8").replace(/\r/g, "").trim();
  if (/^#draft/.test(raw)) return null;
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return raw.split(/\n\s*\n/).map(v => `<p class="verse">${v.split("\n").map(l => l.startsWith("# ") ? `<h3>${esc(l.slice(2))}</h3>` : `<span class="ln">${esc(l)}</span>`).join("")}</p>`).join("\n");
}
// short, original intro per available item (optional)
const INTRO = {
  "stotram/mahalakshmyashtakam": "महालक्ष्म्यष्टकम् देवी महालक्ष्मी की आठ श्लोकों की स्तुति है, जिसे परंपरा में इंद्र द्वारा रचित माना जाता है। इसे शुक्रवार और दीवाली की पूजा में पढ़ा जाता है।",
  "mantra/gayatri-mantra": "गायत्री मंत्र ऋग्वेद का मंत्र है, जो सविता देव के तेज का ध्यान करता है और बुद्धि को सही दिशा में प्रेरित करने की प्रार्थना है।",
  "mantra/mahamrityunjaya-mantra": "महामृत्युंजय मंत्र ऋग्वेद और यजुर्वेद में आया शिव को समर्पित मंत्र है। इसे आरोग्य और भय से मुक्ति के लिए जपा जाता है।",
  "mantra/shanti-path": "शान्ति पाठ यजुर्वेद का मंत्र है, जो आकाश, पृथ्वी, जल, वनस्पति और सभी देवताओं में शांति की प्रार्थना करता है। इसे पूजा और हवन के अंत में पढ़ा जाता है।",
  "chalisa/hanuman-chalisa": "हनुमान चालीसा गोस्वामी तुलसीदास की रचना है, जिसमें दो दोहे, 40 चौपाइयाँ और समापन दोहा हैं। इसे मंगलवार और शनिवार को पढ़ने की परंपरा है।",
  "aarti/jagdish-ji": "ॐ जय जगदीश हरे आरती की रचना पं. श्रद्धाराम फिल्लौरी ने 1870 के आसपास की थी। यह भारत में पूजा के अंत में सबसे ज़्यादा गाई जाने वाली आरती है।"
};

function load(type, slug) {
  const f = path.join(ROOT, "data", "lyrics", type, slug + ".txt");
  if (!fs.existsSync(f)) return null;
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const verses = fs.readFileSync(f, "utf8").replace(/\r/g, "").trim().split(/\n\s*\n/);
  return verses.map(v => v.split("\n").map(l => l.startsWith("# ") ? `<h3>${esc(l.slice(2))}</h3>` : `<span class="ln">${esc(l)}</span>`).join("")).map(v => `<p class="verse">${v}</p>`).join("\n");
}

module.exports = function ({ BRAND, layout, write, faqSchema }) {
  const KINDS = [
    { type: "aarti", cat: AARTI, hi: "आरती संग्रह", en: "Aarti Collection", one: "आरती", oneEn: "Aarti", desc: "Ganesh, Devi, Shiv, Hanuman, Krishna, Ram and weekday aartis" },
    { type: "chalisa", cat: CHALISA, hi: "चालीसा संग्रह", en: "Chalisa Collection", one: "चालीसा", oneEn: "Chalisa", desc: "Hanuman, Shiv, Durga, Ganesh, Shani and other chalisas" },
    { type: "stotram", cat: STOTRAM, hi: "स्तोत्रम् संग्रह", en: "Stotram Collection", one: "स्तोत्रम्", oneEn: "Stotram", desc: "Lakshmi, Saraswati, Durga, Ganesh and Shiv stotrams" },
    { type: "mantra", cat: MANTRA, hi: "वैदिक मंत्र संग्रह", en: "Vedic Mantra Collection", one: "मंत्र", oneEn: "Mantra", desc: "Gayatri, Mahamrityunjaya, Dasha Mahavidya and deity mantras" },
    { type: "ashtakam", cat: ASHTAKAM, hi: "अष्टकम् संग्रह", en: "Ashtakam Collection", one: "अष्टकम्", oneEn: "Ashtakam", desc: "Shiv, Ganesh, Krishna and Saraswati ashtakams" }
  ];
  PATHS.forEach(([slug, hi, en, intro]) => {
    const body = loadPath(slug); if (!body) return;
    const urlPath = `/${slug}/`;
    write(urlPath, layout({
      urlPath, title: `${hi} – ${en} in Hindi | ${BRAND}`, description: `${hi} (${en}) पूरे हिंदी पाठ के साथ।`,
      h1: `${hi} / ${en}`, crumbLabel: hi,
      bodyHtml: `${intro ? `<p lang="hi">${intro}</p>` : ""}
<div class="lyrics" lang="hi">${body}</div>
<style>.lyrics{font-size:1.1rem;line-height:1.9;max-width:640px}.lyrics .verse{margin:0 0 1.2em}.lyrics .ln{display:block}.lyrics h3{font-size:1rem;margin:.6em 0 .2em;opacity:.8}</style>
<p>See also <a href="/chalisa/hanuman-chalisa/">Hanuman Chalisa</a>, <a href="/aarti/">Aarti</a> and <a href="/mantra/">Vedic Mantra</a>.</p>`,
      related: [["/aarti/", "Aarti"], ["/chalisa/", "Chalisa"], ["/stotram/", "Stotram"], ["/mantra/", "Vedic Mantra"], ["/hindu-calendar/", "Hindu Calendar"]]
    }));
  });
  KINDS.forEach(K => {
    const all = K.cat.flatMap(([, items]) => items), ready = all.filter(([s]) => load(K.type, s));
    const related = [["/aarti/", "Aarti"], ["/chalisa/", "Chalisa"], ["/stotram/", "Stotram"], ["/mantra/", "Vedic Mantra"], ["/ashtakam/", "Ashtakam"], ["/navratri/", "Sharad Navratri"], ["/vrats/", "Vrat Dates"], ["/hindu-calendar/", "Hindu Calendar"]];
    // item pages
    ready.forEach(([slug, hi, en], i) => {
      const body = load(K.type, slug), urlPath = `/${K.type}/${slug}/`, intro = INTRO[`${K.type}/${slug}`];
      const sib = ready.filter(x => x[0] !== slug).slice(0, 6);
      write(urlPath, layout({
        urlPath, title: `${hi} – ${en} in Hindi | ${BRAND}`,
        description: `${hi} (${en}) पूरे हिंदी पाठ के साथ। ${intro ? intro.split("।")[0] + "।" : ""}`.trim(),
        h1: `${hi} / ${en}`, crumbLabel: hi,
        bodyHtml: `${intro ? `<p lang="hi">${intro}</p>` : ""}
<div class="lyrics" lang="hi">${body}</div>
<style>.lyrics{font-size:1.1rem;line-height:1.9;max-width:640px}.lyrics .verse{margin:0 0 1.2em}.lyrics .ln{display:block}.lyrics h3{font-size:1rem;margin:.6em 0 .2em;opacity:.8}</style>
<p>All ${K.oneEn.toLowerCase()}s: <a href="/${K.type}/">${K.en}</a>. See also <a href="/hindu-calendar/">Hindu Calendar</a> and <a href="/shubh-muhurat/">Shubh Muhurat</a>.</p>
${sib.length ? `<h2>और ${K.one} / More ${K.oneEn}s</h2><ul>${sib.map(([s, h]) => `<li><a href="/${K.type}/${s}/">${h}</a></li>`).join("")}</ul>` : ""}`,
        related
      }));
    });
    // hub
    const faqs = [[`${K.one} कैसे पढ़ें? / How to recite a ${K.oneEn}?`, `Bathe, sit in a clean place facing the deity's picture or idol, light a lamp, and read the text slowly. The ${K.oneEn.toLowerCase()} is read at the usual puja time, in the morning or the evening, and most families have their own custom.`]];
    write(`/${K.type}/`, layout({
      urlPath: `/${K.type}/`, title: `${K.hi} – ${K.en} in Hindi | ${BRAND}`,
      description: `${K.hi}: ${K.desc} in Hindi.`,
      h1: `${K.hi} / ${K.en}`, crumbLabel: K.hi,
      bodyHtml: `<p lang="hi">यहाँ ${K.one} का संग्रह है। जिन ${K.one} का पाठ उपलब्ध है, उनके लिंक नीचे दिए गए हैं; बाकी जल्द जोड़ी जाएँगी।</p>
${K.cat.map(([title, items]) => `<h2>${title}</h2><ul>${items.map(([s, h, e]) => load(K.type, s) ? `<li><a href="/${K.type}/${s}/">${h}</a> <small>${e}</small></li>` : `<li>${h} <small>(जल्द आ रहा है)</small></li>`).join("")}</ul>`).join("\n")}
<h2>FAQs</h2>
${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}`,
      extraJsonLd: [faqSchema(faqs)], related
    }));
  });
};
