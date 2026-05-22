/**
 * ============================================================
 * GRUPO PARTILHAR — Componente: Navbar
 * ============================================================
 */

'use strict';

/**
 * Renderiza e gerencia a navbar.
 * @param {Function} navigateTo — Callback de navegação do router
 */
export function initNavbar(navigateTo) {
  const navbar = document.getElementById('navbar');

  navbar.innerHTML = `
    <div class="navbar__inner">
      <button class="navbar__logo" id="nav-logo" aria-label="Ir para o Dashboard">
        <img
          src="assets/img/logo-partilhar.jpeg"
          alt="Logo Grupo Partilhar"
          class="navbar__logo-icon"
        />
      </button>

      <nav class="navbar__nav" role="navigation" aria-label="Menu principal">
        <button class="nav-link" id="nav-dashboard" data-page="dashboard">
          <span class="nav-icon"></span> Dashboard
        </button>
        <button class="nav-link" id="nav-cadastro" data-page="cadastro">
          <span class="nav-icon"></span> Cadastrar Doador
        </button>
        <button class="nav-link" id="nav-relatorios" data-page="relatorios">
          <span class="nav-icon"></span> Relatórios
        </button>
      </nav>

      <button class="navbar__mobile-toggle" id="nav-mobile-toggle" aria-label="Abrir menu">
        ☰
      </button>
    </div>

    <!-- Mobile Menu -->
    <nav class="navbar__mobile-menu" id="nav-mobile-menu" role="navigation">
      <button class="nav-link" data-page="dashboard">
        <span class="nav-icon"></span> Dashboard
      </button>
      <button class="nav-link" data-page="cadastro">
        <span class="nav-icon"></span> Cadastrar Doador
      </button>
      <button class="nav-link" data-page="relatorios">
        <span class="nav-icon"></span> Relatórios
      </button>
    </nav>
  `;

  // ── Eventos ──
  const mobileToggle = document.getElementById('nav-mobile-toggle');
  const mobileMenu = document.getElementById('nav-mobile-menu');

  mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    mobileToggle.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
  });

  // Logo → dashboard
  document.getElementById('nav-logo').addEventListener('click', () => {
    navigateTo('dashboard');
  });

  // Nav links (desktop + mobile)
  navbar.querySelectorAll('.nav-link[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.page);
      mobileMenu.classList.remove('open');
      mobileToggle.textContent = '☰';
    });
  });
}

/**
 * Atualiza o link ativo na navbar.
 * @param {string} page
 */
export function setActiveNavLink(page) {
  document.querySelectorAll('.nav-link[data-page]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
}
