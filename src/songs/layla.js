import { P } from "../lib/constants";

const V_CHORDS = ["C#m7","G#7","C#m7","C","D","E","E7","F#m","B","E","A","F#m","B","E"];
const C_CHORDS = ["A","D5","C5","Bb5","C5","D5","C5","Bb5","C5","D5","C5","Bb5","C5","A5","C5"];

function vLyrics(lines, chords) {
  return {
    tip:"Attack each line with conviction — Clapton's delivery is urgent, not pleading.",
    chordTimeline: chords.slice(0, 8).map((chord, i) => ({ chord, t:i * 2.2 })),
    lines,
  };
}

const CHORUS_LYRICS = {
  tip:"'Layla' is the emotional peak — push the note. Build urgency with each repeat.",
  chordTimeline:[
    {chord:"A",t:0},{chord:"D5",t:0.8},{chord:"C5",t:1.6},{chord:"Bb5",t:2.4},
    {chord:"C5",t:3.5},{chord:"D5",t:4.3},{chord:"C5",t:5.5},{chord:"Bb5",t:6.3},
    {chord:"C5",t:7.5},{chord:"D5",t:8.3},{chord:"C5",t:9.5},{chord:"Bb5",t:10.3},
    {chord:"C5",t:11.5},{chord:"A5",t:12.8},{chord:"C5",t:13.5},
  ],
  lines:[
    {words:["Lay-","la,"],timings:[0.5,1.2]},
    {words:["Got","me","on","my","knees."],timings:[2.8,3.1,3.4,3.7,4.2]},
    {words:["Lay-","la,"],timings:[5.5,6.2]},
    {words:["Beg-","gin'","dar-","lin'","please."],timings:[7.8,8.2,8.6,9.0,9.6]},
    {words:["Lay-","la,"],timings:[10.5,11.2]},
    {words:["Dar-","lin'","won't","you","ease","my","wor-","ried","mind?"],timings:[12.0,12.4,12.8,13.1,13.4,13.7,14.0,14.4,15.0]},
  ],
};

