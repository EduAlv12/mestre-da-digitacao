/* Correções de visibilidade da V3 no mobile. */
(() => {
  const css = document.createElement('style');
  css.id = 'mobile-visibility-fixes';
  css.textContent = `
    @media (max-width: 760px) {
      .medals-box {
        display: block !important;
      }

      .history-box {
        display: block !important;
      }

      .history-chart {
        display: flex !important;
        min-height: 48px;
        width: 100%;
        overflow: visible;
      }

      .history-dot {
        min-width: 6px;
      }

      .medals-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `;
  document.head.appendChild(css);
})();
