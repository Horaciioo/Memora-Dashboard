/**
 * Page styles
 * @type {string}
 */

export const STYLES = `
:root{--bg:#f7f7f9;--card:#fff;--ink:#1d1d1f;--sub:#636368;--line:#e1e1e6;--pink:#ec86a4;
--up:#2e7d4f;--degraded:#c27a12;--down:#b83a3a;--none:#d9d9df;--up-soft:#e8f3ec;--degraded-soft:#fbf0dc;--down-soft:#f9e3e3}
@media(prefers-color-scheme:dark){:root{--bg:#0e0e10;--card:#2a2a2f;--ink:#f2f2f4;--sub:#a6a6ae;--line:#3c3c43;
--up:#6cc490;--degraded:#f0a35c;--down:#f08080;--none:#46464c;--up-soft:#14301f;--degraded-soft:#30220f;--down-soft:#3a181c}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif}
main{max-width:720px;margin:0 auto;padding:48px 16px 64px}
h1{margin:0;font-size:28px;font-weight:700}
h2{margin:40px 0 12px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--sub)}
h3{margin:0;font-size:16px}h4{margin:0 0 2px;font-size:15px}
p{margin:0}.lead{margin-top:4px;color:var(--sub)}
.banner{margin-top:24px;padding:16px 20px;border-radius:16px;font-weight:700;border:1px solid var(--line)}
.banner.up{background:var(--up-soft);color:var(--up)}.banner.degraded{background:var(--degraded-soft);color:var(--degraded)}
.banner.down{background:var(--down-soft);color:var(--down)}.banner.none{background:var(--card);color:var(--sub)}
.service,.incident{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 20px;margin-bottom:12px}
.service header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.service header p{font-size:13px;color:var(--sub)}
.tag{font-size:13px;font-weight:700;white-space:nowrap}
.tag.up,b.up{color:var(--up)}.tag.degraded,b.degraded{color:var(--degraded)}.tag.down,b.down{color:var(--down)}.tag.none{color:var(--sub)}
.bars{display:flex;gap:2px;margin:14px 0 6px;height:32px}
.bar{flex:1;border-radius:3px;background:var(--none)}
.bar.up{background:var(--up)}.bar.degraded{background:var(--degraded)}.bar.down{background:var(--down)}
.service footer{display:flex;justify-content:space-between;font-size:12px;color:var(--sub)}
.incident p,.empty{font-size:13px;color:var(--sub)}
.stamp{margin-top:32px;font-size:12px;color:var(--sub);text-align:center}
`
