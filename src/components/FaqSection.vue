<template>
  <details class="faq-section">
    <summary class="faq-toggle">Frequently Asked Questions</summary>
    <div class="faq-content">
      <details class="faq-item">
        <summary>What is Asset Locator 5000?</summary>
        <p>
          Asset Locator 5000 helps you decide how to distribute your investments across registered
          Canadian account types (TFSA, RRSP, and non-registered) to maximise tax efficiency and
          long-term growth.
        </p>
      </details>
      <details class="faq-item">
        <summary>What account types does this tool support?</summary>
        <p>
          The tool supports three account types commonly used in Canada: Tax-Free Savings Accounts
          (TFSA), Registered Retirement Savings Plans (RRSP), and non-registered (taxable)
          investment accounts.
        </p>
      </details>
      <details class="faq-item">
        <summary>How are the allocations calculated?</summary>
        <p>
          The tool uses a rules-based approach that considers the tax characteristics of each asset
          class and the tax treatment of each account type to suggest an optimal placement strategy.
        </p>
      </details>
      <details class="faq-item">
        <summary>Do I need to enter amounts in Canadian dollars?</summary>
        <p>
          Yes, all dollar amounts should be entered in Canadian dollars. The tool will display USD
          equivalents where applicable using a live exchange rate.
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
</style>
