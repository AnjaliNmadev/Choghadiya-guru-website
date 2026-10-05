// Festival data for the /hindu-calendar/, /indian-holidays/ and /telugu-festivals/ pages (year 2026, Delhi/IST).
// Format: one array per calendar, 12 months (Jan..Dec); each month is lines of "day|name, name, name".
// Weekday is computed by code. To add another year, add a new key (e.g. 2027) with the same shape.
const L = s => s.trim().split("\n").map(l => { const i = l.indexOf("|"); return [+l.slice(0, i), l.slice(i + 1).split(",").map(x => x.trim()).filter(Boolean)]; });

const HINDU = { 2026: [
L(`1|Pradosh Vrat
3|Paush Purnima, Shakambhari Purnima
7|Sakat Chauth, Sankashti Chaturthi
14|Shattila Ekadashi
16|Pradosh Vrat
18|Darsha Amavasya, Magha Amavasya, Mauni Amavas
19|Gupta Navratri Begins, Chandra Darshan
23|Vasant Panchami
25|Ratha Saptami
26|Bhishma Ashtami
29|Jaya Ekadashi
31|Pradosh Vrat`),
L(`1|Magha Purnima, Guru Ravidas Jayanti
5|Sankashti Chaturthi
13|Vijaya Ekadashi
15|Maha Shivaratri, Pradosh Vrat
17|Darsha Amavasya, Phalguna Amavasya
18|Chandra Darshan
19|Phulera Dooj
27|Amalaki Ekadashi`),
L(`1|Pradosh Vrat
2|Chhoti Holi
3|Holika Dahan, Phalguna Purnima, Vasanta Purnima
5|Bhai Dooj, Bhratri Dwitiya
7|Sankashti Chaturthi
8|Ranga Panchami
10|Sheetala Saptami
11|Basoda, Sheetala Ashtami
15|Papmochani Ekadashi
17|Pradosh Vrat
19|Chaitra Amavasya, Darsha Amavasya
20|Chaitra Navratri, Gudi Padwa, Ugadi, Ghatasthapana, Shailputri Puja, Chandra Darshan, Sindhara Dooj, Brahmacharini Puja
21|Gangaur, Gauri Puja, Matsya Jayanti, Gauri Teej, Saubhagya Teej, Chandraghanta Puja
22|Kushmanda Puja, Varad Vinayaka Chauth
23|Lakshmi Panchami, Naag Puja, Skandamata Puja, Skanda Sashti
24|Yamuna Chhath, Katyayani Puja
25|Maha Saptami, Kalaratri Puja
26|Durga Ashtami, Mahagauri Puja, Annapurna Ashtami, Sandhi Puja
27|Rama Navami, Navratri Parana
29|Kamada Ekadashi
31|Pradosh Vrat`),
L(`2|Chaitra Purnima, Hanuman Jayanti
6|Sankashti Chaturthi
13|Vaishnava Varuthini Ekadashi, Varuthini Ekadashi
15|Pradosh Vrat
17|Darsha Amavasya, Vaishakha Amavasya
18|Chandra Darshan
20|Akshaya Tritiya, Parashurama Jayanti, Matangi Jayanti
21|Ramanujacharya Jayanti, Shankaracharya Jayanti, Surdas Jayanti
23|Ganga Saptami
24|Baglamukhi Jayanti
25|Sita Navami
27|Mohini Ekadashi
29|Pradosh Vrat
30|Narasimha Jayanti, Chhinnamasta Jayanti`),
L(`1|Buddha Purnima, Kurma Jayanti, Vaishakha Purnima
2|Narada Jayanti
5|Sankashti Chaturthi
6|Sankashti Chaturthi
13|Apara Ekadashi
15|Pradosh Vrat
16|Darsha Bhavuka Amavasya, Vaishakha Amavasya, Shani Jayanti, Vat Savitri Vrat
17|Chandra Darshan, Adhik Maas Begins
26|Padmini Ekadashi
27|Vaishnava Padmini Ekadashi
29|Pradosh Vrat
31|Adhik Purnima`),
L(`4|Sankashti Chaturthi
11|Parama Ekadashi
13|Pradosh Vrat
15|Adhik Amavasya, Darsha Amavasya
16|Chandra Darshan
24|Ganga Dussehra
25|Gayatri Jayanti, Nirjala Ekadashi
27|Pradosh Vrat
29|Jyeshtha Purnima, Vat Purnima Vrat`),
L(`4|Sankashti Chaturthi
11|Yogini Ekadashi
12|Pradosh Vrat
14|Ashadha Amavasya, Darsha Amavasya
15|Gupta Navratri Begins, Chandra Darshan
16|Jagannath Rathyatra
21|Sandhi Puja
25|Devshayani Ekadashi
27|Pradosh Vrat, Jayaparvati Vrat Begin
28|Kokila Vrat
29|Ashadha Purnima, Guru Purnima, Vyasa Puja`),
L(`1|Jayaparvati Vrat End
2|Sankashti Chaturthi
9|Vaishnava Kamika Ekadashi, Gauna Kamika Ekadashi, Kamika Ekadashi
11|Pradosh Vrat
12|Darsha Amavasya, Shravana Amavasya
13|Chandra Darshan
15|Hariyali Teej
17|Kalki Jayanti, Nag Panchami
23|Shravana Putrada Ekadashi
26|Pradosh Vrat
28|Rakhi, Raksha Bandhan, Shravana Purnima, Varalakshmi Vrat
31|Kajari Teej`),
L(`1|Sankashti Chaturthi, Bahula Chaturthi
3|Balarama Jayanti, Janmashtami Smarta
4|Janmashtami ISKCON, Jivitputrika Vrat
5|Dahi Handi
7|Aja Ekadashi
9|Pradosh Vrat
11|Bhadrapada Amavasya, Darsha Amavasya, Pithori Amavasya
12|Chandra Darshan
14|Hartalika Teej, Varaha Jayanti
15|Ganesh Chaturthi
16|Rishi Panchami
18|Lalita Saptami
19|Durva Ashtami, Mahalakshmi Vrat Begins, Radha Ashtami
22|Parsva Ekadashi
23|Vamana Jayanti
24|Pradosh Vrat
25|Anant Chaturdashi, Ganesh Visarjan
26|Bhadrapada Purnima, Purnima Shraddha, Pitrupaksha Begin
30|Sankashti Chaturthi`),
L(`3|Mahalakshmi Vrat Ends
6|Indira Ekadashi
8|Pradosh Vrat
10|Ashwin Amavasya, Sarva Pitru Amavasya, Sarvapitri Darsha Amavasya
11|Ghatasthapana, Navratri Begins, Shailputri Puja, Chandra Darshan
12|Brahmacharini Puja
13|Sindoor Tritiya, Chandraghanta Puja
14|Varad Vinayaka Chauth, Kushmanda Puja
15|Lalita Panchami, Upang Lalita Vrat, Skandamata Puja
16|Saraswati Avahan, Katyayani Puja, Bilva Nimantran, Kalparambha, Akal Bodhon, Amantran and Adhivas
17|Saraswati Puja, Kalaratri Puja, Navpatrika Puja, Kolabou Puja
18|Saraswati Puja, Kalaratri Puja, Navpatrika Puja, Kolabou Puja
19|Durga Ashtami, Mahagauri Puja, Sandhi Puja, Annapurna Ashtami, Kumari Puja
20|Maha Navami, Ayudha Puja, Navami Homa, Durga Balidan
21|Durga Visarjan, Dussehra, Saraswati Visarjan, Navratri Parana, Sindoor Utsav
22|Papankusha Ekadashi
24|Pradosh Vrat
26|Ashwin Purnima, Kojagara Puja, Sharad Purnima
28|Karwa Chauth
29|Sankashti Chaturthi`),
L(`2|Ahoi Ashtami, Radha Kunda Snan
5|Rama Ekadashi
6|Govatsa Dwadashi, Vasu Baras
7|Dhanteras, Pradosh Vrat, Dhantrayodashi, Dhanvantari Trayodashi, Yama Deepam
8|Kali Chaudas, Narak Chaturdashi, Hanuman Puja, Tamil Deepavali, Roop Chaudas, Choti Diwali
9|Darsha Amavasya, Diwali, Kartika Amavasya, Lakshmi Puja, Kedar Gauri Vrat, Chopda Puja, Sharda Puja, Bengal Kali Puja, Diwali Snan, Diwali Devpuja
10|Dyuta Krida, Gowardhan Puja, Annakut, Bali Pratipada, Gujrati New Year, Chandra Darshan
11|Bhaiya Dooj, Bhau Beej, Yama Dwitiya
14|Labh Panchami
15|Chhath Puja
17|Gopashtami
18|Akshaya Navami
19|Akshaya Navami
20|Kansa Vadh
21|Bhishma Panchak Begins, Devutthana Ekadashi, Tulsi Vivah
22|Pradosh Vrat, Vishweshwara Vrat
23|Dev Diwali, Manikarnika Snan, Vaikuntha Chaturdashi
24|Kartika Purnima
28|Sankashti Chaturthi
30|Kalabhairav Jayanti`),
L(`4|Utpanna Ekadashi
6|Pradosh Vrat
8|Darsha Amavasya, Margashirsha Amavasya
9|Chandra Darshan
10|Chandra Darshan
14|Vivah Panchami
15|Champa Shashthi
20|Gita Jayanti, Mokshada Ekadashi
22|Pradosh Vrat`)
] };

