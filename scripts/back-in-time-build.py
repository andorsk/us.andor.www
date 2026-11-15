#!/usr/bin/env python3
"""Build /back-in-time/: a master timeline page and one story page per era, each styled after its era.

    python3 scripts/back-in-time-build.py      (writes public/back-in-time/**/index.html)

Content lives in scripts/back_in_time_data.py. The 1840–1859 era is the hand-made page at /1854/.
"""

import html
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from back_in_time_data import ERAS, ME  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "public" / "back-in-time"

# theme: google fonts query, title font, body font, colours, extra css, color-scheme
T = {
    "woodcut": dict(f="IM+Fell+DW+Pica:ital@0;1&family=IM+Fell+DW+Pica+SC", tf="'IM Fell DW Pica SC', serif", bf="'IM Fell DW Pica', serif",
                    bg="#E9DFC6", ink="#231C12", mut="#6A5C44", acc="#8A2A1A", card="#F1E8D2",
                    x=".mast{border:3px double var(--ink);padding:18px}.mast h1{letter-spacing:.04em}"),
    "logbook": dict(f="IM+Fell+English:ital@0;1&family=IM+Fell+Double+Pica+SC&family=Homemade+Apple", tf="'IM Fell Double Pica SC', serif", bf="'IM Fell English', serif",
                    bg="#D9C49A", ink="#2B1E10", mut="#5E4A2C", acc="#6A3A12", card="#E4D3AE",
                    x="body{background-image:repeating-linear-gradient(transparent 0 31px,rgba(43,30,16,.12) 31px 32px)}.when{font-family:'Homemade Apple',cursive;font-size:15px;text-transform:none;letter-spacing:0}"),
    "regency": dict(f="Playfair+Display:ital,wght@0,600;1,500&family=Libre+Baskerville:ital@0;1", tf="'Playfair Display', serif", bf="'Libre Baskerville', serif",
                    bg="#F4EEE2", ink="#22201C", mut="#6A6358", acc="#1E3A5F", card="#FBF7EE", x=".mast h1{font-style:italic}"),
    "journal": dict(f="Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Libre+Caslon+Display", tf="'Libre Caslon Display', serif", bf="'Libre Caslon Text', serif",
                    bg="#F2EFE6", ink="#1E1C18", mut="#615B50", acc="#6A1F1F", card="#FAF8F1", x=".mast{border-top:4px double var(--ink);border-bottom:4px double var(--ink);padding:14px 0}"),
    "frontier": dict(f="Rye&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400", tf="'Rye', serif", bf="'Old Standard TT', serif",
                     bg="#EDE0C4", ink="#2A1E14", mut="#6E5A40", acc="#9A2A1A", card="#F4EAD4", x=".mast{border:4px solid var(--ink);outline:2px solid var(--ink);outline-offset:4px;padding:18px}"),
    "poster": dict(f="Abril+Fatface&family=Lora:ital@0;1", tf="'Abril Fatface', serif", bf="'Lora', serif",
                   bg="#F3E5C8", ink="#1E2A2E", mut="#5E6460", acc="#1F4E5A", card="#FAF0DA", x=".mast{border:2px solid var(--acc);border-radius:14px;padding:20px;box-shadow:inset 0 0 0 6px var(--bg),inset 0 0 0 8px var(--acc)}"),
    "almanac": dict(f="Alfa+Slab+One&family=Merriweather:ital,wght@0,400;0,700;1,400", tf="'Alfa Slab One', serif", bf="'Merriweather', serif",
                    bg="#F2E6CF", ink="#22261C", mut="#5E6450", acc="#2E5E2E", card="#F8EFDD", x="body{font-size:18px}"),
    "warposter": dict(f="Oswald:wght@500;700&family=Source+Serif+4:ital@0;1", tf="'Oswald', sans-serif", bf="'Source Serif 4', serif",
                      bg="#E9E2D0", ink="#1C2E4A", mut="#4E5A6A", acc="#B22222", card="#F3EEE2", x=".mast h1{text-transform:uppercase;letter-spacing:.03em}.mast{border-top:14px solid var(--acc);padding-top:14px}"),
    "deco": dict(f="Poiret+One&family=Cormorant+Garamond:ital,wght@0,500;1,500", tf="'Poiret One', sans-serif", bf="'Cormorant Garamond', serif",
                 bg="#0F1A1A", ink="#EDE3C8", mut="#A99E80", acc="#D4AF37", mc="#8A6A10", card="#16262A", dark=True,
                 x="body{font-size:21px}.mast{border:1px solid var(--acc);padding:22px;background:linear-gradient(135deg,transparent 48%,rgba(212,175,55,.08) 50%,transparent 52%)}.mast h1{letter-spacing:.08em;font-weight:400}"),
    "pulp": dict(f="Archivo+Black&family=Crimson+Pro:ital@0;1", tf="'Archivo Black', sans-serif", bf="'Crimson Pro', serif",
                 bg="#F7E9C6", ink="#1A1A1A", mut="#5E5240", acc="#C8102E", card="#FFF3D6", x=".mast{background:var(--acc);color:#FFF6E0;padding:20px;transform:rotate(-.6deg)}.mast .when,.mast .dek{color:#FFE6B0}"),
    "mechanics": dict(f="Staatliches&family=Libre+Franklin:ital,wght@0,400;0,600;1,400", tf="'Staatliches', sans-serif", bf="'Libre Franklin', sans-serif",
                      bg="#EAE4D3", ink="#1E2228", mut="#5A5E64", acc="#D35400", card="#F3EFE4",
                      x="body{font-size:18px}.box{background:#1F3A5F;color:#E6F0FF;border-color:#9FC0E8;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:16px 16px}.box h3{color:#FFD08A}"),
    "atomic": dict(f="Righteous&family=Nunito:ital,wght@0,400;0,700;1,400", tf="'Righteous', sans-serif", bf="'Nunito', sans-serif",
                   bg="#F6F1E3", ink="#22313A", mut="#5E6A70", acc="#E8505B", card="#FFFFFF", x="body{font-size:18px}.mast{background:#14B8A6;color:#fff;border-radius:40px 4px 40px 4px;padding:24px}.mast .when,.mast .dek{color:#E9FFFB}"),
    "swiss": dict(f="Archivo:wght@400;800&family=Inter:wght@400;600", tf="'Archivo', sans-serif", bf="'Inter', sans-serif",
                  bg="#FFFFFF", ink="#111111", mut="#666666", acc="#E30613", card="#F4F4F4", x="body{font-size:18px}.mast h1{font-weight:800;letter-spacing:-.02em}.mast{text-align:left;border-left:12px solid var(--acc);padding-left:18px}"),
    "groovy": dict(f="Shrikhand&family=Fraunces:ital,wght@0,400;1,400", tf="'Shrikhand', serif", bf="'Fraunces', serif",
                   bg="#F4E3C1", ink="#3B2416", mut="#7A5A3A", acc="#D2691E", card="#FAEDD2", x=".mast{background:linear-gradient(180deg,#E2A52B 0 33%,#D2691E 33% 66%,#8B3A1A 66%);color:#FFF4DC;border-radius:24px;padding:24px}.mast .when,.mast .dek{color:#FFF4DC}"),
    "terminal": dict(f="VT323", tf="'VT323', monospace", bf="'VT323', monospace", bg="#050A05", ink="#7CFF7C", mut="#3FAF3F", acc="#B6FFB6", mc="#1E7A1E", card="#0A140A", dark=True,
                     x="body{font-size:23px;text-shadow:0 0 6px rgba(124,255,124,.45)}body::after{content:'';position:fixed;inset:0;pointer-events:none;background:repeating-linear-gradient(transparent 0 2px,rgba(0,0,0,.25) 2px 3px)}.mast h1::before{content:'> '}.story p:first-of-type::first-letter{font-size:inherit;float:none;margin:0;color:inherit}"),
    "earlyweb": dict(f="", tf="'Times New Roman', Times, serif", bf="'Times New Roman', Times, serif", bg="#C0C0C0", ink="#000000", mut="#333333", acc="#0000EE", card="#FFFFFF",
                     x=".sheet{background:#fff;border:3px outset #dfdfdf;padding:18px}.mast{background:linear-gradient(90deg,#000080,#1084d0);color:#fff;padding:10px 14px;text-align:left}.mast .when,.mast .dek{color:#fff}.box{border:3px inset #dfdfdf}a{color:#0000EE}a:visited{color:#551A8B}.story p:first-of-type::first-letter{float:none;font-size:inherit;margin:0;color:inherit}"),
    "glossy": dict(f="Varela+Round", tf="'Varela Round', 'Trebuchet MS', sans-serif", bf="'Trebuchet MS', 'Varela Round', sans-serif", bg="#E8F4FF", ink="#1E2B3A", mut="#55657A", acc="#2B7BD8", card="#FFFFFF",
                   x="body{font-size:18px;background:linear-gradient(180deg,#FFFFFF,#D6EBFF)}.mast{background:linear-gradient(180deg,#5AA8FF,#1F6FD1 50%,#1A5FB8 51%,#2B7BD8);color:#fff;border-radius:16px;padding:22px;box-shadow:0 8px 20px rgba(31,111,209,.35)}.mast .when,.mast .dek{color:#E6F2FF}.box{border-radius:14px;box-shadow:0 4px 14px rgba(0,0,0,.1)}"),
    "flat": dict(f="Roboto:ital,wght@0,400;0,500;0,700;1,400", tf="'Roboto', sans-serif", bf="'Roboto', sans-serif", bg="#FAFAFA", ink="#212121", mut="#616161", acc="#2196F3", card="#FFFFFF",
                 x="body{font-size:18px}.mast{background:var(--acc);color:#fff;padding:24px;border-radius:2px;box-shadow:0 2px 6px rgba(0,0,0,.2);text-align:left}.mast .when,.mast .dek{color:#E3F2FD}.box{border:0;box-shadow:0 1px 4px rgba(0,0,0,.18);border-radius:2px}"),
    "modern": dict(f="Inter:wght@400;600;800", tf="'Inter', sans-serif", bf="'Inter', sans-serif", bg="#0B0B0F", ink="#ECECF1", mut="#9A9AA8", acc="#8B7BFF", card="#15151C", dark=True,
                   x="body{font-size:18px}.mast{text-align:left;background:radial-gradient(circle at 20% 0%,rgba(139,123,255,.25),transparent 60%);border:1px solid #26263A;border-radius:20px;padding:24px}.mast h1{font-weight:800;letter-spacing:-.03em}.box{border-radius:16px;border-color:#2A2A3A}"),
    "broadsheet": dict(f="", tf="serif", bf="serif", bg="#EFE6D2", ink="#1F1A14", mut="#5E5444", acc="#7A1E14", card="#F5EEDD", x=""),
}

