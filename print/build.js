// Builds every print file in print/out from one template.
// Run from the repo root:  node print/build.js
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const DIR = __dirname, OUT = path.join(DIR, "out");
const URL_TXT = "behzad119sarkhosh-web.github.io/masraf-daroo";

// Wording per place. t1/t2 = headline lines (t2 in gold), sub = line under headline.
const VENUES = {
  "pharmacy":  { t1: "داروی‌تان را", gold: "درست", t2: "مصرف کنید", sub: "راهنمای ساده و فارسی مصرف دارو",
                 k: "دوربین گوشی را<br>روی <span>این کد</span> بگیرید", p: "نام داروی‌تان را جست‌وجو کنید و<br>طریقه‌ی درست مصرفش را ببینید." },
  "doctor":    { t1: "نسخه‌تان را گرفتید؟", gold: "درست", t2: "مصرفش کنید", sub: "تا درمان‌تان کامل و بی‌خطر باشد",
                 k: "پیش از رفتن،<br><span>این کد</span> را اسکن کنید", p: "برای هر دارو ببینید کِی، چطور<br>و با چه احتیاطی مصرفش کنید." },
  "clinic":    { t1: "همراه بیمار هستید؟", gold: "درست", t2: "دارو بدهید", sub: "راهنمای مصرف دارو برای بیمار و همراه",
                 k: "دوربین گوشی را<br>روی <span>این کد</span> بگیرید", p: "زمان، روش مصرف و هشدارهای<br>هر دارو را ساده و فارسی ببینید." },
  "elderly":   { t1: "داروی عزیزان‌تان را", gold: "درست", t2: "بدهید", sub: "برای سالمندان و مراقبان‌شان",
                 k: "دوربین گوشی را<br>روی <span>این کد</span> بگیرید", p: "با نوشته‌های درشت و ساده،<br>طریقه‌ی مصرف هر دارو را ببینید." },
};
// One-line headline for the 10 cm desk QR sticker.
const TILE = {
  pharmacy: "داروی‌تان را <b>درست</b> مصرف کنید",
  doctor:   "نسخه‌تان را <b>درست</b> مصرف کنید",
  clinic:   "به بیمارتان <b>درست</b> دارو بدهید",
  elderly:  "داروی عزیزان‌تان را <b>درست</b> بدهید",
};

