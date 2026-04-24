/**
 * Logger estructurado para el CMS de Two Six.
 *
 * Usa Pino para logs JSON en producción y formato legible en desarrollo.
 *
 * Uso:
 *   import logger from '@/utils/logger';
 *   logger.info({ designId: 123 }, 'Diseño creado');
 *   logger.error({ error: err.message }, 'Error cargando productos');
 */
import pino from 'pino';

const isProduction = import.meta.env?.PROD ?? false;

const logger = pino({
  browser: {
    asObject: true,
  },
  level: isProduction ? 'info' : 'debug',
});

export { logger };
export default logger;
