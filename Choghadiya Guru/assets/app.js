/* Choghadiya Guru — shared site script. Sunrise/sunset: NOAA solar equations (disc centre at horizon, IST). */
var CITY_DATA = [
"New Delhi|Delhi|28.61|77.21","Gurugram|Haryana|28.46|77.03","Noida|Uttar Pradesh|28.54|77.39","Faridabad|Haryana|28.41|77.31","Ghaziabad|Uttar Pradesh|28.67|77.44",
"Lucknow|Uttar Pradesh|26.85|80.95","Kanpur|Uttar Pradesh|26.45|80.35","Varanasi|Uttar Pradesh|25.32|82.97","Prayagraj|Uttar Pradesh|25.44|81.85","Agra|Uttar Pradesh|27.18|78.01","Mathura|Uttar Pradesh|27.49|77.67","Ayodhya|Uttar Pradesh|26.80|82.20","Meerut|Uttar Pradesh|28.98|77.71","Gorakhpur|Uttar Pradesh|26.76|83.37","Bareilly|Uttar Pradesh|28.37|79.43","Aligarh|Uttar Pradesh|27.88|78.08","Moradabad|Uttar Pradesh|28.84|78.78","Jhansi|Uttar Pradesh|25.45|78.57","Saharanpur|Uttar Pradesh|29.96|77.55",
"Dehradun|Uttarakhand|30.32|78.03","Haridwar|Uttarakhand|29.95|78.16","Rishikesh|Uttarakhand|30.09|78.27","Nainital|Uttarakhand|29.38|79.46",
"Shimla|Himachal Pradesh|31.10|77.17","Manali|Himachal Pradesh|32.24|77.19","Dharamshala|Himachal Pradesh|32.22|76.32",
"Srinagar|Jammu and Kashmir|34.08|74.80","Jammu|Jammu and Kashmir|32.73|74.87","Leh|Ladakh|34.15|77.58",
"Chandigarh|Chandigarh|30.73|76.78","Ludhiana|Punjab|30.90|75.86","Amritsar|Punjab|31.63|74.87","Jalandhar|Punjab|31.33|75.58","Patiala|Punjab|30.34|76.39",
"Ambala|Haryana|30.38|76.78","Panipat|Haryana|29.39|76.97","Rohtak|Haryana|28.90|76.61","Hisar|Haryana|29.15|75.72","Kurukshetra|Haryana|29.97|76.88",
"Jaipur|Rajasthan|26.91|75.79","Jodhpur|Rajasthan|26.24|73.02","Udaipur|Rajasthan|24.59|73.71","Kota|Rajasthan|25.18|75.83","Ajmer|Rajasthan|26.45|74.64","Bikaner|Rajasthan|28.02|73.31","Jaisalmer|Rajasthan|26.92|70.92","Pushkar|Rajasthan|26.49|74.55","Alwar|Rajasthan|27.55|76.63","Bharatpur|Rajasthan|27.22|77.49","Sikar|Rajasthan|27.61|75.14",
"Ahmedabad|Gujarat|23.02|72.57","Surat|Gujarat|21.17|72.83","Vadodara|Gujarat|22.31|73.18","Rajkot|Gujarat|22.30|70.80","Gandhinagar|Gujarat|23.22|72.65","Bhavnagar|Gujarat|21.76|72.15","Jamnagar|Gujarat|22.47|70.07","Junagadh|Gujarat|21.52|70.46","Dwarka|Gujarat|22.24|68.97","Somnath|Gujarat|20.89|70.40","Bhuj|Gujarat|23.25|69.67",
"Bhopal|Madhya Pradesh|23.26|77.41","Indore|Madhya Pradesh|22.72|75.86","Ujjain|Madhya Pradesh|23.18|75.78","Jabalpur|Madhya Pradesh|23.18|79.94","Gwalior|Madhya Pradesh|26.22|78.18","Sagar|Madhya Pradesh|23.84|78.74","Rewa|Madhya Pradesh|24.53|81.30",
"Raipur|Chhattisgarh|21.25|81.63","Bilaspur|Chhattisgarh|22.08|82.14","Bhilai|Chhattisgarh|21.21|81.38",
"Mumbai|Maharashtra|19.08|72.88","Pune|Maharashtra|18.52|73.86","Nagpur|Maharashtra|21.15|79.09","Nashik|Maharashtra|19.99|73.79","Thane|Maharashtra|19.22|72.98","Navi Mumbai|Maharashtra|19.03|73.03","Chhatrapati Sambhajinagar|Maharashtra|19.88|75.34","Solapur|Maharashtra|17.66|75.91","Kolhapur|Maharashtra|16.70|74.24","Shirdi|Maharashtra|19.77|74.48","Amravati|Maharashtra|20.93|77.75",
"Panaji|Goa|15.50|73.83","Margao|Goa|15.27|73.96",
"Bengaluru|Karnataka|12.97|77.59","Mysuru|Karnataka|12.30|76.64","Mangaluru|Karnataka|12.91|74.86","Hubballi|Karnataka|15.36|75.12","Belagavi|Karnataka|15.85|74.50","Udupi|Karnataka|13.34|74.75","Kalaburagi|Karnataka|17.33|76.83","Shivamogga|Karnataka|13.93|75.57",
"Thiruvananthapuram|Kerala|8.52|76.94","Kochi|Kerala|9.93|76.27","Kozhikode|Kerala|11.26|75.78","Thrissur|Kerala|10.53|76.21","Kollam|Kerala|8.89|76.61","Kannur|Kerala|11.87|75.37","Palakkad|Kerala|10.78|76.65",
"Chennai|Tamil Nadu|13.08|80.27","Coimbatore|Tamil Nadu|11.02|76.96","Madurai|Tamil Nadu|9.93|78.12","Tiruchirappalli|Tamil Nadu|10.79|78.70","Salem|Tamil Nadu|11.66|78.15","Tirunelveli|Tamil Nadu|8.71|77.76","Vellore|Tamil Nadu|12.92|79.13","Rameswaram|Tamil Nadu|9.29|79.31","Thanjavur|Tamil Nadu|10.79|79.14","Erode|Tamil Nadu|11.34|77.72",
"Puducherry|Puducherry|11.93|79.83",
"Visakhapatnam|Andhra Pradesh|17.69|83.22","Vijayawada|Andhra Pradesh|16.51|80.65","Tirupati|Andhra Pradesh|13.63|79.42","Guntur|Andhra Pradesh|16.31|80.44","Nellore|Andhra Pradesh|14.44|79.99","Kurnool|Andhra Pradesh|15.83|78.04","Amaravati|Andhra Pradesh|16.51|80.52",
"Hyderabad|Telangana|17.39|78.49","Warangal|Telangana|17.97|79.59","Nizamabad|Telangana|18.67|78.09","Karimnagar|Telangana|18.44|79.13",
"Bhubaneswar|Odisha|20.30|85.82","Cuttack|Odisha|20.46|85.88","Puri|Odisha|19.81|85.83","Rourkela|Odisha|22.26|84.85","Sambalpur|Odisha|21.47|83.98",
"Kolkata|West Bengal|22.57|88.36","Howrah|West Bengal|22.59|88.31","Siliguri|West Bengal|26.72|88.43","Durgapur|West Bengal|23.55|87.32","Asansol|West Bengal|23.68|86.98",
"Ranchi|Jharkhand|23.34|85.31","Jamshedpur|Jharkhand|22.80|86.20","Dhanbad|Jharkhand|23.80|86.43","Deoghar|Jharkhand|24.49|86.69","Bokaro|Jharkhand|23.67|86.15",
"Patna|Bihar|25.59|85.14","Gaya|Bihar|24.80|85.00","Bhagalpur|Bihar|25.24|87.01","Muzaffarpur|Bihar|26.12|85.39","Darbhanga|Bihar|26.15|85.90",
"Gangtok|Sikkim|27.33|88.61","Guwahati|Assam|26.14|91.74","Dibrugarh|Assam|27.47|94.91","Silchar|Assam|24.83|92.78","Jorhat|Assam|26.76|94.20",
"Shillong|Meghalaya|25.57|91.88","Imphal|Manipur|24.82|93.94","Agartala|Tripura|23.83|91.28","Aizawl|Mizoram|23.73|92.72","Kohima|Nagaland|25.67|94.11","Itanagar|Arunachal Pradesh|27.08|93.61",
"Port Blair|Andaman and Nicobar|11.62|92.73","Silvassa|Dadra and Nagar Haveli|20.27|73.01","Daman|Daman and Diu|20.41|72.83","Kavaratti|Lakshadweep|10.57|72.64"
];
var CITIES = {};
CITY_DATA.forEach(function (s) { var p = s.split("|"); CITIES[p[0] + ", " + p[1]] = { lat: +p[2], lon: +p[3] }; });

