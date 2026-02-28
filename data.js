// ============================================================
// NETFLIX TV CLONE - DATA
// Replace image URLs with your own CDN or local assets
// ============================================================

const PROFILES = [
  {
    id: 1,
    name: "Alex",
    avatar: "https://i.pravatar.cc/200?img=3",
    color: "#2196F3",
    locked: false,
    pin: null,
    kids: false,
  },
  {
    id: 2,
    name: "Sam",
    avatar: "https://i.pravatar.cc/200?img=5",
    color: "#9C27B0",
    locked: true,
    pin: "1234",
    kids: false,
  },
  {
    id: 3,
    name: "Jordan",
    avatar: "https://i.pravatar.cc/200?img=8",
    color: "#FF9800",
    locked: false,
    pin: null,
    kids: false,
  },
  {
    id: 4,
    name: "Kids",
    avatar: "https://i.pravatar.cc/200?img=12",
    color: "#4CAF50",
    locked: false,
    pin: null,
    kids: true,
  },
];

// Hero content (shown at the top of browse)
const HERO_CONTENT = [
  {
    id: 100,
    title: "Stranger Things",
    description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    match: "98% Match",
    year: "2016",
    rating: "TV-14",
    seasons: "4 Seasons",
    bg: "https://picsum.photos/seed/strangerthings/1920/1080",
    thumb: "https://picsum.photos/seed/strangerthings-t/400/225",
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder"],
    genres: ["Sci-Fi", "Horror", "Drama"],
    type: "show",
  },
  {
    id: 101,
    title: "Squid Game",
    description: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits — with deadly high stakes.",
    match: "97% Match",
    year: "2021",
    rating: "TV-MA",
    seasons: "2 Seasons",
    bg: "https://picsum.photos/seed/squidgame/1920/1080",
    thumb: "https://picsum.photos/seed/squidgame-t/400/225",
    cast: ["Lee Jung-jae", "Park Hae-soo", "Wi Ha-jun"],
    genres: ["Thriller", "Drama", "Action"],
    type: "show",
  },
  {
    id: 102,
    title: "The Gray Man",
    description: "When the CIA's most skilled mercenary unwittingly uncovers dark agency secrets, he becomes the target of a worldwide manhunt.",
    match: "94% Match",
    year: "2022",
    rating: "PG-13",
    seasons: null,
    bg: "https://picsum.photos/seed/grayman/1920/1080",
    thumb: "https://picsum.photos/seed/grayman-t/400/225",
    cast: ["Ryan Gosling", "Chris Evans", "Ana de Armas"],
    genres: ["Action", "Thriller"],
    type: "movie",
  },
];

