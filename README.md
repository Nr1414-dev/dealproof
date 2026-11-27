# DealProof — 60 verified Black Friday deals, checked 27 Nov 2026

[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

DealProof is a hand-built Black Friday deal finder. **60 deals, 15 all-time
lows, 7 stores, $11,384 total savings, 40% average discount** — every price
re-checked on **27 Nov 2026, 14:40 WIB (07:40 UTC)** against a source that
names the store and the date. Each card prints the price we saw, the store's
own list price, the dollar and percent saving, one line of evidence, and
where we confirmed it — so anyone can check it before buying.

## What is inside

- **Deals (`#/`):** 60 verified deals in 10 categories. Search, category
  pills with counts, store filter, minimum-discount filter, verdict filter
  (including "All-time lows only"), and sorting by best verdict, biggest %
  off, biggest $ saved, or price. Every card links to a **store search
  page** — never a guessed product URL — and shows "Also at …" prices
  where another store is cheaper or tied.
- **Compare stores (`#/compare`):** the same product at two or more stores
  for 10 products, plus a strip of the five biggest price gaps today
  (largest: LG C5 OLED, $299.99 between Best Buy and Amazon).
- **Today-only promos (`#/promos`):** 3 gift-card and giveaway offers that
  run 27 Nov only. These are **not** price cuts, so they are listed
  separately and are not counted in the 60 deals.
- **How we check (`#/how`):** the method, in full — including the 13
  products we dropped during checking because their price or was-price
  could not be verified at a named store.

## How we check

1. Start from the stores' own Black Friday releases and roundups that name
   the store and the date (23–27 Nov 2026).
2. Re-check every price on the day of publishing. If a price moved, update
   it; if it sold out or cannot be confirmed, drop the deal.
3. The was-price is the store's own list price for that exact product.
   Anything whose was-price could not be verified is dropped, not listed.
4. The verdict compares the sale price with the product's 2026 street
   price: **all-time low** (lowest seen this year), **strong** (a real cut
   below street price), **routine** (an ordinary cut). Inflated was-prices
   are dropped, not listed.
5. No product photos — every thumbnail is a plain colour block with the
   category initials. No affiliate codes, no sponsored slots, no paid
   placement. No network requests at runtime; no fonts or scripts from a
   CDN.

## Run it locally

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Plain static files: `app/index.html`, `app/style.css`, `app/data.js`
(the deals, sources and check times), `app/filters.js` (filter/sort logic),
`app/views.js` (rendering), `app/main.js` (hash router). Vanilla JS, no
framework, no build step.

## Hand in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to `/output` and writes `/output/dossier.json` via the vendored
`vendor/makefun-frontend.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots (in `screenshots/`, see `shots.json`):

| File | View |
| ---- | ---- |
| `1-deals.jpg` | Home, desktop 1280×800 — 6 cards with prices, badges, stores, check times |
| `2-compare.jpg` | Cross-store compare, desktop 1280×800 |
| `3-deal-phone.jpg` | Home, phone 390×844 |
| `4-lows.jpg` | Home with "All-time lows only", desktop 1280×800 |

## Note on prices

Prices move fast on Black Friday. The check time printed on every card is
the moment we saw that price; the store page is always the final word.