var GOOD = {
  Amrit: ["good", "All kinds of work, esp. dairy trade"], Shubh: ["good", "Weddings, puja, studies"],
  Labh: ["good", "Fresh business ventures, learning"], Char: ["ok", "Journeys, arts, dance, cultural events"],
  Udveg: ["bad", "Official / government matters"], Kaal: ["bad", "Machinery, building, farming work"], Rog: ["bad", "Debates, contests, settling disputes"]
};
var DAYSEQ = { 0: "Udveg Char Labh Amrit Kaal Shubh Rog Udveg", 1: "Amrit Kaal Shubh Rog Udveg Char Labh Amrit",
  2: "Rog Udveg Char Labh Amrit Kaal Shubh Rog", 3: "Labh Amrit Kaal Shubh Rog Udveg Char Labh",
  4: "Shubh Rog Udveg Char Labh Amrit Kaal Shubh", 5: "Char Labh Amrit Kaal Shubh Rog Udveg Char", 6: "Kaal Shubh Rog Udveg Char Labh Amrit Kaal" };
var NIGHTSEQ = { 0: "Shubh Amrit Char Rog Kaal Labh Udveg Shubh", 1: "Char Rog Kaal Labh Udveg Shubh Amrit Char",
  2: "Kaal Labh Udveg Shubh Amrit Char Rog Kaal", 3: "Udveg Shubh Amrit Char Rog Kaal Labh Udveg",
  4: "Amrit Char Rog Kaal Labh Udveg Shubh Amrit", 5: "Rog Kaal Labh Udveg Shubh Amrit Char Rog", 6: "Labh Udveg Shubh Amrit Char Rog Kaal Labh" };
