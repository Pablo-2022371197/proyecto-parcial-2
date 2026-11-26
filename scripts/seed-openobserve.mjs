/**
 * Crea tablero y alertas operativas en OpenObserve (RF-05 / RF-06).
 * Uso: OO_URL=http://IP:5080 OO_USER=... OO_PASSWORD=... node scripts/seed-openobserve.mjs
 */
const url = (process.env.OO_URL || 'http://127.0.0.1:5080').replace(/\/$/, '');
const user = process.env.OO_USER || 'admin@uteqgram.local';
const password = process.env.OO_PASSWORD || 'OpenObserve123!';
const auth = Buffer.from(`${user}:${password}`).toString('base64');
const headers = {
  Authorization: `Basic ${auth}`,
  'Content-Type': 'application/json'
};

async function api(method, path, body) {
  const res = await fetch(`${url}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 800)}`);
  }
  return json;
}

function metricPanel({ id, title, stream, yLabel, x, y, w, h, i, color }) {
  return {
    id,
    type: 'line',
    title,
    description: '',
    config: {
      show_legends: true,
      legends_position: 'bottom',
      decimals: 2
    },
    queryType: 'sql',
    queries: [
      {
        query: `SELECT histogram(_timestamp) AS "x_axis_1", avg(value) AS "y_axis_1" FROM "${stream}" GROUP BY x_axis_1 ORDER BY x_axis_1`,
        customQuery: true,
        fields: {
          stream,
          stream_type: 'metrics',
          x: [
            {
              label: 'Timestamp',
              alias: 'x_axis_1',
              column: 'x_axis_1',
              color: null,
              aggregationFunction: null
            }
          ],
          y: [
            {
              label: yLabel,
              alias: 'y_axis_1',
              column: 'y_axis_1',
              color: color || '#3b82f6',
              aggregationFunction: 'avg'
            }
          ],
          z: [],
          filter: {
            filterType: 'group',
            logicalOperator: 'AND',
            conditions: []
          }
        },
        config: {
          promql_legend: '',
          layer_type: 'line',
          weight_fixed: 1,
          limit: 0,
          min: 0,
          max: 0,
          time_shift: []
        }
      }
    ],
    layout: { x, y, w, h, i }
  };
}

const dashboard = {
  version: 8,
  title: 'UTEQGram — Infraestructura y CI/CD',
  description:
    'CPU, RAM, ancho de banda, temperatura, peticiones HTTP y ejecuciones del pipeline (Proyecto Parcial 2).',
  folder_id: 'default',
  tabs: [
    {
      tabId: 'infra',
      name: 'Servidor EC2',
      panels: [
        metricPanel({
          id: 'cpu',
          title: 'CPU (%)',
          stream: 'host_cpu_percent',
          yLabel: 'CPU %',
          x: 0,
          y: 0,
          w: 96,
          h: 14,
          i: 1,
          color: '#2563eb'
        }),
        metricPanel({
          id: 'ram',
          title: 'Memoria RAM (%)',
          stream: 'host_memory_used_percent',
          yLabel: 'RAM %',
          x: 96,
          y: 0,
          w: 96,
          h: 14,
          i: 2,
          color: '#16a34a'
        }),
        metricPanel({
          id: 'net_rx',
          title: 'Ancho de banda — bytes recibidos',
          stream: 'host_network_rx_bytes',
          yLabel: 'RX bytes',
          x: 0,
          y: 14,
          w: 96,
          h: 14,
          i: 3,
          color: '#0ea5e9'
        }),
        metricPanel({
          id: 'net_tx',
          title: 'Ancho de banda — bytes enviados',
          stream: 'host_network_tx_bytes',
          yLabel: 'TX bytes',
          x: 96,
          y: 14,
          w: 96,
          h: 14,
          i: 4,
          color: '#f97316'
        }),
        metricPanel({
          id: 'temp_host',
          title: 'Temperatura host (°C) — sensor kernel',
          stream: 'host_thermal_celsius',
          yLabel: '°C',
          x: 0,
          y: 28,
          w: 96,
          h: 14,
          i: 5,
          color: '#dc2626'
        }),
        metricPanel({
          id: 'temp_hwmon',
          title: 'Temperatura hwmon (°C) — node-exporter',
          stream: 'node_hwmon_temp_celsius',
          yLabel: '°C',
          x: 96,
          y: 28,
          w: 96,
          h: 14,
          i: 6,
          color: '#b45309'
        })
      ]
    },
    {
      tabId: 'app',
      name: 'Aplicación',
      panels: [
        metricPanel({
          id: 'http_req',
          title: 'Peticiones HTTP',
          stream: 'http_server_requests',
          yLabel: 'requests',
          x: 0,
          y: 0,
          w: 96,
          h: 14,
          i: 7,
          color: '#6366f1'
        }),
        metricPanel({
          id: 'http_err',
          title: 'Errores HTTP (4xx/5xx)',
          stream: 'http_server_errors',
          yLabel: 'errors',
          x: 96,
          y: 0,
          w: 96,
          h: 14,
          i: 8,
          color: '#e11d48'
        }),
        metricPanel({
          id: 'http_lat',
          title: 'Latencia HTTP (suma ms)',
          stream: 'http_server_duration_sum',
          yLabel: 'ms',
          x: 0,
          y: 14,
          w: 192,
          h: 14,
          i: 9,
          color: '#8b5cf6'
        })
      ]
    },
    {
      tabId: 'cicd',
      name: 'Pipeline CI/CD',
      panels: [
        {
          id: 'cicd_table',
          type: 'table',
          title: 'Ejecuciones de GitHub Actions',
          description: 'status, sha, rama y actor enviados por el job notify',
          config: { show_legends: false },
          queryType: 'sql',
          queries: [
            {
              query:
                'SELECT _timestamp, event, status, sha, ref, actor, run_id FROM "cicd" ORDER BY _timestamp DESC',
              customQuery: true,
              fields: {
                stream: 'cicd',
                stream_type: 'logs',
                x: [],
                y: [],
                z: [],
                filter: {
                  filterType: 'group',
                  logicalOperator: 'AND',
                  conditions: []
                }
              },
              config: {
                promql_legend: '',
                layer_type: 'scatter',
                weight_fixed: 1,
                limit: 50,
                min: 0,
                max: 0,
                time_shift: []
              }
            }
          ],
          layout: { x: 0, y: 0, w: 192, h: 16, i: 10 }
        }
      ]
    }
  ]
};

