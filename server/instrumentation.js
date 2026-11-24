import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const disabled =
  process.env.OTEL_SDK_DISABLED === 'true' ||
  process.env.OTEL_SDK_DISABLED === '1' ||
  !process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (disabled) {
  process.env.OTEL_SDK_DISABLED = 'true';
} else {
  const serviceName = process.env.OTEL_SERVICE_NAME || 'uteqgram';
  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: '2.0.0',
      'deployment.environment': process.env.NODE_ENV || 'development'
    }),
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 15000
    }),
    logRecordProcessors: [
      new BatchLogRecordProcessor(new OTLPLogExporter())
    ],
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false }
      })
    ]
  });

  sdk.start();

  const shutdown = () => {
    sdk.shutdown().catch((err) => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        msg: 'otel_shutdown_failed',
        error: String(err)
      }));
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