var RAHU = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 };
var YAMA = { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6 };
var GULI = { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 };
var WD = ["Ravivaar", "Somvaar", "Mangalvaar", "Budhvaar", "Guruvaar", "Shukravaar", "Shanivaar"];
var WDS = ["Ravi", "Som", "Mangal", "Budh", "Guru", "Shukra", "Shani"];
var MN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var HN = ["Surya", "Shukra", "Budh", "Chandra", "Shani", "Guru", "Mangal"], HL = [0, 3, 6, 2, 5, 1, 4];
var HI = { Surya: ["ok", "Govt. work, authority, health"], Shukra: ["good", "Marriage, romance, art, vehicles"], Budh: ["good", "Business, exams, contracts"],
  Chandra: ["ok", "Travel, water, family matters"], Shani: ["bad", "Iron, oil, labour; avoid new starts"], Guru: ["good", "Puja, teaching, wedding, finance"], Mangal: ["bad", "Property, sports, repairs; avoid disputes"] };
var GK = { U: "Uthi", A: "Amirdha", V: "Visham", R: "Rogam", L: "Laabam", D: "Dhanam", S: "Sugam", O: "Soram" };
var GI = { U: ["ok", "Official / professional work"], A: ["good", "Best for every new start"], L: ["ok", "Profit, trade, deals"], D: ["ok", "Money, accounts, buying"],
  S: ["ok", "Comfort, travel, home"], V: ["bad", "Avoid: obstacles likely"], R: ["bad", "Avoid: health, delays"], O: ["bad", "Avoid: loss, quarrels"] };
