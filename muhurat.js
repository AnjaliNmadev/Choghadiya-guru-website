// Date-driven muhurat pages. Edit the DATA blocks (or add a new YEAR block) and re-run `node build.js`.
// Format: "[Wkd] Mon D time > [Wkd] Mon D time | Nakshatra" - times IST, 12h (7:57PM) or 24h. Weekday (if given) is verified at build.
const YEAR = 2026, REVIEWED = "2026-10-01", SRC = "mPanchang";
const MARRIAGE = `Wed Jan 14 7:57PM > Jan 15 3:02AM | Anuradha
Fri Jan 23 3:58PM > Jan 24 1:45AM | Uttara Bhadrapada
Sun Jan 25 7:21AM > Jan 25 1:34PM | Revati
Wed Jan 28 9:28AM > Jan 28 11:52PM | Rohini
Tue Feb 3 1:54AM > Feb 3 7:14AM | Magha
Fri Feb 6 12:24AM > Feb 6 11:35PM | Hasta
Mon Feb 9 12:09AM > Feb 9 5:00AM | Swati
Thu Feb 12 1:44PM > Feb 13 4:11PM | Moola
Thu Feb 19 8:53PM > Feb 20 2:37PM | Uttara Bhadrapada
Thu Feb 26 2:43AM > Feb 26 12:10PM | Mrigashirsha
Sun Mar 8 6:49AM > Mar 8 7:02AM | Swati
Mon Apr 20 4:37AM > Apr 20 7:27AM | Rohini
Tue Apr 21 4:17AM > Apr 21 6:00AM | Mrigashirsha
Sun Apr 26 5:58AM > Apr 26 8:26PM | Magha
Mon Apr 27 9:18PM > Apr 27 9:34PM | Uttara Phalguni
Wed Apr 29 5:54AM > Apr 29 7:51PM | Hasta
Sun May 3 7:11AM > May 3 10:26PM | Anuradha
Wed May 6 7:53AM > May 6 3:52PM | Moola
Wed May 13 5:46AM > May 14 11:20AM | Uttara Bhadrapada
Mon May 18 1:59AM > May 19 5:40AM | Rohini
Sat May 23 2:08AM > May 23 5:03AM | Magha
Mon May 25 4:33AM > May 26 5:37AM | Uttara Phalguni
Thu May 28 8:08AM > May 29 3:53AM | Swati
Mon Jun 1 7:08PM > Jun 2 5:37AM | Moola
Thu Jun 4 11:32PM > Jun 5 3:40AM | Uttara Ashadha
Wed Jun 10 5:38AM > Jun 10 1:51PM | Uttara Bhadrapada
Thu Jun 11 12:58AM > Jun 11 8:15AM | Revati
Fri Jun 19 10:08AM > Jun 19 5:01PM | Magha
Sun Jun 21 9:33AM > Jun 21 11:20AM | Uttara Phalguni
Wed Jun 24 1:59PM > Jun 25 7:06AM | Swati
Fri Jun 26 7:17PM > Jun 27 5:38AM | Anuradha
Tue Jul 7 1:43AM > Jul 7 5:41AM | Uttara Bhadrapada
Thu Jul 16 7:54PM > Jul 16 11:34PM | Magha
Fri Nov 20 6:58AM > Nov 20 7:01PM | Uttara Bhadrapada
Sat Nov 21 6:34AM > Nov 21 6:53AM | Uttara Bhadrapada
Wed Nov 25 4:52PM > Nov 26 5:46PM | Rohini
Wed Dec 2 10:54PM > Dec 3 10:53AM | Uttara Phalguni
Thu Dec 3 11:06PM > Dec 4 10:21AM | Hasta
Sat Dec 12 3:06AM > Dec 12 7:09AM | Uttara Ashadha`;
// Weekdays are intentionally omitted here: the source page printed 2025 weekdays against 2026 dates, so we compute them.
const NAMKARAN = `Jan 1 06:38 > Jan 2 20:02 | Rohini
Jan 4 15:13 > Jan 5 13:18 | Pushya
Jan 9 13:42 > Jan 10 06:35 | Hasta
Jan 14 06:38 > Jan 15 03:01 | Anuradha
Jan 18 10:16 > Jan 20 06:37 | Uttara Ashadha
Jan 21 06:39 > Jan 21 13:56 | Dhanishta
Jan 23 14:34 > Jan 24 06:34 | Uttara Bhadrapada
Jan 25 06:39 > Jan 26 12:31 | Revati
Jan 28 09:29 > Jan 30 05:24 | Rohini
Feb 1 06:38 > Feb 1 23:53 | Pushya
Feb 5 22:59 > Feb 7 00:18 | Hasta
Feb 11 06:38 > Feb 11 10:51 | Anuradha
Feb 15 06:37 > Feb 17 06:28 | Uttara Ashadha
Feb 19 20:51 > Feb 21 06:31 | Uttara Bhadrapada
Feb 22 06:34 > Feb 22 17:52 | Ashwini
Feb 25 06:32 > Feb 26 12:08 | Rohini
Mar 1 06:28 > Mar 1 08:32 | Pushya
Mar 5 08:19 > Mar 6 09:29 | Hasta
Mar 9 16:11 > Mar 10 06:21 | Anuradha
Mar 14 03:05 > Mar 14 06:18 | Uttara Ashadha
Mar 15 06:19 > Mar 17 06:13 | Shravana
Mar 19 05:23 > Mar 21 06:14 | Uttara Bhadrapada
Mar 23 20:49 > Mar 24 06:12 | Rohini
Mar 25 06:15 > Mar 25 17:31 | Mrigashirsha
Mar 27 15:26 > Mar 28 06:11 | Pushya
Apr 1 16:19 > Apr 2 17:33 | Hasta
Apr 6 00:09 > Apr 7 02:53 | Anuradha
Apr 10 11:29 > Apr 11 06:00 | Uttara Ashadha
Apr 12 06:01 > Apr 13 16:00 | Shravana
Apr 15 15:24 > Apr 18 05:54 | Uttara Bhadrapada
Apr 20 04:35 > Apr 21 05:53 | Rohini
Apr 24 00:02 > Apr 24 20:10 | Pushya
Apr 29 05:54 > Apr 30 00:12 | Hasta
May 3 07:11 > May 4 09:55 | Anuradha
May 7 18:47 > May 9 05:42 | Uttara Ashadha
May 10 05:48 > May 11 00:48 | Dhanishta
May 13 05:49 > May 15 20:14 | Uttara Bhadrapada
May 17 14:34 > May 19 05:42 | Rohini
May 22 00:02 > May 22 02:44 | Pushya
May 26 04:06 > May 26 05:44 | Hasta
May 27 05:47 > May 27 05:55 | Hasta
May 31 05:47 > May 31 16:11 | Anuradha
Jun 4 00:59 > Jun 6 05:42 | Uttara Ashadha
Jun 7 05:47 > Jun 7 07:53 | Dhanishta
Jun 10 05:47 > Jun 12 06:26 | Uttara Bhadrapada
Jun 14 05:48 > Jun 15 19:05 | Rohini
Jun 17 13:36 > Jun 18 13:31 | Pushya
Jun 22 10:24 > Jun 23 05:47 | Hasta
Jun 26 19:18 > Jun 27 05:44 | Anuradha
Jul 1 06:53 > Jul 4 05:48 | Uttara Ashadha
Jul 6 16:09 > Jul 7 05:48 | Uttara Bhadrapada
Jul 8 05:51 > Jul 9 14:56 | Revati
Jul 12 05:54 > Jul 13 05:38 | Rohini
Jul 15 05:55 > Jul 15 21:44 | Pushya
Jul 19 18:14 > Jul 20 19:05 | Hasta
Jul 24 01:44 > Jul 25 04:34 | Anuradha
Jul 29 05:59 > Jul 31 19:21 | Uttara Ashadha
Aug 2 21:37 > Aug 4 05:51 | Uttara Bhadrapada
Aug 5 05:58 > Aug 5 21:16 | Ashwini
Aug 7 18:45 > Aug 8 05:53 | Rohini
Aug 9 05:59 > Aug 9 14:41 | Mrigashirsha
Aug 12 05:59 > Aug 12 07:57 | Pushya
Aug 16 06:02 > Aug 17 03:48 | Hasta
Aug 20 09:08 > Aug 21 11:48 | Anuradha
Aug 24 20:28 > Aug 25 05:58 | Uttara Ashadha
Aug 26 06:01 > Aug 28 02:11 | Shravana
Aug 30 06:01 > Sep 1 06:01 | Uttara Bhadrapada
Sep 4 00:29 > Sep 5 06:01 | Rohini
Sep 7 18:16 > Sep 8 05:58 | Pushya
Sep 13 06:03 > Sep 13 13:04 | Hasta
Sep 16 17:24 > Sep 17 19:51 | Anuradha
Sep 21 04:36 > Sep 22 06:01 | Uttara Ashadha
Sep 23 06:03 > Sep 24 10:33 | Shravana
Sep 27 06:03 > Sep 29 06:01 | Uttara Bhadrapada
Oct 1 06:04 > Oct 3 02:52 | Rohini
Oct 5 00:15 > Oct 5 23:07 | Pushya
Oct 9 21:19 > Oct 10 06:01 | Hasta
Oct 14 06:04 > Oct 15 04:03 | Anuradha
Oct 18 12:48 > Oct 20 06:01 | Uttara Ashadha
Oct 21 06:05 > Oct 21 19:45 | Dhanishta
Oct 23 21:05 > Oct 24 06:02 | Uttara Bhadrapada
Oct 25 06:06 > Oct 26 17:41 | Revati
Oct 28 13:27 > Oct 30 09:03 | Rohini
Nov 1 06:08 > Nov 2 04:28 | Pushya
Nov 6 03:57 > Nov 7 04:40 | Hasta
Nov 11 06:09 > Nov 11 11:34 | Anuradha
Nov 15 06:11 > Nov 17 06:12 | Uttara Ashadha
Nov 20 06:58 > Nov 21 06:13 | Uttara Bhadrapada
Nov 22 06:15 > Nov 23 04:13 | Ashwini
Nov 25 06:17 > Nov 26 17:45 | Rohini
Nov 29 06:19 > Nov 29 10:57 | Pushya
Dec 3 09:24 > Dec 4 10:18 | Hasta
Dec 7 15:48 > Dec 8 06:20 | Anuradha
Dec 12 03:06 > Dec 12 06:23 | Uttara Ashadha
Dec 13 06:27 > Dec 15 06:20 | Shravana
Dec 17 15:34 > Dec 19 06:26 | Uttara Bhadrapada
Dec 20 06:29 > Dec 20 14:53 | Ashwini
Dec 23 06:32 > Dec 24 04:51 | Rohini
Dec 25 22:54 > Dec 26 06:30 | Pushya
Dec 30 15:38 > Dec 31 16:12 | Hasta`;
const VEHICLE = `Thu Jan 1 06:36AM > Jan 1 10:21PM | Rohini
Sun Jan 4 06:36AM > Jan 4 12:31PM | Punarvasu
Tue Jan 20 02:16AM > Jan 20 06:40AM | Shravana
Fri Jan 23 02:34PM > Jan 24 01:47AM | Uttara Bhadrapada
Sun Jan 25 06:41AM > Jan 25 11:11PM | Revati
Wed Jan 28 09:28AM > Jan 29 07:32AM | Rohini
Sat Jan 31 03:29AM > Jan 31 06:39AM | Punarvasu
Mon Feb 2 10:49PM > Feb 3 01:53AM | Magha
Thu Feb 19 08:53PM > Feb 20 02:39PM | Uttara Bhadrapada
Sun Feb 22 06:34AM > Feb 22 11:11AM | Ashwini
Fri Feb 27 10:48AM > Feb 28 06:29AM | Punarvasu
Wed Mar 4 07:38AM > Mar 4 04:50PM | Uttara Phalguni
Fri Mar 20 04:54AM > Mar 21 06:17AM | Revati
Fri Mar 27 10:09AM > Mar 27 03:25PM | Punarvasu
Sun Mar 29 02:39PM > Mar 30 02:49PM | Magha
Thu Apr 2 07:43AM > Apr 3 08:43AM | Hasta
Mon Apr 20 04:37AM > Apr 20 07:29AM | Rohini
Wed Apr 22 10:52PM > Apr 23 08:50PM | Punarvasu
Sun Apr 26 05:53AM > Apr 26 08:26PM | Magha
Mon Apr 27 09:18PM > Apr 28 05:52AM | Uttara Phalguni
Wed Apr 29 05:52AM > Apr 29 07:51PM | Hasta
Fri May 1 10:55PM > May 2 04:34AM | Swati
Sun May 17 09:43PM > May 18 11:30AM | Rohini
Wed May 20 11:09AM > May 21 04:11AM | Punarvasu
Sat May 23 02:08AM > May 23 05:03AM | Magha
Mon May 25 04:33AM > May 26 05:44AM | Uttara Phalguni
Wed May 27 05:47AM > May 29 09:50AM | Hasta
Sun May 31 02:16PM > May 31 04:10PM | Anuradha
Wed Jun 17 05:46AM > Jun 17 01:35PM | Punarvasu
Fri Jun 19 10:08AM > Jun 19 05:01PM | Magha
Sun Jun 21 09:33AM > Jun 21 03:20PM | Uttara Phalguni
Wed Jun 24 05:48AM > Jun 25 04:28PM | Chitra
Fri Jun 26 07:15PM > Jun 27 05:47AM | Anuradha
Wed Jul 1 06:51AM > Jul 1 07:37AM | Uttara Ashadha
Thu Jul 16 07:52PM > Jul 17 06:27AM | Magha
Mon Jul 20 03:32AM > Jul 21 04:02AM | Hasta
Fri Jul 24 01:42AM > Jul 25 04:35AM | Anuradha
Wed Jul 29 08:05PM > Jul 30 05:44PM | Shravana
Thu Aug 13 08:44PM > Aug 14 04:37AM | Magha
Sat Aug 15 03:40AM > Aug 15 06:01AM | Uttara Phalguni
Sun Aug 16 04:55PM > Aug 17 05:01PM | Hasta
Wed Aug 19 06:02AM > Aug 19 06:45AM | Swati
Mon Aug 24 08:20PM > Aug 25 06:03AM | Uttara Ashadha
Wed Aug 26 06:03AM > Aug 26 07:59AM | Shravana
Sun Sep 13 06:04AM > Sep 14 07:06AM | Hasta
Thu Sep 17 10:48AM > Sep 17 07:52PM | Anuradha
Mon Sep 21 04:36AM > Sep 22 06:00AM | Uttara Ashadha
Wed Sep 23 06:03AM > Sep 23 09:08AM | Shravana
Sun Sep 27 06:01AM > Sep 27 08:58PM | Uttara Bhadrapada
Sun Oct 11 09:33PM > Oct 12 11:51PM | Chitra
Thu Oct 15 01:13AM > Oct 15 04:02AM | Anuradha
Fri Oct 23 09:05PM > Oct 24 06:03AM | Uttara Bhadrapada
Mon Oct 26 09:43AM > Oct 26 05:40PM | Ashwini
Wed Nov 11 06:11AM > Nov 11 11:37AM | Anuradha
Mon Nov 16 02:03AM > Nov 17 02:15AM | Shravana
Fri Nov 20 06:58AM > Nov 21 06:12AM | Uttara Bhadrapada
Sun Nov 22 06:16AM > Nov 23 02:36AM | Ashwini
Wed Nov 25 06:17AM > Nov 25 04:51PM | Rohini
Sat Dec 12 03:06AM > Dec 12 06:24AM | Uttara Ashadha
Sun Dec 13 04:48PM > Dec 14 09:11AM | Shravana
Fri Dec 18 11:14PM > Dec 19 06:27AM | Revati
Sun Dec 20 06:31AM > Dec 20 02:54PM | Ashwini
Fri Dec 25 01:49AM > Dec 25 03:06AM | Punarvasu`;
const PROPERTY = `Jan 1 22:53 > Jan 2 07:13 | Mrigashirsha
Jan 2 07:17 > Jan 2 20:01 | Mrigashirsha
Jan 8 07:17 > Jan 8 12:21 | Purva Phalguni
Jan 15 05:52 > Jan 16 07:12 | Moola
Jan 16 07:18 > Jan 17 07:12 | Moola
Jan 22 14:32 > Jan 23 07:11 | Purva Bhadrapada
Jan 23 07:18 > Jan 23 14:32 | Purva Bhadrapada
Jan 29 07:36 > Jan 30 05:28 | Mrigashirsha
Jan 30 03:32 > Jan 31 07:09 | Punarvasu
Feb 12 13:47 > Feb 13 06:58 | Moola
Feb 13 07:06 > Feb 14 06:57 | Moola, Purva Ashadha
Feb 19 06:59 > Feb 19 20:52 | Purva Bhadrapada
Feb 20 20:12 > Feb 21 06:53 | Revati
Feb 26 06:53 > Feb 26 12:08 | Mrigashirsha
Feb 27 10:53 > Feb 28 06:44 | Punarvasu
Mar 12 06:39 > Mar 13 06:32 | Moola, Purva Ashadha
Mar 13 06:38 > Mar 14 03:02 | Purva Ashadha
Mar 19 04:07 > Mar 20 04:51 | Revati, Uttara Bhadrapada
Mar 20 06:27 > Mar 21 02:24 | Revati
Mar 26 16:24 > Mar 27 06:14 | Punarvasu
Mar 27 06:22 > Mar 27 15:23 | Punarvasu
Apr 9 06:07 > Apr 10 05:53 | Moola, Purva Ashadha
Apr 10 06:06 > Apr 10 11:25 | Purva Ashadha
Apr 16 14:04 > Apr 17 05:51 | Revati
Apr 17 05:59 > Apr 17 12:01 | Revati
Apr 23 05:53 > Apr 23 20:54 | Punarvasu
Apr 24 20:19 > Apr 25 05:43 | Ashlesha
May 1 04:37 > May 2 05:37 | Vishakha
May 7 05:39 > May 7 18:43 | Purva Ashadha
May 14 05:36 > May 14 22:31 | Revati
Jun 18 11:37 > Jun 19 05:22 | Ashlesha
Jun 19 05:28 > Jun 20 05:23 | Ashlesha, Magha
Jun 25 16:34 > Jun 26 05:22 | Vishakha
Jun 26 05:28 > Jun 27 05:24 | Vishakha, Anuradha
Jul 16 05:39 > Jul 17 05:31 | Ashlesha, Magha
Jul 17 05:39 > Jul 18 04:41 | Magha, Purva Phalguni
Jul 23 05:42 > Jul 24 05:35 | Vishakha, Anuradha
Jul 24 05:43 > Jul 25 04:33 | Anuradha
Aug 13 05:52 > Aug 14 04:35 | Magha
Aug 14 05:55 > Aug 15 03:41 | Purva Phalguni
Aug 20 05:58 > Aug 21 05:52 | Vishakha, Anuradha
Aug 21 05:58 > Aug 21 11:51 | Anuradha
Aug 28 03:18 > Aug 29 05:56 | Purva Bhadrapada
Sep 4 23:09 > Sep 5 05:58 | Mrigashirsha
Sep 10 06:08 > Sep 11 06:03 | Magha, Purva Phalguni
Sep 11 06:09 > Sep 11 13:13 | Purva Phalguni
Sep 17 06:12 > Sep 17 19:52 | Anuradha
Sep 18 22:49 > Sep 19 06:07 | Moola
Sep 25 11:27 > Sep 26 06:08 | Purva Bhadrapada
Oct 1 04:32 > Oct 2 06:13 | Mrigashirsha
Oct 2 06:19 > Oct 3 02:52 | Mrigashirsha
Oct 8 06:23 > Oct 8 21:19 | Purva Phalguni
Oct 16 06:53 > Oct 17 06:22 | Moola
Oct 22 20:54 > Oct 23 06:26 | Purva Bhadrapada
Oct 23 06:32 > Oct 23 21:01 | Purva Bhadrapada
Oct 29 11:16 > Oct 30 06:28 | Mrigashirsha
Oct 30 06:36 > Oct 30 09:03 | Mrigashirsha
Nov 12 14:24 > Nov 13 06:41 | Moola
Nov 13 06:47 > Nov 14 06:42 | Moola, Purva Ashadha
Nov 19 06:52 > Nov 20 06:47 | Purva Bhadrapada
Nov 20 06:53 > Nov 20 06:55 | Uttara Bhadrapada, Purva Bhadrapada
Nov 26 06:57 > Nov 26 17:46 | Mrigashirsha
Nov 27 15:13 > Nov 28 06:38 | Punarvasu
Dec 10 07:08 > Dec 11 07:01 | Moola, Purva Ashadha
Dec 11 07:09 > Dec 12 03:01 | Purva Ashadha
Dec 17 07:12 > Dec 17 15:29 | Purva Bhadrapada
Dec 18 16:13 > Dec 19 07:08 | Revati
Dec 24 01:52 > Dec 25 07:08 | Punarvasu
Dec 25 07:16 > Dec 25 22:49 | Punarvasu`;
const ABUJH = [["Jan 23", "Basant Panchami", "बसंत पंचमी"], ["Feb 19", "Fulera Dooj", "फुलेरा दूज"], ["Apr 19", "Akshaya Tritiya", "अक्षय तृतीया"], ["Apr 25", "Janaki Navami", "जानकी नवमी"], ["May 25", "Ganga Dashami", "गंगा दशमी"], ["Nov 20", "Devutthani Ekadashi", "देवउठनी एकादशी"]];

