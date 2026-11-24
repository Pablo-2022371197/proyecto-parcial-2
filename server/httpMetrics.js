import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('uteqgram-http');

const duration = meter.createHistogram('http.server.duration', {
  description: 'Latencia HTTP en milisegundos',
  unit: 'ms'
});

const requests = meter.createCounter('http.server.requests', {
  description: 'Peticiones HTTP por endpoint y statusCode'
});

const errors = meter.createCounter('http.server.errors', {
  description: 'Respuestas HTTP 4xx/5xx'
});

export function httpMetrics(req, res, next) {
  const started = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    const route = req.route?.path || req.path || 'unknown';
    const attrs = {
      'http.method': req.method,
      'http.route': route,
      'http.status_code': res.statusCode
    };
    duration.record(ms, attrs);
    requests.add(1, attrs);
    if (res.statusCode >= 400) {
      errors.add(1, attrs);
    }
  });
  next();
}