var GD = ["UARLDSOV", "AVRLDSOU", "RLDSOUAV", "LDSOVUAR", "DSOUAVRL", "SOVUARLD", "OUAVRLDS"];
var TILES = { marriage: ["Marriage", ["Shubh", "Amrit", "Labh"]], naming: ["Name Giving", ["Amrit", "Shubh"]], vehicle: ["New Vehicle", ["Amrit", "Shubh", "Labh", "Char"]],
  property: ["New Property", ["Labh", "Amrit", "Shubh"]], business: ["Business", ["Labh", "Amrit", "Shubh"]], mundan: ["Mundan", ["Shubh", "Amrit"]] };

var IST = 330, ZEN = 90.0, RAD = Math.PI / 180, DEG = 180 / Math.PI;
var $ = function (id) { return document.getElementById(id); };
function set(id, html) { var e = $(id); if (e) e.innerHTML = html; }
function setText(id, txt) { var e = $(id); if (e) e.textContent = txt; }

function jd0(y, m, d) { return Date.UTC(y, m - 1, d) / 864e5 + 2440587.5; }
function sun(y, m, d, lat, lon) {
  var base = jd0(y, m, d), t = base + (12 - lon / 15) / 24, out = null;
  for (var k = 0; k < 2; k++) {
    var T = (t - 2451545) / 36525;
    var L0 = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360;
    var M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
    var e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
    var C = Math.sin(M * RAD) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
      Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * RAD) * 0.000289;
    var om = 125.04 - 1934.136 * T, lam = L0 + C - 0.00569 - 0.00478 * Math.sin(om * RAD);
    var eps = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(om * RAD);
    var dec = Math.asin(Math.sin(eps * RAD) * Math.sin(lam * RAD));
    var yy = Math.pow(Math.tan(eps * RAD / 2), 2);
    var eq = 4 * DEG * (yy * Math.sin(2 * L0 * RAD) - 2 * e * Math.sin(M * RAD) +
      4 * e * yy * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) - 0.5 * yy * yy * Math.sin(4 * L0 * RAD) -
      1.25 * e * e * Math.sin(2 * M * RAD));
    var c = Math.cos(ZEN * RAD) / (Math.cos(lat * RAD) * Math.cos(dec)) - Math.tan(lat * RAD) * Math.tan(dec);
    c = Math.max(-1, Math.min(1, c));
    var ha = Math.acos(c) * DEG, noon = 720 - 4 * lon - eq;
    out = { r: noon - 4 * ha + IST, s: noon + 4 * ha + IST };
    t = base + (k === 0 ? noon : noon - 4 * ha) / 1440;
  }
  return out;
}
function fmt(m) { m = Math.round(m); m = ((m % 1440) + 1440) % 1440; var h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; }
function range(a, b) { return fmt(a) + " – " + fmt(b); }

var state = { city: (typeof DEFAULT_CITY !== "undefined" ? DEFAULT_CITY : "New Delhi, Delhi"), date: new Date() }, SLOTS = [], tile = "";

function slotHtml(cls, n, s, e, txt, on, tag) {
  return '<div class="slot ' + cls + (on ? " cur" : "") + '"><div class="sh"><b>' + n + '</b>' + (tag ? "<em>" + tag + "</em>" : "") + (on ? '<em class="now">Now</em>' : "") +
    '</div><time>' + range(s, e) + (s >= 1440 ? " (next day)" : "") + '</time><p>' + txt + '</p></div>';
}