export const LAYLA = {
  id:"layla", title:"Layla", artist:"Derek and the Dominos",
  key:"D Minor / D Major", timeSignature:"4/4", bpm:116, capo:0,
  difficulty:"advanced", genre:["classic rock","blues rock"],
  color:P.red, source:"builtin", dataQuality:"verified",
  sourceNote:"Chord progressions and lyrics from Hal Leonard Guitar Chord Songbook. Intro riff tabs from published sources.",
  references:[
    {type:"original_recording",label:"Layla — Derek and the Dominos (Official Audio)",url:"https://youtu.be/kseSoguuiCs?si=AzF3zU9KGdYMcSz5",note:"Primary timing reference. All chord changes mapped to this recording."},
    {type:"tutorial",label:"Layla Guitar Lesson — Full Tutorial",url:"https://youtu.be/C1TKkRwqkZc?si=9fuo-Hhvwh5CBKe8",note:"Covers intro riff, verse fingering, and piano outro adapted for guitar."},
  ],
  runThrough:[
    {sectionId:1,stage:"intro"},{sectionId:2,stage:"verse"},{sectionId:3,stage:"chorus"},
    {sectionId:4,stage:"verse"},{sectionId:5,stage:"chorus"},{sectionId:6,stage:"verse"},
    {sectionId:7,stage:"chorus"},{sectionId:8,stage:"outro"},
  ],
  sections:[
    {
      id:1, name:"Intro Riff", type:"power chords", bars:"1–8", duration:"~16 sec",
      color:P.red, chords:["D5","C5","Bb5","C5","D5"], status:"not-started",
      technique:"Play 5 times. Heavy attack on beat 1. Let power chords ring. This riff IS the song — nail it before anything else.",
      riffs:[{
        id:"r1", name:"The Layla Riff", type:"riff", feel:"straight", bpm_guide:80,
        difficulty:"intermediate", dataQuality:"verified",
        tab:["e |------------------------|","B |------------------------|","G |------------------------|","D |--7---5---3---5---7-----|","A |--5---3---1---3---5-----|","E |------------------------|"],
        notes:[
          {s:5,f:5,d:0.5},{s:4,f:7,d:0.5},{s:5,f:3,d:0.5},{s:4,f:5,d:0.5},
          {s:5,f:1,d:0.5},{s:4,f:3,d:0.5},{s:5,f:3,d:0.5},{s:4,f:5,d:0.5},
          {s:5,f:5,d:0.5},{s:4,f:7,d:0.5},
        ],
        annotations:["D5 beat 1 — full downstroke, let ring","C5 beat 2 — two frets down, same two-finger shape","Bb5 fret 1 on A string — lowest point","Resolve back C5→D5","Repeat 5 times total before verse"],
        embellishments:[],
        techniqueSteps:["Index on A string, ring on D string for each power chord","Mute strings 1–3 with right palm — only A and D ring","Practice D5→C5 shift first — two frets in one motion","Bb5 at fret 1 is the hardest position — keep fingers arched","Add rhythm: strong downstroke beat 1, lighter on 2–4"],
        aiSuggestions:["Add slight palm mute on beats 2 and 3 for rhythmic drive","Try a brief slide into D5 from one fret below","On final repeat, add a pick scrape on beat 4"],
      }],
      lyrics:null, referenceNotes:[294,262,233,262,294],
    },
    {
      id:2, name:"Verse 1", type:"chord melody", bars:"9–24", duration:"~28 sec",
      color:P.accent, chords:V_CHORDS, status:"not-started",
      technique:"Chord melody style. Chords change on the syllable shown. Keep eighth-note pulse consistent. The C#m7 barre is the hardest change — practise it in isolation first.",
      riffs:[{
        id:"r2", name:"Verse Chord Hook", type:"lick", feel:"straight", bpm_guide:90,
        difficulty:"advanced", dataQuality:"verified",
        tab:["e |--4---4---0---2---4---4--|","B |--5---5---1---2---5---5--|","G |--6---6---0---2---6---6--|","D |--6---6---2---2---6---6--|","A |--4---4---3---0---4---4--|","E |-------------------------|"],
        notes:[
          {s:5,f:4,d:1},{s:4,f:6,d:1},{s:3,f:6,d:1},{s:2,f:5,d:1},
          {s:5,f:6,d:1},{s:4,f:6,d:1},{s:3,f:5,d:1},{s:2,f:4,d:1},
          {s:5,f:3,d:0.5},{s:4,f:2,d:0.5},{s:3,f:0,d:0.5},{s:2,f:1,d:0.5},
          {s:5,f:0,d:0.5},{s:4,f:2,d:0.5},{s:3,f:2,d:0.5},{s:2,f:2,d:0.5},
        ],
        annotations:["C#m7 barre fret 4 — index covers 5 strings","G#7 4fr barre — trickiest chord in the song","Release to open C then D — brief relief from barres","F#m→B→E is the resolution — practise as a unit"],
        embellishments:[],
        techniqueSteps:["Practise C#m7 to G#7 alone — both barre chords in similar positions","C→D→E→E7 run uses open chords — this is your breath","F#m→B→E resolution: practise this three-chord move until automatic"],
        aiSuggestions:["Add vibrato on held G#7 to increase tension before release","Try hammer-on from open E to fret 1 when moving into C"],
      }],
      lyrics:vLyrics([
        {words:["What","will","you","do","when","you","get","lone-","ly?"],timings:[0,0.3,0.5,0.8,1.2,1.5,1.8,2.2,2.8]},
        {words:["No","one","wait-","ing","by","your","side."],timings:[3.5,3.8,4.1,4.5,5.0,5.3,5.8]},
        {words:["You've","been","run-","nin'","hid-","in'","much","too","long."],timings:[7.0,7.3,7.6,8.0,8.5,8.8,9.2,9.6,10.0]},
        {words:["You","know","it's","just","your","fool-","ish","pride."],timings:[11.0,11.3,11.6,12.0,12.4,12.8,13.3,13.8]},
      ], V_CHORDS),
      referenceNotes:[277,294,330,349,294,277],
    },
    {
      id:3, name:"Chorus 1", type:"power chords + vocals", bars:"25–36", duration:"~20 sec",
      color:P.gold, chords:C_CHORDS, status:"not-started",
      technique:"Intro riff returns as the chorus groove. Vocals over D5-C5-Bb5. The A chord opens before the riff enters.",
      riffs:[{
        id:"r3", name:"Chorus Riff (Intro reprise)", type:"riff", feel:"straight", bpm_guide:100,
        difficulty:"intermediate", dataQuality:"verified",
        tab:["e |------------------------|","B |------------------------|","G |------------------------|","D |--7---5---3---5---7-----|","A |--5---3---1---3---5-----|","E |------------------------|"],
        annotations:["Same riff as the intro — now played while singing","A chord opens the chorus before riff enters","End on A5→C5 rather than D5 on the final repeat"],
        embellishments:[],
        techniqueSteps:["Practise singing 'Layla' over D5 while keeping riff steady","Start: guitar only, then hum the melody, then add words","The hardest part is keeping the riff rhythmic while phrasing vocals"],
        aiSuggestions:["Sustain the A chord with vibrato before launching into the riff","Add a pick slide on the last beat of each riff cycle"],
      }],
      lyrics:CHORUS_LYRICS, referenceNotes:[220,294,262,233,262,294],
    },
    {
      id:4, name:"Verse 2", type:"chord melody", bars:"37–52", duration:"~28 sec",
      color:P.accent, chords:V_CHORDS, status:"not-started",
      technique:"Identical chord pattern to Verse 1. Focus on tightening barre chord transitions — they should feel easier than Verse 1.",
      riffs:[],
      lyrics:vLyrics([
        {words:["Tried","to","give","you","con-","so-","la-","tion,"],timings:[0,0.3,0.6,0.9,1.3,1.7,2.1,2.6]},
        {words:["Your","old","man","had","let","you","down."],timings:[3.5,3.8,4.1,4.5,4.9,5.3,5.8]},
        {words:["Like","a","fool,","I","fell","in","love","with","you,"],timings:[7.0,7.3,7.6,8.0,8.4,8.7,9.0,9.4,9.8]},
        {words:["You","turned","my","whole","world","up-","side","down."],timings:[11.0,11.4,11.7,12.0,12.4,12.8,13.2,13.7]},
      ], V_CHORDS),
      referenceNotes:[277,294,330,349,294,277],
    },
    {
      id:5, name:"Chorus 2", type:"power chords + vocals", bars:"53–64", duration:"~20 sec",
      color:P.gold, chords:C_CHORDS, status:"not-started",
      technique:"Same as Chorus 1. Build slightly more intensity — you are deeper into the song now.",
      riffs:[],
      lyrics:{...CHORUS_LYRICS, tip:"Build on Chorus 1 — more breath support, more edge on the vowels."},
      referenceNotes:[220,294,262,233,262,294],
    },
    {
      id:6, name:"Verse 3", type:"chord melody", bars:"65–80", duration:"~28 sec",
      color:P.accent, chords:V_CHORDS, status:"not-started",
      technique:"Final verse — the emotional resolution. Play with the most intention of all three verses.",
      riffs:[],
      lyrics:vLyrics([
        {words:["Make","the","best","of","the","sit-","u-","a-","tion,"],timings:[0,0.3,0.5,0.8,1.1,1.4,1.8,2.1,2.5]},
        {words:["Be-","fore","I","fin-","'ly","go","in-","sane."],timings:[3.5,3.8,4.1,4.4,4.7,5.0,5.4,5.9]},
        {words:["Please","don't","say","we'll","nev-","er","find","a","way."],timings:[7.0,7.3,7.6,8.0,8.4,8.7,9.0,9.4,9.9]},
        {words:["Tell","me","all","my","love's","in","vain."],timings:[11.0,11.3,11.6,11.9,12.3,12.7,13.2]},
      ], V_CHORDS),
      referenceNotes:[277,294,330,349,294,277],
    },
    {
      id:7, name:"Chorus 3 (Final)", type:"power chords + vocals", bars:"81–92", duration:"~20 sec",
      color:P.gold, chords:[...C_CHORDS.slice(0,-1),"D5"], status:"not-started",
      technique:"Final chorus ends on D5. Everything you have. After this, the piano coda begins.",
      riffs:[],
      lyrics:{...CHORUS_LYRICS, tip:"Last chorus — everything you have. The final 'worried mind' should feel like release."},
      referenceNotes:[220,294,262,233,262,294],
    },
    {
      id:8, name:"Piano Coda (Guitar Adaptation)", type:"fingerpicking", bars:"93+", duration:"~varies",
      color:P.purple, chords:["C","G","Am","F","C","G","Dm","E"], status:"not-started",
      technique:"Jim Gordon's piano outro adapted for guitar. Learn this section independently — it has a completely different feel from the main song. Swung eighth notes are essential.",
      riffs:[{
        id:"r4", name:"Piano Coda Melody", type:"lick", feel:"swung", bpm_guide:60,
        difficulty:"advanced", dataQuality:"ai_assisted",
        tab:["e |--0---1---0---------0--|","B |--1---1---1---1---1----|","G |--0---0---2---0---2----|","D |--2---2---2---2---0----|","A |--3---3---0---2--------|","E |------------------------|"],
        annotations:["Guitar approximation of the piano part","Swung feel is essential — straight eighth notes sound wrong","C→G→Am→F is the repeating loop","Note: tab is AI-assisted — verify against tutorial reference"],
        embellishments:[{type:"slide",label:"sl",desc:"Slide between chord positions for smooth voice leading"}],
        techniqueSteps:["Learn the C→G→Am→F loop slowly first","Add melody notes once chord shapes are automatic","Swung feel: slightly delay every second eighth note"],
        aiSuggestions:["Travis picking — thumb alternates bass, fingers carry the melody","Listen closely to the recording before attempting this section"],
      }],
      lyrics:null, referenceNotes:[262,294,220,196],
    },
  ],
};

export const BUILTIN_SONGS = [LAYLA];
