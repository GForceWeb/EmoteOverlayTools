# Hosting and market research

Research date: 7 October 2026. All provider costs below are US dollars per month unless labeled A$. These are planning models, not measured production bills or revenue forecasts. The HTML report may show A$ using an explicit illustrative exchange rate of US$1 = A$1.50, which is not a live quote.

## What the decision actually changes

A hosted overlay still runs its DOM, animation, and image rendering inside the streamer's OBS browser source. The server receives Twitch events, stores settings, and sends small messages. No video encoding or stream delivery is required in this model. Hosting therefore buys easier onboarding, saved settings, remote control, consistent upgrades, and subscription enforcement. It does not remove OBS configuration or the user's rendering load.

The attractive cloud implementation is Twitch EventSub webhook ingress into Workers, channel routing through Durable Objects, settings and encrypted token records in D1, and uploaded assets in R2. OBS and preview clients connect to hibernating server-side WebSockets. Filter and rate-limit irrelevant or excessive events before producing animation triggers. Do not write every chat message into the database. Subscribe to channels while overlays are active rather than collecting idle channels continuously.

## Verified Cloudflare rates

Workers Paid has a US$5 monthly account minimum, 10 million requests and 30 million CPU milliseconds included. Additional usage costs US$0.30 per million requests and US$0.02 per million CPU milliseconds. Static asset requests are free; only a WebSocket's initial upgrade counts as a Worker request. Data transfer has no additional fee. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), accessed 7 October 2026, page updated 2 October 2026.

Durable Objects include 1 million requests and 400,000 GB-seconds per month. Excess costs US$0.15 per million requests and US$12.50 per million GB-seconds. Excess is rounded up to whole billing units. Outgoing WebSocket messages are free; incoming WebSocket messages receive a 20:1 billing ratio. HTTP and RPC calls do not receive that ratio. Allocation is 128 MB per object, and the provider's worked examples use 0.128 GB. SQLite-backed object storage includes 5 GB, then US$0.20 per GB-month. [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/), accessed 7 October 2026.