# simple engraving-ish line icons, 64x64, stroke = currentColor
I = {
    "cow": '<path d="M12 30c0-8 8-12 20-12s20 4 20 12v8c0 6-6 10-20 10S12 44 12 38z"/><path d="M14 22l-6-6M50 22l6-6"/><circle cx="26" cy="30" r="2"/><circle cx="38" cy="30" r="2"/><path d="M26 40c4 3 8 3 12 0"/><path d="M20 48v8M44 48v8"/>',
    "lemon": '<path d="M10 34c0-12 10-20 22-20s22 8 22 20-10 18-22 18S10 46 10 34z"/><path d="M8 34h-4M56 34h4"/><path d="M32 14c2-6 8-8 12-6-2 4-6 6-12 6z"/><path d="M20 30q12-8 24 0" opacity=".6"/>',
    "basin": '<path d="M8 30h48c0 14-10 22-24 22S8 44 8 30z"/><path d="M14 30c4-4 32-4 36 0"/><path d="M28 10c-6 8-6 12 0 14 6-2 6-6 0-14z"/><path d="M24 52v6h16v-6"/>',
    "flask": '<path d="M26 8h12M28 8v14L14 50c-2 4 0 8 6 8h24c6 0 8-4 6-8L36 22V8"/><path d="M20 42h24"/><path d="M42 14c6-2 10 0 12 4" opacity=".6"/>',
    "cup": '<path d="M14 22h30v20c0 8-6 12-15 12s-15-4-15-12z"/><path d="M44 28h6c4 0 4 10 0 10h-6"/><path d="M24 14c0-4 4-4 4-8M32 14c0-4 4-4 4-8"/>',
    "mosquito": '<path d="M32 22v28"/><ellipse cx="32" cy="38" rx="4" ry="12"/><path d="M28 30L10 18M36 30l18-12M28 36L12 44M36 36l16 8M28 42L16 56M36 42l12 14"/><path d="M32 22l0-14"/><path d="M28 26c-10-10-16-6-18-2M36 26c10-10 16-6 18-2" opacity=".6"/>',
    "bottle": '<path d="M26 6h12v8l4 6v34c0 2-2 4-4 4H26c-2 0-4-2-4-4V20l4-6z"/><path d="M22 30h20"/><path d="M28 2h8v4h-8z"/><path d="M26 38h12M26 46h12" opacity=".5"/>',
    "corn": '<path d="M32 8c8 6 10 18 8 32-2 10-6 16-8 16s-6-6-8-16c-2-14 0-26 8-32z"/><path d="M28 18h8M27 26h10M27 34h10M28 42h8"/><path d="M24 54c-8-4-12-14-10-24M40 54c8-4 12-14 10-24"/>',
    "window": '<rect x="12" y="8" width="40" height="48"/><path d="M32 8v48M12 32h40"/><path d="M4 24c6 2 6 8 0 10M4 40c6 2 6 8 0 10" opacity=".7"/><path d="M58 22c-6 2-6 8 0 10" opacity=".7"/>',
    "dish": '<ellipse cx="32" cy="36" rx="26" ry="12"/><ellipse cx="32" cy="32" rx="26" ry="12"/><circle cx="26" cy="31" r="5"/><circle cx="26" cy="31" r="10" stroke-dasharray="2 3"/><path d="M42 28h2M46 34h2M38 36h2"/>',
    "cigarette": '<rect x="6" y="36" width="44" height="8"/><path d="M40 36v8"/><path d="M54 30c-4-4 0-8-4-12M58 28c-4-4 0-8-4-12" opacity=".6"/><circle cx="32" cy="40" r="22" opacity=".35"/><path d="M16 24l32 32" opacity=".5"/>',
    "belt": '<path d="M16 8l32 44"/><path d="M8 50h48"/><rect x="40" y="44" width="14" height="12" rx="2"/><path d="M14 4l6 2-2 6"/><path d="M8 30c4-2 8-2 10 2" opacity=".6"/>',
    "pump": '<rect x="14" y="14" width="24" height="42" rx="3"/><rect x="18" y="20" width="16" height="12"/><path d="M38 24h8l6 6v18c0 4 4 4 4 0V30"/><path d="M10 56h32"/><path d="M22 42h8" opacity=".6"/>',
    "curve": '<path d="M6 56h52M6 56V8"/><path d="M8 50l6-2 4 3 6-4 4 2 6-5 4 2 6-7 4 1 6-10 4-1"/><circle cx="54" cy="14" r="2"/>',
    "drop": '<path d="M32 6C24 20 16 30 16 40a16 16 0 0032 0c0-10-8-20-16-34z"/><path d="M24 40a8 8 0 008 8" opacity=".6"/>',
    "key": '<circle cx="20" cy="32" r="10"/><path d="M30 32h28M50 32v8M44 32v6"/><circle cx="20" cy="32" r="3"/>',
    "pill": '<rect x="10" y="24" width="44" height="16" rx="8"/><path d="M32 24v16"/><path d="M16 50l-4 6M48 50l4 6" opacity=".5"/>',
    "strand": '<path d="M12 8c20 8 20 16 0 24s-20 16 0 24M52 8c-20 8-20 16 0 24s20 16 0 24"/><path d="M18 14h28M22 20h20M22 44h20M18 50h28"/>',
    "plane": '<path d="M4 34l20-4 16-20h6l-8 20 18-2 4-6h4l-2 10 2 10h-4l-4-6-18-2 8 20h-6L24 34z"/>',
    "air": '<path d="M6 22h34a6 6 0 10-6-6M6 34h46a6 6 0 11-6 6M6 46h24"/><circle cx="50" cy="20" r="2" opacity=".6"/><circle cx="56" cy="30" r="1.5" opacity=".6"/>',
}


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def icon(k: str, size: int = 64, sw: float = 2.2) -> str:
    return (f'<svg viewBox="0 0 64 64" width="{size}" height="{size}" fill="none" stroke="currentColor" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{I[k]}</svg>')


