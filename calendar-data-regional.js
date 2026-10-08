// 2026 festival data for the Malayalam, Tamil and Gujarati calendars (Delhi/IST page data as published by mPanchang).
// Other years are computed in calendar-regional.js. Format of the raw text: "<DD><Weekday><name>, <name>" under a month heading.
const parse = raw => {
  const M = Array.from({ length: 12 }, () => []);
  let mi = -1;
  const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  raw.trim().split("\n").forEach(line => {
    const h = line.match(/^Festival Holidays in (\w+) \d{4}/);
    if (h) { mi = MON.indexOf(h[1]); return; }
    const m = line.match(/^(\d{2})(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)(.+)$/);
    if (m && mi >= 0) M[mi].push([+m[1], m[3].split(",").map(x => x.trim()).filter(Boolean)]);
  });
  return M;
};
const MAL_RAW = `
Festival Holidays in January 2026
03SaturdayThiruvathira
14WednesdayMakaram Sankramam, Pongal, Makaravilakku
Festival Holidays in February 2026
01SundayThai Pooyam
13FridayKumbham Sankramam
15SundayShivarathri
17TuesdaySurya Grahan *Valayakara
Festival Holidays in March 2026
03TuesdayAttukal Pongal, Chandra Grahan *Purna
15SundayMeenam Sankramam
21SaturdayMatsyavathara Dinam
26ThursdayShree Rama Navami *Smarta
27FridayShree Rama Navami *ISKCON
Festival Holidays in April 2026
01WednesdayPainkuni Uthram
14TuesdayMetam Sankramam
15WednesdayVishu
19SundayParashurama Jayanthi, Akshaya Trithiya
21TuesdayShree Shankara Jayanthi
27MondayThrissur Pooram
30ThursdayNarasimha Jayanthi
Festival Holidays in May 2026
01FridayKurmavathara Dinam, Chitra Pournami
15FridayItavam Sankramam
Festival Holidays in June 2026
15MondayMithunam Sankramam
Festival Holidays in July 2026
16ThursdayKarkatakam Sankramam
29WednesdayGuru Poornima
Festival Holidays in August 2026
12WednesdaySurya Grahan *Purna
17MondayChingam Sankramam, Malayalam New Year
26WednesdayAvani Avittam, Onam
28FridayChandra Grahan *Anshika
Festival Holidays in September 2026
04FridayAshtami Rohini, Agastya Arghya
13SundayVaraha Jayanthi
14MondayKerala Vinayaka Chathurthi
15TuesdayRishi Panchami
17ThursdayVishwakarma Puja, Kanni Sankramam
23WednesdayVamana Jayanthi
Festival Holidays in October 2026
11SundayNavarathri
17SaturdayThulam Sankramam
19MondayDurgashtami
20TuesdayMaha Navami
21WednesdayVijayadashami, Vidyarambham Day
Festival Holidays in November 2026
08SundayDiwali
16MondayVrischikam Sankramam
17TuesdayMandalakala Begins
21SaturdayGuruvayur Ekadasi
24TuesdayKarthigai Deepam
Festival Holidays in December 2026
16WednesdayDhanu Sankramam
20SundayGeeta Dinam, Mukkoti Ekadasi
24ThursdayThiruvathira
27SundayMandalakala Pooja
`;
const TAM_RAW = `
Festival Holidays in January 2026
03SaturdayArudra Darshan
13TuesdayBhogi Pandigai
14WednesdayPongal
15ThursdayMattu Pongal
18SundayThai Amavasai
25SundayRatha Sapthami
Festival Holidays in February 2026
01SundayThai Pusam
15SundayShivaratri
Festival Holidays in March 2026
03TuesdayMasi Magam
14SaturdayKaradaiyan Nombu
19ThursdayUgadi - Telugu New Year
26ThursdayRama Navami *Smarta
27FridayRama Navami *ISKCON
Festival Holidays in April 2026
01WednesdayPanguni Uthiram
14TuesdayPuthandu
15WednesdayVishu
19SundayAkshaya Thiruthiyai
21TuesdaySankara Jayanthi
22WednesdayRamanuja Jayanthi
Festival Holidays in May 2026
01FridayChitra Pournami
04MondayAgni Nakshatram Begins
28ThursdayAgni Nakshatram Ends
30SaturdayVaikasi Visakam
Festival Holidays in August 2026
03MondayAadi Perukku
12WednesdayAadi Amavasai
14FridayAndal Jayanthi
17MondayGaruda Panjami
26WednesdayAvani Avittam *Rigveda, Onam
27ThursdayAvani Avittam *Yajurveda
28FridayVaralakshmi Vratam, Gayathri Japam
31MondayMaha Sangada Hara Chathurti
Festival Holidays in September 2026
01TuesdayGokulastami, Astami Rohini, Agastya Arghya
12SaturdayAvani Avittam *Samaveda
14MondayVinayagar Chathurthi
29TuesdayMaha Bharani
Festival Holidays in October 2026
07WednesdayMagha Shraddha
10SaturdayMahalaya Amavasai
11SundayNavarathiri
20TuesdayAyutha Poojai, Saraswati Poojai
21WednesdayVidyarambham
Festival Holidays in November 2026
08SundayLakshmi Puja, Kedara Gowri Vratham, Deepavali
15SundaySoora Samharam
24TuesdayKarthigai Deepam
Festival Holidays in December 2026
15TuesdaySubrahmanya Sashti
20SundayVaikuntha Ekadashi
24ThursdayArudra Darshan
`;
const GUJ_RAW = `
Festival Holidays in January 2026
06TuesdayLambodara Sankashta
10SaturdayKalashtami, Masik Krishna Janmashtami
14WednesdayMakara Sankranti, Uttarayana, Shattila Ekadashi
20TuesdayChandra Darshana
22ThursdayGauriganesha Chaturthi
23FridayVasant Panchami
26MondayMasik Durgashtami
29ThursdayJaya Ekadashi
Festival Holidays in February 2026
05ThursdayDwijapriya Sankashta
09MondayKalashtami, Masik Krishna Janmashtami
13FridayVijaya Ekadashi
15SundayMaha Shivaratri
17TuesdaySurya Grahan *Valayakara
18WednesdayChandra Darshana
21SaturdayDhundhiraja Chaturthi
24TuesdayMasik Durgashtami
27FridayAmalaki Ekadashi
Festival Holidays in March 2026
03TuesdayHoli, Holika Dahan, Chandra Grahan *Purna
04WednesdayDhuleti
06FridayBhalachandra Sankashta
11WednesdayKalashtami, Masik Krishna Janmashtami
15SundayPapamochani Ekadashi
19ThursdayGudi Padwa
20FridayChandra Darshana
22SundayVasudeva Chaturthi
26ThursdayRama Navami *Smarta, Masik Durgashtami
27FridayRama Navami *ISKCON
29SundayKamada Ekadashi
Festival Holidays in April 2026
02ThursdayHanuman Jayanti, Hanuman Janmotsava
05SundayVikata Sankashta
09ThursdayMasik Krishna Janmashtami
10FridayKalashtami
13MondayVaruthini Ekadashi
18SaturdayChandra Darshana
19SundayParashurama Jayanti, Akha Trij
20MondaySankarshana Chaturthi
23ThursdayGanga Saptami
24FridayMasik Durgashtami
25SaturdaySita Navami
27MondayMohini Ekadashi
30ThursdayNrisinha Jayanti
Festival Holidays in May 2026
01FridayKurma Jayanti
02SaturdayNarada Jayanti
05TuesdayEkadanta Sankashta
09SaturdayKalashtami, Masik Krishna Janmashtami
13WednesdayApara Ekadashi
16SaturdayShani Jayanti
17SundayAdhika Chandra Darshana
20WednesdayVarada Chaturthi
23SaturdayAdhika Masik Durgashtami
27WednesdayPadmini Ekadashi
Festival Holidays in June 2026
03WednesdayVibhuvana Sankashta
08MondayAdhika Kalashtami, Adhika Masik Durgashtami
11ThursdayParama Ekadashi
16TuesdayChandra Darshana
18ThursdayPradyumna Chaturthi
22MondayMasik Durgashtami
25ThursdayNirjala Ekadashi
Festival Holidays in July 2026
03FridayKrishnapingala Sankashta
07TuesdayKalashtami, Masik Krishna Janmashtami
10FridayYogini Ekadashi
11SaturdayGauna Yogini Ekadashi, Vaishnava Yogini Ekadashi
15WednesdayChandra Darshana
16ThursdayJagannath Rathyatra
17FridayAniruddha Chaturthi
21TuesdayMasik Durgashtami
25SaturdayGauri Vrat Begins, Devshayani Ekadashi
27MondayJayaparvati Vrat Begins
28TuesdayKokila Vrat
29WednesdayGuru Purnima, Gauri Vrat Ends
Festival Holidays in August 2026
01SaturdayJayaparvati Vrat Ends
02SundayGajanana Sankashta
05WednesdayKalashtami, Masik Krishna Janmashtami
09SundayKamika Ekadashi
12WednesdaySurya Grahan *Purna
14FridayChandra Darshana
16SundayDurva Ganapati Chaturthi
18TuesdayKalki Jayanti
20ThursdayMasik Durgashtami
23SundayPavitra Ekadashi
24MondayVaishnava Shravana Putrada Ekadashi
28FridayRaksha Bandhan, Chandra Grahan *Anshika
31MondayBol Choth, Heramba Sankashta
Festival Holidays in September 2026
01TuesdayNag Pancham
02WednesdayRandhan Chhath
03ThursdayShitala Satam
04FridayKrishna Janmashtami, Agastya Arghya, Kalashtami, Masik Krishna Janmashtami
07MondayBachha Baras Dwadashi, Aja Ekadashi
13SundayVaraha Jayanti, Chandra Darshana
14MondayKevda Trij, Ganesh Chaturthi, Siddhivinayaka Chaturthi
15TuesdayRishi Panchami
18FridayDharo Atham
19SaturdayRadha Ashtami, Masik Durgashtami
22TuesdayParsva Ekadashi
23WednesdayVamana Jayanti
25FridayGanesh Visarjan, Anant Chaturdashi
27SundayPitrupaksha Begins
29TuesdayVighnaraja Sankashta
Festival Holidays in October 2026
03SaturdayKalashtami, Masik Krishna Janmashtami
06TuesdayIndira Ekadashi
10SaturdaySarva Pitru Amavasya
11SundayNavratri Begins, Ghatasthapana
12MondayChandra Darshana
14WednesdayKapardisha Chaturthi
16FridaySaraswati Avahan
17SaturdaySaraswati Puja
18SundaySaraswati Balidan
19MondayDurga Ashtami, Maha Navami, Saraswati Visarjan, Masik Durgashtami
20TuesdayVijayadashami, Dussehra
22ThursdayPapankusha Ekadashi
25SundayKojagari Puja, Sharad Purnima
29ThursdayKarwa Chauth, Vakratunda Sankashta
Festival Holidays in November 2026
01SundayKalashtami, Masik Krishna Janmashtami
05ThursdayVagh Baras, Rama Ekadashi
06FridayDhanteras
07SaturdayKali Chaudas, Hanuman Puja
08SundayLakshmi Puja, Roop Chaudas, Diwali, Chopda Puja, Sharda Puja
10TuesdayGovardhan Puja, Annakut, Bestu Varsh
11WednesdayBhai Beej, Chandra Darshana, Yama Dwitiya
13FridayLabh Chaturthi
14SaturdayLabh Pancham
16MondayJalaram Bapa Jayanti
17TuesdayMasik Durgashtami
18WednesdayAkshaya Navami
20FridayDevutthana Ekadashi
21SaturdayTulasi Vivah, Gauna Devutthana Ekadashi, Vaishnava Devutthana Ekadashi
24TuesdayDev Diwali
27FridayGanadhipa Sankashta
Festival Holidays in December 2026
01TuesdayKalabhairav Jayanti, Kalashtami, Masik Krishna Janmashtami
04FridayUtpanna Ekadashi
10ThursdayChandra Darshana
13SundayKrichchhra Chaturthi
17ThursdayMasik Durgashtami
20SundayGita Jayanti, Mokshada Ekadashi
23WednesdayDattatreya Jayanti
26SaturdayAkhuratha Sankashta
30WednesdayKalashtami, Masik Krishna Janmashtami
`;