R2 Standard includes 10 GB-month storage, 1 million Class A writes, and 10 million Class B reads per month. Excess storage costs US$0.015 per GB-month; excess writes US$4.50 per million; excess reads US$0.36 per million. Internet egress is free. Usage rounds up to billing units. [R2 pricing](https://developers.cloudflare.com/r2/pricing/), accessed 7 October 2026.

D1 Paid includes 25 billion row reads, 50 million row writes, and 5 GB storage. Excess costs US$0.001 per million reads, US$1 per million writes, and US$0.75 per GB-month. Indexed settings and token data fit inside these allowances in the model below. [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), accessed 7 October 2026.

## Cost model aligned with the report

Assumptions, not observations:

- N means registered streamers. MAU = 50% of N.
- Each MAU uses the overlay for 60 stream-hours per month.
- Ingest 0.1 Twitch events per second per active channel, or 360 per hour. This includes chat, whether or not it triggers an animation.
- Each incoming event invokes one Worker and one Durable Object. Worker CPU averages 5 ms and object active wall time averages 10 ms.
- Two OBS or preview clients per active channel. Only 10% of incoming events produce normalized triggers, sent to both clients.
- Average uploaded asset storage is 100 MB per registered account. Config and token database storage is 10 KB per account. No retained chat history.
- R2 writes are 20 per registered account per month; reads are 2,000 per MAU per month. Both remain within the quoted allowances.
- A month has 720 hours. Average simultaneously active channels = MAU x 60 / 720. A planning peak is 20% of registered users.
- Formula omits small control-plane overhead such as OAuth callbacks, reconnects, validation calls, and settings changes. Production reserve covers this and other unmodeled usage.

Formulas:

```text
MAU = 0.5 x N
events E = MAU x 60 x 360 = 10,800 x N
Worker USD = 5 + max(0,E-10m)/1m x .30 + max(0,5E-30m)/1m x .02
DO request USD = ceil(max(0,E-1m)/1m) x .15
DO duration GB-s = E x .010 x .128
DO duration USD = ceil(max(0,GB-s-400,000)/1m) x 12.50
R2 storage USD = ceil(max(0,.1N-10)) x .015
```

| Model | 100 registered | 1,000 registered | 10,000 registered |
| --- | ---: | ---: | ---: |
| MAU | 50 | 500 | 5,000 |
| Average / planning peak live channels | 4.2 / 20 | 41.7 / 200 | 416.7 / 2,000 |
| Incoming events per month | 1.08 million | 10.8 million | 108 million |
| Workers including monthly minimum | $5.00 | $5.72 | $44.60 |
| Durable Object requests | $0.15 | $1.50 | $16.05 |
| Durable Object active duration | $0.00 | $0.00 | $0.00 |
| R2 uploaded asset storage | $0.00 | $1.35 | $14.85 |
| D1 and modeled R2 operations | $0.00 | $0.00 | $0.00 |
| Modeled provider floor | **$5.15** | **$8.57** | **$75.50** |
| At 10x incoming chatter, 1 event/sec | **$7.22** | **$62.00** | **$622.60** |

The 10x case changes only event volume. It assumes active duration remains 10 ms per event and asset operations remain fixed through caching, so it is a sensitivity test rather than a guaranteed upper bound. At 10,000 registered users the 10x case includes US$12.50 of excess object duration after rounding. If every event performs an external fetch, writes a chat record, or wakes the object for much longer, the assumptions fail.

A reasonable first budget can add a planning reserve of US$25, US$75, and US$200 at the three scales for monitoring, log retention, backup exports, staging, control APIs, retries, and operational tools. This gives approximate baseline cash envelopes of US$30, US$84, and US$276. Those reserves are estimates, not quoted provider bundles or uptime guarantees. Allowance-heavy prototype bills can be US$0; a production decision should use paid infrastructure and measured capacity.

## The expensive implementation trap

Cloudflare only hibernates accepted server-side WebSockets. Outgoing WebSockets, such as persistent connections from each channel object to Twitch, cannot hibernate. Timers and pending work also interfere with hibernation. [WebSocket behavior](https://developers.cloudflare.com/durable-objects/best-practices/websockets/), accessed 7 October 2026.

Under the same MAU and 60-hour assumptions, always-active channel objects consume `MAU x 60 x 3,600 x .128` GB-seconds. Duration alone becomes US$12.50, US$175, and US$1,725 at 100, 1,000, and 10,000 registered users after allowances and rounding. Add request, database, and asset bills separately. Webhook ingress avoids keeping a Twitch outbound socket inside every channel object. This is why an architecture decision matters more than registered user count.

## Conventional VPS alternative

DigitalOcean lists US$6 monthly for 1 GB, US$24 for 4 GB, and US$48 for 8 GB basic Droplets with bundled transfer. [Droplets pricing](https://www.digitalocean.com/products/droplets), accessed 7 October 2026. Daily image backups add 30% of Droplet cost. [Backup pricing](https://docs.digitalocean.com/products/backups/details/pricing/), accessed 7 October 2026, provider last verified 9 March 2026. A regional HTTP load balancer starts at US$12 monthly. [Load balancer pricing](https://docs.digitalocean.com/products/networking/load-balancers/details/pricing/), accessed 7 October 2026, provider last verified 13 July 2026.

Illustrative configurations, with R2 for uploaded assets:

| Scale | Assumed configuration | Monthly core bill |
| --- | --- | ---: |
| 100 | One 1 GB app/database host and daily backups | $7.80 |
| 1,000 | One 4 GB app/database host, daily backups, R2 | $32.55 |
| 10,000 | Two 8 GB app hosts, one 4 GB DB host, one 1 GB routing/cache host, daily backups, load balancer, R2 | $190.65 |

These configurations have not been load tested. A single host has a single point of failure, and the larger configuration does not by itself provide database high availability. Regional network latency, OS patching, deployment, sharding, recovery, and monitoring are the team's responsibility. Include staff time before declaring VPS cheaper. Static assets should use CDN delivery rather than consuming app-host bandwidth.

## Twitch login and scaling feasibility

Users can have one Twitch sign-in and authorization flow. The app operator still needs a registered Twitch application, secrets, token refresh and revocation handling, and separate credentials for an app-owned bot. Cloud chat uses app-token webhook subscriptions, bot authorization including `user:read:chat` and `user:bot`, and broadcaster authorization through `channel:bot`. Request event-specific scopes for rewards, subscriptions, Bits, and other premium interactions only as needed. [Twitch chat authentication](https://dev.twitch.tv/docs/chat/authenticating/), accessed 7 October 2026. That page recommends webhooks for cloud bots and WebSockets for installed applications, and describes Conduits for distributing subscriptions across shards.

Twitch's ordinary concurrent join limit is 100 rooms per user account. Joins with authorized app-token `channel:bot` subscriptions, or as broadcaster/moderator, are exempt. So 10,000 users is not automatically blocked by a 100-room ceiling. [Chat limits](https://dev.twitch.tv/docs/chat/), accessed 7 October 2026.

EventSub WebSockets allow three connections, 300 enabled subscriptions per connection, and a maximum cost of ten for each client-ID/user-ID pair. These limits are not a universal maximum of 300 customers for a hosted app. Dropped connections require recreation of subscriptions, and missing events are not replayed. [EventSub WebSocket limits](https://dev.twitch.tv/docs/eventsub/handling-websocket-events/), accessed 7 October 2026.

## Market and monetization

StreamElements advertises free cloud overlays, widgets, and full themes. [StreamElements overlays](https://streamelements.com/features/overlays), accessed 7 October 2026. Streamlabs advertises free overlays and widgets plus its broader Ultra suite starting at US$15.75/month; that is a starting price, not a verified monthly-billed comparable. [Streamlabs Ultra](https://streamlabs.com/ultra), accessed 7 October 2026. Sound Alerts has a free plan and a US$6.99/month premium tier with increased reward/profile limits and AI voices. [Sound Alerts Premium](https://soundalerts.com/premium), accessed 7 October 2026. Stream Stickers advertises a free Twitch extension. [Stream Stickers](https://streamstickers.com/), accessed 7 October 2026.

Implication: test a US$5-8 monthly paid tier around effects, saved profiles, reward automation, scheduling, branded uploads, and reliable control during streams. Charging only for a hosted URL is weak differentiation against free incumbents. Keep a useful free tier, avoid arbitrary limits that cripple first-use demonstrations, and measure activation and retained use before setting conversion expectations.

Desktop can sell a US$25-40 one-time license, paid major upgrades, US$5-15 effect packs, or US$40-100 custom setup services. These are proposed test prices. Desktop customers still need reason to renew a subscription, such as content or optional cloud sync. Cloud can sell subscriptions, annual plans, packs, creator-team plans, and branded campaigns. Pack sales require asset rights and creator payments; custom setup sells labor, not scalable software margin.

Illustrative US$6/month recurring revenue, assuming 50% MAU and conversion measured among MAU:

| Paying share of MAU | 100 registered | 1,000 registered | 10,000 registered |
| --- | ---: | ---: | ---: |
| 3% | $9 | $90 | $900 |
| 8% | $24 | $240 | $2,400 |
| 15% | $45 | $450 | $4,500 |

Small-scale customer counts are expected values, so 1.5 paying customers means an average across scenarios. These are arithmetic scenarios with no evidence of demand or conversion. Churn, annual discounts, refunds, payment fees, tax, customer acquisition, support, and development reduce take-home cash. A desktop license model pays once per new buyer, so registered installed users cannot be multiplied into recurring revenue.

Twitch Extensions can share Bits revenue: normally the creator receives 80% and the extension developer receives 20% of US$0.01 per Bit. This requires a Bits-enabled extension installed on eligible channels; merely listening to chat Cheers does not entitle this app to a cut. [Twitch Bits revenue](https://help.twitch.tv/s/article/earning-revenue-from-bits-in-extensions?language=en_US) and [extension implementation requirements](https://dev.twitch.tv/docs/extensions/monetization/), accessed 7 October 2026. Example assumption: 500 participating channels consuming 2,000 extension Bits monthly would generate US$2,000 monthly to the developer. It is a separate product and distribution effort, not part of basic Twitch login hosting.

## Payments and business costs

Stripe Australia currently quotes 1.65% plus A$0.30 for domestic online cards and 3.5% plus A$0.30 for international cards; conversion adds 2% when required. Billing pay-as-you-go adds 0.7% of Billing volume. [Stripe Australia pricing](https://stripe.com/au/pricing), accessed 7 October 2026. The live page has changed from older indexed snippets quoting 1.7%, so use 1.65% in the report.

At the report's illustrative exchange rate, the fixed fee is US$0.20. Domestic recurring payments using Stripe Billing retain `price x (1 - .0165 - .007) - .20`, or US$5.659 at a US$6 price before tax and refunds. International with Billing but without FX retains `price x (1 - .035 - .007) - .20`, or US$5.548. Annual billing reduces repeated fixed fees but discounts reduce booked monthly revenue.

Keep labor separate. Support example assumption: 10% of MAU need 15 minutes/month, at US$40/hour, produces US$50, US$500, and US$5,000 monthly at the three sizes. This is a stress planning scenario, not expected observed demand. Even a fraction of this can exceed hosting. Electron trades much of cloud operations for installer, antivirus, firewall, startup, and version support. Cloud trades local installation issues for a central uptime promise, payment operations, credential custody, and incident response.
