import { useState, useEffect, useRef, useCallback } from "react";
import { P, REF_TYPES, SOURCE_QUALITY } from "../../lib/constants";
import { claudeCall, extractJson } from "../../lib/claudeApi";
import { QualityBadge } from "../shared/Badges";

// ── AIGenerator ───────────────────────────────────────────────────────────────
export function AIGenerator({ onDone, onClose }) {
  const [query,   setQuery]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [refs,    setRefs]    = useState([{ type:"original_recording", label:"", url:"", note:"" }]);
  const addRef  = () => setRefs(r => [...r, { type:"tutorial", label:"", url:"", note:"" }]);
  const upRef   = (i, k, v) => setRefs(r => r.map((x, j) => j === i ? { ...x, [k]:v } : x));
  const rmRef   = i => setRefs(r => r.filter((_, j) => j !== i));

  const generate = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(null);
    try {
      const text = await claudeCall([{ role:"user", content:
        `Generate guitar song learning schema JSON for: "${query}". Return ONLY valid JSON. Mark ALL sections and riffs with dataQuality:"ai_assisted". Schema: {"id":"snake_id","title":"","artist":"","key":"G Major","timeSignature":"4/4","bpm":120,"capo":0,"difficulty":"beginner","genre":["rock"],"color":"#3dd6c8","source":"ai","dataQuality":"ai_assisted","sourceNote":"AI generated — verify against recording.","sections":[{"id":1,"name":"Intro","type":"riff","bars":"1-4","duration":"~10 sec","color":"#f0a500","chords":["G","C"],"status":"not-started","technique":"desc","dataQuality":"ai_assisted","riffs":[{"id":"r1","name":"Main Riff","type":"riff","feel":"straight","bpm_guide":70,"difficulty":"beginner","dataQuality":"ai_assisted","tab":["e |--0---|","B |--1---|","G |--0---|","D |--2---|","A |--3---|","E |------|"],"annotations":["beat 1"],"embellishments":[],"techniqueSteps":["step 1"],"aiSuggestions":["try vibrato"]}],"lyrics":null,"referenceNotes":[196,220]}]}. For vocal sections: "lyrics":{"tip":"tip","chordTimeline":[{"chord":"G","t":0}],"lines":[{"words":["Hel-","lo"],"timings":[0,0.8]}]}. Include 4-5 sections. Use common chords. Colors from: #3dd6c8,#f0a500,#d4875a,#b06dff.`
      }], 2500);
      const jStr = extractJson(text);
      if (!jStr) throw new Error("No JSON found");
      const song = JSON.parse(jStr);
      song.sections = song.sections.map((s, i) => ({
        ...s, status:i===0?"in-progress":"not-started", dataQuality:"ai_assisted"
      }));
      song.references = refs.filter(r => r.url.trim());
      onDone(song);
    } catch (e) { setError(`Failed: ${e.message}`); }
    finally { setLoading(false); }
  };

  const inp = (placeholder, val, onChange, type = "text") => (
    <input type={type} value={val} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width:"100%", background:P.bg, border:`1px solid ${P.border}`,
        borderRadius:6, padding:"7px 10px", color:P.text, fontSize:12,
        outline:"none", boxSizing:"border-box", marginBottom:6 }} />
  );

  return (
    <div style={{ background:P.card, border:`1px solid ${P.border}`, borderRadius:14, padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ color:P.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:4 }}>AI GENERATION</div>
          <div style={{ color:P.text, fontSize:18, fontWeight:800 }}>Generate Any Song</div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:`1px solid ${P.border}`,
          color:P.muted, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>✕</button>
      </div>
      <QualityBadge quality="ai_assisted" />
      <div style={{ marginTop:12, marginBottom:14 }}>
        <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em", marginBottom:6 }}>SONG TITLE + ARTIST</div>
        <input value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          placeholder='"Hotel California — Eagles"'
          style={{ width:"100%", background:P.bg, border:`1px solid ${P.border}`,
            borderRadius:8, padding:"10px 14px", color:P.text, fontSize:14,
            outline:"none", boxSizing:"border-box" }} />
      </div>
      <div style={{ marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em" }}>REFERENCES (optional)</div>
          <button onClick={addRef} style={{ background:P.tealDim, border:`1px solid ${P.teal}44`,
            color:P.teal, borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>+ Add</button>
        </div>
        {refs.map((ref, i) => (
          <div key={i} style={{ background:P.surface, borderRadius:8, padding:10,
            border:`1px solid ${P.border}`, marginBottom:8 }}>
            <div style={{ display:"flex", gap:8, marginBottom:6, alignItems:"center" }}>
              <select value={ref.type} onChange={e => upRef(i, "type", e.target.value)}
                style={{ background:P.bg, border:`1px solid ${P.border}`, borderRadius:6,
                  padding:"5px 8px", color:P.text, fontSize:11, outline:"none" }}>
                {Object.entries(REF_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button onClick={() => rmRef(i)} style={{ background:"none", border:"none",
                color:P.red, cursor:"pointer", fontSize:14, marginLeft:"auto" }}>✕</button>
            </div>
            {inp("Label", ref.label, v => upRef(i, "label", v))}
            {inp("URL", ref.url, v => upRef(i, "url", v))}
            {inp("Note (optional)", ref.note, v => upRef(i, "note", v))}
          </div>
        ))}
      </div>
      {error && <div style={{ color:P.red, fontSize:12, marginBottom:12, padding:"8px 12px",
        background:P.red+"22", borderRadius:8 }}>{error}</div>}
      {loading && <div style={{ color:P.teal, fontSize:12, marginBottom:12, padding:"8px 12px",
        background:P.tealDim, borderRadius:8 }}>Building schema…</div>}
      <button onClick={generate} disabled={loading || !query.trim()}
        style={{ width:"100%", padding:"12px 0", borderRadius:8, fontWeight:800, fontSize:14,
          border:"none", cursor:loading||!query.trim()?"not-allowed":"pointer",
          background:loading||!query.trim()?P.border:P.purple, color:"#fff",
          transition:"background 0.2s" }}>
        {loading ? "Generating…" : "✦ Generate with Claude"}
      </button>
    </div>
  );
}

// ── ImageImporter ─────────────────────────────────────────────────────────────
export function ImageImporter({ onExtracted, onClose }) {
  const [images,  setImages]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [log,     setLog]     = useState("");

  const fileToBase64 = file => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const addFiles = useCallback(async files => {
    const validTypes = ["image/jpeg","image/png","image/gif","image/webp"];
    const newImgs = [];
    for (const f of Array.from(files)) {
      if (!validTypes.includes(f.type)) continue;
      const base64  = await fileToBase64(f);
      const dataUrl = `data:${f.type};base64,${base64}`;
      newImgs.push({ dataUrl, base64, mediaType:f.type });
    }
    setImages(prev => [...prev, ...newImgs].slice(0, 8));
  }, []);

  useEffect(() => {
    const handler = async e => {
      const items    = Array.from(e.clipboardData?.items || []);
      const imgItems = items.filter(it => it.kind === "file" && it.type.startsWith("image/"));
      if (!imgItems.length) return;
      e.preventDefault();
      await addFiles(imgItems.map(it => it.getAsFile()).filter(Boolean));
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [addFiles]);

  const removeImage = idx => setImages(prev => prev.filter((_, i) => i !== idx));

  const extract = async () => {
    if (!images.length) return;
    setLoading(true); setError(null); setLog("Sending images to Claude…");
    const imgContent = images.map(img => ({
      type:"image", source:{ type:"base64", media_type:img.mediaType, data:img.base64 }
    }));
    const prompt = `You are a guitar learning app schema generator. Read these chord chart / sheet music screenshots and extract the song data.
Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{"title":"Song Title","artist":"Artist Name","key":"X Major or X Minor","timeSignature":"4/4","bpm":120,"capo":0,"difficulty":"beginner|intermediate|advanced","genre":["rock"],"sourceNote":"Extracted from chord chart image","sections":[{"id":1,"name":"Intro","type":"strumming|fingerpicking|chord melody|power chords","bars":"1-4","duration":"~10 sec","color":"#f0a500","chords":["G","C","D"],"technique":"Describe what the player does in this section","riffs":[],"lyrics":null,"referenceNotes":[196,220]}]}
Rules:
- Chord names exactly as shown (C#m7, G#7, F#m, D5, Bb5 etc)
- For lyrics: split hyphenated syllables as separate words
- Timing estimates: assume 4/4 at the stated bpm
- referenceNotes: MIDI frequencies for the key root and common melody notes
- Colors: use from #3dd6c8, #f0a500, #d4875a, #b06dff, #e05c5c, #4ecb71
- Set all section status to "not-started"`;
    try {
      // Note: image payloads can't go through claudeCall() helper — must use fetch directly
      const res = await fetch("http://localhost:3001/api/claude", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-5", max_tokens:3000,
          messages:[{ role:"user", content:[...imgContent, { type:"text", text:prompt }] }] })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const jStr = extractJson(data.content[0].text);
      if (!jStr) throw new Error("No JSON found in response");
      const schema = JSON.parse(jStr);
      schema.id = `import_${Date.now()}`;
      schema.source = "manual"; schema.dataQuality = "verified";
      schema.color = schema.color || P.gold;
      schema.sections = (schema.sections || []).map((s, i) => ({
        ...s, id:s.id||i+1, status:"not-started", dataQuality:"verified", riffs:s.riffs||[]
      }));
      setLog("Extracted! Review below before saving.");
      onExtracted(schema);
    } catch (e) {
      setError(`Extraction failed: ${e.message}. API access required — check your proxy is running.`);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background:P.card, border:`1px solid ${P.border}`, borderRadius:14, padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ color:P.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:4 }}>IMAGE IMPORT</div>
          <div style={{ color:P.text, fontSize:18, fontWeight:800 }}>Import from Screenshots</div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:`1px solid ${P.border}`,
          color:P.muted, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>✕</button>
      </div>
      <div style={{ background:P.surface, borderRadius:10, padding:"12px 14px",
        border:`1px solid ${P.border}`, marginBottom:16 }}>
        <div style={{ color:P.accent, fontSize:11, fontWeight:700, marginBottom:6 }}>HOW TO ADD SCREENSHOTS</div>
        {["Copy a screenshot (Cmd+Shift+4 on Mac, or take phone screenshot) then paste anywhere on this page",
          "Or tap the upload button below to pick image files",
          "Add multiple screenshots for one song — e.g. page 1, page 2, verse 2",
          "Works best with Hal Leonard chord songbooks, Ultimate Guitar screenshots, or clear chord charts"
        ].map((t, i) => (
          <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:5 }}>
            <span style={{ color:P.teal, fontSize:12, flexShrink:0, marginTop:1 }}>{i+1}.</span>
            <span style={{ color:P.textSoft, fontSize:12, lineHeight:1.5 }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ border:`2px dashed ${images.length>0?P.teal:P.border}`, borderRadius:12,
        padding:"20px 16px", textAlign:"center", marginBottom:14,
        background:images.length>0?P.teal+"08":P.surface, transition:"all 0.2s" }}>
        {images.length === 0 ? (
          <div>
            <div style={{ fontSize:28, marginBottom:8 }}>📋</div>
            <div style={{ color:P.textSoft, fontSize:14, marginBottom:4 }}>Paste a screenshot here</div>
            <div style={{ color:P.muted, fontSize:12 }}>Cmd+V / Ctrl+V after copying a screenshot</div>
          </div>
        ) : (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
            {images.map((img, i) => (
              <div key={i} style={{ position:"relative", flexShrink:0 }}>
                <img src={img.dataUrl} alt={`Page ${i+1}`}
                  style={{ width:90, height:90, objectFit:"cover", borderRadius:8,
                    border:`2px solid ${P.teal}`, display:"block" }} />
                <div style={{ position:"absolute", top:2, left:6, background:P.teal,
                  color:"#0a0a0f", fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:4 }}>p{i+1}</div>
                <button onClick={() => removeImage(i)}
                  style={{ position:"absolute", top:-6, right:-6, width:20, height:20,
                    borderRadius:"50%", background:P.red, border:"none", color:"#fff",
                    fontSize:12, cursor:"pointer", display:"flex",
                    alignItems:"center", justifyContent:"center", lineHeight:1 }}>×</button>
              </div>
            ))}
            <div onClick={() => document.getElementById("img-file-input").click()}
              style={{ width:90, height:90, borderRadius:8, border:`2px dashed ${P.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                color:P.muted, fontSize:24, cursor:"pointer" }}>+</div>
          </div>
        )}
      </div>
      <input id="img-file-input" type="file" accept="image/*" multiple
        onChange={async e => { await addFiles(e.target.files); e.target.value = ""; }}
        style={{ display:"none" }} />
      <button onClick={() => document.getElementById("img-file-input").click()}
        style={{ width:"100%", padding:"9px 0", borderRadius:8, border:`1px solid ${P.border}`,
          background:P.surface, color:P.textSoft, fontWeight:700, fontSize:13,
          cursor:"pointer", marginBottom:14 }}>Upload image files</button>
      {images.length > 0 && (
        <div style={{ background:P.surface, borderRadius:8, padding:"8px 12px",
          border:`1px solid ${P.teal}44`, marginBottom:14 }}>
          <span style={{ color:P.teal, fontSize:12, fontWeight:700 }}>{images.length} image{images.length>1?"s":""} ready</span>
          <span style={{ color:P.muted, fontSize:12 }}> — Claude will read all of them together</span>
        </div>
      )}
      {error  && <div style={{ color:P.red, fontSize:12, marginBottom:12, padding:"8px 12px", background:P.red+"22", borderRadius:8, lineHeight:1.5 }}>{error}</div>}
      {loading && <div style={{ color:P.teal, fontSize:12, marginBottom:12, padding:"8px 12px", background:P.tealDim, borderRadius:8 }}>⏳ {log}</div>}
      <button onClick={extract} disabled={loading || images.length === 0}
        style={{ width:"100%", padding:"12px 0", borderRadius:8, fontWeight:800, fontSize:14,
          border:"none", cursor:loading||!images.length?"not-allowed":"pointer",
          background:loading||!images.length?P.border:P.teal,
          color:loading||!images.length?P.muted:"#0a0a0f", transition:"background 0.2s" }}>
        {loading?"Extracting…":images.length===0?"Add screenshots first":"✦ Extract Song from Images"}
      </button>
    </div>
  );
}

// ── ReviewSchema ──────────────────────────────────────────────────────────────
export function ReviewSchema({ schema, onSave, onBack }) {
  const [form, setForm] = useState({
    title: schema.title||"", artist: schema.artist||"", key: schema.key||"G Major",
    bpm: String(schema.bpm||120), timeSignature: schema.timeSignature||"4/4",
    difficulty: schema.difficulty||"intermediate",
  });
  const [refs,     setRefs]   = useState([]);
  const [sections, setSecs]   = useState(schema.sections || []);
  const set    = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const addRef = () => setRefs(r => [...r, { type:"original_recording", label:"", url:"", note:"" }]);
  const upRef  = (i, k, v) => setRefs(r => r.map((x, j) => j === i ? { ...x, [k]:v } : x));
  const rmRef  = i => setRefs(r => r.filter((_, j) => j !== i));
  const save   = () => onSave({ ...schema, ...form, bpm:parseInt(form.bpm)||120, references:refs.filter(r=>r.url.trim()), sections });

  const inp = (label, key, type = "text", opts = null) => (
    <div style={{ marginBottom:12 }}>
      <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em", marginBottom:5 }}>{label}</div>
      {opts
        ? <select value={form[key]} onChange={e => set(key, e.target.value)}
            style={{ width:"100%", background:P.bg, border:`1px solid ${P.border}`, borderRadius:8,
              padding:"9px 12px", color:P.text, fontSize:13, outline:"none" }}>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        : <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
            style={{ width:"100%", background:P.bg, border:`1px solid ${P.border}`, borderRadius:8,
              padding:"9px 12px", color:P.text, fontSize:13, outline:"none", boxSizing:"border-box" }} />
      }
    </div>
  );

  return (
    <div style={{ background:P.card, border:`1px solid ${P.border}`, borderRadius:14, padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ color:P.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:4 }}>REVIEW EXTRACTION</div>
          <div style={{ color:P.text, fontSize:18, fontWeight:800 }}>Check & Save</div>
        </div>
        <button onClick={onBack} style={{ background:"none", border:`1px solid ${P.border}`,
          color:P.muted, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>← Back</button>
      </div>
      <div style={{ background:P.tealDim, border:`1px solid ${P.teal}44`, borderRadius:8, padding:"10px 14px", marginBottom:16 }}>
        <div style={{ color:P.teal, fontSize:11, fontWeight:700, marginBottom:3 }}>Extracted {sections.length} sections</div>
        <div style={{ color:P.textSoft, fontSize:11 }}>Review the fields below. Correct any errors before saving — especially chord names and the key.</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
        <div>{inp("SONG TITLE","title")}</div><div>{inp("ARTIST","artist")}</div>
      </div>
      {inp("KEY","key")}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 10px" }}>
        <div>{inp("BPM","bpm","number")}</div>
        <div>{inp("TIME","timeSignature","text",["4/4","3/4","6/8","2/4"])}</div>
        <div>{inp("LEVEL","difficulty","text",["beginner","intermediate","advanced"])}</div>
      </div>
      <div style={{ marginBottom:14 }}>
        <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em", marginBottom:8 }}>EXTRACTED SECTIONS</div>
        {sections.map((s, i) => (
          <div key={i} style={{ background:P.surface, borderRadius:8, padding:"10px 12px",
            border:`1px solid ${P.border}`, marginBottom:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
              <span style={{ color:P.accent, fontSize:12, fontWeight:700 }}>{s.name}</span>
              <span style={{ color:P.muted, fontSize:11 }}>{s.type}</span>
            </div>
            <div style={{ color:P.teal, fontSize:11, fontFamily:"monospace" }}>{(s.chords||[]).join(" · ")}</div>
            {s.lyrics?.lines && <div style={{ color:P.muted, fontSize:10, marginTop:3 }}>{s.lyrics.lines.length} lyric line{s.lyrics.lines.length!==1?"s":""} extracted</div>}
          </div>
        ))}
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em" }}>REFERENCES</div>
          <button onClick={addRef} style={{ background:P.tealDim, border:`1px solid ${P.teal}44`,
            color:P.teal, borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>+ Add</button>
        </div>
        {refs.length === 0 && <div style={{ color:P.muted, fontSize:12, padding:"6px 0" }}>Add YouTube links or source references before saving.</div>}
        {refs.map((ref, i) => (
          <div key={i} style={{ background:P.surface, borderRadius:8, padding:10,
            border:`1px solid ${P.border}`, marginBottom:8 }}>
            <div style={{ display:"flex", gap:8, marginBottom:6, alignItems:"center" }}>
              <select value={ref.type} onChange={e => upRef(i,"type",e.target.value)}
                style={{ background:P.bg, border:`1px solid ${P.border}`, borderRadius:6,
                  padding:"5px 8px", color:P.text, fontSize:11, outline:"none" }}>
                {Object.entries(REF_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button onClick={() => rmRef(i)} style={{ background:"none", border:"none",
                color:P.red, cursor:"pointer", fontSize:14, marginLeft:"auto" }}>✕</button>
            </div>
            {["label","url","note"].map(k => (
              <input key={k} value={ref[k]} onChange={e => upRef(i,k,e.target.value)}
                placeholder={k.charAt(0).toUpperCase()+k.slice(1)}
                style={{ width:"100%", background:P.bg, border:`1px solid ${P.border}`,
                  borderRadius:6, padding:"6px 10px", color:P.text, fontSize:12,
                  outline:"none", boxSizing:"border-box", marginBottom:6 }} />
            ))}
          </div>
        ))}
      </div>
      <button onClick={save}
        style={{ width:"100%", padding:"12px 0", borderRadius:8, fontWeight:800, fontSize:14,
          border:"none", cursor:"pointer", background:P.teal, color:"#0a0a0f" }}>
        ✓ Save Song
      </button>
    </div>
  );
}

// ── ManualEntry ───────────────────────────────────────────────────────────────
export function ManualEntry({ onDone, onClose }) {
  const [form, setForm] = useState({ title:"", artist:"", key:"G Major", bpm:"120",
    timeSignature:"4/4", difficulty:"beginner", chordsRaw:"G C D Em", lyricsRaw:"" });
  const [refs, setRefs] = useState([]);
  const set    = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const addRef = () => setRefs(r => [...r, { type:"original_recording", label:"", url:"", note:"" }]);
  const upRef  = (i, k, v) => setRefs(r => r.map((x, j) => j === i ? { ...x, [k]:v } : x));
  const rmRef  = i => setRefs(r => r.filter((_, j) => j !== i));

  const saveManual = () => {
    const chords = form.chordsRaw.split(/[\s,]+/).filter(Boolean);
    const lyricLines = form.lyricsRaw.trim()
      ? form.lyricsRaw.split("\n").map(l => ({ words:l.split(" ").filter(Boolean), timings:l.split(" ").map((_,i)=>i*0.5) }))
      : [];
    const song = {
      id:`manual_${Date.now()}`, title:form.title, artist:form.artist, key:form.key,
      timeSignature:form.timeSignature, bpm:parseInt(form.bpm)||120, capo:0,
      difficulty:form.difficulty, genre:["unknown"], color:P.gold,
      source:"manual", dataQuality:"manual",
      sourceNote:"User-entered — verify against recording.",
      references:refs.filter(r=>r.url.trim()),
      sections:[{ id:1, name:"Main Section", type:"chord melody",
        bars:"1+", duration:"varies", color:P.accent, chords, status:"not-started",
        technique:"Work through these chords at a comfortable tempo.",
        riffs:[],
        lyrics:lyricLines.length>0?{tip:"Practise lyrics with the chord changes.",chordTimeline:[{chord:chords[0],t:0}],lines:lyricLines}:null,
        referenceNotes:[] }],
    };
    onDone(song);
  };

  const fi = (label, key, type = "text", opts = null) => (
    <div style={{ marginBottom:12 }}>
      <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em", marginBottom:5 }}>{label}</div>
      {opts
        ? <select value={form[key]} onChange={e => set(key, e.target.value)}
            style={{ width:"100%", background:P.bg, border:`1px solid ${P.border}`, borderRadius:8,
              padding:"9px 12px", color:P.text, fontSize:13, outline:"none" }}>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        : type === "textarea"
          ? <textarea value={form[key]} onChange={e => set(key, e.target.value)} rows={4}
              style={{ width:"100%", background:P.bg, border:`1px solid ${P.border}`, borderRadius:8,
                padding:"9px 12px", color:P.text, fontSize:13, outline:"none",
                boxSizing:"border-box", resize:"vertical", fontFamily:"inherit" }} />
          : <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
              style={{ width:"100%", background:P.bg, border:`1px solid ${P.border}`, borderRadius:8,
                padding:"9px 12px", color:P.text, fontSize:13, outline:"none", boxSizing:"border-box" }} />
      }
    </div>
  );

  return (
    <div style={{ background:P.card, border:`1px solid ${P.border}`, borderRadius:14, padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ color:P.muted, fontSize:11, fontWeight:700, letterSpacing:"0.1em", marginBottom:4 }}>MANUAL ENTRY</div>
          <div style={{ color:P.text, fontSize:18, fontWeight:800 }}>Add a Song</div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:`1px solid ${P.border}`,
          color:P.muted, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>✕</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 12px" }}>
        <div>{fi("SONG TITLE","title")}</div><div>{fi("ARTIST","artist")}</div>
      </div>
      {fi("KEY","key")}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 10px" }}>
        <div>{fi("BPM","bpm","number")}</div>
        <div>{fi("TIME","timeSignature","text",["4/4","3/4","6/8","2/4"])}</div>
        <div>{fi("LEVEL","difficulty","text",["beginner","intermediate","advanced"])}</div>
      </div>
      {fi("CHORDS (comma-separated)","chordsRaw")}
      {fi("LYRICS (one line per row)","lyricsRaw","textarea")}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <div style={{ color:P.muted, fontSize:10, fontWeight:700, letterSpacing:"0.1em" }}>REFERENCES</div>
          <button onClick={addRef} style={{ background:P.tealDim, border:`1px solid ${P.teal}44`,
            color:P.teal, borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>+ Add</button>
        </div>
        {refs.length === 0 && <div style={{ color:P.muted, fontSize:12, padding:"8px 0" }}>Add YouTube links or chord chart sources.</div>}
        {refs.map((ref, i) => (
          <div key={i} style={{ background:P.surface, borderRadius:8, padding:10,
            border:`1px solid ${P.border}`, marginBottom:8 }}>
            <div style={{ display:"flex", gap:8, marginBottom:6, alignItems:"center" }}>
              <select value={ref.type} onChange={e => upRef(i,"type",e.target.value)}
                style={{ background:P.bg, border:`1px solid ${P.border}`, borderRadius:6,
                  padding:"5px 8px", color:P.text, fontSize:11, outline:"none" }}>
                {Object.entries(REF_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button onClick={() => rmRef(i)} style={{ background:"none", border:"none",
                color:P.red, cursor:"pointer", fontSize:14, marginLeft:"auto" }}>✕</button>
            </div>
            {["label","url","note"].map(k => (
              <input key={k} value={ref[k]} onChange={e => upRef(i,k,e.target.value)}
                placeholder={k.charAt(0).toUpperCase()+k.slice(1)}
                style={{ width:"100%", background:P.bg, border:`1px solid ${P.border}`,
                  borderRadius:6, padding:"6px 10px", color:P.text, fontSize:12,
                  outline:"none", boxSizing:"border-box", marginBottom:6 }} />
            ))}
          </div>
        ))}
      </div>
      <button onClick={saveManual} disabled={!form.title || !form.artist}
        style={{ width:"100%", padding:"12px 0", borderRadius:8, fontWeight:800, fontSize:14,
          border:"none", cursor:!form.title||!form.artist?"not-allowed":"pointer",
          background:!form.title||!form.artist?P.border:P.gold, color:"#0a0a0f", marginTop:4 }}>
        Add Song
      </button>
    </div>
  );
}

// ── SongLibrary ───────────────────────────────────────────────────────────────
export function SongLibrary({ allSongs, onSelect, onDelete, isMobile, allProgress }) {
  const [filter,  setFilter]  = useState("all");
  const [addMode, setAddMode] = useState(null);
  const [importSchema, setImportSchema] = useState(null);

  const diff     = { beginner:P.teal, intermediate:P.accent, advanced:P.red };
  const filtered = filter==="all"?allSongs:allSongs.filter(s=>s.difficulty===filter||s.source===filter||s.dataQuality===filter);

  if (addMode === "ai")     return <AIGenerator     onDone={s=>{onSelect(s,true);setAddMode(null);}} onClose={()=>setAddMode(null)} />;
  if (addMode === "manual") return <ManualEntry      onDone={s=>{onSelect(s,true);setAddMode(null);}} onClose={()=>setAddMode(null)} />;
  if (addMode === "image")  {
    if (importSchema) return <ReviewSchema schema={importSchema} onSave={s=>{onSelect(s,true);setAddMode(null);setImportSchema(null);}} onBack={()=>setImportSchema(null)} />;
    return <ImageImporter onExtracted={s=>{setImportSchema(s);}} onClose={()=>setAddMode(null)} />;
  }

  return (
    <div>
      <div style={{ marginBottom:20, display:"flex", flexWrap:"wrap", gap:12,
        alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ color:P.muted, fontSize:11, letterSpacing:"0.1em", marginBottom:4 }}>SONG LIBRARY</div>
          <h2 style={{ margin:0, fontSize:isMobile?20:24, fontWeight:800, letterSpacing:"-0.02em" }}>Choose a Song</h2>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={() => setAddMode("ai")}
            style={{ padding:"8px 14px", borderRadius:8, border:`1px solid ${P.purple}`,
              background:P.purple+"22", color:P.purple, fontWeight:700, fontSize:12, cursor:"pointer" }}>✦ AI Generate</button>
          <button onClick={() => setAddMode("image")}
            style={{ padding:"8px 14px", borderRadius:8, border:`1px solid ${P.teal}`,
              background:P.tealDim, color:P.teal, fontWeight:700, fontSize:12, cursor:"pointer" }}>📷 From Images</button>
          <button onClick={() => setAddMode("manual")}
            style={{ padding:"8px 14px", borderRadius:8, border:`1px solid ${P.gold}`,
              background:P.gold+"22", color:P.gold, fontWeight:700, fontSize:12, cursor:"pointer" }}>+ Manual</button>
        </div>
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
        {[["all","All"],["beginner","Beginner"],["intermediate","Intermediate"],["advanced","Advanced"],["ai","AI"],["manual","Manual"]].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ padding:"5px 13px", borderRadius:20,
              border:`1px solid ${filter===v?P.accent:P.border}`,
              background:filter===v?P.accentDim:"transparent",
              color:filter===v?P.accent:P.muted, fontSize:12, fontWeight:700, cursor:"pointer" }}>{l}</button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(270px,1fr))", gap:12 }}>
        {filtered.map(song => {
          const q   = SOURCE_QUALITY[song.dataQuality] || SOURCE_QUALITY.builtin;
          const sp  = allProgress[song.id] || {};
          const tot = song.sections?.length || 0;
          const mas = song.sections?.filter(s => sp[s.id]==="mastered" || s.status==="mastered").length || 0;
          const pct = tot ? Math.round((mas / tot) * 100) : 0;
          return (
            <div key={song.id} onClick={() => onSelect(song)}
              style={{ background:P.card, border:`1px solid ${P.border}`,
                borderLeft:`4px solid ${song.color||P.accent}`, borderRadius:12,
                padding:18, cursor:"pointer", transition:"all 0.2s" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ color:P.text, fontSize:16, fontWeight:800, marginBottom:2,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{song.title}</div>
                  <div style={{ color:P.textSoft, fontSize:13 }}>{song.artist}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end",
                  gap:4, flexShrink:0, marginLeft:8 }}>
                  <span style={{ padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:700,
                    background:(diff[song.difficulty]||P.muted)+"22",
                    color:diff[song.difficulty]||P.muted }}>{song.difficulty}</span>
                  <span style={{ padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:700,
                    background:q.color+"22", color:q.color }}>{q.icon} {q.label}</span>
                </div>
              </div>
              {pct > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ color:P.muted, fontSize:10 }}>Progress</span>
                    <span style={{ color:pct===100?P.teal:P.accent, fontSize:10, fontWeight:700 }}>{pct}%</span>
                  </div>
                  <div style={{ background:P.border, borderRadius:3, height:4 }}>
                    <div style={{ background:pct===100?P.teal:`linear-gradient(90deg,${P.teal},${P.accent})`,
                      width:`${pct}%`, height:"100%", borderRadius:3 }} />
                  </div>
                </div>
              )}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                {[["Key",song.key],["BPM",`${song.bpm}`],["Time",song.timeSignature]].map(([k,v]) => (
                  <div key={k} style={{ background:P.surface, border:`1px solid ${P.border}`, borderRadius:5, padding:"3px 8px" }}>
                    <div style={{ color:P.muted, fontSize:9, fontWeight:700 }}>{k}</div>
                    <div style={{ color:P.text, fontSize:11, fontWeight:600 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:4 }}>
                <div style={{ color:P.muted, fontSize:11 }}>{tot} sections · {(song.genre||[]).join(", ")}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {song.references?.length > 0 && <span style={{ color:P.teal, fontSize:11 }}>{song.references.length} ref{song.references.length>1?"s":""}</span>}
                  {song.source !== "builtin" && (
                    <button onClick={e => { e.stopPropagation(); onDelete(song.id); }}
                      aria-label={`Delete ${song.title}`}
                      style={{ background:"none", border:"none", color:P.red, cursor:"pointer", fontSize:12 }}>✕</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
