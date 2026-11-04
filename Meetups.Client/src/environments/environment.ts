export const environment = {
  production: false,
  /**
   * В dev-режиме запросы проксируются на ASP.NET Core API
   * (см. proxy.conf.json). В production ожидается reverse-proxy
   * или размещение SPA на том же origin, что и API.
   */
  apiBaseUrl: '/api',
} as const;
