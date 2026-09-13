/* ============================================================
   Monthly trivia quiz — 20 questions, rotated on the 1st.

   Shape: one entry per calendar month, newest last.

     { month: 'YYYY-MM', title: '…', questions: [ {q, a, c, note}, … ] }

   `c` is the index of the correct answer in `a` as written here. The page
   shuffles the options on every play, so position carries no signal and a
   returning player can't learn "it's always the third one."

   Rules for anything added here — these are what make it worth playing:

   1. One defensible answer. Dylan's biography is full of disputed facts and
      the guide's house style is to say so rather than pick the better story.
      A quiz can't do that, so genuinely unsettled material — what exactly
      happened at Newport, who shouted 'Judas!', the motorcycle injuries —
      stays out. Ask about the parts of those nights that ARE settled.
   2. The three wrong options must be plausible to someone who knows the
      period. A question is only hard if the distractors are real.
   3. `note` is the payoff. Players who get it wrong should learn something,
      so write the note for them, not for the ones who got it right.
   4. No lyrics beyond a phrase — the same copyright rule as the rest of the
      site.
   ============================================================ */

window.DYLAN = window.DYLAN || {};

window.DYLAN.quiz = [

  /* ---------------------------------------------------------- 2026-09 */
  {
    month: '2026-09',
    title: 'The one that starts hard',
    questions: [
      {
        q: 'John Hammond signed Dylan to Columbia partly on the strength of a harmonica part he played on someone else’s session. Whose?',
        a: ['Carolyn Hester', 'Joan Baez', 'Odetta', 'Judy Collins'],
        c: 0,
        note: 'Hester’s September 1961 session. Hammond was producing, Dylan was the hired harmonica player, and the contract followed in October — he was twenty.'
      },
      {
        q: 'Dylan’s stated ambition in his 1959 Hibbing High yearbook was:',
        a: ['To join Little Richard', 'To follow Woody Guthrie', 'To play Carnegie Hall', 'To write for Sing Out!'],
        c: 0,
        note: 'Not folk music — Little Richard. The Guthrie conversion was still a year away, and happened almost overnight when a friend lent him Bound for Glory.'
      },
      {
        q: 'Before the Golden Chords, Dylan’s first Hibbing band was called:',
        a: ['The Shadow Blasters', 'The Iron Rangers', 'The Elston Gunnn Trio', 'The Jokers'],
        c: 0,
        note: 'The Shadow Blasters came first, then the Golden Chords — loud enough at a school talent show that the principal cut the microphone. "Elston Gunnn", with three n’s, was a name he used later and briefly, playing piano behind Bobby Vee.'
      },
      {
        q: 'Al Kooper turned up to the ‘Like a Rolling Stone’ session intending to play which instrument?',
        a: ['Guitar', 'Organ', 'Piano', 'Bass'],
        c: 0,
        note: 'He took one look at Mike Bloomfield and quietly gave up. When the organist moved to piano he talked his way onto the Hammond, an instrument he barely played, and came in a half-beat late on every chord change because he was waiting to hear where the song was going. At playback Dylan told the engineer to turn it up.'
      },
      {
        q: 'Which song did CBS refuse to let him perform on The Ed Sullivan Show in May 1963?',
        a: ['‘Talkin’ John Birch Paranoid Blues’', '‘Masters of War’', '‘Oxford Town’', '‘Blowin’ in the Wind’'],
        c: 0,
        note: 'He declined to play anything else and walked out. The same song was pulled from Freewheelin’ after sleeves had been printed, which is why the few surviving copies that still contain it are worth a great deal.'
      },
      {
        q: 'At the March on Washington in August 1963 he performed:',
        a: ['‘Only a Pawn in Their Game’ and ‘When the Ship Comes In’', '‘Blowin’ in the Wind’ and ‘The Times They Are a-Changin’’', '‘A Hard Rain’s A-Gonna Fall’, alone', '‘The Lonesome Death of Hattie Carroll’ and ‘Oxford Town’'],
        c: 0,
        note: 'Hours before King’s ‘I Have a Dream’. ‘Blowin’ in the Wind’ was sung that day — but by Peter, Paul and Mary.'
      },
      {
        q: 'The arrangement of ‘House of the Rising Sun’ on Dylan’s debut album was worked out by:',
        a: ['Dave Van Ronk', 'Ramblin’ Jack Elliott', 'Woody Guthrie', 'Tom Paley'],
        c: 0,
        note: 'Van Ronk had spent years on it and asked Dylan to wait. Dylan recorded it anyway, and Van Ronk then had to drop it from his own sets because audiences assumed he had taken it from Dylan. The Animals’ worldwide hit in 1964 used essentially the same arrangement.'
      },
      {
        q: 'What did Dylan say to his band immediately after answering the ‘Judas!’ heckle in Manchester?',
        a: ['‘Play it fucking loud’', '‘Take it from the top’', '‘Let’s give them what they came for’', '‘Louder’'],
        c: 0,
        note: 'He said ‘I don’t believe you… you’re a liar’, turned round, and they went into ‘Like a Rolling Stone’ at maximum volume. Who actually shouted from the balcony is still argued over; what he said back is on tape.'
      },
      {
        q: 'The motorcycle he came off near Woodstock in July 1966 was a:',
        a: ['Triumph', 'Harley-Davidson', 'Norton', 'BSA'],
        c: 0,
        note: 'A Triumph 500. No ambulance was called, no police report was filed and he was not admitted to hospital — which is exactly why sixty years of theories have grown around it. What he was actually doing was stopping.'
      },
      {
        q: 'Which album was recorded in a single overnight session, with a case of Beaujolais on hand?',
        a: ['Another Side of Bob Dylan', 'The Times They Are a-Changin’', 'Bringing It All Back Home', 'Nashville Skyline'],
        c: 0,
        note: '9 June 1964, running past midnight. The wine is not a legend — it is in the session photographs.'
      },
      {
        q: 'How many of the ten songs on Blood on the Tracks were re-recorded in Minneapolis at the last minute?',
        a: ['Five', 'Three', 'Seven', 'All ten'],
        c: 0,
        note: 'The album was finished and the sleeves were printed. His brother David heard the test pressing over Christmas and said it was too bleak and too samey to sell, so Dylan booked a Minneapolis studio, hired local musicians who had no idea what they were walking into, and re-cut half of it in two days. Columbia had to pulp the sleeves.'
      },
      {
        q: 'Which song did Dylan write about receiving an honorary doctorate from Princeton in 1970?',
        a: ['‘Day of the Locusts’', '‘Went to See the Gypsy’', '‘If Dogs Run Free’', '‘Sign on the Window’'],
        c: 0,
        note: 'He hated every minute of the ceremony and put it on New Morning. All four options are from that album, which is what makes this one hard.'
      },
      {
        q: 'Which finished recording was left off Infidels in 1983, to lasting bewilderment?',
        a: ['‘Blind Willie McTell’', '‘Foot of Pride’', '‘Lord Protect My Child’', '‘Someone’s Got a Hold of My Heart’'],
        c: 0,
        note: 'All four were left in the vault and all four later surfaced on the Bootleg Series — but ‘Blind Willie McTell’ is the one he has been asked about ever since. Mark Knopfler produced the album.'
      },
      {
        q: 'Dylan’s first competitive Grammy, in 1980, was for:',
        a: ['‘Gotta Serve Somebody’', '‘Like a Rolling Stone’', '‘Blowin’ in the Wind’', '‘Tangled Up in Blue’'],
        c: 0,
        note: 'Best Rock Vocal Performance, Male — awarded in the middle of the gospel period, for a gospel song, to an audience that had spent a year booing the material.'
      },
      {
        q: 'Dylan co-wrote the 2003 film Masked and Anonymous under which pseudonym?',
        a: ['Sergei Petrov', 'Elston Gunnn', 'Jack Frost', 'Boo Wilbury'],
        c: 0,
        note: 'Sergei Petrov, for the screenplay. Jack Frost is real too — it is the name he produces his own records under, from "Love and Theft" onwards. Boo Wilbury was his Traveling Wilburys alias on the second album.'
      },
      {
        q: 'The dancer who stripped to reveal SOY BOMB during ‘Love Sick’ at the 1998 Grammys was:',
        a: ['Michael Portnoy', 'Michael Alig', 'Mark Pauline', 'Joey Skaggs'],
        c: 0,
        note: 'A hired backing dancer. He convulsed beside Dylan for about thirty seconds before security removed him; Dylan never looked at him and never missed a word. Portnoy later explained that soy represents sustenance and bomb represents explosive dynamism. He was not paid.'
      },
      {
        q: '‘Like a Rolling Stone’ was produced by:',
        a: ['Tom Wilson', 'Bob Johnston', 'John Hammond', 'Daniel Lanois'],
        c: 0,
        note: 'Wilson produced the single in June 1965 and was replaced by Bob Johnston for the rest of Highway 61 Revisited — so the album’s most famous track has a different producer from almost everything around it.'
      },
      {
        q: 'Which album gave Dylan his first US number one?',
        a: ['Planet Waves', 'Blood on the Tracks', 'Highway 61 Revisited', 'Nashville Skyline'],
        c: 0,
        note: '1974, on the back of the comeback tour with The Band — some six million people applied for 650,000 tickets. It then took until Modern Times in 2006 for him to top the chart again.'
      },
      {
        q: 'In the Nobel lecture, the passages that turned out to resemble SparkNotes rather than the book itself concerned:',
        a: ['Moby-Dick', 'All Quiet on the Western Front', 'The Odyssey', 'Don Quixote'],
        c: 0,
        note: 'The writer Andrea Pitzer noticed phrases in the Moby-Dick section that appear nowhere in Melville but do appear in the study guide. Dylan has never commented. He delivered the lecture as a recording over jazz piano, days before the deadline that would have forfeited the prize money.'
      },
      {
        q: 'Who sang at the 2016 Nobel ceremony in Dylan’s place — and stopped, mid-song, having lost the words?',
        a: ['Patti Smith', 'Joan Baez', 'Emmylou Harris', 'Rosanne Cash'],
        c: 0,
        note: '‘A Hard Rain’s A-Gonna Fall’. She apologised, restarted, and got a standing ovation — and wrote afterwards that the nerves were about the size of the room, not the song.'
      }
    ]
  },

  /* ---------------------------------------------------------- 2026-10 */
  {
    month: '2026-10',
    title: 'Deeper in the weeds',
    questions: [
      {
        q: 'The folklorist who tracked Dylan down in Minneapolis to recover a stolen record collection was:',
        a: ['Jon Pankake', 'Alan Lomax', 'Harry Smith', 'Izzy Young'],
        c: 0,
        note: 'Pankake owned a rare Charlie Poole collection that went missing after a Dylan visit. He got the records back. Dylan was absorbing an entire tradition at speed and was not fussy about the mechanism.'
      },
      {
        q: 'Dylan arrived at the Beatles’ hotel in 1964 assuming they already smoked marijuana, because he had misheard which line?',
        a: ['‘I can’t hide’', '‘It’s such a feeling’', '‘I should have known better’', '‘Please please me’'],
        c: 0,
        note: 'He heard ‘I get high’ in ‘I Want to Hold Your Hand’. They hadn’t; he rolled one anyway; Brian Epstein spent the evening saying he was so high he was on the ceiling. Both catalogues changed direction within a year.'
      },
      {
        q: 'Accepting the Tom Paine Award in December 1963, drunk, Dylan told the room he saw something of himself in:',
        a: ['Lee Harvey Oswald', 'Fidel Castro', 'Billy the Kid', 'Charles Starkweather'],
        c: 0,
        note: 'Three weeks after the Kennedy assassination, to a room of ageing left-wing donors. The booing was immediate and the donations reportedly suffered. He sent a long, rambling written apology afterwards, itself one of the stranger documents in the catalogue.'
      },
      {
        q: 'Dylan’s first professional booking, in April 1961, was opening for:',
        a: ['John Lee Hooker', 'Muddy Waters', 'Big Joe Williams', 'Lightnin’ Hopkins'],
        c: 0,
        note: 'At Gerde’s Folk City on West 4th Street. Five months later Robert Shelton’s New York Times review of that same room put him on the map.'
      },
      {
        q: 'The double album of Basement Tapes material sold in Los Angeles shops in 1969 — generally credited as the first commercially significant rock bootleg — was called:',
        a: ['Great White Wonder', 'Troubled Troubadour', 'Stealin’', 'A Thousand Miles Behind'],
        c: 0,
        note: 'A plain white sleeve, no label, no credits. The other three are real Dylan bootlegs too — they just came later, in the flood this one started.'
      },
      {
        q: 'Who coined the word ‘Dylanology’ and went through Dylan’s bins on MacDougal Street?',
        a: ['A.J. Weberman', 'Paul Williams', 'Michael Gray', 'Clinton Heylin'],
        c: 0,
        note: 'He also ran a ‘Dylan Liberation Front’ demanding a return to protest songs. Dylan argued with him at length on tape and — by Weberman’s own account — eventually knocked him down in the street. The other three are serious Dylan scholars, which is rather the point of the question.'
      },
      {
        q: 'Where was Slow Train Coming recorded?',
        a: ['Muscle Shoals, Alabama', 'Nashville, Tennessee', 'New Orleans, Louisiana', 'Malibu, California'],
        c: 0,
        note: 'With Jerry Wexler producing and Mark Knopfler on guitar. Wexler, faced with a newly born-again artist trying to save his soul mid-session, replied that he was a sixty-two-year-old confirmed Jewish atheist and a lost cause, and could they please get back to making the record.'
      },
      {
        q: 'The November 1979 Warfield residency in San Francisco, at which he played nothing but the new gospel material, ran for how many nights?',
        a: ['Fourteen', 'Six', 'Nine', 'Twenty-one'],
        c: 0,
        note: '1–16 November. He refused every shouted request for older songs and preached between them. Audiences heckled and some walked out; the recordings released nearly forty years later on Trouble No More show a band operating at an extraordinary level.'
      },
      {
        q: 'Dylan’s offhand remark at Live Aid in 1985 — which enraged Bob Geldof — led directly to the founding of:',
        a: ['Farm Aid', 'Live 8', 'The Bridge School Benefit', 'Comic Relief'],
        c: 0,
        note: 'He suggested some of the money might go to American farmers facing foreclosure, at a famine benefit. Willie Nelson, watching, took the idea entirely seriously, and the first Farm Aid happened that September.'
      },
      {
        q: 'The Traveling Wilburys came together because George Harrison needed a B-side in a hurry and borrowed a studio. Whose garage was it in?',
        a: ['Bob Dylan’s, in Malibu', 'Tom Petty’s, in Encino', 'Jeff Lynne’s, in Beverly Hills', 'Roy Orbison’s, in Nashville'],
        c: 0,
        note: 'Petty came along because Harrison had left a guitar at his house. The B-side became ‘Handle with Care’, the label said it was far too good to bury, and a supergroup with joke surnames sold several million records almost by accident.'
      },
      {
        q: 'Stopped by police in Long Branch, New Jersey in 2009 after residents reported an eccentric old man wandering in the rain, Dylan said he had been looking at:',
        a: ['The house where Springsteen wrote ‘Born to Run’', 'The Stone Pony', 'A house he had once rented', 'The boardwalk from a song he was writing'],
        c: 0,
        note: 'He had no identification on him, and a show that night with Willie Nelson and John Mellencamp. The 24-year-old officer, Kristie Buble, had never heard of him and drove him back to his tour bus to have it confirmed.'
      },
      {
        q: 'The 1997 illness that nearly killed him was:',
        a: ['Histoplasmosis, causing acute pericarditis', 'Viral meningitis', 'A pulmonary embolism', 'Endocarditis'],
        c: 0,
        note: 'A fungal infection. On release he said he really thought he would be seeing Elvis soon. Time Out of Mind — already recorded before he fell ill — came out four months later and was read, wrongly, as a record about dying.'
      },
      {
        q: 'Who inducted Dylan into the Rock and Roll Hall of Fame in 1988?',
        a: ['Bruce Springsteen', 'Neil Young', 'George Harrison', 'Tom Petty'],
        c: 0,
        note: 'Springsteen said Dylan ‘freed the mind the way Elvis freed the body’. Under five months later the Never Ending Tour began in Concord, California.'
      },
      {
        q: 'The working draft of ‘Like a Rolling Stone’ sold at Sotheby’s in 2014 for:',
        a: ['$2.045 million', '$405,000', '$1.2 million', '$5.5 million'],
        c: 0,
        note: 'Four sheets of hotel stationery covered in crossings-out and marginal doodles — then a record for any popular-music manuscript. The drafts show the song starting as something much longer and angrier before he found the shape of it.'
      },
      {
        q: 'Lines lifted from the Confederate poet Henry Timrod turned up, to some scandal, on which album?',
        a: ['Modern Times', 'Time Out of Mind', 'Tempest', '"Love and Theft"'],
        c: 0,
        note: 'Modern Times, in 2006. "Love and Theft" had already drawn the same complaint over Junichi Saga’s Confessions of a Yakuza. Dylan’s position has never moved: this is what the tradition is, and everyone in it did the same.'
      },
      {
        q: 'Theme Time Radio Hour, his satellite radio show, ran to roughly how many episodes?',
        a: ['One hundred', 'Twenty-six', 'Fifty', 'Two hundred'],
        c: 0,
        note: 'Each built around a theme — coffee, dogs, the Devil, divorce — delivered deadpan, with a record collection nobody could have predicted. It began in May 2006 and is the best available argument that he actually enjoys something.'
      },
      {
        q: 'The marriage that stayed unknown to the public until Howard Sounes revealed it in 2001 was to:',
        a: ['Carolyn Dennis', 'Sara Lownds', 'Clydie King', 'Ruth Tyrangiel'],
        c: 0,
        note: 'One of his backing singers. They married in June 1986, their daughter Desiree had been born that January, and the marriage ended in 1992. Dennis said afterwards that the privacy had been her choice as much as his.'
      },
      {
        q: 'The Philosophy of Modern Song, published in 2022, collects how many essays on other people’s songs?',
        a: ['Sixty-six', 'Thirty-three', 'One hundred', 'Fifty-two'],
        c: 0,
        note: 'Sixty-six — half criticism, half prose poem, and his first book of new writing since Chronicles eighteen years earlier.'
      },
      {
        q: 'Dylan skipped Woodstock — held sixty miles from his door and named after his adopted town — and played instead, before roughly 150,000 people, at:',
        a: ['The Isle of Wight Festival', 'The Newport Folk Festival', 'The Bath Festival', 'The Concert for Bangladesh'],
        c: 0,
        note: '31 August 1969, with three Beatles watching from the side of the stage. His son was ill, and his Woodstock property had spent years being overrun by people who thought he owed them something.'
      },
      {
        q: 'Which producer was brought in for Oh Mercy in 1989, and returned for Time Out of Mind eight years later?',
        a: ['Daniel Lanois', 'Don Was', 'Jack Frost', 'David Bromberg'],
        c: 0,
        note: 'Lanois, in New Orleans — the first genuinely good Dylan record in years. Jack Frost is a distractor with teeth: it is Dylan’s own production pseudonym, used from "Love and Theft" onwards, once he decided he would rather do it himself.'
      }
    ]
  }

];