def mine(e: dict) -> str:
    m = ME[e["slug"]]
    kit = "".join(f"<li>{esc(k)}</li>" for k in m["kit"])
    return (f'<section class="me" aria-labelledby="me-{e["slug"]}"><div class="k">And for myself: a good life in {esc(e["era"].replace("The ", "the "))}</div>'
            f'<h3 id="me-{e["slug"]}">{esc(m["title"])}</h3><p>{esc(m["text"])}</p><ul>{kit}</ul>'
            f'<p class="small">{esc(m["fact"])} Hindsight, not advice.</p></section>')


def href(e: dict) -> str:
    return e.get("href") or f"/back-in-time/{e['slug']}/"


BASE_CSS = """
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:19px/1.65 var(--bf)}
a{color:var(--acc)}
.sheet{width:min(760px,100%);margin:0 auto;padding:22px 18px 56px}
.top{display:flex;justify-content:space-between;gap:10px;font-size:14px;margin-bottom:18px}
.top a{text-decoration:none}
.mast{text-align:center;margin-bottom:22px}
.when{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.mast h1{margin:6px 0 6px;font:400 clamp(34px,7.4vw,62px)/1.04 var(--tf)}
.dek{margin:0 auto;max-width:44ch;font-style:italic;color:var(--mut);font-size:19px}
.ico{display:flex;justify-content:center;color:var(--acc);margin:4px 0 18px}
.story p{margin:0 0 15px}
.story p:first-of-type::first-letter{float:left;font:400 3.6em/.86 var(--tf);margin:.06em .1em 0 0;color:var(--acc)}
.box{border:2px solid var(--acc);background:var(--card);padding:14px 18px;margin:22px 0;border-radius:6px}
.box h3{margin:0 0 6px;font:400 22px var(--tf);color:var(--acc)}
.box ol{margin:0;padding-left:1.3em}.box li{margin:3px 0}
h2{font:400 26px var(--tf);margin:34px 0 10px;color:var(--acc)}
.why p{margin:0 0 12px}.why ul{padding-left:1.2em}.why li{margin-bottom:7px}
.small{font-size:15px;color:var(--mut)}
.me{margin:26px 0;padding:16px 18px;border-radius:8px;background:color-mix(in srgb,var(--acc) 10%,var(--card));border:1px dashed var(--acc)}
.me .k{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.me h3{margin:2px 0 8px;font:400 26px/1.15 var(--tf);color:var(--acc)}
.me p{margin:0 0 8px}.me ul{margin:0 0 8px;padding-left:1.2em}
.nav{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid color-mix(in srgb,var(--ink) 25%,transparent);margin-top:30px;padding-top:14px;font-size:16px}
.nav a{text-decoration:none}
"""