const CSS = `
/* ---- 100x100 mm desk QR sticker, 2mm bleed ---- */
.tile{position:relative;width:104mm;height:104mm;overflow:hidden;background:var(--ink)}
.tile .ph{position:absolute;inset:0;background:url(${DIR}/photo-print.jpg) 30% 40%/auto 100% no-repeat;opacity:.4}
.tile .ph::after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 55%,rgba(13,10,7,.5),var(--ink) 80%)}
.tile .t-in{position:absolute;inset:7mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center}
.tile .h{font-size:13.5pt;font-weight:700;color:#fff;line-height:1.35;text-shadow:0 .4mm 2mm #000}.tile .h b{color:var(--gold)}
.tile .qr{width:56mm;height:56mm;padding:3mm}
.tile .s{font-size:9.5pt;font-weight:700;color:var(--gold2);line-height:1.5}
.tile .m{font-size:6.5pt;color:#a99d86;line-height:1.5;margin-top:.6mm;font-weight:400}
@font-face{font-family:V;src:url(${DIR}/../fonts/Vazirmatn-Regular.woff2);font-weight:400}
@font-face{font-family:V;src:url(${DIR}/../fonts/Vazirmatn-Bold.woff2);font-weight:700}
@page{margin:0}
:root{--ink:#0d0a07;--gold:#d4b06a;--gold2:#f1dca8;--teal:#0b6e7a;--cream:#f6eedd}
*{box-sizing:border-box}html,body{margin:0;background:var(--ink)}
body{font-family:V;-webkit-print-color-adjust:exact;print-color-adjust:exact;color:var(--cream)}
.tag{font-size:8.5pt;color:var(--gold2);border:.3mm solid rgba(212,176,106,.7);border-radius:20mm;padding:1mm 4.5mm;background:rgba(13,10,7,.45)}
.qr{flex:none;background:#fff;border-radius:4mm;padding:3mm;box-shadow:0 0 0 .8mm var(--gold),0 0 0 2mm rgba(212,176,106,.25)}
.qr img{width:100%;height:100%;display:block}
/* ---- A5 stand (A4 poster = same page zoomed) ---- */
.page{position:relative;width:154mm;height:216mm;overflow:hidden;background:var(--ink)}
.hero{position:absolute;inset:0 0 auto 0;height:118mm;background:url(${DIR}/photo-print.jpg) 22% 40%/auto 100% no-repeat}
.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(13,10,7,.55) 0,rgba(13,10,7,0) 22%,rgba(13,10,7,0) 48%,rgba(13,10,7,.85) 82%,var(--ink) 100%)}
.in{position:absolute;inset:10mm;display:flex;flex-direction:column;align-items:center;text-align:center}
.title{margin-top:57mm;font-size:27pt;font-weight:700;line-height:1.35;color:#fff;text-shadow:0 .6mm 3mm rgba(0,0,0,.7)}
.title b{color:var(--gold)}
.rule{display:flex;align-items:center;gap:3mm;margin-top:2.5mm;color:var(--gold);font-size:9pt}
.rule::before,.rule::after{content:"";width:16mm;height:.3mm;background:linear-gradient(to left,transparent,var(--gold))}
.rule::after{background:linear-gradient(to right,transparent,var(--gold))}
.feats{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;width:100%;margin-top:5.5mm}
.f{border:.3mm solid rgba(212,176,106,.35);border-radius:3mm;padding:3mm 1.5mm 2.5mm;background:rgba(255,255,255,.035)}
.f svg{width:8mm;height:8mm;stroke:var(--gold);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.f div{font-size:9.5pt;font-weight:700;margin-top:1mm;line-height:1.5}
.f small{display:block;font-size:7.5pt;color:#bfb29a;line-height:1.5}
.qrrow{display:flex;align-items:center;gap:6mm;margin-top:6mm;width:100%}
.qrrow .qr{width:46mm;height:46mm}
.cta{flex:1;text-align:right}
.cta .k{font-size:15pt;font-weight:700;color:#fff;line-height:1.45}.cta .k span{color:var(--gold)}
.cta p{margin:2mm 0 0;font-size:9pt;color:#cfc3ab;line-height:1.7}
.pill{display:inline-block;margin-top:2.5mm;font-size:8.5pt;font-weight:700;background:var(--teal);color:#fff;border-radius:20mm;padding:1mm 4mm}
.foot{margin-top:auto;font-size:6.8pt;color:#8f8573;line-height:1.7}.foot b{color:#bfb29a;font-weight:400}
/* ---- 90x50 card, 2mm bleed ---- */
.card{position:relative;width:94mm;height:54mm;overflow:hidden;background:var(--ink)}
.card .ph{position:absolute;inset:0 0 0 auto;width:52mm;background:url(${DIR}/photo-print.jpg) 18% 45%/auto 100% no-repeat}
.card .ph::after{content:"";position:absolute;inset:0;background:linear-gradient(to left,rgba(13,10,7,.15),rgba(13,10,7,.65) 55%,var(--ink))}
.card .c-in{position:absolute;inset:5mm;display:flex;align-items:center;gap:4mm}
.card .qr{width:30mm;height:30mm;padding:1.8mm;border-radius:2.5mm;box-shadow:0 0 0 .6mm var(--gold)}
.card .tx{position:relative;flex:1;text-align:right}
.card .h{font-size:13pt;font-weight:700;line-height:1.4;color:#fff;text-shadow:0 .4mm 2mm #000}.card .h b{color:var(--gold)}
.card .s{font-size:7pt;color:#e6dcc6;margin-top:1.2mm;line-height:1.6;text-shadow:0 .3mm 1.5mm #000}
.card .m{font-size:5.6pt;color:var(--gold2);margin-top:2mm}
`;
const ICONS = `
<div class="f"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><div>کِی بخورم؟</div><small>زمان و فاصله‌ی مصرف</small></div>
<div class="f"><svg viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M9.2 9.2l5.6 5.6"/></svg><div>چطور بخورم؟</div><small>با غذا، ناشتا، قدم‌به‌قدم</small></div>
<div class="f"><svg viewBox="0 0 24 24"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4.5M12 17.3v.2"/></svg><div>مراقب باشم</div><small>نکته‌ها و هشدارها</small></div>`;
const QR = `<div class="qr"><img src="${DIR}/../qr/qr.svg" alt=""></div>`;

