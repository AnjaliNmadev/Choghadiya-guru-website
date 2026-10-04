/* Choghadiya Guru — Panchang engine (no dependencies; runs in browser and in Node build).
   Moon: Meeus ch.47 (truncated). Sun: Meeus ch.25. Sidereal: Lahiri. Times in IST. */
(function (root) {
  var RAD = Math.PI / 180, DEG = 180 / Math.PI, IST = 330, ZEN = 90.0;
  function mod(a, n) { return ((a % n) + n) % n; }
  function wrap(a) { a = mod(a, 360); return a > 180 ? a - 360 : a; }
  function jd0(y, m, d) { return Date.UTC(y, m - 1, d) / 864e5 + 2440587.5; }          // 0h UT of that date
  function jdIST(y, m, d, min) { return jd0(y, m, d) + (min - IST) / 1440; }          // IST minutes after midnight -> JD(UT)
  function dT(jd) { var yr = 2000 + (jd - 2451545) / 365.25, t = yr - 2000; return 62.92 + 0.32217 * t + 0.005589 * t * t; }
  function Tc(jd) { return (jd + dT(jd) / 86400 - 2451545) / 36525; }

  /* ---------- Sunrise / sunset (same NOAA routine the rest of the site uses) ---------- */
  function sun(y, m, d, lat, lon) {
    var base = jd0(y, m, d), t = base + (12 - lon / 15) / 24, out = null;
    for (var k = 0; k < 2; k++) {
      var T = (t - 2451545) / 36525;
      var L0 = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360;
      var M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
      var e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
      var C = Math.sin(M * RAD) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * RAD) * 0.000289;
      var om = 125.04 - 1934.136 * T, lam = L0 + C - 0.00569 - 0.00478 * Math.sin(om * RAD);
      var eps = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(om * RAD);
      var dec = Math.asin(Math.sin(eps * RAD) * Math.sin(lam * RAD));
      var yy = Math.pow(Math.tan(eps * RAD / 2), 2);
      var eq = 4 * DEG * (yy * Math.sin(2 * L0 * RAD) - 2 * e * Math.sin(M * RAD) + 4 * e * yy * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) - 0.5 * yy * yy * Math.sin(4 * L0 * RAD) - 1.25 * e * e * Math.sin(2 * M * RAD));
      var c = Math.cos(ZEN * RAD) / (Math.cos(lat * RAD) * Math.cos(dec)) - Math.tan(lat * RAD) * Math.tan(dec);
      c = Math.max(-1, Math.min(1, c));
      var ha = Math.acos(c) * DEG, noon = 720 - 4 * lon - eq;
      out = { r: noon - 4 * ha + IST, s: noon + 4 * ha + IST };
      t = base + (k === 0 ? noon : noon - 4 * ha) / 1440;
    }
    return out;
  }

  /* ---------- Sun & Moon longitudes ---------- */
  function sunLon(jd) {            // geometric+aberration, mean equinox of date (deg)
    var T = Tc(jd), L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T, M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * RAD) + (0.019993 - 0.000101 * T) * Math.sin(2 * M * RAD) + 0.000289 * Math.sin(3 * M * RAD);
    return mod(L0 + C - 0.00569, 360);
  }
  var MT = [ // D, M, M', F, sum_l (1e-6 deg)
    [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],
    [0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
    [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],
    [1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
    [2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487],
    [2,1,0,-2,-399],[0,0,2,-2,-381],[1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]];
  var BT = [ // D, M, M', F, sum_b
    [0,0,0,1,5128122],[0,0,1,1,280602],[0,0,1,-1,277693],[2,0,0,-1,173237],[2,0,-1,1,55413],[2,0,-1,-1,46271],[2,0,0,1,32573],[0,0,2,1,17198],[2,0,1,-1,9266],[0,0,2,-1,8822],
    [2,-1,0,-1,8216],[2,0,-2,-1,4324],[2,0,1,1,4200],[2,1,0,-1,-3359],[2,-1,-1,1,2463],[2,-1,0,1,2211],[2,-1,-1,-1,2065],[0,1,-1,-1,-1870],[4,0,-1,-1,1828],[0,1,0,1,-1794],
    [0,0,0,3,-1749],[0,1,-1,1,-1565],[1,0,0,1,-1491],[0,1,1,1,-1475],[0,1,1,-1,-1410],[0,1,0,-1,-1344],[1,0,0,-1,-1335],[0,0,3,1,1107]];
  var RT = [ // D, M, M', sum_r (1e-3 km)
    [0,0,1,-20905355],[2,0,-1,-3699111],[2,0,0,-2955968],[0,0,2,-569925],[0,1,0,48888],[2,0,-2,246158],[2,-1,-1,-152138],[2,0,1,-170733],[2,-1,0,-204586],[0,1,-1,-129620],[1,0,0,108743],[0,1,1,104755]];
  function moon(jd) {              // {lon, lat, dist} mean equinox of date
    var T = Tc(jd), T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    var Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
    var D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000) * RAD;
    var M = (357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000) * RAD;
    var Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000) * RAD;
    var F = (93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000) * RAD;
    var A1 = (119.75 + 131.849 * T) * RAD, A2 = (53.09 + 479264.290 * T) * RAD, A3 = (313.45 + 481266.484 * T) * RAD, E = 1 - 0.002516 * T - 0.0000074 * T2;
    var sl = 0, sb = 0, sr = 385000560, i, t, e, a;
    for (i = 0; i < MT.length; i++) { t = MT[i]; e = t[1] ? (Math.abs(t[1]) === 2 ? E * E : E) : 1; a = t[0] * D + t[1] * M + t[2] * Mp + t[3] * F; sl += t[4] * e * Math.sin(a); }
    for (i = 0; i < BT.length; i++) { t = BT[i]; e = t[1] ? (Math.abs(t[1]) === 2 ? E * E : E) : 1; a = t[0] * D + t[1] * M + t[2] * Mp + t[3] * F; sb += t[4] * e * Math.sin(a); }
    for (i = 0; i < RT.length; i++) { t = RT[i]; e = t[1] ? (Math.abs(t[1]) === 2 ? E * E : E) : 1; a = t[0] * D + t[1] * M + t[2] * Mp; sr += t[3] * e * Math.cos(a); }
    sl += 3958 * Math.sin(A1) + 1962 * Math.sin(Lp * RAD - F) + 318 * Math.sin(A2);
    sb += -2235 * Math.sin(Lp * RAD) + 382 * Math.sin(A3) + 175 * Math.sin(A1 - F) + 175 * Math.sin(A1 + F) + 127 * Math.sin(Lp * RAD - Mp) - 115 * Math.sin(Lp * RAD + Mp);
    return { lon: mod(Lp + sl / 1e6, 360), lat: sb / 1e6, dist: sr / 1000 };
  }
  function ayanamsa(jd) { return 23.83306 + 1.396971 * ((jd - 2451545) / 36525) + 0.000308 * Math.pow((jd - 2451545) / 36525, 2); }  // Lahiri (mean)

  /* ---------- Angles driving the panchang ---------- */
  function elong(jd) { return mod(moon(jd).lon - sunLon(jd), 360); }
  function moonSid(jd) { return mod(moon(jd).lon - ayanamsa(jd), 360); }
  function sunSid(jd) { return mod(sunLon(jd) - ayanamsa(jd), 360); }
  function yogaAng(jd) { return mod(moonSid(jd) + sunSid(jd), 360); }
  var ELEM = {                      // angle fn, size of one unit (deg), mean rate (deg/day)
    tithi: { f: elong, u: 12, r: 12.19 }, karana: { f: elong, u: 6, r: 12.19 },
    nak: { f: moonSid, u: 360 / 27, r: 13.176 }, yoga: { f: yogaAng, u: 360 / 27, r: 14.19 },
    rashi: { f: moonSid, u: 30, r: 13.176 }, srashi: { f: sunSid, u: 30, r: 0.9856 }
  };
  function cross(fn, target, t) { for (var i = 0; i < 12; i++) { var d = wrap(target - fn(t)), r = (fn === sunSid ? 0.9856 : 12.2); t += d / r; if (Math.abs(d) < 2e-6) break; } return t; }
  function crossE(el, target, t) { for (var i = 0; i < 14; i++) { var d = wrap(target - el.f(t)); t += d / el.r; if (Math.abs(d) < 2e-6) break; } return t; }
  function idx(el, jd) { return Math.floor(el.f(jd) / el.u + 1e-9); }
  function endOf(el, jd) { var k = idx(el, jd); return crossE(el, mod((k + 1) * el.u, 360), jd + (((k + 1) * el.u - el.f(jd) % 360 + 360) % 360 || el.u) / el.r * 1); }
  function endOf2(el, jd) { var k = idx(el, jd), tgt = mod((k + 1) * el.u, 360), left = mod(tgt - el.f(jd), 360); return crossE(el, tgt, jd + left / el.r); }
  function startOf(el, jd) { var k = idx(el, jd), tgt = mod(k * el.u, 360), back = mod(el.f(jd) - tgt, 360); return crossE(el, tgt, jd - back / el.r); }

  /* ---------- Lunar month (amanta), adhik detection ---------- */
  var nmCache = [];
  function newMoonBefore(jd) { var t = jd - elong(jd) / 12.19; t = cross(elong, 0, t); if (t > jd + 0.01) t = cross(elong, 0, t - 29.53); return t; }
  function monthInfo(jd) {
    for (var i = 0; i < nmCache.length; i++) if (jd >= nmCache[i].a && jd < nmCache[i].b) return nmCache[i];
    var a = newMoonBefore(jd), b = cross(elong, 0, a + 29.53);
    if (b <= a + 1) b = cross(elong, 0, a + 30);
    var r0 = Math.floor(sunSid(a) / 30), r1 = Math.floor(sunSid(b) / 30);
    var o = { a: a, b: b, idx: (r0 + 1) % 12, adhik: r0 === r1 };
    nmCache.push(o); if (nmCache.length > 60) nmCache.shift(); return o;
  }

  /* ---------- Moonrise / moonset for one civil date ---------- */
  function gmst(jd) { var T = (jd - 2451545) / 36525; return mod(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T, 360); }
  function moonAlt(jd, lat, lon) {
    var m = moon(jd), T = Tc(jd), eps = (23.439291 - 0.0130042 * T) * RAD, l = m.lon * RAD, b = m.lat * RAD;
    var ra = Math.atan2(Math.sin(l) * Math.cos(eps) - Math.tan(b) * Math.sin(eps), Math.cos(l)), dec = Math.asin(Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l));
    var H = (gmst(jd) + lon) * RAD - ra, la = lat * RAD;
    var alt = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H));
    var par = Math.asin(6378.14 / m.dist);
    var topo = alt - par * Math.cos(alt);
    var sd = Math.asin(1737.4 / m.dist);
    return (topo - 0 ) * DEG + (0.5667 + sd * DEG);  // >0 once upper limb is above horizon (incl. refraction)
  }
  function moonRiseSet(y, m, d, lat, lon, endMin) {
    var res = { rise: null, set: null }, step = 10, prev = moonAlt(jdIST(y, m, d, 0), lat, lon), mn;
    endMin = endMin || 1440;
    for (mn = step; mn <= endMin + step; mn += step) {
      var cur = moonAlt(jdIST(y, m, d, mn), lat, lon);
      if ((prev < 0) !== (cur < 0)) {
        var lo = mn - step, hi = mn, fl = prev, k;
        for (k = 0; k < 14; k++) { var mid = (lo + hi) / 2, fm = moonAlt(jdIST(y, m, d, mid), lat, lon); if ((fm < 0) === (fl < 0)) { lo = mid; fl = fm; } else hi = mid; }
        var t = (lo + hi) / 2;
        if (prev < 0) { if (res.rise === null) res.rise = t; } else { if (res.set === null) res.set = t; }
      }
      prev = cur;
    }
    return res;
  }

  /* ---------- Names / tables ---------- */
  var T = {
    wd: { hi: ["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"], en: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] },
    mon: { hi: ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"], en: ["January","February","March","April","May","June","July","August","September","October","November","December"] },
    tithi: { hi: ["प्रतिपदा","द्वितीया","तृतीया","चतुर्थी","पंचमी","षष्ठी","सप्तमी","अष्टमी","नवमी","दशमी","एकादशी","द्वादशी","त्रयोदशी","चतुर्दशी","पूर्णिमा","अमावस्या"], en: ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima","Amavasya"] },
    nak: { hi: ["अश्विनी","भरणी","कृत्तिका","रोहिणी","मृगशीर्षा","आर्द्रा","पुनर्वसु","पुष्य","आश्लेषा","मघा","पूर्व फाल्गुनी","उत्तर फाल्गुनी","हस्त","चित्रा","स्वाति","विशाखा","अनुराधा","ज्येष्ठा","मूल","पूर्वाषाढ़ा","उत्तराषाढ़ा","श्रवण","धनिष्ठा","शतभिषा","पूर्व भाद्रपद","उत्तर भाद्रपद","रेवती"], en: ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"] },
    yoga: { hi: ["विष्कम्भ","प्रीति","आयुष्मान","सौभाग्य","शोभन","अतिगण्ड","सुकर्मा","धृति","शूल","गण्ड","वृद्धि","ध्रुव","व्याघात","हर्षण","वज्र","सिद्धि","व्यतीपात","वरीयान","परिघ","शिव","सिद्ध","साध्य","शुभ","शुक्ल","ब्रह्मा","इन्द्र","वैधृति"], en: ["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyan","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"] },
    kar: { hi: ["बव","बालव","कौलव","तैतिल","गर","वणिज","विष्टि (भद्रा)","शकुनि","चतुष्पद","नाग","किंस्तुघ्न"], en: ["Bava","Balava","Kaulava","Taitila","Gara","Vanija","Vishti (Bhadra)","Shakuni","Chatushpada","Naga","Kimstughna"] },
    rashi: { hi: ["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुम्भ","मीन"], en: ["Mesha (Aries)","Vrishabha (Taurus)","Mithuna (Gemini)","Karka (Cancer)","Simha (Leo)","Kanya (Virgo)","Tula (Libra)","Vrishchika (Scorpio)","Dhanu (Sagittarius)","Makara (Capricorn)","Kumbha (Aquarius)","Meena (Pisces)"] },
    lm: { hi: ["चैत्र","वैशाख","ज्येष्ठ","आषाढ़","श्रावण","भाद्रपद","आश्विन","कार्तिक","मार्गशीर्ष","पौष","माघ","फाल्गुन"], en: ["Chaitra","Vaishakha","Jyeshtha","Ashadha","Shravana","Bhadrapada","Ashwin","Kartik","Margashirsha","Pausha","Magha","Phalguna"] },
    sam: { hi: "प्रभव विभव शुक्ल प्रमोद प्रजापति अंगिरा श्रीमुख भाव युवा धाता ईश्वर बहुधान्य प्रमाथी विक्रम वृष चित्रभानु सुभानु तारण पार्थिव व्यय सर्वजित सर्वधारी विरोधी विकृति खर नन्दन विजय जय मन्मथ दुर्मुख हेमलम्बी विलम्बी विकारी शार्वरी प्लव शुभकृत शोभकृत क्रोधी विश्वावसु पराभव प्लवंग कीलक सौम्य साधारण विरोधकृत परिधावी प्रमादी आनन्द राक्षस नल पिंगल कालयुक्त सिद्धार्थी रौद्र दुर्मति दुन्दुभि रुधिरोद्गारी रक्ताक्षी क्रोधन अक्षय".split(" "),
           en: "Prabhava Vibhava Shukla Pramoda Prajapati Angirasa Srimukha Bhava Yuva Dhata Ishvara Bahudhanya Pramathi Vikrama Vrisha Chitrabhanu Subhanu Tarana Parthiva Vyaya Sarvajit Sarvadhari Virodhi Vikriti Khara Nandana Vijaya Jaya Manmatha Durmukhi Hevilambi Vilambi Vikari Sharvari Plava Shubhakrit Shobhakrit Krodhi Vishvavasu Parabhava Plavanga Kilaka Saumya Sadharana Virodhikrit Paridhavi Pramadicha Ananda Rakshasa Nala Pingala Kalayukti Siddharthi Raudra Durmati Dundubhi Rudhirodgari Raktakshi Krodhana Akshaya".split(" ") }
  };
  var RAHU = [8, 2, 7, 5, 6, 4, 3], YAMA = [5, 4, 3, 2, 1, 7, 6], GULI = [7, 6, 5, 4, 3, 2, 1];
  var DURM = [[14], [9, 12], [4], [8], [6, 12], [4, 9], [1]];                       // daytime muhurta numbers (1-15) by weekday
  var VARJ = [50,24,30,40,14,11,30,20,32,30,20,18,22,20,14,14,10,14,56,24,20,10,10,18,16,24,30];   // Varjyam start (ghati elapsed in nakshatra)
  var AMRIT = [42,48,54,52,38,35,54,44,56,54,44,42,45,44,38,38,34,38,44,48,44,34,34,42,40,48,54];  // Amrit Kalam start (ghati elapsed)

  function karIdx(k) { if (k === 0) return 10; if (k >= 57) return 7 + (k - 57); return (k - 1) % 7; }
  function tithiLabel(n) { return { n: n, i: (n - 1) % 15, paksha: n <= 15 ? "S" : "K" }; }

  /* ---------- Daily panchang ---------- */
  function dayData(y, m, d, lat, lon) {
    var a = sun(y, m, d, lat, lon), nd = new Date(Date.UTC(y, m - 1, d + 1)), b = sun(nd.getUTCFullYear(), nd.getUTCMonth() + 1, nd.getUTCDate(), lat, lon);
    var wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    var sr = jdIST(y, m, d, a.r), nsr = jdIST(y, m, d, 1440 + b.r), base = jd0(y, m, d) - IST / 1440;       // base = local midnight (JD)
    var mins = function (jd) { return (jd - base) * 1440; };
    var out = { y: y, m: m, d: d, wd: wd, sunrise: a.r, sunset: a.s, nextSunrise: 1440 + b.r };
    function seq(el, mapName, maxN) {
      var list = [], t = sr, s = startOf(el, sr), k = 0;
      while (list.length < maxN) {
        var e = endOf2(el, t), i = idx(el, t + 1e-6);
        list.push({ i: mapName === "kar" ? i : i, s: mins(s), e: mins(e), cont: false });
        if (e >= nsr) break;
        t = e + 1e-5; s = e; if (++k > 5) break;
      }
      return list;
    }
    out.tithi = seq(ELEM.tithi, "tithi", 3).map(function (x) { x.n = x.i % 30 + 1; return x; });
    out.nak = seq(ELEM.nak, "nak", 3).map(function (x) { x.i %= 27; return x; });
    out.yoga = seq(ELEM.yoga, "yoga", 3).map(function (x) { x.i %= 27; return x; });
    out.kar = seq(ELEM.karana, "kar", 4).map(function (x) { x.k = x.i % 60; x.i = karIdx(x.k); return x; });
    var rs = seq(ELEM.rashi, "rashi", 2).map(function (x) { x.i %= 12; return x; }); out.moonRashi = rs;
    out.sunRashi = Math.floor(sunSid(sr) / 30) % 12;
    var mi = monthInfo(sr), tn = out.tithi[0].n;
    out.adhik = mi.adhik; out.amanta = mi.idx; out.purnimanta = (mi.idx + (tn > 15 ? 1 : 0)) % 12;
    out.paksha = tn <= 15 ? "S" : "K";
    /* samvat */
    var shaka = (mi.idx >= 9 && m <= 6) ? y - 79 : (mi.idx <= 8 ? y - 78 : y - 78);
    if (mi.idx >= 9 && m >= 10) shaka = y - 78;
    if (mi.idx >= 9 && m <= 6) shaka = y - 79;
    out.shaka = shaka; out.vikram = shaka + 135; out.samvatsara = (shaka + 11) % 60;
    /* moon rise/set (civil date) */
    var mr = moonRiseSet(y, m, d, lat, lon, 1440 + b.r); out.moonrise = mr.rise; out.moonset = mr.set;
    /* inauspicious / auspicious periods */
    var dl = (a.s - a.r) / 8, seg = function (tb) { var s = a.r + (tb[wd] - 1) * dl; return [s, s + dl]; };
    out.rahu = seg(RAHU); out.yama = seg(YAMA); out.gulika = seg(GULI);
    var mu = (a.s - a.r) / 15; out.abhijit = wd === 3 ? null : [a.r + 7 * mu, a.r + 8 * mu];
    out.durm = DURM[wd].map(function (n) { return [a.r + (n - 1) * mu, a.r + n * mu]; });
    /* varjyam / amrit kalam from every nakshatra overlapping sunrise-to-next-sunrise */
    var vj = [], am = [], t0 = sr - 1.2, guard = 0, t = t0;
    while (t < nsr && guard++ < 6) {
      var ni = idx(ELEM.nak, t + 1e-6), ns = startOf(ELEM.nak, t + 1e-6), ne = endOf2(ELEM.nak, t + 1e-6), du = ne - ns, ix = ni % 27;
      var vs = ns + VARJ[ix] / 60 * du, as = ns + AMRIT[ix] / 60 * du, ln = du * 4 / 60;
      var chk = function (s0, arr) { if (s0 + ln > sr && s0 < nsr) arr.push([mins(s0), mins(s0 + ln)]); };
      chk(vs, vj); chk(as, am);
      t = ne + 1e-5;
    }
    out.varjyam = vj; out.amrit = am;
    return out;
  }

  /* ---------- Festivals ---------- */
  // m = purnimanta month (0 Chaitra … 11 Phalguna), t = tithi 1..30, at = sr|md|pr|ni|mr|ss ; g = generic observance this festival replaces
  var FEST = [
    { id: "shivratri", hi: "महाशिवरात्रि", en: "Maha Shivratri", m: 11, t: 29, at: "ni", g: "shivratri", big: 1 },
    { id: "holika", hi: "होलिका दहन", en: "Holika Dahan", m: 11, t: 15, at: "pr", g: "purnima", big: 1 },
    { id: "ugadi", hi: "चैत्र नवरात्रि प्रारंभ / गुड़ी पड़वा / उगादि", en: "Chaitra Navratri begins / Gudi Padwa / Ugadi", m: 0, t: 1, at: "sr", big: 1 },
    { id: "mahavir", hi: "महावीर जयंती", en: "Mahavir Jayanti", m: 0, t: 13, at: "sr", g: "pradosh" },
    { id: "ramnavami", hi: "राम नवमी", en: "Ram Navami", m: 0, t: 9, at: "md", big: 1 },
    { id: "hanuman", hi: "हनुमान जयंती", en: "Hanuman Jayanti", m: 0, t: 15, at: "sr", g: "purnima", big: 1 },
    { id: "akshaya", hi: "अक्षय तृतीया", en: "Akshaya Tritiya", m: 1, t: 3, at: "md", big: 1 },
    { id: "buddha", hi: "बुद्ध पूर्णिमा", en: "Buddha Purnima", m: 1, t: 15, at: "sr", g: "purnima", big: 1 },
    { id: "vatsavitri", hi: "वट सावित्री व्रत (अमावस्या)", en: "Vat Savitri Vrat", m: 2, t: 30, at: "sr", g: "amavasya" },
    { id: "gangadussehra", hi: "गंगा दशहरा", en: "Ganga Dussehra", m: 2, t: 10, at: "sr" },
    { id: "rath", hi: "जगन्नाथ रथ यात्रा", en: "Jagannath Rath Yatra", m: 3, t: 2, at: "sr", big: 1 },
    { id: "guru", hi: "गुरु पूर्णिमा", en: "Guru Purnima", m: 3, t: 15, at: "sr", g: "purnima", big: 1 },
    { id: "hariyali", hi: "हरियाली तीज", en: "Hariyali Teej", m: 4, t: 3, at: "sr" },
    { id: "nagpanchami", hi: "नाग पंचमी", en: "Nag Panchami", m: 4, t: 5, at: "sr" },
    { id: "raksha", hi: "रक्षा बंधन", en: "Raksha Bandhan", m: 4, t: 15, at: "sr", g: "purnima", big: 1 },
    { id: "janmashtami", hi: "कृष्ण जन्माष्टमी", en: "Krishna Janmashtami", m: 5, t: 23, at: "ni", big: 1 },
    { id: "hartalika", hi: "हरतालिका तीज", en: "Hartalika Teej", m: 5, t: 3, at: "sr" },
    { id: "ganesh", hi: "गणेश चतुर्थी", en: "Ganesh Chaturthi", m: 5, t: 4, at: "md", g: "vinayaka", big: 1 },
    { id: "radha", hi: "राधा अष्टमी", en: "Radha Ashtami", m: 5, t: 8, at: "md" },
    { id: "anant", hi: "अनंत चतुर्दशी", en: "Anant Chaturdashi", m: 5, t: 14, at: "sr" },
    { id: "pitrustart", hi: "पितृ पक्ष प्रारंभ (पूर्णिमा श्राद्ध)", en: "Pitru Paksha begins", m: 5, t: 15, at: "sr", g: "purnima" },
    { id: "sarvapitri", hi: "सर्वपितृ अमावस्या", en: "Sarva Pitru Amavasya", m: 6, t: 30, at: "sr", g: "amavasya", big: 1 },
    { id: "sharadnav", hi: "शारदीय नवरात्रि प्रारंभ", en: "Sharad Navratri begins", m: 6, t: 1, at: "sr", big: 1 },
    { id: "durgashtami", hi: "दुर्गा अष्टमी", en: "Durga Ashtami", m: 6, t: 8, at: "sr", big: 1 },
    { id: "mahanavami", hi: "महा नवमी", en: "Maha Navami", m: 6, t: 9, at: "sr" },
    { id: "dussehra", hi: "विजयादशमी (दशहरा)", en: "Vijayadashami (Dussehra)", m: 6, t: 10, at: "sr", big: 1 },
    { id: "sharadpurnima", hi: "शरद पूर्णिमा", en: "Sharad Purnima", m: 6, t: 15, at: "sr", g: "purnima", big: 1 },
    { id: "karwa", hi: "करवा चौथ", en: "Karwa Chauth", m: 7, t: 19, at: "mr", big: 1 },
    { id: "ahoi", hi: "अहोई अष्टमी", en: "Ahoi Ashtami", m: 7, t: 23, at: "pr" },
    { id: "dhanteras", hi: "धनतेरस", en: "Dhanteras", m: 7, t: 28, at: "pr", g: "pradosh", big: 1 },
    { id: "narak", hi: "नरक चतुर्दशी (छोटी दिवाली)", en: "Narak Chaturdashi (Chhoti Diwali)", m: 7, t: 29, at: "sr", g: "shivratri", big: 1 },
    { id: "diwali", hi: "दीपावली (लक्ष्मी पूजा)", en: "Diwali (Lakshmi Puja)", m: 7, t: 30, at: "pr", g: "amavasya", big: 1 },
    { id: "govardhan", hi: "गोवर्धन पूजा", en: "Govardhan Puja", m: 7, t: 1, at: "sr", big: 1 },
    { id: "bhaidooj", hi: "भाई दूज", en: "Bhai Dooj", m: 7, t: 2, at: "sr", big: 1 },
    { id: "chhath", hi: "छठ पूजा", en: "Chhath Puja", m: 7, t: 6, at: "ss", big: 1 },
    { id: "tulsi", hi: "तुलसी विवाह", en: "Tulsi Vivah", m: 7, t: 12, at: "sr" },
    { id: "kartikpurnima", hi: "कार्तिक पूर्णिमा / देव दीपावली / गुरु नानक जयंती", en: "Kartik Purnima / Dev Deepawali / Guru Nanak Jayanti", m: 7, t: 15, at: "pr", g: "purnima", big: 1 },
    { id: "vivahpanchami", hi: "विवाह पंचमी", en: "Vivah Panchami", m: 8, t: 5, at: "sr" },
    { id: "datta", hi: "दत्तात्रेय जयंती", en: "Datta Jayanti", m: 8, t: 15, at: "pr", g: "purnima" },
    { id: "mauni", hi: "मौनी अमावस्या", en: "Mauni Amavasya", m: 10, t: 30, at: "sr", g: "amavasya", big: 1 },
    { id: "basant", hi: "बसंत पंचमी (सरस्वती पूजा)", en: "Basant Panchami (Saraswati Puja)", m: 10, t: 5, at: "md", big: 1 },
    { id: "phulera", hi: "फुलेरा दूज", en: "Phulera Dooj", m: 11, t: 2, at: "sr" },
    { id: "janaki", hi: "जानकी नवमी (सीता नवमी)", en: "Janaki Navami (Sita Navami)", m: 1, t: 9, at: "md" },
    { id: "rathsaptami", hi: "रथ सप्तमी", en: "Ratha Saptami", m: 10, t: 7, at: "sr" }
  ];
  var EKA = { // purnimanta month, paksha -> [hi, en]
    "0K": ["पापमोचनी एकादशी", "Papmochani Ekadashi"], "0S": ["कामदा एकादशी", "Kamada Ekadashi"], "1K": ["वरुथिनी एकादशी", "Varuthini Ekadashi"], "1S": ["मोहिनी एकादशी", "Mohini Ekadashi"],
    "2K": ["अपरा एकादशी", "Apara Ekadashi"], "2S": ["निर्जला एकादशी", "Nirjala Ekadashi"], "3K": ["योगिनी एकादशी", "Yogini Ekadashi"], "3S": ["देवशयनी एकादशी", "Devshayani Ekadashi"],
    "4K": ["कामिका एकादशी", "Kamika Ekadashi"], "4S": ["श्रावण पुत्रदा एकादशी", "Shravana Putrada Ekadashi"], "5K": ["अजा एकादशी", "Aja Ekadashi"], "5S": ["परिवर्तिनी एकादशी", "Parivartini Ekadashi"],
    "6K": ["इंदिरा एकादशी", "Indira Ekadashi"], "6S": ["पापांकुशा एकादशी", "Papankusha Ekadashi"], "7K": ["रमा एकादशी", "Rama Ekadashi"], "7S": ["देवउठनी एकादशी", "Devutthani Ekadashi"],
    "8K": ["उत्पन्ना एकादशी", "Utpanna Ekadashi"], "8S": ["मोक्षदा एकादशी (गीता जयंती)", "Mokshada Ekadashi (Gita Jayanti)"], "9K": ["सफला एकादशी", "Saphala Ekadashi"], "9S": ["पौष पुत्रदा एकादशी", "Pausha Putrada Ekadashi"],
    "10K": ["षटतिला एकादशी", "Shattila Ekadashi"], "10S": ["जया एकादशी", "Jaya Ekadashi"], "11K": ["विजया एकादशी", "Vijaya Ekadashi"], "11S": ["आमलकी एकादशी", "Amalaki Ekadashi"]
  };
  var NAVD = [["शैलपुत्री पूजा", "Shailputri Puja"], ["ब्रह्मचारिणी पूजा", "Brahmacharini Puja"], ["चंद्रघंटा पूजा", "Chandraghanta Puja"], ["कुष्मांडा पूजा", "Kushmanda Puja"], ["स्कंदमाता पूजा", "Skandamata Puja"], ["कात्यायनी पूजा", "Katyayani Puja"], ["कालरात्रि पूजा", "Kalaratri Puja"], ["महागौरी पूजा", "Mahagauri Puja"], ["सिद्धिदात्री पूजा", "Siddhidatri Puja"]];
  var CIVIL = [[1, 1, "नव वर्ष", "New Year's Day"], [1, 26, "गणतंत्र दिवस", "Republic Day"], [4, 14, "अम्बेडकर जयंती", "Ambedkar Jayanti"], [8, 15, "स्वतंत्रता दिवस", "Independence Day"], [10, 2, "गांधी जयंती", "Gandhi Jayanti"], [12, 25, "क्रिसमस", "Christmas"]];
  var SANK = [["मेष संक्रांति (बैसाखी)", "Mesha Sankranti (Baisakhi)"], ["वृषभ संक्रांति", "Vrishabha Sankranti"], ["मिथुन संक्रांति", "Mithuna Sankranti"], ["कर्क संक्रांति", "Karka Sankranti"], ["सिंह संक्रांति", "Simha Sankranti"], ["कन्या संक्रांति (विश्वकर्मा पूजा)", "Kanya Sankranti (Vishwakarma Puja)"], ["तुला संक्रांति", "Tula Sankranti"], ["वृश्चिक संक्रांति", "Vrishchika Sankranti"], ["धनु संक्रांति", "Dhanu Sankranti"], ["मकर संक्रांति / पोंगल / उत्तरायण", "Makar Sankranti / Pongal / Uttarayan"], ["कुम्भ संक्रांति", "Kumbha Sankranti"], ["मीन संक्रांति", "Meena Sankranti"]];

  function daysIn(y) { return ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) ? 366 : 365; }
  function festivals(y, lat, lon) {
    var N = daysIn(y), D = [], i, key = function (dt) { return dt.m + "-" + dt.d; };
    var cache = {};
    for (i = -1; i <= N + 1; i++) {
      var dt = new Date(Date.UTC(y, 0, 1 + i)), yy = dt.getUTCFullYear(), mm = dt.getUTCMonth() + 1, dd = dt.getUTCDate(), s = sun(yy, mm, dd, lat, lon);
      D.push({ y: yy, m: mm, d: dd, wd: dt.getUTCDay(), r: s.r, s: s.s, i: i });
    }
    var dayLen = function (x) { return x.s - x.r; };
    var atMin = function (x, at) { var nx = D[x.i + 2]; switch (at) { case "sr": return x.r + 1; case "md": return x.r + dayLen(x) / 2; case "pr": return x.s + 30; case "ss": return x.s - 1; case "ap": return x.r + dayLen(x) * 0.6; case "ni": return (x.s + nx.r + 1440) / 2; default: return x.r + 1; } };
    var tAt = function (x, min) { var jd = jdIST(x.y, x.m, x.d, min), n = Math.floor(elong(jd) / 12) + 1, mi = monthInfo(jd); return { n: n, pm: (mi.idx + (n > 15 ? 1 : 0)) % 12, adhik: mi.adhik, jd: jd }; };
    var memo = {}, get = function (x, at) { var k = x.i + at; return memo[k] || (memo[k] = tAt(x, atMin(x, at))); };
    var out = {}, add = function (x, o) { if (x.i < 0 || x.i >= N) return; var k = key(x); (out[k] = out[k] || []).push(o); };
    var has = function (x, g) { return (out[key(x)] || []).some(function (o) { return o.g === g; }); };
    var cyc = function (n, k) { return ((n - 1 + k + 30) % 30) + 1; };
    var mrise = function (x) { var r = moonRiseSet(x.y, x.m, x.d, lat, lon).rise; return r === null ? null : tAt(x, r); };
    function tithiDays(t, atFn, pmReq) {     // days where tithi t prevails at anchor; kshaya fallback
      var hits = [], j, v;
      for (j = 0; j <= N; j++) { var x = D[j + 1]; v = atFn(x); if (v && v.n === t && (pmReq === undefined || v.pm === pmReq)) { if (!(hits.length && hits[hits.length - 1].i === x.i - 1)) hits.push(x); } }
      if (!hits.length) for (j = 0; j <= N; j++) { var x2 = D[j + 1], a0 = get(x2, "sr"), a1 = get(D[x2.i + 2], "sr"); if (a0.n !== t && cyc(a0.n, 1) === t && cyc(a0.n, 2) === a1.n && (pmReq === undefined || a0.pm === pmReq || a1.pm === pmReq)) hits.push(x2); }
      return hits;
    }
    /* named festivals */
    FEST.forEach(function (f) {
      var hits = tithiDays(f.t, function (x) { var v = f.at === "mr" ? mrise(x) : get(x, f.at); return v; }, f.m).filter(function (x) {
        var v = f.at === "mr" ? mrise(x) : get(x, f.at); return !(v && v.adhik);
      });
      if (!hits.length && f.at !== "sr") hits = tithiDays(f.t, function (x) { return get(x, "sr"); }, f.m);
      hits = hits.filter(function (x) { return x.i >= 0 && x.i < N; });
      if (hits.length) { var x = hits[0];
        if (f.id === "holika" && karIdx(Math.floor(elong(get(x, "pr").jd) / 6)) === 6) x = D[x.i + 2];   /* Bhadra (Vishti) at pradosh -> next day */
        add(x, { id: f.id, hi: f.hi, en: f.en, g: f.g, big: f.big ? 1 : 0 });
        if (f.id === "holika") { var nx = D[x.i + 2]; add(nx, { id: "holi", hi: "होली (धुलेंडी)", en: "Holi (Dhulandi)", big: 1 }); }
        if (f.id === "janmashtami") { /* also fine */ } }
    });
    /* solar sankrantis */
    for (var r = 0; r < 12; r++) {
      var tgt = r * 30, g0 = jd0(y, 1, 1) + (r === 9 ? 5 : ((r + 3) % 12) * 30.4 + 50) , c;
      var guess = (function () { var yd = jd0(y, 1, 1); var best = null; for (var q = 0; q < 366; q += 10) { var jj = yd + q; if (Math.floor(sunSid(jj) / 30) === (r + 11) % 12 && Math.floor(sunSid(jj + 10) / 30) === r) { best = jj + 5; break; } } return best; })();
      if (guess === null) continue;
      c = cross(sunSid, tgt, guess);
      var mins = (c - jd0(y, 1, 1)) * 1440 + IST, dayN = Math.floor(mins / 1440), inm = mins - dayN * 1440, x = D[dayN + 1];
      if (!x) continue; if (inm > x.s) x = D[x.i + 2];
      add(x, { id: "sank" + r, hi: SANK[r][0], en: SANK[r][1], big: r === 9 ? 1 : 0, sank: 1 });
      if (r === 9) add(D[x.i], { id: "lohri", hi: "लोहड़ी", en: "Lohri", big: 1 }), (function () { var pv = D[x.i], prev = D[pv.i], dd2 = D[pv.i]; })();
    }
    /* fix Lohri: day before Makar Sankranti */
    Object.keys(out).forEach(function (k) { out[k] = out[k].filter(function (o) { return o.id !== "lohri"; }); if (!out[k].length) delete out[k]; });
    for (i = 0; i < N; i++) { var xx = D[i + 1]; if ((out[key(xx)] || []).some(function (o) { return o.id === "sank9"; })) add(D[xx.i], { id: "lohri", hi: "लोहड़ी", en: "Lohri", big: 1 }), void 0; }
    /* generic observances */
    for (i = 0; i < N; i++) {
      var x3 = D[i + 1], sr = get(x3, "sr"), pr = get(x3, "pr"), prevSr = get(D[x3.i], "sr"), nsr = get(D[x3.i + 2], "sr");
      var nm = sr.n, pmN = T.lm.hi[sr.pm], pmE = T.lm.en[sr.pm];
      var kshaya = function (t) { return sr.n !== t && cyc(sr.n, 1) === t && cyc(sr.n, 2) === nsr.n; };
      var first = function (t) { return (sr.n === t && prevSr.n !== t) || (sr.n === t && prevSr.n === t && false) || kshaya(t); };
      // Ekadashi
      [11, 26].forEach(function (t) { if (first(t) || (sr.n === t && prevSr.n === t && false)) { var ad = sr.adhik, pk = t === 11 ? "S" : "K", e = EKA[sr.pm + pk]; if (kshaya(t)) e = EKA[get(x3, "sr").pm + pk];
        var hi = ad ? (pk === "S" ? "पद्मिनी एकादशी" : "परमा एकादशी") : e[0], en = ad ? (pk === "S" ? "Padmini Ekadashi" : "Parama Ekadashi") : e[1];
        if (!has(x3, "ekadashi")) add(x3, { hi: hi, en: en, g: "ekadashi", big: 0 }); } });
      // Pradosh (tithi at pradosh)
      if ((((sr.n === 13 || sr.n === 28) && prevSr.n !== sr.n) || kshaya(13) || kshaya(28))) { if (!has(x3, "pradosh")) { var wdx = x3.wd, pn = { 1: ["सोम प्रदोष व्रत", "Som Pradosh Vrat"], 2: ["भौम प्रदोष व्रत", "Bhauma Pradosh Vrat"], 6: ["शनि प्रदोष व्रत", "Shani Pradosh Vrat"] }[wdx] || ["प्रदोष व्रत", "Pradosh Vrat"]; add(x3, { hi: pn[0], en: pn[1], g: "pradosh", big: 0 }); } }
      // Purnima / Amavasya
      if (first(15) && !has(x3, "purnima")) add(x3, { hi: T.lm.hi[sr.pm] + " पूर्णिमा", en: T.lm.en[sr.pm] + " Purnima", g: "purnima", big: 0 });
      if (first(30) && !has(x3, "amavasya")) add(x3, { hi: T.lm.hi[sr.pm] + " अमावस्या", en: T.lm.en[sr.pm] + " Amavasya", g: "amavasya", big: 0 });
      // Masik Shivratri
      if ((pr.n === 29) && !(get(D[x3.i], "pr").n === 29) && !has(x3, "shivratri")) add(x3, { hi: "मासिक शिवरात्रि", en: "Masik Shivratri", g: "shivratri", big: 0 });
      // Navratri daily pujas (Chaitra & Ashwin shukla 1-9)
      if ((sr.pm === 6 || sr.pm === 0) && !sr.adhik && sr.n >= 1 && sr.n <= 9 && !(prevSr.n === sr.n)) { var nv = NAVD[sr.n - 1]; add(x3, { hi: nv[0], en: nv[1], g: "navratri", big: 0 }); }
      // Bhanu Saptami
      if (x3.wd === 0 && (sr.n === 7 || sr.n === 22) && !has(x3, "bhanu")) add(x3, { hi: "भानु सप्तमी", en: "Bhanu Saptami", g: "bhanu", big: 0 });
      // Vinayaka Chaturthi (shukla 4, midday)
      var md = get(x3, "md"); if (md.n === 4 && get(D[x3.i], "md").n !== 4 && !has(x3, "vinayaka")) add(x3, { hi: "विनायक चतुर्थी", en: "Vinayaka Chaturthi", g: "vinayaka", big: 0 });
    }
    // Sankashti Chaturthi (krishna 4 at moonrise)
    for (i = 0; i < N; i++) { var x4 = D[i + 1], sr4 = get(x4, "sr"); if (sr4.n === 19 || sr4.n === 18 || sr4.n === 20) { var mq = mrise(x4); if (mq && mq.n === 19 && !has(x4, "sankashti")) { var pv = D[x4.i], pq = mrise(pv); if (!(pq && pq.n === 19)) { var an = { 2: ["अंगारकी संकष्टी चतुर्थी", "Angarki Sankashti Chaturthi"] }[x4.wd] || ["संकष्टी चतुर्थी", "Sankashti Chaturthi"]; add(x4, { hi: an[0], en: an[1], g: "sankashti", big: 0 }); } } } }
    // civil days
    CIVIL.forEach(function (c) { var x = D.filter(function (q) { return q.m === c[0] && q.d === c[1] && q.y === y; })[0]; if (x) add(x, { hi: c[2], en: c[3], civil: 1, big: 1 }); });
    return out;
  }



  /* ---------- Month-wise panchang grid (tithi at sunrise + tithis that begin before midnight) ---------- */
  function monthGrid(y, m, lat, lon) {
    var dim = new Date(Date.UTC(y, m, 0)).getUTCDate(), out = [], d;
    for (d = 1; d <= dim; d++) {
      var a = sun(y, m, d, lat, lon), nx = new Date(Date.UTC(y, m - 1, d + 1)), b = sun(nx.getUTCFullYear(), nx.getUTCMonth() + 1, nx.getUTCDate(), lat, lon);
      var sr = jdIST(y, m, d, a.r), nsr = jdIST(y, m, d, 1440 + b.r), n0 = Math.floor(elong(sr) / 12) + 1, n1 = Math.floor(elong(nsr) / 12) + 1, list = [n0], df = (n1 - n0 + 30) % 30, k;
      for (k = 1; k < df; k++) list.push((n0 - 1 + k) % 30 + 1);          // tithis that fall wholly between two sunrises (kshaya)
      var mi = monthInfo(sr);
      out.push({ d: d, wd: new Date(Date.UTC(y, m - 1, d)).getUTCDay(), tn: list, am: mi.idx, adhik: mi.adhik, pm: (mi.idx + (list[0] > 15 ? 1 : 0)) % 12, sam: 0 });
    }
    var sh = (out[0].am >= 9 && m <= 6) ? y - 79 : y - 78; if (out[0].am >= 9 && m >= 10) sh = y - 78;
    return { days: out, shaka: sh, samvatsara: (sh + 11) % 60 };
  }

  /* ---------- Calendar markup (used by the build for SEO and by the browser for re-rendering) ---------- */
  var WDH = ["सो", "मं", "बु", "गु", "शु", "श", "र"], WDE = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function monthHTML(y, m, fest) {
    var lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7, dim = new Date(Date.UTC(y, m, 0)).getUTCDate(), r, c, h, list = "", n = 0, d;
    h = '<div class="mc"><h3>' + T.mon.hi[m - 1] + " " + y + ' <small>' + T.mon.en[m - 1] + '</small></h3><table class="pcal"><thead><tr>';
    for (c = 0; c < 7; c++) h += '<th scope="col"><span class="hi">' + WDH[c] + '</span><span class="en">' + WDE[c] + "</span></th>";
    h += "</tr></thead><tbody>";
    for (r = 0; r < 6; r++) {
      h += "<tr>";
      for (c = 0; c < 7; c++) {
        var dn = r * 7 + c - lead + 1, dt = new Date(Date.UTC(y, m - 1, dn)), dm = dt.getUTCMonth() + 1, dd = dt.getUTCDate(), dy = dt.getUTCFullYear(), inM = dm === m;
        var fl = dy === y ? fest[dm + "-" + dd] : null, cls = (inM ? "" : "adj ") + (fl && fl.length ? "f" : (c >= 5 ? "w" : ""));
        var tip = fl && fl.length ? ' title="' + esc(fl.map(function (o) { return o.hi + " · " + o.en; }).join("; ")) + '"' : "";
        if (inM) h += '<td class="' + cls + '"><button type="button" data-d="' + y + "-" + pad2(m) + "-" + pad2(dd) + '"' + tip + ' aria-label="' + dd + " " + T.mon.en[m - 1] + " " + y + (fl && fl.length ? ": " + esc(fl.map(function (o) { return o.en; }).join(", ")) : "") + '">' + dd + "</button></td>";
        else h += '<td class="' + cls + '"' + tip + "><span>" + dd + "</span></td>";
      }
      h += "</tr>";
    }
    h += "</tbody></table>";
    for (d = 1; d <= dim; d++) (fest[m + "-" + d] || []).forEach(function (o) { n++; list += '<li><b>' + d + '</b> <span class="hi">' + esc(o.hi) + '</span><span class="en">' + esc(o.en) + "</span></li>"; });
    h += '<details class="mf"><summary><span class="hi">त्योहार</span><span class="en">Festivals &amp; vrats</span> (' + n + ")</summary><ul>" + list + "</ul></details></div>";
    return h;
  }
  function calendarHTML(y, fest) { var h = "", m; for (m = 1; m <= 12; m++) h += monthHTML(y, m, fest); return h; }

  /* ---------- tiny helpers shared with UI ---------- */
  function ago24(mins) { mins = Math.round(mins); var h = Math.floor(mins / 60), mm = mins - h * 60; return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; }

  var API = { dayData: dayData, festivals: festivals, calendarHTML: calendarHTML, monthGrid: monthGrid, monthHTML: monthHTML, T: T, fmt24: ago24, moonRiseSet: moonRiseSet, sun: sun, _int: { elong: elong, moon: moon, sunLon: sunLon, sunSid: sunSid, moonSid: moonSid, ayanamsa: ayanamsa, jdIST: jdIST, jd0: jd0, cross: cross, monthInfo: monthInfo } };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else root.Panchang = API;
})(typeof window !== "undefined" ? window : this);
