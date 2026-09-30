# Code changes

## 2026-09-30

- Added a single-page site for Sole Trader Debt Collection Services.
- The page is aimed at sole traders and small businesses (window cleaners, carpet cleaners, trades and similar) who are owed money by a customer.
- The only call to action is an enquiry form: name, phone or email, and a note. No business phone number is shown.
- Enquiries are posted to a Cloudflare Worker, which emails travis_gm@live.co.uk. FormSubmit was returning a server error, so the page no longer uses it.
- Rewrote the page copy to describe the process: the business gets in touch, the debt is quantified, books are brought up to date when the amount is unclear, then customers are reminded professionally and the approach is escalated only as far as it needs to go.
- Shifted the wording from a single unpaid customer to several customers with balances, and the overwhelm of keeping on top of them.
- Rewrote the opening and supporting copy so it addresses sole traders and small businesses whose customers and clients carry a balance, without leaning on a single trade as the example.
- Set the section heading to: this is a service for when staying on top of debts owed is a full-time job.
- Published the page on GitHub Pages and pointed soletraderdebtcollection.co.uk at it.
- Connected the enquiry form so notes are emailed to travis_gm@live.co.uk. The first submission must be confirmed from that inbox.
- Replaced the FormSubmit request with a post to the enquiry Worker after FormSubmit answered with a server error and the browser reported it as a blocked request.