const MON = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "), WK = "Sun Mon Tue Wed Thu Fri Sat".split(" ");
const MON_HI = "जन॰ फ़र॰ मार्च अप्रै॰ मई जून जुला॰ अग॰ सित॰ अक्तू॰ नव॰ दिस॰".split(" "), WK_HI = "रवि सोम मंगल बुध गुरु शुक्र शनि".split(" ");
const MONTH_FULL = "January February March April May June July August September October November December".split(" ");
const MONTH_FULL_HI = "जनवरी फ़रवरी मार्च अप्रैल मई जून जुलाई अगस्त सितंबर अक्टूबर नवंबर दिसंबर".split(" ");
const t = (en, hi) => `<span class="t-en">${en}</span><span class="t-hi">${hi}</span>`;
const pad = n => String(n).padStart(2, "0");
function parseT(s) { const m = s.match(/(\d+):(\d+)\s?(AM|PM)?/); let h = +m[1]; if (m[3] === "PM" && h < 12) h += 12; if (m[3] === "AM" && h === 12) h = 0; return [h, +m[2]]; }
function parse(txt) {
  return txt.trim().split("\n").map(l => {
    const [a, b, nak] = l.split(/ > | \| /);
    const pt = (x) => { const m = x.trim().match(/^(?:(\w{3}) )?(\w{3}) (\d+) (.+)$/); const [h, mi] = parseT(m[4]); return { wk: m[1], d: new Date(Date.UTC(YEAR, MON.indexOf(m[2]), +m[3], h, mi)) }; };
    const s = pt(a), e = pt(b);
    if (s.wk && WK[s.d.getUTCDay()] !== s.wk) throw new Error("Weekday mismatch: " + l);
    if (!(e.d > s.d)) throw new Error("End before start: " + l);
    return { s: s.d, e: e.d, nak: nak.trim() };
  });
}
const tm = d => { let h = d.getUTCHours(), m = pad(d.getUTCMinutes()); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${m} ${ap}`; };
const dt = d => t(`${WK[d.getUTCDay()]}, ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`, `${WK_HI[d.getUTCDay()]}, ${d.getUTCDate()} ${MON_HI[d.getUTCMonth()]}`) + ` · ${tm(d)}`;
const iso = d => d.toISOString().slice(0, 16) + ":00+05:30";

module.exports = function ({ t, layout, write, faqSchema, citiesBlock, BRAND }) {
  const nowIST = new Date(Date.now() + 5.5 * 3600e3);
  const todayStr = nowIST.toISOString().slice(0, 10);
  const BEST = [1, 3, 4, 5]; // Mon, Wed, Thu, Fri
  const bestDays = r => { const out = []; for (let d = new Date(Date.UTC(r.s.getUTCFullYear(), r.s.getUTCMonth(), r.s.getUTCDate())); d <= r.e; d = new Date(d.getTime() + 864e5)) if (BEST.includes(d.getUTCDay())) out.push(`${WK[d.getUTCDay()]} ${d.getUTCDate()}`); return out.join(", ") || "—"; };
  let NOSTAR = false;
  const AD0 = Date.UTC(2026, 4, 17), AD1 = Date.UTC(2026, 5, 15, 23, 59), inAdhik = r => !(r.s > AD1 || r.e < AD0);
  const adhik = r => !r.__n && r.s < new Date(Date.UTC(YEAR, 5, 16)) && r.e >= new Date(Date.UTC(YEAR, 4, 17));
  const row = (r, withBest) => `<tr class="mrow" data-end="${iso(r.e)}"><td>${dt(r.s)}</td><td>${dt(r.e)}</td><td>${r.nak}${!withBest && !NOSTAR && inAdhik(r) ? " *" : ""}</td>${withBest ? `<td>${bestDays(r)}</td>` : ""}</tr>`;
  const head = withBest => `<thead><tr><th>${t("Starts", "शुरू")}</th><th>${t("Ends", "समाप्त")}</th><th>${t("Nakshatra", "नक्षत्र")}</th>${withBest ? `<th>${t("Best weekdays inside window", "विंडो में श्रेष्ठ वार")}</th>` : ""}</tr></thead>`;
  const monthBlocks = (rows, withBest) => {
    const by = {}; rows.forEach(r => (by[r.s.getUTCMonth()] ||= []).push(r));
    return Object.keys(by).map(m => `<h3>${t(MONTH_FULL[m] + " " + YEAR, MONTH_FULL_HI[m] + " " + YEAR)}</h3><div class="tbl"><table>${head(withBest)}<tbody>${by[m].map(r => row(r, withBest)).join("")}</tbody></table></div>`).join("\n");
  };
  const page = ({ urlPath, slug, title, description, h1, crumb, data, withBest, noStar, intro, extra, faqs, noteEn, noteHi, related }) => {
    NOSTAR = !!noStar;
    const rows = parse(data), up = rows.filter(r => iso(r.e).slice(0, 16) >= nowIST.toISOString().slice(0, 16)), past = rows.filter(r => !up.includes(r));
    const nxt = up[0];
    const banner = `<div class="sum" id="nextM"><b>${t("Next muhurat:", "अगला मुहूर्त:")}</b> ${nxt ? `${dt(nxt.s)} → ${dt(nxt.e)} · ${nxt.nak}` : t(`All ${YEAR} dates are over. The next year's list is added once its panchang tables are verified.`, `${YEAR} की सभी तिथियां बीत चुकी हैं। अगले साल की सूची पंचांग की जांच के बाद जोड़ी जाएगी।`)}</div>`;
    const script = `<script>(function(){var n=Date.now(),rs=[].slice.call(document.querySelectorAll("tr.mrow"));rs.forEach(function(r){if(new Date(r.dataset.end).getTime()<n)r.classList.add("past"),r.style.display="none"});document.querySelectorAll(".tbl").forEach(function(b){if(!b.querySelector("tr.mrow:not(.past)")){b.style.display="none";var h=b.previousElementSibling;if(h&&h.tagName=="H3")h.style.display="none"}});var f=document.querySelector("tr.mrow:not(.past)"),s=document.getElementById("nextM");if(f&&s){var c=f.cells;s.innerHTML="<b>"+${JSON.stringify(t("Next muhurat:", "अगला मुहूर्त:"))}+"</b> "+c[0].innerHTML+" → "+c[1].innerHTML+" · "+c[2].textContent}})()</script>`;
    write(urlPath, layout({
      urlPath, title, description, h1, crumbLabel: crumb,
      bodyHtml: `${intro}\n${banner}\n<p class="sub">${t(`Times are in IST. Last reviewed ${REVIEWED}; source tables: ${SRC}. This page is rebuilt daily so finished dates drop off automatically.`, `समय IST में हैं। अंतिम समीक्षा ${REVIEWED}; स्रोत तालिकाएं: ${SRC}। यह पेज रोज़ दोबारा बनता है, इसलिए बीत चुकी तारीख़ें अपने आप हट जाती हैं।`)}</p>\n${extra.before || ""}<h2>${t(`Upcoming ${YEAR} dates`, `${YEAR} की आगामी तिथियां`)}</h2>\n${up.length ? monthBlocks(up, withBest) : ""}\n<p>${t(noteEn, noteHi)}</p>\n${past.length ? `<details><summary>${t(`Earlier ${YEAR} dates (archive)`, `${YEAR} की बीती तिथियां (संग्रह)`)}</summary>${monthBlocks(past, withBest).replace(/class="mrow"/g, 'class="mrow-old"')}</details>` : ""}\n${extra.after}\n<h2 id="faq">${t("FAQs", "अक्सर पूछे जाने वाले सवाल")}</h2>\n${faqs.map(f => `<details><summary>${t(f[0], f[2])}</summary><p>${t(f[1], f[3])}</p></details>`).join("\n")}\n${citiesBlock}${script}`,
      extraJsonLd: [faqSchema(faqs.map(f => [f[0], f[1]]))], related
    }));
  };

  const abRows = ABUJH.filter(a => new Date(`${YEAR}-${pad(MON.indexOf(a[0].slice(0, 3)) + 1)}-${pad(+a[0].slice(4))}T23:59:00+05:30`) >= nowIST);
  const abujh = abRows.length ? `<h2>${t("Abujh muhurat (no pandit consultation needed)", "अबूझ मुहूर्त (पंडित से पूछे बिना शुभ)")}</h2><p>${t("Some days are traditionally treated as self-proven auspicious, so weddings are held without a separate muhurat search. Remaining in " + YEAR + ":", "कुछ दिन परंपरा से स्वयंसिद्ध शुभ माने जाते हैं, इसलिए अलग मुहूर्त देखे बिना विवाह होते हैं। " + YEAR + " में शेष:")}</p><ul>${abRows.map(a => `<li><b>${t(a[0], a[0])}</b> — ${t(a[1], a[2])}</li>`).join("")}</ul>` : "";

  page({
    urlPath: "/shubh-muhurat/marriage/", title: `Vivah Muhurat ${YEAR}: Shubh Marriage Dates & Timings | ${BRAND}`,
    description: `Upcoming Hindu marriage (vivah) muhurat dates for ${YEAR} with start/end times and nakshatra, abujh muhurat and how to choose a date. Auto-updated daily.`,
    h1: t(`Vivah Muhurat ${YEAR}`, `विवाह मुहूर्त ${YEAR}`), crumb: "Marriage Muhurat", data: MARRIAGE, withBest: false,
    intro: `<p>${t("A vivah muhurat is the window when the lunar mansion (nakshatra), tithi, yoga and karana all favour a wedding. These windows are far rarer than ordinary good days, which is why a handful of dates carry most weddings in a year.", "विवाह मुहूर्त वह समय है जब नक्षत्र, तिथि, योग और करण विवाह के अनुकूल हों। ऐसी अवधियां सामान्य शुभ दिनों से बहुत कम होती हैं, इसीलिए साल के कुछ ही दिनों में अधिकांश शादियां होती हैं।")}</p>`,
    noteEn: "* Falls in Adhik Jyeshtha (17 May to 15 June 2026), an extra lunar month many traditions avoid for weddings. Each window is when the nakshatra is favourable. Pick the actual pheras time inside it from a clean choghadiya or lagna, avoiding Rahu Kaal. Edges that fall near sunrise can shift by a few minutes between cities.",
    noteHi: "* अधिक ज्येष्ठ (17 मई से 15 जून 2026) में पड़ती है, जिस अतिरिक्त मास को कई परंपराएं विवाह के लिए टालती हैं। हर विंडो उस समय की है जब नक्षत्र अनुकूल है। फेरों का असली समय इसके भीतर किसी शुभ चौघड़िया या लग्न में, राहु काल से बचते हुए चुनें। सूर्योदय के आसपास के सिरे शहर के हिसाब से कुछ मिनट खिसक सकते हैं।",
    extra: {
      before: abujh,
      after: `<p>${t("* Dates marked with an asterisk fall in Adhik Jyeshtha (17 May – 15 June 2026), the extra lunar month. Many traditions avoid weddings in it, so check with your pandit.", "* तारे वाली तिथियां अधिक ज्येष्ठ (17 मई – 15 जून 2026) में पड़ती हैं, जो अधिक मास है। कई परंपराओं में इसमें विवाह नहीं होते, इसलिए पंडित से पूछ लें।")}</p><h2>${t("Why there are no dates from August to October", "अगस्त से अक्टूबर तक तिथियां क्यों नहीं हैं")}</h2><p>${t("Chaturmas, the four-month period when Vishnu is said to rest, runs from Devshayani Ekadashi in July until Devutthani Ekadashi on 20 November this year. Weddings are traditionally paused throughout, which is why the list reopens right on 20 November.", "चातुर्मास, यानी वह चार महीने जब विष्णु शयन माने जाते हैं, जुलाई की देवशयनी एकादशी से इस वर्ष 20 नवंबर की देवउठनी एकादशी तक चलता है। इस पूरे समय विवाह परंपरा से रुके रहते हैं, इसलिए सूची ठीक 20 नवंबर से फिर खुलती है।")}</p><h2>${t("How to pick the final date", "अंतिम तारीख़ कैसे चुनें")}</h2><p>${t("Match the couple's kundali first (guna milan and manglik check). Then choose a date from the list, confirm tithi and lagna with your pandit, and keep the pheras inside a clean choghadiya. Use the <a href=\"/choghadiya/\">choghadiya tool</a> and the <a href=\"/rahu-kaal/\">Rahu Kaal page</a> for your city.", "पहले वर-वधू की कुंडली मिलाएं (गुण मिलान और मांगलिक जांच)। फिर सूची से तारीख़ चुनें, पंडित से तिथि और लग्न पक्का करें और फेरे किसी शुभ चौघड़िया में रखें। अपने शहर के लिए <a href=\"/choghadiya/\">चौघड़िया टूल</a> और <a href=\"/rahu-kaal/\">राहु काल पेज</a> देखें।")}</p>`
    },
    faqs: [
      [`How many marriage muhurat dates are there in ${YEAR}?`, `Roughly 40 windows fall in ${YEAR}, concentrated in January–February, April–June and the period after 20 November. None fall in August–October because of Chaturmas.`, `${YEAR} में विवाह के कितने मुहूर्त हैं?`, `${YEAR} में लगभग 40 विंडो हैं, जो जनवरी–फ़रवरी, अप्रैल–जून और 20 नवंबर के बाद केंद्रित हैं। चातुर्मास के कारण अगस्त–अक्टूबर में कोई नहीं है।`],
      ["Is a muhurat window the same as the wedding time?", "No. The window shows when the nakshatra is favourable. The exact pheras time is picked inside it using lagna and choghadiya.", "क्या मुहूर्त विंडो ही विवाह का समय होती है?", "नहीं। विंडो बताती है कि नक्षत्र कब अनुकूल है। फेरों का सटीक समय उसके भीतर लग्न और चौघड़िया से चुना जाता है।"],
      ["Why can another site show different dates?", "Panchang schools and city sunrise differ, and some lists add or remove dates based on extra rules. Confirm the final date with your family pandit.", "दूसरी साइट पर अलग तारीख़ें क्यों दिखती हैं?", "पंचांग की परंपराएं और शहर का सूर्योदय अलग होते हैं, और कुछ सूचियां अतिरिक्त नियमों से तारीख़ें जोड़ती-घटाती हैं। अंतिम तारीख़ अपने पंडित से पक्की करें।"]
    ],
    related: [[ "/shubh-muhurat/namkaran/", "Namkaran Muhurat"], ["/choghadiya/", "Choghadiya Today"], ["/rahu-kaal/", "Rahu Kaal"]]
  });

  page({
    urlPath: "/shubh-muhurat/namkaran/", title: `Namkaran Muhurat ${YEAR}: Baby Naming Dates & Timings | ${BRAND}`,
    description: `Upcoming namkaran sanskar muhurat dates for ${YEAR} with timings, nakshatra and the best weekdays, plus rules for tithi and nakshatra. Auto-updated daily.`,
    h1: t(`Namkaran Muhurat ${YEAR}`, `नामकरण मुहूर्त ${YEAR}`), crumb: "Namkaran Muhurat", data: NAMKARAN, withBest: true,
    intro: `<p>${t("Namkaran is the sanskar in which a newborn is given a name, traditionally held within the first two weeks after birth. When it is delayed, families choose a favourable date from the list below.", "नामकरण वह संस्कार है जिसमें नवजात को नाम दिया जाता है, जो परंपरा से जन्म के पहले दो हफ़्तों में होता है। देर होने पर परिवार नीचे दी गई सूची से अनुकूल तारीख़ चुनते हैं।")}</p>`,
    noteEn: "The last column lists Monday, Wednesday, Thursday and Friday dates that fall inside each window, the weekdays usually preferred for naming. Windows that start at about sunrise begin with that city's sunrise.",
    noteHi: "आख़िरी कॉलम हर विंडो में पड़ने वाले सोमवार, बुधवार, गुरुवार और शुक्रवार दिखाता है, जो नामकरण के लिए आम तौर पर पसंद किए जाते हैं। जो विंडो सूर्योदय से शुरू होती हैं वे उस शहर के सूर्योदय से शुरू मानें।",
    extra: {
      before: "",
      after: `<h2>${t("Rules traditionally followed", "परंपरागत नियम")}</h2><ul><li>${t("<b>Tithi:</b> sources disagree. Some lists name Chaturthi, Navami and Chaturdashi as good, while classical muhurta texts treat these Rikta tithis as ones to avoid for auspicious rites. Ask your pandit which rule your family follows.", "<b>तिथि:</b> स्रोतों में मतभेद है। कुछ सूचियां चतुर्थी, नवमी और चतुर्दशी को शुभ बताती हैं, जबकि शास्त्रीय मुहूर्त ग्रंथ इन रिक्ता तिथियों को शुभ कार्य में वर्जित मानते हैं। अपने पंडित से पूछें कि आपका परिवार कौन-सा नियम मानता है।")}</li><li>${t("<b>Weekday:</b> Monday, Wednesday, Thursday and Friday.", "<b>वार:</b> सोमवार, बुधवार, गुरुवार और शुक्रवार।")}</li><li>${t("<b>Nakshatra:</b> Ashwini, Shatabhisha, Swati, Chitra, Revati, Hasta, Pushya, Rohini, Mrigashira, Anuradha, Uttara Ashadha, Uttara Phalguni, Uttara Bhadrapada and Shravana.", "<b>नक्षत्र:</b> अश्विनी, शतभिषा, स्वाति, चित्रा, रेवती, हस्त, पुष्य, रोहिणी, मृगशिरा, अनुराधा, उत्तराषाढ़ा, उत्तरफाल्गुनी, उत्तरभाद्रपद और श्रवण।")}</li></ul><p>${t("Once you choose a day, pick a clean slot from the <a href=\"/choghadiya/\">choghadiya tool</a> (Amrit, Shubh or Labh) and avoid Rahu Kaal. A pandit can also match the name's first letter to the baby's nakshatra pada.", "दिन चुनने के बाद <a href=\"/choghadiya/\">चौघड़िया टूल</a> से कोई शुभ स्लॉट (अमृत, शुभ या लाभ) लें और राहु काल से बचें। पंडित नाम का पहला अक्षर शिशु के नक्षत्र चरण से भी मिला सकते हैं।")}</p>`
    },
    faqs: [
      ["When is the namkaran ceremony usually held?", "Customs vary by family and region, but it is traditionally done in the first two weeks after birth. If that is missed, any date from the list can be used.", "नामकरण संस्कार आम तौर पर कब होता है?", "रीति परिवार और क्षेत्र के अनुसार बदलती है, पर परंपरा से यह जन्म के पहले दो हफ़्तों में होता है। चूक जाने पर सूची की किसी भी तारीख़ पर कर सकते हैं।"],
      ["Which weekdays are best for naming a baby?", "Monday, Wednesday, Thursday and Friday are traditionally preferred.", "नामकरण के लिए कौन-से वार श्रेष्ठ हैं?", "परंपरा से सोमवार, बुधवार, गुरुवार और शुक्रवार श्रेष्ठ माने जाते हैं।"],
      ["Do I need a muhurat for the naming ceremony?", "It is considered best, but the exact day also depends on your family tradition. Confirm with your pandit if unsure.", "क्या नामकरण के लिए मुहूर्त ज़रूरी है?", "मुहूर्त श्रेष्ठ माना जाता है, पर सही दिन आपकी पारिवारिक परंपरा पर भी निर्भर है। असमंजस हो तो पंडित से पूछें।"]
    ],
    related: [["/shubh-muhurat/marriage/", "Marriage Muhurat"], ["/choghadiya/", "Choghadiya Today"], ["/hora/", "Shubh Hora"]]
  });
  page({
    urlPath: "/shubh-muhurat/vehicle/", title: `Vehicle Purchase Muhurat ${YEAR}: Shubh Dates to Buy Car & Bike | ${BRAND}`,
    description: `Upcoming shubh muhurat dates to buy a car, bike or any new vehicle in ${YEAR}, with start/end times and nakshatra, plus the best nakshatra, weekdays and tithis. Auto-updated daily.`,
    h1: t(`Vehicle Purchase Muhurat ${YEAR}`, `वाहन ख़रीदने का मुहूर्त ${YEAR}`), crumb: "Vehicle Purchase Muhurat", data: VEHICLE, withBest: false, noStar: true,
    intro: `<p>${t("Many families wait for an auspicious window before bringing home a new car, bike, scooter, truck or tractor. The windows below are when the moon's nakshatra is favourable for buying or taking delivery of a vehicle.", "कई परिवार नई कार, बाइक, स्कूटर, ट्रक या ट्रैक्टर घर लाने से पहले शुभ समय का इंतज़ार करते हैं। नीचे दी गई विंडो वे हैं जब चंद्रमा का नक्षत्र वाहन ख़रीदने या डिलीवरी लेने के लिए अनुकूल होता है।")}</p>`,
    noteEn: "Each window is when the nakshatra is favourable. Pick the actual time of purchase or delivery inside it from a clean choghadiya (Amrit, Shubh or Labh) and avoid Rahu Kaal. Edges that fall near sunrise can shift by a few minutes between cities.",
    noteHi: "हर विंडो उस समय की है जब नक्षत्र अनुकूल है। ख़रीदारी या डिलीवरी का असली समय इसके भीतर किसी शुभ चौघड़िया (अमृत, शुभ या लाभ) में चुनें और राहु काल से बचें। सूर्योदय के आसपास के सिरे शहर के हिसाब से कुछ मिनट खिसक सकते हैं।",
    extra: {
      before: "",
      after: `<h2>${t("What makes a vehicle muhurat good", "वाहन मुहूर्त को शुभ क्या बनाता है")}</h2><ul><li>${t("<b>Nakshatra:</b> Swati, Punarvasu, Dhanishta and Shatabhisha are the most favoured for buying a vehicle. When none of these is available, the other nakshatras in the list above are used.", "<b>नक्षत्र:</b> वाहन ख़रीदने के लिए स्वाति, पुनर्वसु, धनिष्ठा और शतभिषा सबसे श्रेष्ठ माने जाते हैं। इनमें से कोई उपलब्ध न हो तो ऊपर की सूची के दूसरे नक्षत्र लिए जाते हैं।")}</li><li>${t("<b>Weekday:</b> Monday, Wednesday, Thursday, Friday and Sunday are generally preferred. Friday (Venus) is liked for cars, and Sunday for two-wheelers.", "<b>वार:</b> सोमवार, बुधवार, गुरुवार, शुक्रवार और रविवार आम तौर पर श्रेष्ठ माने जाते हैं। कार के लिए शुक्रवार (शुक्र) और दोपहिया के लिए रविवार पसंद किया जाता है।")}</li><li>${t("<b>Tithi:</b> Pratipada, Tritiya, Panchami, Shashthi, Dashami, Ekadashi, Trayodashi and Purnima are favourable. Avoid Amavasya (new moon).", "<b>तिथि:</b> प्रतिपदा, तृतीया, पंचमी, षष्ठी, दशमी, एकादशी, त्रयोदशी और पूर्णिमा अनुकूल हैं। अमावस्या से बचें।")}</li><li>${t("<b>Lagna:</b> movable signs (Aries, Cancer, Libra, Capricorn) and dual signs (Gemini, Sagittarius, Pisces) are preferred for the moment of purchase.", "<b>लग्न:</b> ख़रीदारी के क्षण के लिए चर राशियां (मेष, कर्क, तुला, मकर) और द्विस्वभाव राशियां (मिथुन, धनु, मीन) श्रेष्ठ मानी जाती हैं।")}</li><li>${t("<b>Moon:</b> it should not sit in the 6th, 8th or 12th house of the chart for the time chosen.", "<b>चंद्रमा:</b> चुने गए समय की कुंडली में चंद्रमा छठे, आठवें या बारहवें भाव में नहीं होना चाहिए।")}</li><li>${t("<b>Special days:</b> Akshaya Tritiya, Sarvartha Siddhi Yoga, Guru Pushya, Ravi Pushya and Amrit Siddhi Yoga are treated as good for almost any purchase.", "<b>विशेष दिन:</b> अक्षय तृतीया, सर्वार्थ सिद्धि योग, गुरु पुष्य, रवि पुष्य और अमृत सिद्धि योग लगभग हर ख़रीदारी के लिए शुभ माने जाते हैं।")}</li></ul><h2>${t("Rahu Kaal and the pooja", "राहु काल और पूजा")}</h2><p>${t("Even on a good day, avoid the Rahu Kaal slot for taking delivery. Check your city on the <a href=\"/rahu-kaal/\">Rahu Kaal page</a> and pick a clean slot from the <a href=\"/choghadiya/\">choghadiya tool</a>. After the purchase, many families do a small vehicle pooja before the first drive.", "डिलीवरी लेने के लिए अच्छे दिन में भी राहु काल के स्लॉट से बचें। अपने शहर के लिए <a href=\"/rahu-kaal/\">राहु काल पेज</a> देखें और <a href=\"/choghadiya/\">चौघड़िया टूल</a> से कोई साफ़ स्लॉट चुनें। ख़रीदारी के बाद कई परिवार पहली सवारी से पहले वाहन की छोटी पूजा करते हैं।")}</p>`
    },
    faqs: [
      ["Which nakshatra is best for buying a vehicle?", "Swati, Punarvasu, Dhanishta and Shatabhisha are the most favoured. If none is available, other nakshatras from the list can be used.", "वाहन ख़रीदने के लिए कौन-सा नक्षत्र श्रेष्ठ है?", "स्वाति, पुनर्वसु, धनिष्ठा और शतभिषा सबसे श्रेष्ठ माने जाते हैं। कोई उपलब्ध न हो तो सूची के दूसरे नक्षत्र लिए जा सकते हैं।"],
      ["Which day of the week is best to buy a car or bike?", "Monday, Wednesday, Thursday, Friday and Sunday are generally preferred. Friday is liked for cars and Sunday for two-wheelers.", "कार या बाइक ख़रीदने के लिए कौन-सा वार श्रेष्ठ है?", "सोमवार, बुधवार, गुरुवार, शुक्रवार और रविवार आम तौर पर श्रेष्ठ माने जाते हैं। कार के लिए शुक्रवार और दोपहिया के लिए रविवार पसंद किया जाता है।"],
      ["Is the muhurat for booking, payment or delivery?", "Most families use it for taking delivery or the first drive. If delivery falls on a different day, some also make the booking or payment inside a muhurat window. Follow your family custom.", "मुहूर्त बुकिंग, भुगतान या डिलीवरी में से किसके लिए देखें?", "ज़्यादातर परिवार इसे डिलीवरी या पहली सवारी के लिए देखते हैं। डिलीवरी किसी और दिन हो तो कुछ लोग बुकिंग या भुगतान भी मुहूर्त विंडो में करते हैं। अपने परिवार की रीति मानें।"],
      ["Can I buy a vehicle on Amavasya?", "Amavasya (new moon) is traditionally avoided for buying a vehicle.", "क्या अमावस्या पर वाहन ख़रीद सकते हैं?", "वाहन ख़रीदने के लिए अमावस्या परंपरा से टाली जाती है।"]
    ],
    related: [["/shubh-muhurat/property/", "Property Muhurat"], ["/choghadiya/", "Choghadiya Today"], ["/rahu-kaal/", "Rahu Kaal"]]
  });

  page({
    urlPath: "/shubh-muhurat/property/", title: `Property Purchase Muhurat ${YEAR}: Shubh Dates for Home, Plot & Registry | ${BRAND}`,
    description: `Upcoming shubh muhurat dates to buy or register a house, flat or plot in ${YEAR}, with start/end times and nakshatra, plus the favourable nakshatras and Vastu basics. Auto-updated daily.`,
    h1: t(`Property Purchase Muhurat ${YEAR}`, `संपत्ति ख़रीदने का मुहूर्त ${YEAR}`), crumb: "Property Purchase Muhurat", data: PROPERTY, withBest: false, noStar: true,
    intro: `<p>${t("Buying a house, flat or plot is one of the biggest steps in a family's life, so many people choose the date for booking, agreement or registration from a favourable muhurat. The windows below are Thursday and Friday periods when the nakshatra supports property dealings.", "घर, फ़्लैट या प्लॉट ख़रीदना परिवार के बड़े फ़ैसलों में से है, इसलिए कई लोग बुकिंग, एग्रीमेंट या रजिस्ट्री की तारीख़ अनुकूल मुहूर्त से चुनते हैं। नीचे दी गई विंडो गुरुवार और शुक्रवार की हैं, जब नक्षत्र संपत्ति के लेन-देन के अनुकूल होता है।")}</p>`,
    noteEn: "Each window is when the nakshatra is favourable. Registry offices work only in fixed hours, so use the part of a window that overlaps office time, and avoid Rahu Kaal while signing. Edges that fall near sunrise can shift by a few minutes between cities.",
    noteHi: "हर विंडो उस समय की है जब नक्षत्र अनुकूल है। रजिस्ट्री दफ़्तर तय समय पर ही खुलते हैं, इसलिए विंडो का वह हिस्सा लें जो दफ़्तर के समय से मिलता हो, और हस्ताक्षर के समय राहु काल से बचें। सूर्योदय के आसपास के सिरे शहर के हिसाब से कुछ मिनट खिसक सकते हैं।",
    extra: {
      before: "",
      after: `<h2>${t("What favours a property purchase", "संपत्ति ख़रीद के लिए क्या अनुकूल है")}</h2><ul><li>${t("<b>Nakshatra:</b> Rohini, Uttara Phalguni, Uttara Ashadha and Uttara Bhadrapada are the constellations traditionally linked with land, property and laying a foundation.", "<b>नक्षत्र:</b> रोहिणी, उत्तरफाल्गुनी, उत्तराषाढ़ा और उत्तरभाद्रपद परंपरा से भूमि, संपत्ति और नींव रखने से जुड़े नक्षत्र हैं।")}</li><li>${t("<b>Planets:</b> Mars (Mangal) rules land and property and the 4th house of the chart. Jupiter and Venus are benefics that help in owning a home.", "<b>ग्रह:</b> मंगल भूमि और संपत्ति तथा कुंडली के चौथे भाव का कारक है। गुरु और शुक्र शुभ ग्रह हैं जो घर के स्वामित्व में सहायक माने जाते हैं।")}</li></ul><h2>${t("Vastu basics", "वास्तु की बुनियादी बातें")}</h2><ul><li>${t("An east-facing entrance is generally preferred.", "पूर्वमुखी प्रवेश द्वार आम तौर पर श्रेष्ठ माना जाता है।")}</li><li>${t("Keep the north side open and unblocked; it is linked with prosperity.", "उत्तर दिशा को खुला रखें, उसे अवरुद्ध न करें; इसे समृद्धि से जोड़ा जाता है।")}</li><li>${t("At griha pravesh, place the kalash towards the east.", "गृह प्रवेश पर कलश पूर्व दिशा में रखें।")}</li></ul><p>${t("Pick a clean slot from the <a href=\"/choghadiya/\">choghadiya tool</a> and check your city on the <a href=\"/rahu-kaal/\">Rahu Kaal page</a> before signing.", "हस्ताक्षर से पहले <a href=\"/choghadiya/\">चौघड़िया टूल</a> से कोई साफ़ स्लॉट चुनें और <a href=\"/rahu-kaal/\">राहु काल पेज</a> पर अपना शहर देखें।")}</p>`
    },
    faqs: [
      ["Which nakshatra is favourable for buying property?", "Rohini, Uttara Phalguni, Uttara Ashadha and Uttara Bhadrapada are traditionally favoured for land, property and foundations.", "संपत्ति ख़रीदने के लिए कौन-सा नक्षत्र अनुकूल है?", "रोहिणी, उत्तरफाल्गुनी, उत्तराषाढ़ा और उत्तरभाद्रपद भूमि, संपत्ति और नींव के लिए परंपरा से अनुकूल माने जाते हैं।"],
      ["Which planet is linked with buying a home?", "Mars is the planet of land and property and rules the 4th house. Jupiter and Venus are benefics that support owning a home.", "घर ख़रीदने से कौन-सा ग्रह जुड़ा है?", "मंगल भूमि और संपत्ति का ग्रह है और चौथे भाव का कारक है। गुरु और शुक्र शुभ ग्रह हैं जो घर के स्वामित्व में सहायक हैं।"],
      ["Does the muhurat apply to booking or to registration?", "Families use it for the registration or the main agreement. Some also use it for the booking amount. Follow your family custom and your pandit's advice.", "मुहूर्त बुकिंग पर लागू होता है या रजिस्ट्री पर?", "परिवार इसे रजिस्ट्री या मुख्य एग्रीमेंट के लिए देखते हैं। कुछ लोग बुकिंग राशि के लिए भी देखते हैं। अपने परिवार की रीति और पंडित की सलाह मानें।"],
      ["Which direction should the house face?", "As per Vastu, an east-facing entrance is generally preferred, and the north side should not be blocked.", "घर का मुख किस दिशा में होना चाहिए?", "वास्तु के अनुसार पूर्वमुखी प्रवेश आम तौर पर श्रेष्ठ है और उत्तर दिशा अवरुद्ध नहीं होनी चाहिए।"]
    ],
    related: [["/shubh-muhurat/vehicle/", "Vehicle Muhurat"], ["/shubh-muhurat/marriage/", "Marriage Muhurat"], ["/choghadiya/", "Choghadiya Today"]]
  });
};
