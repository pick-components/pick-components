export const PLAYGROUND_SHELL_STYLES = `
    :host {
      display: block;
      height: 100vh;
      min-height: 0;
      --pg-brand-col: calc(1rem + min(250px, 36vw));
      --pg-topbar-height: 53px;
    }

    .pg-shell {
      display: grid;
      grid-template-rows: auto 1fr;
      grid-template-columns: var(--pg-brand-col) 1fr;
      height: 100%;
      min-height: 0;
      background: var(--pg-shell-panel-bg, #111822);
      color: var(--pg-shell-topbar-color, #eef2f7);
    }

    .pg-topbar {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0 1rem;
      min-height: 52px;
      background: var(--pg-shell-topbar-bg, #151b23);
      border-bottom: 1px solid var(--pg-shell-panel-border, #2a3443);
      color: var(--pg-shell-topbar-color, #eef2f7);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0;
      min-width: 0;
    }

    .mobile-nav-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      width: 2.1rem;
      height: 2.1rem;
      border: 1px solid var(--pg-shell-control-border, #2b3645);
      border-radius: 0.6rem;
      background: var(--pg-shell-control-bg, #111827);
      color: var(--pg-shell-control-color, #d8e0eb);
      font-size: 1rem;
      line-height: 1;
      cursor: pointer;
      flex: 0 0 auto;
    }

    .mobile-nav-toggle:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--pg-shell-control-focus, rgba(138, 200, 90, 0.24));
    }

    .brand-logo-link {
      display: inline-flex;
      align-items: center;
      min-width: 0;
      text-decoration: none;
    }

    .brand-logo {
      display: block;
      width: min(250px, 36vw);
      height: auto;
      flex-shrink: 0;
    }

    .brand-logo--light {
      display: none;
    }

    :host([data-theme="light"]) .brand-logo--dark {
      display: none;
    }

    :host([data-theme="light"]) .brand-logo--light {
      display: block;
    }

    :host([data-theme="dark"]) .brand-logo--dark {
      display: block;
    }

    :host([data-theme="dark"]) .brand-logo--light {
      display: none;
    }

    @media (prefers-color-scheme: light) {
      :host(:not([data-theme])) .brand-logo--dark {
        display: none;
      }

      :host(:not([data-theme])) .brand-logo--light {
        display: block;
      }
    }

    @media (prefers-color-scheme: dark) {
      :host(:not([data-theme])) .brand-logo--dark {
        display: block;
      }

      :host(:not([data-theme])) .brand-logo--light {
        display: none;
      }
    }

    .spacer {
      flex: 1;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.35rem 0;
    }

    .controls language-switcher,
    .controls theme-switcher {
      background: transparent;
    }

    .pg-sidebar {
      background: var(--pg-shell-panel-bg, #111822);
      border-right: 1px solid var(--pg-shell-panel-border, #2a3443);
      overflow-y: auto;
      padding: 0.75rem 0;
      min-height: 0;
    }

    .mobile-nav-backdrop {
      display: none;
    }

    .pg-main {
      display: flex;
      overflow: hidden;
      min-width: 0;
      min-height: 0;
    }

    playground-route-view {
      display: flex;
      flex: 1;
      min-width: 0;
      min-height: 0;
    }

    @media (max-width: 768px) {
      .pg-shell {
        grid-template-columns: 1fr;
      }

      .mobile-nav-toggle {
        display: inline-flex;
      }

      .brand-logo {
        width: min(190px, 55vw);
      }

      .pg-sidebar {
        position: fixed;
        top: var(--pg-topbar-height);
        left: 0;
        bottom: 0;
        width: min(82vw, 320px);
        border-right: 1px solid var(--pg-shell-panel-border, #2a3443);
        border-top: none;
        border-bottom: none;
        transform: translateX(-100%);
        transition: transform 0.2s ease;
        z-index: 40;
        max-height: none;
        padding: 0.5rem 0;
      }

      .pg-sidebar.mobile-nav-open {
        transform: translateX(0);
      }

      .mobile-nav-backdrop {
        display: block;
        position: fixed;
        top: var(--pg-topbar-height);
        right: 0;
        bottom: 0;
        left: 0;
        border: none;
        margin: 0;
        padding: 0;
        background: rgba(7, 13, 24, 0.48);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 30;
      }

      .mobile-nav-backdrop.mobile-nav-open {
        opacity: 1;
        pointer-events: auto;
      }

      .pg-main {
        min-height: 0;
      }
    }

  `;

export const PLAYGROUND_SHELL_TEMPLATE = `
    <div class="pg-shell">
      <div class="pg-topbar">
        <button class="mobile-nav-toggle" aria-label="Open navigation menu" aria-expanded="{{mobileNavExpanded}}" aria-controls="pg-mobile-sidebar">☰</button>
        <div class="brand">
          <a class="brand-logo-link" href="{{homePath}}" aria-label="Pick Components home">
            <img class="brand-logo brand-logo--dark" src="{{brandLogoDarkSrc}}" alt="Pick Components Playground" loading="eager" fetchpriority="high" decoding="async" />
            <img class="brand-logo brand-logo--light" src="{{brandLogoLightSrc}}" alt="Pick Components Playground" loading="eager" fetchpriority="high" decoding="async" />
          </a>
        </div>
        <div class="spacer"></div>
        <div class="controls">
          <language-switcher
            espath="{{esPath}}"
            enpath="{{enPath}}"
          ></language-switcher>
          <theme-switcher
            mode="{{themeMode}}"
            icon="{{themeIcon}}"
            label="{{themeLabel}}"
            buttontitle="{{themeTitle}}"
          ></theme-switcher>
        </div>
      </div>

      <aside id="pg-mobile-sidebar" class="pg-sidebar {{mobileNavOpenClass}}">
        <tab-nav groups="{{navigationGroups}}"></tab-nav>
      </aside>

      <button class="mobile-nav-backdrop {{mobileNavOpenClass}}" aria-label="Close navigation menu"></button>

      <div class="pg-main">
        <playground-route-view
          locale="{{locale}}"
          src="{{activeExampleSrc}}"
        ></playground-route-view>
      </div>
    </div>
  `;