const HOLIDAYS = { 2026: [
L(`1|English New Year
2|Hazarat Ali's Birthday
9|Vivekananda Jayanti *Samvat
12|Swami Vivekananda Jayanti, National Youth Day
13|Lohri
14|Makara Sankranti, Pongal
23|Vasant Panchami, Subhas Chandra Bose Jayanti
26|Republic Day
30|Martyrs' Day`),
L(`1|Guru Ravidas Jayanti
4|World Cancer Day
12|Maharishi Dayanand Saraswati Jayanti
14|Valentine's Day
15|Maha Shivaratri
19|Ramakrishna Jayanti, Chhatrapati Shivaji Maharaj Jayanti`),
L(`3|Chhoti Holi, Holika Dahan, Chaitanya Mahaprabhu Jayanti
4|Holi
6|Chhatrapati Shivaji Maharaj Jayanti
8|International Women's Day
19|Ugadi, Gudi Padwa
20|Eid ul-Fitr (expected, depends on moon sighting)
23|Shaheed Diwas
26|Rama Navami *Smarta
27|Rama Navami *ISKCON
31|Mahavir Swami Jayanti`),
L(`1|Bank's Holiday
3|Good Friday
5|Easter
13|Vallabhacharya Jayanti
14|Solar New Year, Ambedkar Jayanti, Baisakhi
21|Shankaracharya Jayanti, Surdas Jayanti
22|Earth Day`),
L(`1|Labour Day
3|World Laughter Day
7|Rabindranath Tagore Jayanti
10|Mother's Day
27|Eid al-Adha, Bakrid
31|World No Tobacco Day`),
L(`5|World Environment Day
17|Islamic New Year (expected, depends on moon sighting)
21|International Yoga Day
26|Muharram / Ashura (expected, depends on moon sighting)
29|Kabirdas Jayanti`),
L(`16|Jagannath Rathyatra
29|Guru Purnima`),
L(`2|Friendship Day
15|Independence Day
19|Tulsidas Jayanti
26|Eid-e-Milad / Milad-un-Nabi (expected, depends on moon sighting)
28|Raksha Bandhan, Rakhi`),
L(`4|Krishna Janmashtami
5|Teachers' Day
14|Ganesh Chaturthi, Hindi Diwas
15|Engineers' Day
23|Autumnal Equinox`),
L(`2|Gandhi Jayanti
11|Maharaja Agrasen Jayanti
19|Durga Ashtami, Maha Navami
20|Dussehra
21|Madhvacharya Jayanti
26|Valmiki Jayanti, Meerabai Jayanti
29|Karwa Chauth`),
L(`8|Lakshmi Puja, Narak Chaturdashi, Diwali
10|Govardhan Puja
11|Bhaiya Dooj
14|Children's Day
15|Chhath Puja
24|Guru Nanak Jayanti`),
L(`1|World AIDS Day
22|Shortest Day of Year
23|Hazarat Ali's Birthday
25|Christmas`)
] };

