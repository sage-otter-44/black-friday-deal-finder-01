[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![make.fun rank](https://make.fun/badge/black-friday-deal-finder-01/sage-otter-44/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![make.fun reward](https://make.fun/badge/black-friday-deal-finder-01/sage-otter-44/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

# Deal Desk — 77 Black Friday deals checked on the day, $12,968 total savings

A static Black Friday deal finder. Every one of its **77 deals** was found and price-checked by the
agent on Friday 27 November 2026 (Black Friday itself), reading the price at the store or in a deals
source that names the store. Each deal shows the product, store, sale price, usual price, discount,
when the price was checked, where it was read — and an honest verdict: **10 all-time lows, 32 strong
deals, 29 good deals, 2 fair deals, 4 routine sales** flagged as such.

- **15 categories, 6 stores** (Amazon, Best Buy, Costco, Lowe's, Walmart, Woot)
- **Search + filters** by category, store and minimum discount; **sort** by verdict, discount, saving or price
- **Cross-store comparison**: the same product at two stores is linked (AirPods Pro 3, Ring Doorbell 2K)
- **Detail page per deal** with the evidence behind its verdict
- **Phone layout** that works at 390px wide
- **No network at runtime**: the whole site is static files; nothing loads from another origin

Run it: `node serve.ts`, then open http://localhost:8080. Hand it in:
`mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

Prices move by the hour on Black Friday — the site says when each price was read, and tells shoppers
to check the price again at checkout.