// Content rows
const CONTENT_ROWS = [
  {
    title: "Trending Now",
    items: [
      { id: 1, title: "Breaking Bad", thumb: "https://picsum.photos/seed/breaking/400/225", match: "99%", year: "2008", rating: "TV-MA", seasons: "5 Seasons", desc: "A high school chemistry teacher turned methamphetamine manufacturer.", cast: ["Bryan Cranston", "Aaron Paul"], genres: ["Crime", "Drama"], type: "show" },
      { id: 2, title: "The Crown", thumb: "https://picsum.photos/seed/crown/400/225", match: "95%", year: "2016", rating: "TV-MA", seasons: "6 Seasons", desc: "Follows the political rivalries and romance of Queen Elizabeth II's reign.", cast: ["Olivia Colman", "Tobias Menzies"], genres: ["Drama", "History"], type: "show" },
      { id: 3, title: "Ozark", thumb: "https://picsum.photos/seed/ozark/400/225", match: "96%", year: "2017", rating: "TV-MA", seasons: "4 Seasons", desc: "A financial advisor drags his family from Chicago to the Missouri Ozarks.", cast: ["Jason Bateman", "Laura Linney"], genres: ["Crime", "Drama"], type: "show" },
      { id: 4, title: "Wednesday", thumb: "https://picsum.photos/seed/wednesday/400/225", match: "94%", year: "2022", rating: "TV-14", seasons: "1 Season", desc: "Wednesday Addams investigates murders in her new school.", cast: ["Jenna Ortega", "Catherine Zeta-Jones"], genres: ["Comedy", "Horror"], type: "show" },
      { id: 5, title: "Bridgerton", thumb: "https://picsum.photos/seed/bridgerton/400/225", match: "91%", year: "2020", rating: "TV-MA", seasons: "3 Seasons", desc: "The Bridgerton siblings navigate love and society in Regency-era England.", cast: ["Phoebe Dynevor", "Regé-Jean Page"], genres: ["Drama", "Romance"], type: "show" },
      { id: 6, title: "Dark", thumb: "https://picsum.photos/seed/dark-nf/400/225", match: "97%", year: "2017", rating: "TV-MA", seasons: "3 Seasons", desc: "A family saga with a supernatural twist set in a German town.", cast: ["Louis Hofmann", "Oliver Masucci"], genres: ["Sci-Fi", "Thriller"], type: "show" },
      { id: 7, title: "Narcos", thumb: "https://picsum.photos/seed/narcos/400/225", match: "96%", year: "2015", rating: "TV-MA", seasons: "3 Seasons", desc: "A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar.", cast: ["Wagner Moura", "Boyd Holbrook"], genres: ["Crime", "Drama"], type: "show" },
    ]
  },
  {
    title: "Continue Watching for Alex",
    items: [
      { id: 10, title: "Peaky Blinders", thumb: "https://picsum.photos/seed/peaky/400/225", match: "98%", year: "2013", rating: "TV-MA", seasons: "6 Seasons", desc: "A gangster family epic set in 1919 Birmingham.", cast: ["Cillian Murphy", "Tom Hardy"], genres: ["Crime", "Drama"], type: "show" },
      { id: 11, title: "Mindhunter", thumb: "https://picsum.photos/seed/mindhunter/400/225", match: "97%", year: "2017", rating: "TV-MA", seasons: "2 Seasons", desc: "FBI agents study serial killers to solve ongoing cases.", cast: ["Jonathan Groff", "Holt McCallany"], genres: ["Crime", "Thriller"], type: "show" },
      { id: 12, title: "Lupin", thumb: "https://picsum.photos/seed/lupin/400/225", match: "93%", year: "2021", rating: "TV-MA", seasons: "3 Parts", desc: "Inspired by the adventures of Arsène Lupin, a master thief seeks revenge.", cast: ["Omar Sy", "Ludivine Sagnier"], genres: ["Crime", "Mystery"], type: "show" },
      { id: 13, title: "The Witcher", thumb: "https://picsum.photos/seed/witcher/400/225", match: "88%", year: "2019", rating: "TV-MA", seasons: "3 Seasons", desc: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world.", cast: ["Henry Cavill", "Anya Chalotra"], genres: ["Fantasy", "Action"], type: "show" },
      { id: 14, title: "Cobra Kai", thumb: "https://picsum.photos/seed/cobrakai/400/225", match: "90%", year: "2018", rating: "TV-14", seasons: "5 Seasons", desc: "Decades after their 1984 All Valley Karate Tournament, the rivalry reignites.", cast: ["Ralph Macchio", "William Zabka"], genres: ["Drama", "Martial Arts"], type: "show" },
    ]
  },
  {
    title: "Top 10 in the U.S. Today",
    items: [
      { id: 20, title: "Money Heist", thumb: "https://picsum.photos/seed/moneyheist/400/225", match: "97%", year: "2017", rating: "TV-MA", seasons: "5 Parts", desc: "A criminal mastermind who goes by 'The Professor' plans the perfect heist.", cast: ["Álvaro Morte", "Úrsula Corberó"], genres: ["Crime", "Action"], type: "show" },
      { id: 21, title: "Emily in Paris", thumb: "https://picsum.photos/seed/emily/400/225", match: "82%", year: "2020", rating: "TV-MA", seasons: "4 Seasons", desc: "An American marketer moves to Paris for an unexpected job opportunity.", cast: ["Lily Collins", "Philippine Leroy-Beaulieu"], genres: ["Comedy", "Romance"], type: "show" },
      { id: 22, title: "Never Have I Ever", thumb: "https://picsum.photos/seed/neverhaveiever/400/225", match: "93%", year: "2020", rating: "TV-14", seasons: "4 Seasons", desc: "A coming-of-age story about a first-generation Indian-American teen.", cast: ["Maitreyi Ramakrishnan", "Poorna Jagannathan"], genres: ["Comedy", "Romance"], type: "show" },
      { id: 23, title: "Glass Onion", thumb: "https://picsum.photos/seed/glassonion/400/225", match: "94%", year: "2022", rating: "PG-13", seasons: null, desc: "Benoit Blanc travels to Greece to peel back the layers of a mystery.", cast: ["Daniel Craig", "Edward Norton", "Kate Hudson"], genres: ["Mystery", "Comedy"], type: "movie" },
      { id: 24, title: "The Adam Project", thumb: "https://picsum.photos/seed/adamproject/400/225", match: "89%", year: "2022", rating: "PG-13", seasons: null, desc: "A time-traveling pilot teams up with his younger self and deceased father.", cast: ["Ryan Reynolds", "Mark Ruffalo", "Jennifer Garner"], genres: ["Sci-Fi", "Action"], type: "movie" },
      { id: 25, title: "All Quiet on the Western Front", thumb: "https://picsum.photos/seed/westfront/400/225", match: "96%", year: "2022", rating: "R", seasons: null, desc: "A young German soldier experiences the horrors of World War I.", cast: ["Felix Kammerer", "Albrecht Schuch"], genres: ["War", "Drama"], type: "movie" },
    ]
  },
  {
    title: "Award-Winning TV",
    items: [
      { id: 30, title: "Succession", thumb: "https://picsum.photos/seed/succession/400/225", match: "99%", year: "2018", rating: "TV-MA", seasons: "4 Seasons", desc: "The Roy family controls one of the biggest media and entertainment conglomerates.", cast: ["Brian Cox", "Jeremy Strong", "Kieran Culkin"], genres: ["Drama", "Comedy"], type: "show" },
      { id: 31, title: "Better Call Saul", thumb: "https://picsum.photos/seed/bcs/400/225", match: "98%", year: "2015", rating: "TV-MA", seasons: "6 Seasons", desc: "The complicated journey of Jimmy McGill, a small-time lawyer.", cast: ["Bob Odenkirk", "Jonathan Banks", "Rhea Seehorn"], genres: ["Crime", "Drama"], type: "show" },
      { id: 32, title: "The Bear", thumb: "https://picsum.photos/seed/thebear/400/225", match: "99%", year: "2022", rating: "TV-MA", seasons: "3 Seasons", desc: "A young chef returns home to run his family's sandwich shop.", cast: ["Jeremy Allen White", "Ebon Moss-Bachrach", "Ayo Edebiri"], genres: ["Drama", "Comedy"], type: "show" },
      { id: 33, title: "Severance", thumb: "https://picsum.photos/seed/severance/400/225", match: "97%", year: "2022", rating: "TV-MA", seasons: "2 Seasons", desc: "A company's employees have their work memories surgically divided from their personal ones.", cast: ["Adam Scott", "Britt Lower", "Patricia Arquette"], genres: ["Thriller", "Drama"], type: "show" },
      { id: 34, title: "Beef", thumb: "https://picsum.photos/seed/beeftv/400/225", match: "96%", year: "2023", rating: "TV-MA", seasons: "1 Season", desc: "A road rage incident spirals into an all-out war between two strangers.", cast: ["Steven Yeun", "Ali Wong"], genres: ["Drama", "Thriller"], type: "show" },
    ]
  },
  {
    title: "Critically Acclaimed Films",
    items: [
      { id: 40, title: "Parasite", thumb: "https://picsum.photos/seed/parasite/400/225", match: "98%", year: "2019", rating: "R", seasons: null, desc: "Greed and class discrimination threaten a symbiotic relationship between two families.", cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"], genres: ["Drama", "Thriller"], type: "movie" },
      { id: 41, title: "The Power of the Dog", thumb: "https://picsum.photos/seed/powerdog/400/225", match: "95%", year: "2021", rating: "R", seasons: null, desc: "A domineering rancher seeks to influence his brother's new stepson.", cast: ["Benedict Cumberbatch", "Kirsten Dunst"], genres: ["Drama", "Western"], type: "movie" },
      { id: 42, title: "Marriage Story", thumb: "https://picsum.photos/seed/marriage/400/225", match: "94%", year: "2019", rating: "R", seasons: null, desc: "A stage director and an actress struggle through a coast-to-coast divorce.", cast: ["Adam Driver", "Scarlett Johansson"], genres: ["Drama", "Romance"], type: "movie" },
      { id: 43, title: "Roma", thumb: "https://picsum.photos/seed/roma/400/225", match: "97%", year: "2018", rating: "R", seasons: null, desc: "A year in the life of a middle-class family's domestic worker in early-1970s Mexico City.", cast: ["Yalitza Aparicio", "Marina de Tavira"], genres: ["Drama"], type: "movie" },
      { id: 44, title: "The Irishman", thumb: "https://picsum.photos/seed/irishman/400/225", match: "93%", year: "2019", rating: "R", seasons: null, desc: "A mob hitman recalls his possible involvement with the disappearance of Jimmy Hoffa.", cast: ["Robert De Niro", "Al Pacino", "Joe Pesci"], genres: ["Crime", "Drama"], type: "movie" },
      { id: 45, title: "Mank", thumb: "https://picsum.photos/seed/mank/400/225", match: "88%", year: "2020", rating: "R", seasons: null, desc: "1930s Hollywood is re-examined through the eyes of scathing social critic Herman J. Mankiewicz.", cast: ["Gary Oldman", "Amanda Seyfried"], genres: ["Drama", "History"], type: "movie" },
    ]
  },
  {
    title: "Sci-Fi & Fantasy",
    items: [
      { id: 50, title: "Black Mirror", thumb: "https://picsum.photos/seed/blackmirror/400/225", match: "92%", year: "2011", rating: "TV-MA", seasons: "6 Seasons", desc: "An anthology series exploring a twisted, high-tech multiverse.", cast: ["Various"], genres: ["Sci-Fi", "Thriller"], type: "show" },
      { id: 51, title: "Altered Carbon", thumb: "https://picsum.photos/seed/alteredcarbon/400/225", match: "90%", year: "2018", rating: "TV-MA", seasons: "2 Seasons", desc: "After 250 years on ice, a prisoner is re-sleeved into a new body.", cast: ["Joel Kinnaman", "Anthony Mackie"], genres: ["Sci-Fi", "Cyberpunk"], type: "show" },
      { id: 52, title: "Another Life", thumb: "https://picsum.photos/seed/anotherlife/400/225", match: "78%", year: "2019", rating: "TV-MA", seasons: "2 Seasons", desc: "An astronaut leads a crew on a mission to explore the genesis of an alien artifact.", cast: ["Katee Sackhoff", "Justin Chatwin"], genres: ["Sci-Fi"], type: "show" },
      { id: 53, title: "Lost in Space", thumb: "https://picsum.photos/seed/lostinspace/400/225", match: "89%", year: "2018", rating: "TV-PG", seasons: "3 Seasons", desc: "After crash-landing on an alien planet, the Robinson family fights against all odds to survive.", cast: ["Toby Stephens", "Molly Parker"], genres: ["Sci-Fi", "Adventure"], type: "show" },
      { id: 54, title: "See", thumb: "https://picsum.photos/seed/seeshow/400/225", match: "86%", year: "2019", rating: "TV-MA", seasons: "3 Seasons", desc: "Set in the future where humanity has lost the sense of sight.", cast: ["Jason Momoa", "Alfre Woodard"], genres: ["Sci-Fi", "Drama"], type: "show" },
    ]
  },
];

// My List items (initial)
const MY_LIST = [1, 10, 23, 30, 40, 50, 100];

// Flat lookup
const ALL_CONTENT = {};
[...HERO_CONTENT, ...CONTENT_ROWS.flatMap(r => r.items)].forEach(item => {
  ALL_CONTENT[item.id] = item;
});

// Keyboard layout
const KEYBOARD_KEYS = [
  'a','b','c','d','e','f','g',
  'h','i','j','k','l','m','n',
  'o','p','q','r','s','t','u',
  'v','w','x','y','z','#','@',
  '{SPACE}','{SPACE}','{DEL}','{CLEAR}',
];
