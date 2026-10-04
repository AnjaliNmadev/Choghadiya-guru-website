/* Choghadiya Guru — Panchang calendar UI. Needs panchang-engine.js (window.Panchang) and app.js (CITIES, state). */
(function () {
  var P = window.Panchang, root = document.getElementById("pc"), day = document.getElementById("pDay");
  if (!P || !root || !day || typeof CITIES === "undefined") return;
  var T = P.T, f24 = P.fmt24;
  var L = {
    hi: { panchang: "पंचांग", extra: "अतिरिक्त जानकारी", bad: "अशुभ मुहूर्त", good: "शुभ मुहूर्त", tithi: "तिथि", nak: "नक्षत्र", yoga: "योग", kar: ["प्रथम करण", "द्वितीय करण", "तृतीय करण", "चतुर्थ करण"], vaar: "वार",
      sunrise: "सूर्योदय", sunset: "सूर्यास्त", moonrise: "चन्द्रोदय", moonset: "चन्द्रास्त", shaka: "शक सम्वत", vikram: "विक्रम सम्वत", amanta: "अमान्ता महीना", purni: "पूर्णिमांत", srashi: "सूर्य राशि", crashi: "चन्द्र राशि", paksha: "पक्ष", S: "शुक्ल", K: "कृष्ण",
      guli: "गुलिक काल", yama: "यमगण्ड", durm: "दुर्मुहूर्त", varj: "वर्ज्य काल", rahu: "राहु काल", abh: "अभिजीत", amrit: "अमृत काल", none: "कोई नहीं", nowed: "नहीं (बुधवार)", upto: "तक", adhik: "अधिक ", fest: "त्योहार / व्रत", nofest: "इस दिन कोई प्रमुख त्योहार नहीं।", prev: "« पिछला दिन", next: "अगला दिन »", today: "आज", mtitle: "पूर्णिमान्ता महीना", atitle: "अमान्ता महीना", shakaw: "शक सम्वत", goto: "आज पर जायें", toAm: "अमांत पर जायें", toPu: "पूर्णिमांत पर जायें", sh: "शु", kr: "कृ", links: "इस दिन का चौघड़िया देखें", dash: "—", nextday: "अगले दिन" },
    en: { panchang: "Panchang", extra: "Additional information", bad: "Inauspicious times", good: "Auspicious times", tithi: "Tithi", nak: "Nakshatra", yoga: "Yoga", kar: ["First Karana", "Second Karana", "Third Karana", "Fourth Karana"], vaar: "Weekday",
      sunrise: "Sunrise", sunset: "Sunset", moonrise: "Moonrise", moonset: "Moonset", shaka: "Shaka Samvat", vikram: "Vikram Samvat", amanta: "Amanta month", purni: "Purnimanta month", srashi: "Sun sign (Surya Rashi)", crashi: "Moon sign (Chandra Rashi)", paksha: "Paksha", S: "Shukla", K: "Krishna",
      guli: "Gulika Kaal", yama: "Yamaganda", durm: "Dur Muhurtam", varj: "Varjyam", rahu: "Rahu Kaal", abh: "Abhijit Muhurat", amrit: "Amrit Kalam", none: "None", nowed: "Not observed on Wednesday", upto: "until", adhik: "Adhik ", fest: "Festivals & vrats", nofest: "No major festival on this day.", prev: "« Previous day", next: "Next day »", today: "Today", mtitle: "Purnimanta month", atitle: "Amanta month", shakaw: "Shaka Samvat", goto: "Go to today", toAm: "Switch to Amanta", toPu: "Switch to Purnimanta", sh: "S", kr: "K", links: "See Choghadiya for today", dash: "—", nextday: "next day" }
  };
  var mode = root.dataset.mode || "year", lang = "hi", cur = null, fcache = {}, cityKey = (typeof state !== "undefined" && CITIES[state.city]) ? state.city : "New Delhi, Delhi", rendered = "New Delhi, Delhi";
  try { lang = localStorage.getItem("chg_lang") === "en" ? "en" : "hi"; } catch (e) { }
  function t() { return L[lang]; }
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function fest(y) { var k = y + "|" + cityKey; if (!fcache[k]) { var c = CITIES[cityKey]; fcache[k] = P.festivals(y, c.lat, c.lon); } return fcache[k]; }
  function setLang(l) {
    lang = l; root.setAttribute("data-lang", l);
    Array.prototype.forEach.call(root.querySelectorAll(".lang button"), function (b) { b.setAttribute("aria-pressed", b.dataset.lang === l); });
    document.documentElement.setAttribute("data-plang", l);
    try { localStorage.setItem("chg_lang", l); } catch (e) { }
    if (cur) show(cur.y, cur.m, cur.d, false);
    if (view === "month") mvRender();
  }
  function row(k, v) { return '<div class="pr"><span>' + k + '</span><b>' + v + "</b></div>"; }
  function upto(x) { return f24(x) + " " + t().upto; }
  function flr(v) { return f24(Math.floor(v + 1e-6)); }
  function range(a) { return flr(a[0]) + " – " + flr(a[1]); }
  function tn(n) { return n === 30 ? T.tithi[lang][15] : T.tithi[lang][(n - 1) % 15]; }
  function lines(arr) { return arr.join("<br>"); }

  function show(y, m, d, scroll) {
    var c = CITIES[cityKey], x = P.dayData(y, m, d, c.lat, c.lon), s = t(), h = [], i;
    cur = { y: y, m: m, d: d };
    var dateTxt = lang === "hi" ? two(d) + " " + T.mon.hi[m - 1] + ", " + y : two(d) + " " + T.mon.en[m - 1] + " " + y;
    var tith = x.tithi.map(function (z) { return tn(z.n) + ", " + upto(z.e); });
    var nak = x.nak.map(function (z) { return T.nak[lang][z.i] + ", " + upto(z.e); });
    var yog = x.yoga.map(function (z) { return T.yoga[lang][z.i] + ", " + upto(z.e); });
    var kar = x.kar.map(function (z, j) { return row(s.kar[j] || "", T.kar[lang][z.i] + ", " + upto(z.e)); }).join("");
    var rashi = x.moonRashi.map(function (z, j) { return T.rashi[lang][z.i] + (j < x.moonRashi.length - 1 || z.e < x.nextSunrise ? ", " + upto(z.e) : ""); });
    var mon = function (i) { return T.lm[lang][i]; };
    var amanta = (x.adhik ? s.adhik : "") + mon(x.amanta), purni = (x.adhik ? s.adhik : "") + mon(x.purnimanta);
    var left = row(s.tithi, lines(tith)) + row(s.nak, lines(nak)) + row(s.yoga, lines(yog)) + kar + row(s.vaar, T.wd[lang][x.wd]);
    var mr = x.moonrise === null ? s.dash : flr(x.moonrise), ms = x.moonset === null ? s.dash : flr(x.moonset);
    var right = row(s.sunrise, flr(x.sunrise)) + row(s.sunset, flr(x.sunset)) + row(s.moonrise, mr) + row(s.moonset, ms) +
      row(s.shaka, x.shaka + " " + T.sam[lang][x.samvatsara]) + row(s.vikram, x.vikram) + row(s.amanta, amanta) + row(s.purni, purni) +
      row(s.srashi, T.rashi[lang][x.sunRashi]) + row(s.crashi, lines(rashi)) + row(s.paksha, s[x.paksha]);
    var bad = row(s.guli, range(x.gulika)) + row(s.yama, range(x.yama)) + row(s.durm, lines(x.durm.map(range))) +
      row(s.varj, x.varjyam.length ? lines(x.varjyam.map(range)) : s.none) + row(s.rahu, range(x.rahu));
    var good = row(s.abh, x.abhijit ? range(x.abhijit) : s.nowed) + row(s.amrit, x.amrit.length ? lines(x.amrit.map(range)) : s.none);
    var fl = fest(y)[m + "-" + d] || [];
    var chips = fl.length ? fl.map(function (o) { return '<span class="chip' + (o.big ? " big" : "") + '">' + o[lang] + "</span>"; }).join("") : '<span class="muted">' + s.nofest + "</span>";
    var prev = new Date(Date.UTC(y, m - 1, d - 1)), next = new Date(Date.UTC(y, m - 1, d + 1));
    day.innerHTML =
      '<div class="pdn"><button type="button" data-pn="-1">' + s.prev + '</button><div class="pdt"><b>' + cityKey + ", India</b> <em>" + dateTxt + " · " + T.wd[lang][x.wd] + '</em></div><button type="button" data-pn="1">' + s.next + "</button></div>" +
      '<div class="pdg"><div class="pdc"><span class="ic">📜</span><div><h4>' + s.panchang + "</h4>" + left + '</div></div><div class="pdc"><span class="ic">🪔</span><div><h4>' + s.extra + "</h4>" + right + "</div></div></div>" +
      '<div class="pdg"><div class="pdc bad"><span class="ic">⏳</span><div><h4>' + s.bad + "</h4>" + bad + '</div></div><div class="pdc good"><span class="ic">✨</span><div><h4>' + s.good + "</h4>" + good + "</div></div></div>" +
      '<div class="pdf"><h4>' + s.fest + "</h4>" + chips + '</div><p class="pdl"><a href="/choghadiya/">' + s.links + " →</a> · <a href=\"/rahu-kaal/\">" + s.rahu + "</a> · <a href=\"/abhijit-muhurat/\">" + s.abh + "</a></p>";
    var pd = document.getElementById("pdate"); if (pd) pd.value = y + "-" + two(m) + "-" + two(d);
    // calendar selection
    Array.prototype.forEach.call(root.querySelectorAll("td.sel"), function (e) { e.classList.remove("sel"); });
    var btn = root.querySelector('button[data-d="' + y + "-" + two(m) + "-" + two(d) + '"]'); if (btn) btn.parentNode.classList.add("sel");
    try { history.replaceState(null, "", "#" + y + "-" + two(m) + "-" + two(d)); } catch (e) { }
    if (scroll) day.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function markToday() {
    var n = new Date(), k = n.getFullYear() + "-" + two(n.getMonth() + 1) + "-" + two(n.getDate());
    Array.prototype.forEach.call(root.querySelectorAll("td.today"), function (e) { e.classList.remove("today"); });
    var b = root.querySelector('button[data-d="' + k + '"]'); if (b) b.parentNode.classList.add("today");
  }
  function rerender() {
    var y = +root.dataset.year; var pmEl = document.getElementById("pMonths"); if (pmEl) pmEl.innerHTML = P.calendarHTML(y, fest(y)); rendered = cityKey; markToday(); if (view === "month") mvRender();
    if (cur) show(cur.y, cur.m, cur.d, false);
  }

  /* ---------- Month-wise panchang view ---------- */
  var mv = null, amanta = false, view = "year";
  function adj(y, m, k) { var d = new Date(Date.UTC(y, m - 1 + k, 1)); return [d.getUTCFullYear(), d.getUTCMonth() + 1]; }
  function yearOpts(sel) { var o = "", q; for (q = 2000; q <= 2100; q++) o += '<option value="' + q + '"' + (q === sel ? " selected" : "") + ">" + q + "</option>"; return o; }
  function mvRender() {
    var box = document.getElementById("pMonthView"), s = t(), c = CITIES[cityKey], g = P.monthGrid(mv.y, mv.m, c.lat, c.lon), i, h;
    var seen = [], key = amanta ? "am" : "pm";
    g.days.forEach(function (x) { var k = (x.adhik ? "A" : "") + x[key]; if (seen.indexOf(k) < 0) seen.push(k); });
    var names = seen.map(function (k) { return (k[0] === "A" ? s.adhik : "") + T.lm[lang][+k.replace("A", "")]; });
    var head = (amanta ? s.atitle : s.mtitle) + " : [" + names.join(" - ") + "] &nbsp; " + g.shaka + " " + T.sam[lang][g.samvatsara] + ", " + s.shakaw;
    var first = new Date(Date.UTC(mv.y, mv.m - 1, 1)).getUTCDay(), cells = [], pm = adj(mv.y, mv.m, -1), nm = adj(mv.y, mv.m, 1), gp = null, gn = null;
    var dimP = new Date(Date.UTC(pm[0], pm[1], 0)).getUTCDate();
    if (first) gp = P.monthGrid(pm[0], pm[1], c.lat, c.lon);
    for (i = first - 1; i >= 0; i--) cells.push({ y: pm[0], m: pm[1], x: gp.days[dimP - 1 - i], out: 1 });
    g.days.forEach(function (x) { cells.push({ y: mv.y, m: mv.m, x: x }); });
    var tail = (7 - cells.length % 7) % 7; if (tail) gn = P.monthGrid(nm[0], nm[1], c.lat, c.lon);
    for (i = 0; i < tail; i++) cells.push({ y: nm[0], m: nm[1], x: gn.days[i], out: 1 });
    var n = new Date(), todayK = n.getFullYear() + "-" + (n.getMonth() + 1) + "-" + n.getDate();
    h = '<div class="mvh">' + head + '</div><div class="mvn"><button type="button" data-mv="-1">&lt; ' + (lang === "hi" ? "पिछला" : "Prev") + '</button><button type="button" data-mv="0">' + s.goto + '</button><button type="button" data-mv="1">' + (lang === "hi" ? "अगला" : "Next") + ' &gt;</button><span class="mvs"><select data-mvsel="m" aria-label="Month">' + T.mon[lang].map(function (nm2, q) { return '<option value="' + (q + 1) + '"' + (q + 1 === mv.m ? " selected" : "") + ">" + nm2 + "</option>"; }).join("") + '</select><select data-mvsel="y" aria-label="Year">' + yearOpts(mv.y) + '</select></span><button type="button" data-mv="am">' + (amanta ? s.toPu : s.toAm) + "</button></div>";
    h += '<table class="mvt"><thead><tr>' + [0, 1, 2, 3, 4, 5, 6].map(function (w) { return "<th>" + T.wd.en[w].slice(0, 3) + "</th>"; }).join("") + "</tr></thead><tbody>";
    cells.forEach(function (c2, j) {
      if (j % 7 === 0) h += "<tr>";
      var x = c2.x, fl = (fest(c2.y)[c2.m + "-" + x.d] || []), tnum = x.tn.map(function (q) { return ((q - 1) % 15) + 1; }).join(", ");
      var cls = (c2.out ? "out " : "") + (c2.y + "-" + c2.m + "-" + x.d === todayK ? "today " : "") + (x.wd === 0 ? "sun" : "");
      h += '<td class="' + cls + '"><button type="button" data-d="' + c2.y + "-" + two(c2.m) + "-" + two(x.d) + '"><span class="mt">' + tn(x.tn[0]) + ", " + (x.tn[0] <= 15 ? s.sh : s.kr) + '</span><span class="md"><b>' + x.d + "</b> <i>" + tnum + "</i></span>" +
        fl.slice(0, 4).map(function (o) { return '<span class="mfst" title="' + o[lang].replace(/"/g, "") + '">' + o[lang] + "</span>"; }).join("") + (fl.length > 4 ? '<span class="mfst">+' + (fl.length - 4) + "</span>" : "") + "</button></td>";
      if (j % 7 === 6) h += "</tr>";
    });
    h += "</tbody></table>";
    var up = "";
    g.days.forEach(function (x) { (fest(mv.y)[mv.m + "-" + x.d] || []).forEach(function (o) { up += '<li><b>' + x.d + " " + T.mon[lang][mv.m - 1].slice(0, 3) + "</b> " + o[lang] + "</li>"; }); });
    h += '<div class="mvu"><h4>' + s.fest + "</h4><ul>" + up + "</ul></div>";
    box.innerHTML = h;
  }
  function setView(v) {
    view = v; var cal = document.getElementById("pMonths") || {}, lg = document.getElementById("pLegend") || {}, box = document.getElementById("pMonthView");
    Array.prototype.forEach.call(root.querySelectorAll(".views button"), function (b) { b.setAttribute("aria-pressed", b.dataset.view === v); });
    if (v === "month") { var n = new Date(); mv = mv || (cur ? { y: cur.y, m: cur.m } : { y: n.getFullYear(), m: n.getMonth() + 1 }); cal.hidden = true; lg.hidden = true; box.hidden = false; mvRender(); }
    else { cal.hidden = false; lg.hidden = false; box.hidden = true; }
  }
  root.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.d) { var p = b.dataset.d.split("-"); show(+p[0], +p[1], +p[2], true); }
    else if (b.dataset.pn) { var n = new Date(Date.UTC(cur.y, cur.m - 1, cur.d + (+b.dataset.pn))); show(n.getUTCFullYear(), n.getUTCMonth() + 1, n.getUTCDate(), false); }
    else if (b.dataset.today) { var tn2 = new Date(); show(tn2.getFullYear(), tn2.getMonth() + 1, tn2.getDate(), false); }
    else if (b.dataset.lang) setLang(b.dataset.lang);
    else if (b.dataset.view) setView(b.dataset.view);
    else if (b.dataset.mv) { var q = b.dataset.mv; if (q === "am") amanta = !amanta; else if (q === "0") { var nw = new Date(); mv = { y: nw.getFullYear(), m: nw.getMonth() + 1 }; } else { var a2 = adj(mv.y, mv.m, +q); mv = { y: a2[0], m: a2[1] }; } mvRender(); }
  });
  root.addEventListener("change", function (e) {
    var q = e.target;
    if (q.dataset && q.dataset.mvsel) { if (q.dataset.mvsel === "y") mv.y = +q.value; else mv.m = +q.value; mvRender(); }
    else if (q.id === "pdate" && q.value) { var pp = q.value.split("-"); if (+pp[0] >= 1900 && +pp[0] <= 2200) show(+pp[0], +pp[1], +pp[2], false); }
  });
  var ci = document.getElementById("city");
  function cityChanged() { if (typeof state !== "undefined" && CITIES[state.city] && state.city !== cityKey) { cityKey = state.city; rerender(); } }
  if (ci) { ci.addEventListener("input", cityChanged); ci.addEventListener("change", cityChanged); }

  var y0 = +root.dataset.year, now = new Date(), start, hm = /^#(\d{4})-(\d\d)-(\d\d)$/.exec(location.hash);
  if (hm && +hm[1] >= 2000 && +hm[1] <= 2100) start = { y: +hm[1], m: +hm[2], d: +hm[3] };
  else if (mode !== "year" || now.getFullYear() === y0) start = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  else start = { y: y0, m: 1, d: 1 };
  root.setAttribute("data-lang", lang);
  Array.prototype.forEach.call(root.querySelectorAll(".lang button"), function (b) { b.setAttribute("aria-pressed", b.dataset.lang === lang); });
  if (cityKey !== rendered) rerender(); else markToday();
  show(start.y, start.m, start.d, false);
  if (mode === "month") setView("month");
})();