const BEN_RAW = `
Festival Holidays in January 2026
14WednesdayMakara Sankranti
15ThursdayMagh Bihu
23FridaySaraswati Puja
Festival Holidays in February 2026
13FridayKumbha Sankranti
15SundayMaha Shivaratri
17TuesdaySurya Grahan *Valayakara
Festival Holidays in March 2026
03TuesdayDol Purnima, Chandra Grahan *Purna
15SundayMeena Sankranti
26ThursdayRama Navami *Smarta
27FridayRama Navami *ISKCON
Festival Holidays in April 2026
14TuesdayMesha Sankranti, Solar New Year
15WednesdayPohela Boishakha
19SundayAkshaya Tritiya
Festival Holidays in May 2026
01FridayBuddha Purnima
09SaturdayBuddha Purnima
15FridayVrishabha Sankranti
25MondayGanga Puja
Festival Holidays in June 2026
15MondayMithuna Sankranti
20SaturdayJamai Shashti
Festival Holidays in July 2026
16ThursdayRatha Jatra, Karka Sankranti
29WednesdayGuru Purnima
Festival Holidays in August 2026
12WednesdaySurya Grahan *Purna
17MondaySimha Sankranti
28FridayRakhi Bandhan, Chandra Grahan *Anshika
Festival Holidays in September 2026
01TuesdayNag Panchami
04FridayKrishna Janmashtami, Agastya Arghya
14MondayGanesh Chaturthi
17ThursdayVishwakarma Puja, Kanya Sankranti
Festival Holidays in October 2026
10SaturdayMahalaya
16FridayKalparambha, Akal Bodhon
17SaturdayDurga Saptami, Tula Sankranti
19MondayDurga Ashtami
20TuesdayMaha Navami
21WednesdayVijayadashami
25SundayLakshmi Puja
Festival Holidays in November 2026
06FridayDhanteras
08SundayDipabali, Kali Puja
11WednesdayBhai Phonta
15SundayChhath Puja
16MondayVrishchika Sankranti
18WednesdayJagaddhatri Puja
Festival Holidays in December 2026
16WednesdayDhanu Sankranti
`;
const MALAYALAM = { 2026: parse(MAL_RAW) };
const TAMIL = { 2026: parse(TAM_RAW) };
const GUJARATI = { 2026: parse(GUJ_RAW) };
const BENGALI = { 2026: parse(BEN_RAW) };
module.exports = { MALAYALAM, TAMIL, GUJARATI, BENGALI };