def page(e: dict, prev: dict | None, nxt: dict | None) -> str:
    t = T[e["theme"]]
    fonts = f'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family={t["f"]}&display=swap">' if t["f"] else ""
    css = (f":root{{color-scheme:{'dark' if t.get('dark') else 'light'};--bg:{t['bg']};--ink:{t['ink']};--mut:{t['mut']};--acc:{t['acc']};--card:{t['card']};"
           f"--tf:{t['tf']};--bf:{t['bf']}}}" + BASE_CSS + t["x"])
    story = "".join(f"<p>{p}</p>" for p in e["story"])
    box = f'<div class="box"><h3>{esc(e["box"][0])}</h3><ol>{"".join(f"<li>{esc(x)}</li>" for x in e["box"][1])}</ol></div>'
    why = "".join(f"<p>{p}</p>" for p in e["why"])
    me = mine(e)
    facts = "".join(f"<li>{f}</li>" for f in e["facts"])
    src = " · ".join(f'<a href="{esc(u)}">{esc(lbl)}</a>' for lbl, u in e["sources"])
    pv = f'<a href="{href(prev)}">← {esc(prev["era"])}</a>' if prev else "<span></span>"
    nx = f'<a href="{href(nxt)}">{esc(nxt["era"])} →</a>' if nxt else "<span></span>"
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="{t['bg']}">
<meta name="description" content="{esc(e['era'])}: if I could carry one thing back, it would be this. {esc(e['thing'])}">
<title>{esc(e['title'])} · One Thing Back</title>
{fonts}
<style>{css}</style>
</head>
<body>
<article class="sheet">
  <div class="top"><a href="/back-in-time/">← One Thing Back: all eras</a><span>{esc(e['era'])}</span></div>
  <header class="mast">
    <div class="when">{esc(e['when'])} · {esc(e['where'])}</div>
    <h1>{esc(e['title'])}</h1>
    <p class="dek">{esc(e['thing'])}</p>
  </header>
  <div class="ico">{icon(e['icon'], 72, 1.8)}</div>
  <section class="story">{story}</section>
  {box}
  {me}
  <section class="why">
    <h2>A note on why</h2>
    {why}
    <ul>{facts}</ul>
    <p><b>Runners-up for this era:</b> {esc(e['runners'])}</p>
    <p class="small">{esc(e['real'])} This is a story about history, not medical, legal or safety advice.</p>
    <p class="small">Further reading: {src}</p>
  </section>
  <nav class="nav" aria-label="Eras">{pv}<a href="/back-in-time/">All eras</a>{nx}</nav>
