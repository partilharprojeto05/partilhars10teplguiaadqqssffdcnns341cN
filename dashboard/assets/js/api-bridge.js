/**
 * ============================================================
 * GRUPO PARTILHAR — API Bridge
 *
 * 1. Importa api.js (ES module) e expõe window.PartilharAPI.
 * 2. Carrega app.js dinamicamente DEPOIS que o namespace estiver
 *    pronto, garantindo a ordem de execução correta.
 * ============================================================
 */

import {
  apiFetchDonors,
  apiFetchDonorById,
  apiCreateDonor,
  apiUpdateDonor,
  apiDeleteDonor,
  calcReportStats,
  apiPublicRegister,
} from './api/api.js';

// Expõe no namespace global para o app.js (script clássico)
window.PartilharAPI = {
  apiFetchDonors,
  apiFetchDonorById,
  apiCreateDonor,
  apiUpdateDonor,
  apiDeleteDonor,
  calcReportStats,
  apiPublicRegister,
};

// Carrega app.js dinamicamente, garantindo que window.PartilharAPI já existe
(function () {
  var script = document.createElement('script');
  script.src = 'assets/js/app.js';
  document.body.appendChild(script);
})();