const TELUGU = { 2026: [
L(`1|Guru Pradosh Vrat
6|Lambodara Sankashtahara
14|Shattila Ekadashi
16|Shukra Pradosh Vrat
29|Bhishma Dwadashi, Jaya Ekadashi
30|Shukra Pradosh Vrat`),
L(`5|Dwijapriya Sankashtahara
13|Vijaya Ekadashi
14|Shani Trayodashi, Shani Pradosh Vrat
15|Maha Shivaratri
27|Amalaki Ekadashi
28|Narasimha Dwadashi`),
L(`1|Ravi Pradosh Vrat
3|Chhoti Holi, Holika Dahan
4|Holi
6|Bhalachandra Sankashtahara
15|Papamochani Ekadashi
16|Soma Pradosh Vrat
19|Ugadi
21|Dola Gowri Vratam, Andolana Trutiya
26|Shree Ramanavami *Smarta
27|Shree Ramanavami *ISKCON
29|Vamana Dwadashi, Kamada Ekadashi
30|Soma Pradosh Vrat`),
L(`2|Madana Pournami
5|Vikata Sankashtahara
13|Varuthini Ekadashi
15|Budha Pradosh Vrat
19|Akshaya Trutiya
27|Mohini Ekadashi
28|Parashurama Dwadashi, Bhauma Pradosh Vrat`),
L(`5|Ekadanta Sankashtahara
12|Hanuman Jayanthi
13|Apara Ekadashi
14|Guru Pradosh Vrat
27|Adhika Ramalakshmana Dwadashi, Padmini Ekadashi
28|Guru Pradosh Vrat`),
L(`3|Vibhuvana Sankashtahara
11|Parama Ekadashi
12|Shukra Pradosh Vrat
25|Nirjala Ekadashi
26|Ramalakshmana Dwadashi
27|Shani Trayodashi, Shani Pradosh Vrat`),
L(`3|Krishnapingala Sankashtahara
10|Yogini Ekadashi
11|Gauna Yogini Ekadashi, Vaishnava Yogini Ekadashi
12|Ravi Pradosh Vrat
25|Vasudeva Dwadashi, Devshayani Ekadashi
26|Ravi Pradosh Vrat`),
L(`2|Gajanana Sankashtahara
9|Kamika Ekadashi
10|Soma Pradosh Vrat
23|Shravana Putrada Ekadashi
24|Damodara Dwadashi, Vaishnava Shravana Putrada Ekadashi
25|Bhauma Pradosh Vrat
27|Jandhyala Purnima
28|Varalakshmi Vratam, Raksha Bandhan
31|Heramba Sankashtahara`),
L(`4|Krishna Janmashtami, Agastya Arghya
7|Aja Ekadashi
8|Bhauma Pradosh Vrat
14|Ganesh Chaturthi
22|Kalki Dwadashi, Parivartani Ekadashi
24|Guru Pradosh Vrat
25|Ganesh Visarjan
29|Vighnaraja Sankashtahara`),
L(`6|Indira Ekadashi
8|Guru Pradosh Vrat
11|Navratri Begins
19|Durga Ashtami, Maha Navami
20|Dussehra
22|Padmanabha Dwadashi, Papankusha Ekadashi
23|Shukra Pradosh Vrat
28|Atla Tadde
29|Vakratunda Sankashtahara`),
L(`5|Rama Ekadashi
6|Shukra Pradosh Vrat
8|Lakshmi Puja, Diwali
13|Nagula Chavithi
20|Devutthana Ekadashi
21|Yogeshwara Dwadashi, Gauna Devutthana Ekadashi, Vaishnava Devutthana Ekadashi
22|Ravi Pradosh Vrat
27|Ganadhipa Sankashtahara`),
L(`4|Utpanna Ekadashi
6|Ravi Pradosh Vrat
14|Naga Panchami
20|Mokshada Ekadashi
21|Soma Pradosh Vrat
26|Akhuratha Sankashtahara`)
] };

module.exports = { HINDU, HOLIDAYS, TELUGU };