</article>
</body>
</html>
"""


def master() -> str:
    cards = []
    for e in ERAS:
        t = T[e["theme"]]
        cards.append(f"""<li class="era" style="--a:{t.get('mc', t['acc'])};--bgc:{t['bg']};--inkc:{t['ink']}">
      <a href="{href(e)}">
        <span class="yr">{esc(e['era'])}</span>
        <span class="chip">{icon(e['icon'], 40, 2.4)}</span>
        <span class="txt"><b>{esc(e['title'])}</b><span>{esc(e['thing'])}</span><span class="mine"><i>For me:</i> {esc(ME[e['slug']]['title'])}</span><small>{esc(e['when'])} · {esc(e['where'])}</small></span>
      </a></li>""")
    jump = "".join(f'<a href="{href(e)}" style="--a:{T[e["theme"]].get("mc", T[e["theme"]]["acc"])}">{esc(e["era"].replace("The ", ""))}</a>' for e in ERAS)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#F5F1E8">
<meta name="description" content="If you could carry one thing back in time, what would it be? Twenty eras from the 1600s to the 2020s, twenty answers, each told as a short story.">
<title>One Thing Back</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,400&family=Inter:wght@400;600&display=swap">
<style>
:root{{color-scheme:light;--bg:#F5F1E8;--ink:#1D1B17;--mut:#6B655A;--line:#D8D0BE;--card:#FFFDF8}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{color-scheme:dark;--bg:#14130F;--ink:#EEE8DA;--mut:#A39C8C;--line:#34302A;--card:#1C1A16}}}}
:root[data-theme="dark"]{{color-scheme:dark;--bg:#14130F;--ink:#EEE8DA;--mut:#A39C8C;--line:#34302A;--card:#1C1A16}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font:17px/1.55 Inter,system-ui,sans-serif}}
.wrap{{width:min(920px,100%);margin:0 auto;padding:28px 16px 64px}}
.top{{font-size:14px}} .top a{{color:var(--mut);text-decoration:none}}
h1{{font:700 clamp(44px,10vw,92px)/.95 Fraunces,serif;letter-spacing:-.02em;margin:22px 0 12px}}
.lede{{font:italic 400 clamp(19px,2.6vw,23px)/1.45 Fraunces,serif;color:var(--mut);max-width:40ch;margin:0 0 18px}}
.rules{{font-size:15px;color:var(--mut);max-width:62ch}}
.jump{{display:flex;flex-wrap:wrap;gap:6px;margin:22px 0 30px}}
.jump a{{font-size:13px;font-weight:600;text-decoration:none;color:var(--ink);border:1px solid var(--line);border-left:4px solid var(--a);border-radius:6px;padding:4px 8px;background:var(--card)}}
.jump a:hover,.jump a:focus-visible{{border-color:var(--a)}}
ol.line{{list-style:none;margin:0;padding:0;position:relative}}
ol.line::before{{content:"";position:absolute;left:118px;top:0;bottom:0;width:2px;background:var(--line)}}
.era a{{display:grid;grid-template-columns:100px 40px 1fr;gap:18px;align-items:start;padding:14px 0;color:inherit;text-decoration:none}}
.yr{{font:700 18px/1.2 Fraunces,serif;text-align:right;padding-top:9px}}
.chip{{width:40px;height:40px;border-radius:50%;background:var(--bgc);color:var(--a);display:grid;place-items:center;position:relative;z-index:1;box-shadow:0 0 0 4px var(--bg),0 0 0 5px var(--a)}}
.chip svg{{width:26px;height:26px}}
.txt{{display:grid;gap:3px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;transition:border-color .15s,transform .15s}}
.era a:hover .txt,.era a:focus-visible .txt{{border-color:var(--a);transform:translateX(3px)}}
.era a:focus-visible{{outline:none}} .era a:focus-visible .txt{{outline:2px solid var(--a);outline-offset:2px}}
.txt b{{font:700 21px/1.2 Fraunces,serif;color:var(--a)}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]) .txt b{{filter:brightness(1.5)}}}}
.txt small{{color:var(--mut);font-size:13px}}
.mine{{font-size:15px;color:var(--mut)}} .mine i{{font-style:normal;font-weight:600;color:var(--a)}}
@media (max-width:620px){{ol.line::before{{left:20px}}.era a{{grid-template-columns:40px 1fr;gap:12px}}.yr{{grid-column:2;text-align:left;padding:0;font-size:16px}}.chip{{grid-row:1/3;grid-column:1}}.txt{{grid-column:2}}}}
.foot{{margin-top:34px;font-size:14px;color:var(--mut)}} .foot a{{color:var(--ink)}}
</style>
</head>
<body>
<main class="wrap">
  <div class="top"><a href="/">← andor.us</a></div>
  <h1>One Thing Back</h1>
  <p class="lede">If you could carry one thing back in time (a technology, a piece of knowledge, an idea, a habit), what would it be?</p>
  <p class="rules">Two answers for every era. <b>For the world:</b> one technology or piece of knowledge that era could use straight away, told as a short story set in its time and styled like it. <b>For me:</b> the idea, habit or bit of hindsight that would give me a good life there. One era per century until 1800, then every twenty years, then every decade. Each page has the real history underneath.</p>
  <nav class="jump" aria-label="Jump to an era">{jump}</nav>
  <ol class="line">{''.join(cards)}</ol>
  <p class="foot">The stories are fiction; the notes are history, with sources on each page. None of it is medical or financial advice. By <a href="/">Andor</a>.</p>
</main>
</body>
</html>
"""


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "index.html").write_text(master())
    for i, e in enumerate(ERAS):
        if e.get("href"):
            continue
        d = OUT / e["slug"]
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(page(e, ERAS[i - 1] if i else None, ERAS[i + 1] if i + 1 < len(ERAS) else None))
    print(f"wrote {OUT}: master + {sum(1 for e in ERAS if not e.get('href'))} eras")


if __name__ == "__main__":
    main()