function build() {
  var d = state.date, c = CITIES[state.city]; if (!c) { state.city = "New Delhi, Delhi"; c = CITIES[state.city]; }
  var y = d.getFullYear(), m = d.getMonth() + 1, dd = d.getDate(), w = d.getDay(), nx = new Date(y, m - 1, dd + 1);
  var a = sun(y, m, dd, c.lat, c.lon), b = sun(nx.getFullYear(), nx.getMonth() + 1, nx.getDate(), c.lat, c.lon), dl = (a.s - a.r) / 8, nl = (b.r + 1440 - a.s) / 8;
  var now = new Date(), t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()), off = Math.round((t0 - new Date(y, m - 1, dd)) / 864e5), nm = now.getHours() * 60 + now.getMinutes() + off * 1440, live = off === 0 || off === 1;
  var h1 = "", h2 = "", cur = null; SLOTS = [];
  DAYSEQ[w].split(" ").forEach(function (n, i) { var s = a.r + i * dl, e = s + dl, rk = i + 1 === RAHU[w], on = live && nm >= s && nm < e; h1 += slotHtml(GOOD[n][0], n, s, e, GOOD[n][1], on, rk ? "☊ Rahu Kaal" : ""); SLOTS.push({ n: n, s: s, e: e, rk: rk }); if (on) cur = { n: n, e: e, rk: rk }; });
  NIGHTSEQ[w].split(" ").forEach(function (n, i) { var s = a.s + i * nl, e = s + nl, on = live && nm >= s && nm < e; h2 += slotHtml(GOOD[n][0], n, s, e, GOOD[n][1], on, ""); if (on) cur = { n: n, e: e, rk: false }; });
  set("day", h1); set("night", h2);
  var seg = function (mp) { var s = a.r + (mp[w] - 1) * dl; return range(s, s + dl); }, ab = (a.s - a.r) / 15, abS = a.r + 7 * ab, place = state.city.toUpperCase() + ", INDIA", cn = state.city.split(",")[0];
  set("hd", "<mark>CHOGHADIYA</mark> FOR " + place);
  setText("sub", WD[w] + ", " + MN[m - 1] + " " + dd + ", " + y);
  setText("intro", "Choghadiya timings for " + state.city + " on " + WD[w] + ", " + MN[m - 1] + " " + dd + ", " + y + ". Green marks the most auspicious slots, blue is good, red is best avoided.");
  set("dcard", '<div class="dn">' + dd + '</div><div class="dm">' + MN[m - 1].slice(0, 3) + " " + y + '</div><div class="dw">' + WD[w] + '</div><div class="ck" id="ck"></div><button data-s="-1">« Prev Day</button><button data-s="1">Next Day »</button>');
  tick();
  set("sum", [["Sunrise", fmt(a.r)], ["Sunset", fmt(a.s)], ["Rahu Kaal", seg(RAHU)], ["Yamaganda", seg(YAMA)], ["Gulika Kaal", seg(GULI)], ["Abhijit Muhurat", w === 3 ? "Not observed on Wednesday" : range(abS, abS + ab)]].map(function (x) { return "<div><b>" + x[0] + "</b><span>" + x[1] + "</span></div>"; }).join(""));
  setText("rkline", "Today's Rahu Kaal in " + cn + ": " + seg(RAHU));
  var el = $("now"); if (el) { if (cur) { el.style.display = "block"; el.innerHTML = "<b>Right now: " + cur.n + " choghadiya</b> until " + fmt(cur.e) + "." + (cur.rk ? " Rahu Kaal is also running." : ""); } else el.style.display = "none"; }
  document.querySelectorAll(".cn").forEach(function (elm) { elm.textContent = cn; });
  showTile(); grids(w); extra(a, b, w, dl, nl, nm, live, c);
}
function tick() { var n = new Date(), e = $("ck"); if (e) e.textContent = "(" + fmt(n.getHours() * 60 + n.getMinutes()) + ")"; }
function showTile() { var o = $("tileOut"); if (!o) return; if (!tile) { o.style.display = "none"; return; } var t = TILES[tile], r = SLOTS.filter(function (x) { return t[1].indexOf(x.n) > -1 && !x.rk; });
  o.style.display = "block"; o.innerHTML = "<b>" + t[0] + " – best daytime slots (Rahu Kaal excluded):</b><br>" + (r.length ? r.map(function (x) { return x.n + " " + range(x.s, x.e); }).join(" &nbsp;|&nbsp; ") : "No clean slot today, try another date.") + "<br><small>For weddings and other major rites, also check tithi and nakshatra with a pandit.</small>"; }