async function ensureTemplate() {
  const name = 'uteqgram_http';
  const body = {
    name,
    type: 'http',
    title: 'UTEQGram alerta',
    body: '{"alert":"{alert_name}","type":"{alert_type}","stream":"{stream_name}"}'
  };
  try {
    await api('POST', '/api/default/alerts/templates', body);
    console.log('Plantilla creada:', name);
  } catch (err) {
    if (String(err.message).includes('409') || String(err.message).includes('already')) {
      console.log('Plantilla ya existía:', name);
      return name;
    }
    console.warn('Plantilla (se reintenta PUT):', err.message);
    try {
      await api('PUT', `/api/default/alerts/templates/${name}`, body);
      console.log('Plantilla actualizada:', name);
    } catch (err2) {
      console.warn('No se pudo guardar plantilla:', err2.message);
    }
  }
  return name;
}

async function ensureDestination(template) {
  const name = 'uteqgram_webhook';
  const body = {
    name,
    url: process.env.OO_ALERT_WEBHOOK || `${url.replace(/:5080$/, '')}/api/health`,
    method: 'get',
    skip_tls_verify: true,
    template,
    headers: {}
  };
  try {
    await api('POST', '/api/default/alerts/destinations', body);
    console.log('Destino creado:', name);
  } catch (err) {
    if (String(err.message).includes('409') || String(err.message).includes('already')) {
      console.log('Destino ya existía:', name);
      return name;
    }
    console.warn('Destino (se reintenta PUT):', err.message);
    try {
      await api('PUT', `/api/default/alerts/destinations/${name}`, body);
      console.log('Destino actualizado:', name);
    } catch (err2) {
      console.warn('No se pudo guardar destino:', err2.message);
    }
  }
  return name;
}

async function ensureAlerts(destination) {
  const alerts = [
    {
      name: 'ram_alta_ec2',
      stream_type: 'metrics',
      stream_name: 'host_memory_used_percent',
      is_real_time: false,
      query_condition: {
        type: 'sql',
        sql: 'SELECT avg(value) AS ram FROM "host_memory_used_percent"'
      },
      trigger_condition: {
        period: 5,
        operator: '>=',
        threshold: 90,
        frequency: 5,
        frequency_type: 'minutes',
        silence: 30
      },
      destinations: [destination],
      enabled: true,
      description: 'Alerta operativa: RAM del host >= 90% en 5 minutos'
    },
    {
      name: 'pipeline_ci_fallido',
      stream_type: 'logs',
      stream_name: 'cicd',
      is_real_time: false,
      query_condition: {
        type: 'sql',
        sql: "SELECT count(*) AS n FROM \"cicd\" WHERE status = 'failure'"
      },
      trigger_condition: {
        period: 60,
        operator: '>=',
        threshold: 1,
        frequency: 10,
        frequency_type: 'minutes',
        silence: 30
      },
      destinations: [destination],
      enabled: true,
      description: 'Alerta operativa: GitHub Actions registró un fallo de Playwright'
    },
    {
      name: 'errores_http_app',
      stream_type: 'metrics',
      stream_name: 'http_server_errors',
      is_real_time: false,
      query_condition: {
        type: 'sql',
        sql: 'SELECT sum(value) AS errors FROM "http_server_errors"'
      },
      trigger_condition: {
        period: 10,
        operator: '>=',
        threshold: 25,
        frequency: 10,
        frequency_type: 'minutes',
        silence: 30
      },
      destinations: [destination],
      enabled: true,
      description: 'Alerta operativa: volumen de 4xx/5xx elevado'
    }
  ];

  for (const alert of alerts) {
    try {
      await api('POST', '/api/v2/default/alerts', alert);
      console.log('Alerta creada:', alert.name);
    } catch (err) {
      console.warn('Alerta no creada', alert.name, err.message);
    }
  }
}

const existing = await api('GET', '/api/default/dashboards');
const already = (existing.dashboards || []).find((d) =>
  String(d.title || d.name || '').includes('UTEQGram')
);
if (already) {
  console.log('Dashboard ya existe:', already.dashboard_id || already.dashboardId || already.title);
} else {
  const created = await api('POST', '/api/default/dashboards', dashboard);
  const id = created?.v8?.dashboardId || created?.dashboardId || JSON.stringify(created).slice(0, 200);
  console.log('Dashboard creado:', id);
}

const template = await ensureTemplate();
const destination = await ensureDestination(template);
await ensureAlerts(destination);
console.log('Listo.');
