import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { trace, context } from '@opentelemetry/api';

const otelLogger = logs.getLogger('uteqgram');

function traceFields() {
  const span = trace.getSpan(context.active());
  if (!span) {
    return {};
  }
  const sc = span.spanContext();
  return { traceId: sc.traceId, spanId: sc.spanId };
}

export function log(level, msg, extra = {}) {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    msg,
    ...traceFields(),
    ...extra
  };
  const line = JSON.stringify(record);
  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }

  const severity =
    level === 'error' ? SeverityNumber.ERROR
      : level === 'warn' ? SeverityNumber.WARN
        : SeverityNumber.INFO;

  try {
    otelLogger.emit({
      severityNumber: severity,
      severityText: level.toUpperCase(),
      body: msg,
      attributes: Object.fromEntries(
        Object.entries(record)
          .filter(([k]) => k !== 'msg')
          .map(([k, v]) => [k, v == null ? '' : String(v)])
      )
    });
  } catch {
    // SDK may be disabled
  }
}

export function requestLogger(req, res, next) {
  const started = Date.now();
  res.on('finish', () => {
    log('info', 'http_request', {
      route: req.route?.path || req.path,
      method: req.method,
      statusCode: res.statusCode,
      durationMs: Date.now() - started,
      user: req.user?.username || null
    });
  });
  next();
}
