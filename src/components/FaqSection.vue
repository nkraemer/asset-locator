<template>
  <details class="faq-section">
    <summary class="faq-toggle">Frequently Asked Questions</summary>
    <div class="faq-content">
      <details class="faq-item">
        <summary>What is The Canadian Asset Locator?</summary>
        <p>
          The Canadian Asset Locator helps you decide how to distribute your investments across
          registered Canadian account types (TFSA, RRSP, and non-registered) to maximise tax
          efficiency.
        </p>
      </details>
      <details class="faq-item">
        <summary>Who made this and why?</summary>
        <p>
          My name is Nicholas. I'm a Canadian software/firmware engineer with an interest in
          personal finance. I built this tool for two reasons:
        </p>
        <ol>
          <li>to help myself figure out how to allocate my own investments, and</li>
          <li>to practice building a non-trivial web app with Vue and Claude Code</li>
        </ol>
      </details>
      <details class="faq-item">
        <summary>Why should I use tool?</summary>
        <p>
          Probably not. This is way overkill for most people. You can probably just buy a single
          low-cost all-in-one ETF and call it a day. Also, rebalancing your accounts to match the
          tool's recommendations is potentially a lot of work. Any rebalancing inside a taxable
          account may trigger capital gains and I couldn't be bothered to think through the
          implications of that.
        </p>
      </details>
      <details class="faq-item">
        <summary>How do I use this tool?</summary>
        <ol>
          <li>
            Decide what percentage of your assets you'd like to allocate to:
            <ul>
              <li>Canadian stocks</li>
              <li>US stocks</li>
              <li>International (non-US) stocks</li>
              <li>Bonds</li>
            </ul>
          </li>
          <li>
            Enter those percentages into the input panel on the left. The tool will show you how to
            allocate those assets across your TFSA, RRSP, and non-registered accounts in the output
            panel on the right.
          </li>
          <li>
            If you're feeling fancy, you can gross-up your RRSP balance to reflect after-tax values
          </li>
        </ol>
      </details>
      <details class="faq-item">
        <summary>How are the allocations calculated?</summary>
        <p>
          The tool uses a greedy, priority-based algorithm. Each asset class has a preferred account
          order based on Canadian tax rules:
        </p>
        <ul>
          <li>
            <strong>US Stocks</strong> &rarr; RRSP first, then TFSA, then non-registered. The
            Canada&ndash;US tax treaty exempts US dividends from the 15% withholding tax when held
            in an RRSP, but not in a TFSA or non-registered account.
          </li>
          <li>
            <strong>Canadian Stocks</strong> &rarr; non-registered first, then RRSP, then TFSA.
            Eligible Canadian dividends receive the dividend tax credit, which only applies in a
            taxable account. Placing them in an RRSP would convert that favourably-taxed income into
            fully-taxed income on withdrawal.
          </li>
          <li>
            <strong>International Stocks</strong> &rarr; TFSA first, then RRSP, then non-registered.
            No treaty benefit applies, so the TFSA&rsquo;s permanent tax-free growth is the best
            home; the RRSP is next-best because growth is at least tax-deferred.
          </li>
          <li>
            <strong>Bonds</strong> &rarr; RRSP first, then TFSA, then non-registered. Interest
            income is taxed at your full marginal rate, so sheltering it inside an RRSP (where
            growth is tax-deferred) saves the most tax.
          </li>
        </ul>
        <p>
          The algorithm processes asset classes in the order above (US stocks, Canadian stocks,
          international stocks, Bonds). For each asset class it fills the most-preferred account
          first, up to that account&rsquo;s remaining capacity, then spills into the next-preferred
          account, and so on. This is a single-pass greedy approach &mdash; it does not backtrack or
          globally optimise, so results may differ from a full linear-programming solution in edge
          cases.
        </p>
        <p>
          <strong>RRSP gross-up:</strong> When enabled, the tool treats your RRSP balance at its
          after-tax value (nominal balance &times; (1 &minus; marginal tax rate)) so that allocation
          targets reflect what you actually keep after withdrawal tax. The output then shows both
          the after-tax allocation and the nominal dollars to hold in the RRSP.
        </p>
        <p>
          <strong>Limitations:</strong> This tool provides a simplified starting point, not
          personalised financial advice. It does not account for provincial tax differences, foreign
          withholding tax on international (non-US) dividends, capital-gains inclusion rate changes,
          your specific income level beyond the marginal rate, or future contribution room. Other
          registered account types (FHSA, RESP) are not covered. Cash or cash equivalents have no
          placement logic &mdash; any unallocated balance is simply the remainder. Always consult a
          qualified financial advisor before making investment decisions.
        </p>
        <p>
          The full source code is available on
          <a href="https://github.com/nkraemer/asset-locator" rel="noopener noreferrer">GitHub</a>
          if you want to see exactly how it works under the hood.
        </p>
      </details>
      <details class="faq-item">
        <summary>What on earth are a TFSA and RRSP?</summary>
        <p>
          TFSA and RRSP are two types of registered savings accounts in Canada. If you've never
          heard of these savings accounts then either:
        </p>
        <ol type="A">
          <li>you're not a Canadian and this tool isn't for you (sorry!).</li>
          <li>
            you live in Canada but are very new to personal finance topics. In that case, welcome!
            This tool probably isn't for you just yet. You can learn about TFSAs and RRSPs on the
            Government of Canada website:
            <ul>
              <li>
                <a
                  href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account.html"
                  rel="noopener noreferrer"
                  >Tax-Free Savings Account (TFSA)</a
                >
              </li>
              <li>
                <a
                  href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/rrsps.html"
                  rel="noopener noreferrer"
                  >Registered Retirement Savings Plan (RRSP)</a
                >
              </li>
            </ul>
          </li>
        </ol>
      </details>
      <details class="faq-item">
        <summary>Any personal finance tips?</summary>
        <p>
          I am certainly not qualified to give personal finance advice, but here are some resources
          I found useful for learning about Canadian personal finance topics:
        </p>
        <ul>
          <li>
            <a href="https://thewealthybarber.com/book/" rel="noopener noreferrer"
              >The Wealthy Barber</a
            >
            - The Wealthy Barber Returns was how I first got started with personal finance!
          </li>
          <li>
            <a href="https://www.youtube.com/@BenFelixCSI" rel="noopener noreferrer"
              >Ben Felix's YouTube Channel</a
            >
            - Common Sense Investing
          </li>
          <li>
            <a href="https://canadiancouchpotato.com/" rel="noopener noreferrer"
              >Canadian Couch Potato
            </a>
            - Guide to portfolio construction for Canadian Investors
          </li>
        </ul>
      </details>
      <details class="faq-item">
        <summary>Is my data stored or sent anywhere?</summary>
        <p>
          No. All calculations run entirely in your browser. No data is sent to any server or stored
          anywhere beyond your current session.
        </p>
      </details>
    </div>
  </details>
