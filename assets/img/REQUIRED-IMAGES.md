# Images

All 31 files below **already exist** as branded sample artwork, so the site
renders complete right now. Replace any file with a real photo at the same
path and dimensions — no code change needed.

Regenerate the samples any time with `npm run images`.

## Naming convention

- **Products** — `p{n}-{model-name}.jpg` (e.g. `p4-wt-digital-touch-pin-lock.jpg`)
- **Jobs** — `job-{nn}-{what}-{where}.jpg` (e.g. `job-13-midnight-callout-hougang-hdb.jpg`)

Descriptive filenames are also a small SEO signal for Google Images.

## The full list

| Path | Size | What it shows |
|---|---|---|
| `assets/img/og-cover.jpg` | 1200×630 | Social share card |
| `assets/img/icon-192.png` | 192×192 | PWA icon |
| `assets/img/icon-512.png` | 512×512 | PWA icon |
| `assets/img/icon-maskable.png` | 512×512 | PWA maskable icon (detail inside centre 80%) |
| `assets/img/gallery/p1-traditional-key-letterbox-lock.jpg` | 600×600 | P1 — Silver keyed HDB letterbox lock supplied with two keys |
| `assets/img/gallery/p2-battery-free-combination-lock.jpg` | 600×600 | P2 — Battery-free combination letterbox lock with three dials |
| `assets/img/gallery/p3-combination-backup-key-lock.jpg` | 600×600 | P3 — Combination letterbox lock supplied with a backup key |
| `assets/img/gallery/p4-wt-digital-touch-pin-lock.jpg` | 600×600 | P4 — WT black electronic touch-PIN digital letterbox lock keypad |
| `assets/img/gallery/p5-ergonomic-combination-lock.jpg` | 600×600 | P5 — Easy-grip combination letterbox lock with large dials |
| `assets/img/gallery/p6-zinc-alloy-combination-lock.jpg` | 600×600 | P6 — Silver zinc-alloy combination letterbox lock body |
| `assets/img/gallery/p7-horizontal-digital-lock.jpg` | 600×600 | P7 — Compact horizontal digital letterbox lock for narrow mailbox doors |
| `assets/img/gallery/p8-4-digit-high-security-lock.jpg` | 600×600 | P8 — Black four-digit high-security combination letterbox lock |
| `assets/img/gallery/p9-4-digit-zinc-alloy-lock.jpg` | 600×600 | P9 — Premium silver zinc-alloy four-digit combination letterbox lock |
| `assets/img/gallery/job-01-keyed-replacement-tampines-hdb.jpg` | 800×800 | Keyed replacement · Tampines · HDB |
| `assets/img/gallery/job-02-block-wide-upgrade-punggol-hdb.jpg` | 800×800 | Block-wide upgrade · Punggol · HDB |
| `assets/img/gallery/job-03-combination-upgrade-bishan-condo.jpg` | 800×800 | Combination upgrade · Bishan · Condo |
| `assets/img/gallery/job-04-lost-key-opening-bedok-hdb.jpg` | 800×800 | Lost-key opening · Bedok · HDB |
| `assets/img/gallery/job-05-keyless-conversion-yishun-hdb.jpg` | 800×800 | Keyless conversion · Yishun · HDB |
| `assets/img/gallery/job-06-mcst-bulk-job-woodlands-condo.jpg` | 800×800 | MCST bulk job · Woodlands · Condo |
| `assets/img/gallery/job-07-jammed-lock-jurong-west-hdb.jpg` | 800×800 | Jammed lock · Jurong West · HDB |
| `assets/img/gallery/job-08-digital-install-clementi-condo.jpg` | 800×800 | Digital install · Clementi · Condo |
| `assets/img/gallery/job-09-narrow-door-fit-ang-mo-kio-hdb.jpg` | 800×800 | Narrow-door fit · Ang Mo Kio · HDB |
| `assets/img/gallery/job-10-outdoor-mailbox-serangoon-landed.jpg` | 800×800 | Outdoor mailbox · Serangoon · Landed |
| `assets/img/gallery/job-11-new-build-handover-tengah-bto.jpg` | 800×800 | New-build handover · Tengah · New BTO |
| `assets/img/gallery/job-12-designer-fit-out-sengkang-condo.jpg` | 800×800 | Designer fit-out · Sengkang · Condo |
| `assets/img/gallery/job-13-midnight-callout-hougang-hdb.jpg` | 800×800 | Midnight call-out · Hougang · HDB |
| `assets/img/gallery/job-14-same-day-urgent-pasir-ris-hdb.jpg` | 800×800 | Same-day urgent · Pasir Ris · HDB |
| `assets/img/gallery/job-15-ergonomic-fit-toa-payoh-hdb.jpg` | 800×800 | Ergonomic fit · Toa Payoh · HDB |
| `assets/img/gallery/job-16-landed-gate-post-bukit-timah.jpg` | 800×800 | Gate-post mailbox · Bukit Timah · Landed |
| `assets/img/gallery/job-17-office-mailroom-kallang.jpg` | 800×800 | Office mail room · Kallang · Commercial |
| `assets/img/gallery/job-18-town-council-programme-yishun.jpg` | 800×800 | Town council programme · Yishun · HDB |

## Shooting the real photos

**Products** — square crop, plain light background, lock filling roughly 60% of
the frame, shot straight on. Consistency matters more than styling.

**Jobs** — the finished installation, shot straight on, mailbox door readable.
Avoid faces and unit numbers. If a resident appears, get consent.

The gallery now holds **18 photos in three rows of six**. Keep it at a multiple
of 6 (or 12, 18, 24) so no row is ever left part-empty — the build fails if you
break this.

## After the real photos land

```bash
for f in assets/img/gallery/*.jpg; do
  b="${f%.jpg}"
  for w in 300 600 900; do
    magick "$f" -resize ${w}x -quality 72 "${b}-${w}.avif"
    magick "$f" -resize ${w}x -quality 78 "${b}-${w}.webp"
  done
done
```

Then update `productCard()`, `productDetail()` and `gallerySection()` in
`src/lib/components.mjs` to emit `<picture>`.
