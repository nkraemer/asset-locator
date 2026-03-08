<template>
  <details class="faq-section">
    <summary class="faq-toggle">Frequently Asked Questions</summary>
    <div class="faq-content">
      <details class="faq-item">
        <summary>What is Asset Locator 5000?</summary>
        <p>
          Asset Locator 5000 helps you decide how to distribute your investments across registered
          Canadian account types (TFSA, RRSP, and non-registered) to maximise tax efficiency.
        </p>
      </details>
      <details class="faq-item">
        <summary>Why should I use this tool?</summary>
        <p>
          You probably shouldn't. This is way overkill for most people. You can probably just by a single
          low-cost all-in-one ETF and call it a day. Also, reballancing your accounts to match the tool's
          recommendations is potentially a lot of work. Any rebalancing inside a taxable account may trigger capital gains and
          I couldn't be bothered to think through the implications of that.        
        </p>
      </details>
      <details class="faq-item">
        <summary>Why did you make this?</summary>
        <p>          
          I made this tool for myself because I enjoy optimizing things and I wanted something to 
          help me figure out how much I should put in each of my accounts. If it works for you too, that's great,
          but make sure you understand exactly what's going on here, and consult a qualified financial advisor before making any decisions based on this tool.
        
        </p>
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
            <strong>International Stocks</strong> &rarr; TFSA first, then RRSP, then
            non-registered. No treaty benefit applies, so the TFSA&rsquo;s permanent tax-free
            growth is the best home; the RRSP is next-best because growth is at least tax-deferred.
          </li>
          <li>
            <strong>Bonds</strong> &rarr; RRSP first, then TFSA, then non-registered. Interest
            income is taxed at your full marginal rate, so sheltering it inside an RRSP (where
            growth is tax-deferred) saves the most tax.
          </li>
        </ul>
        <p>
          The algorithm processes asset classes in the order above (US stocks, Canadian
          stocks, international stocks, Bonds). For each asset class it fills the most-preferred account
          first, up to that account&rsquo;s remaining capacity, then spills into the next-preferred
          account, and so on. This is a single-pass greedy approach &mdash; it does not backtrack or
          globally optimise, so results may differ from a full linear-programming solution in edge
          cases.
        </p>
        <p>
          <strong>RRSP gross-up:</strong> When enabled, the tool treats your RRSP balance at its
          after-tax value (nominal balance &times; (1 &minus; marginal tax rate)) so that allocation
          targets reflect what you actually keep after withdrawal tax. The output then shows both the
          after-tax allocation and the nominal dollars to hold in the RRSP.
        </p>
        <p>
          <strong>Limitations:</strong> This tool provides a simplified starting point, not
          personalised financial advice. It does not account for provincial tax differences, foreign
          withholding tax on international (non-US) dividends, capital-gains inclusion rate changes,
          your specific income level beyond the marginal rate, or future contribution room. Always
          consult a qualified financial advisor before making investment decisions.
        </p>
      </details>
      <details class="faq-item">
        <summary>What on earth is a TFSA and RRSP</summary>
        <p>
          TFSA and RRSP are two types of registered savings accounts in Canada. If you've never heard of these savings accounts then either:
          <ul>
          <li>a) you're not a Canadian and this tool isn't for you (sorry!).\</li>
          <li>b) you live in Canada but are very new to personal finance topics. In that case, welcome! This tool probably isn't for you just yet. You can learn about TFSAs and RRSPs on the Government of Canada website:</li>
            <ul>
              <li><a href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account.html">Tax-Free Savings Account (TFSA)</a></li>
              <li><a href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/rrsps.html">Registered Retirement Savings Plan (RRSP)</a></li>
            </ul>
          </ul>
        </p>
      </details>
      <details class="faq-item">
        <summary>Any personal finance tips?</summary>
        <p>
          I am certainly not qualified to give personal finance advice, but here are some resources I find useful for learning about
          Canadian personal finance topics:
          <ul>
            <li><a href="https://thewealthybarber.com/book/">The Wealthy Barber</a>. The Wealthy Barber Returns was how I first got started with personal finance!</li>
            <li><a href="https://www.youtube.com/@BenFelixCSI">Ben Felix's YouTube Channel</a> - Common Sense Investing </li>
            <li><a href="https://canadiancouchpotato.com/">Canadian Couch Potato </a>Lazy Portfolios for Canadian Investors</li>
          </ul>
        </p>
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
  margin-top: 2rem;
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

.faq-item > ul {
  margin: 0.5rem 0 0.5rem 1.25rem;
  padding-left: 1.25rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.faq-item > ul > li {
  margin-bottom: 0.4rem;
}
</style>