</template>

<style scoped>
.faq-section {
  background: var(--color-panel-bg);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--color-panel-shadow);
  padding: 0;
  margin-top: 0;
  margin-bottom: 2rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.faq-toggle {
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-heading);
  padding: 1rem 1.5rem;
  list-style: none;
  user-select: none;
}

.faq-toggle::-webkit-details-marker {
  display: none;
}

.faq-toggle::before {
  content: '\25b6';
  display: inline-block;
  margin-right: 0.5rem;
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.faq-section[open] > .faq-toggle::before {
  transform: rotate(90deg);
}

.faq-content {
  padding: 0 1.5rem 1.5rem;
}

.faq-item {
  border-top: 1px solid var(--color-panel-divider);
  padding: 0.75rem 0;
}

.faq-item > summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text-body);
  list-style: none;
  user-select: none;
}

.faq-item > summary::-webkit-details-marker {
  display: none;
}

.faq-item > summary::before {
  content: '+';
  display: inline-block;
  margin-right: 0.5rem;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.faq-item[open] > summary::before {
  content: '\2212';
}

.faq-item > p {
  margin: 0.5rem 0 0 1.25rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.faq-item > ul,
.faq-item > ol {
  margin: 0.5rem 0 0.5rem 1.25rem;
  padding-left: 1.25rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.faq-item > ul > li,
.faq-item > ol > li {
  margin-bottom: 0.4rem;
}

.faq-item li > ul {
  margin: 0.25rem 0 0.25rem 0;
  padding-left: 1.25rem;
}
</style>