function grids(w) { if (!$("dgrid")) return; [["dgrid", DAYSEQ, "AM"], ["ngrid", NIGHTSEQ, "PM"]].forEach(function (g) { var h = "<thead><tr><th>Time</th>" + WD.map(function (x, i) { return "<th" + (i === w ? ' class="tw"' : "") + ">" + x.replace("vaar", "") + "</th>"; }).join("") + "</tr></thead><tbody>";
  for (var i = 0; i < 8; i++) { var mins = 360 + i * 90, hh = Math.floor(mins / 60) % 12 || 12, mm = ("0" + mins % 60).slice(-2), ap = mins >= 720 ? (g[2] === "AM" ? "PM" : "AM") : g[2];
    h += "<tr><td>From " + hh + ":" + mm + " " + ap + "</td>" + [0, 1, 2, 3, 4, 5, 6].map(function (k) { var n = g[1][k].split(" ")[i]; return '<td class="' + GOOD[n][0] + (k === w ? " tw" : "") + '">' + n + "</td>"; }).join("") + "</tr>"; }
  set(g[0], h + "</tbody>"); }); }
function extra(a, b, w, dl, nl, nm, live, c) {
  var hd = (a.s - a.r) / 12, hn = (b.r + 1440 - a.s) / 12, h1 = "", h2 = "", g1 = "", g2 = "", i, n, s, e;
  if ($("hday") || $("hnight")) {
    for (i = 0; i < 24; i++) { n = HN[(HL[w] + i) % 7]; s = i < 12 ? a.r + i * hd : a.s + (i - 12) * hn; e = s + (i < 12 ? hd : hn);
      var x = slotHtml(HI[n][0], n, s, e, HI[n][1], live && nm >= s && nm < e, HI[n][0] === "good" ? "Shubh" : ""); if (i < 12) h1 += x; else h2 += x; }
    set("hday", h1); set("hnight", h2);
  }
  if ($("gday") || $("gnight")) {
    var gd = GD[w], gn = w ? GD[(w + 4) % 7] : "DSOVUARL";
    for (i = 0; i < 8; i++) { n = gd[i]; s = a.r + i * dl; e = s + dl; g1 += slotHtml(GI[n][0], GK[n], s, e, GI[n][1], live && nm >= s && nm < e, i + 1 === RAHU[w] ? "☊ Rahu Kaal" : "");
      n = gn[i]; s = a.s + i * nl; e = s + nl; g2 += slotHtml(GI[n][0], GK[n], s, e, GI[n][1], live && nm >= s && nm < e, ""); }
    set("gday", g1); set("gnight", g2);
  }
  if ($("rkTbl") || $("abTbl") || $("rkSum") || $("abSum")) {
    var rk = "", ab = "";
    for (i = 0; i < 7; i++) {
      var d = new Date(state.date.getFullYear(), state.date.getMonth(), state.date.getDate() + i), q = d.getDay(), t = sun(d.getFullYear(), d.getMonth() + 1, d.getDate(), c.lat, c.lon), l = (t.s - t.r) / 8, p = (t.s - t.r) / 15,
        f = function (mp) { var z = t.r + (mp[q] - 1) * l; return range(z, z + l); }, lb = d.getDate() + " " + MN[d.getMonth()].slice(0, 3) + ", " + WDS[q], cl = i ? "" : ' class="tw"';
      if (i === 0) {
        set("rkSum", [["Rahu Kaal", f(RAHU)], ["Yamaganda", f(YAMA)], ["Gulika Kaal", f(GULI)]].map(function (y) { return "<div><b>" + y[0] + "</b><span>" + y[1] + "</span></div>"; }).join(""));
        set("abSum", [["Sunrise", fmt(t.r)], ["Sunset", fmt(t.s)], ["Abhijit Muhurat", q === 3 ? "Not observed on Wednesday" : range(t.r + 7 * p, t.r + 8 * p)]].map(function (y) { return "<div><b>" + y[0] + "</b><span>" + y[1] + "</span></div>"; }).join(""));
      }
      rk += "<tr" + cl + "><td>" + lb + "</td><td>" + fmt(t.r) + "</td><td>" + f(RAHU) + "</td><td>" + f(YAMA) + "</td><td>" + f(GULI) + "</td></tr>";
      ab += "<tr" + cl + "><td>" + lb + "</td><td>" + fmt(t.r) + "</td><td>" + fmt(t.s) + "</td><td>" + (q === 3 ? "Not observed" : range(t.r + 7 * p, t.r + 8 * p)) + "</td></tr>";
    }
    set("rkTbl", "<thead><tr><th>Date</th><th>Sunrise</th><th>Rahu Kaal</th><th>Yamaganda</th><th>Gulika</th></tr></thead><tbody>" + rk + "</tbody>");
    set("abTbl", "<thead><tr><th>Date</th><th>Sunrise</th><th>Sunset</th><th>Abhijit Muhurat</th></tr></thead><tbody>" + ab + "</tbody>");
  }
}
function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function go(n) { var d = state.date; state.date = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); if ($("dt")) $("dt").value = iso(state.date); build(); }
function today(k) { var t = new Date(); state.date = new Date(t.getFullYear(), t.getMonth(), t.getDate() + k); if ($("dt")) $("dt").value = iso(state.date); build(); }
function setCity(v) { var hit = null, q = v.trim().toLowerCase(); Object.keys(CITIES).some(function (k) { if (k.toLowerCase() === q || k.split(",")[0].toLowerCase() === q) { hit = k; return true; } });
  if (hit) { state.city = hit; try { localStorage.setItem("chg_city", hit); } catch (e) { } if ($("city")) $("city").value = hit; build(); } }