const stand = (v, zoom = 1) => `<div class="page" style="zoom:${zoom}"><div class="hero"></div><div class="in">
<div class="tag">به یاد داروخانه‌ی آذربایجان · تبریز</div>
<div class="title">${v.t1}<br><b>${v.gold}</b> ${v.t2}</div><div class="rule">${v.sub}</div>
<div class="feats">${ICONS}</div>
<div class="qrrow">${QR}<div class="cta"><div class="k">${v.k}</div><p>${v.p}</p><span class="pill">رایگان · بدون نصب برنامه</span></div></div>
<div class="foot"><b>این راهنما جایگزین توصیه‌ی پزشک و داروساز نیست.</b><br>${URL_TXT}</div></div></div>`;
const card = () => `<div class="card"><div class="ph"></div><div class="c-in">${QR}<div class="tx">
<div class="h">داروی‌تان را<br><b>درست</b> مصرف کنید</div>
<div class="s">کد را اسکن کنید و طریقه‌ی مصرف<br>هر دارو را ساده و فارسی ببینید.</div>
<div class="m">رایگان · به یاد داروخانه‌ی آذربایجان</div></div></div></div>`;

const tile = (k) => `<div class="tile"><div class="ph"></div><div class="t-in">
<div class="h">${TILE[k]}</div>${QR}
<div class="s">دوربین گوشی را روی کد بگیرید<div class="m">رایگان · بدون نصب · به یاد داروخانه‌ی آذربایجان</div></div></div></div>`;

// name, html, page width/height in mm (bleed included)
const JOBS = [
  ...Object.entries(VENUES).map(([k, v]) => [`stand-A5-${k}`, stand(v), 154, 216]),
  ["poster-A4-waiting-room", stand(VENUES.clinic, 303 / 216), 216, 303],
  ["card-90x50", card(), 94, 54],
  ...Object.keys(TILE).map((k) => [`qr-sticker-10cm-${k}`, tile(k), 104, 104]),
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  for (const [name, body, w, h] of JOBS) {
    const html = `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><style>${CSS}@page{size:${w}mm ${h}mm}</style><body>${body}</body></html>`;
    const px = (mm) => Math.round(mm * 96 / 25.4);
    const p = await b.newPage({ viewport: { width: px(w), height: px(h) }, deviceScaleFactor: 300 / 96 });
    const tmp = path.join(OUT, "." + name + ".html"); fs.writeFileSync(tmp, html);
    await p.goto("file://" + tmp, { waitUntil: "load" }); await p.evaluate(() => document.fonts.ready);
    const ok = await p.evaluate(() => document.fonts.check("700 12pt V") && [...document.images].every(i => i.naturalWidth > 0));
    if (!ok) throw new Error(name + ": font or image failed to load");
    await p.pdf({ path: path.join(OUT, name + ".pdf"), width: w + "mm", height: h + "mm", printBackground: true, preferCSSPageSize: true });
    await p.screenshot({ path: path.join(OUT, name + ".png") });
    fs.unlinkSync(tmp); await p.close(); console.log("built", name);
  }
  await b.close();
})();