document.addEventListener("click", function (e) {
  var f = e.target.closest("[data-focus]"); if (f) { setTimeout(function () { if ($("city")) $("city").focus(); }, 50); }
  var b = e.target.closest("[data-s],[data-day],[data-city],[data-tile],[data-share]"); if (!b) return;
  if (b.dataset.s) go(+b.dataset.s); else if (b.dataset.day) today(+b.dataset.day);
  else if (b.dataset.city) { setCity(b.dataset.city); window.scrollTo({ top: 0, behavior: "smooth" }); }
  else if (b.dataset.tile) { tile = b.dataset.tile; showTile(); document.querySelectorAll(".tile").forEach(function (t) { t.setAttribute("aria-pressed", t === b); }); }
  else { var u = encodeURIComponent(location.href), s = b.dataset.share; if (s === "copy") { try { navigator.clipboard.writeText(location.href); b.textContent = "Copied"; } catch (x) { } } else window.open({ wa: "https://wa.me/?text=", fb: "https://www.facebook.com/sharer/sharer.php?u=", x: "https://twitter.com/intent/tweet?url=" }[s] + u, "_blank", "noopener"); }
});
if ($("dt")) $("dt").onchange = function () { if (!this.value) return; var p = this.value.split("-"); state.date = new Date(+p[0], +p[1] - 1, +p[2]); build(); };
if ($("cl")) { var cl = $("cl"); Object.keys(CITIES).forEach(function (k) { var o = document.createElement("option"); o.value = k; cl.appendChild(o); }); }
if ($("city")) { $("city").onchange = $("city").oninput = function () { setCity(this.value); }; }
try { if (typeof LOCK_CITY === "undefined" || !LOCK_CITY) { var sv = localStorage.getItem("chg_city"); if (sv && CITIES[sv]) state.city = sv; } } catch (e) { }
if ($("city")) $("city").value = state.city;
if ($("dt")) $("dt").value = iso(state.date);
build();
setInterval(function () { if (!document.hidden) build(); }, 60000);
var hb = $("hamburger"), navl = $("navlinks");
if (hb && navl) {
  hb.onclick = function () { var o = navl.classList.toggle("open"); hb.setAttribute("aria-expanded", o); };
  Array.prototype.forEach.call(navl.querySelectorAll(".has-drop > a"), function (a) {
    a.addEventListener("click", function (e) {
      var li = a.parentElement;
      if (!li.classList.contains("open")) {
        e.preventDefault();
        Array.prototype.forEach.call(navl.querySelectorAll(".has-drop.open"), function (x) { if (x !== li) x.classList.remove("open"); });
        li.classList.add("open");
        a.setAttribute("aria-expanded", "true");
      }
    });
  });
  navl.addEventListener("click", function (e) {
    if (e.target.closest(".dropmenu a")) { navl.classList.remove("open"); Array.prototype.forEach.call(navl.querySelectorAll(".has-drop.open"), function (x) { x.classList.remove("open"); }); return; }
    if (!e.target.closest(".has-drop")) navl.classList.remove("open");
  });
}
