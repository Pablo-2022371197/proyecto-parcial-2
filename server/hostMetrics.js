import { readFileSync, readdirSync, existsSync } from 'node:fs';
import os from 'node:os';
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('uteqgram-host');

function cpuUsagePercent() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    idle += cpu.times.idle;
    total += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
  }
  return total === 0 ? 0 : (1 - idle / total) * 100;
}

function readThermalCelsius() {
  const root = '/sys/class/thermal';
  if (!existsSync(root)) {
    return null;
  }
  try {
    const zones = readdirSync(root).filter((n) => n.startsWith('thermal_zone'));
    for (const zone of zones) {
      const tempPath = `${root}/${zone}/temp`;
      if (!existsSync(tempPath)) {
        continue;
      }
      const raw = Number(readFileSync(tempPath, 'utf8').trim());
      if (Number.isFinite(raw) && raw > 0) {
        return raw > 1000 ? raw / 1000 : raw;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function readNetworkBytes() {
  const path = '/proc/net/dev';
  if (!existsSync(path)) {
    return { rx: 0, tx: 0 };
  }
  try {
    const lines = readFileSync(path, 'utf8').trim().split('\n').slice(2);
    let rx = 0;
    let tx = 0;
    for (const line of lines) {
      const parts = line.trim().split(/[:\s]+/);
      const iface = parts[0];
      if (!iface || iface === 'lo') {
        continue;
      }
      rx += Number(parts[1]) || 0;
      tx += Number(parts[9]) || 0;
    }
    return { rx, tx };
  } catch {
    return { rx: 0, tx: 0 };
  }
}

export function snapshotHost() {
  const thermal = readThermalCelsius();
  const memTotal = os.totalmem();
  const memFree = os.freemem();
  const net = readNetworkBytes();
  return {
    cpuPercent: Number(cpuUsagePercent().toFixed(2)),
    memUsedBytes: memTotal - memFree,
    memTotalBytes: memTotal,
    memUsedPercent: Number((((memTotal - memFree) / memTotal) * 100).toFixed(2)),
    netRxBytes: net.rx,
    netTxBytes: net.tx,
    thermalCelsius: thermal,
    thermalAvailable: thermal == null ? 0 : 1,
    load1: os.loadavg()[0]
  };
}

export function registerHostMetrics() {
  meter.createObservableGauge('host.cpu.percent', {
    description: 'Uso de CPU del proceso/host (%)'
  }).addCallback((obs) => {
    obs.observe(snapshotHost().cpuPercent);
  });

  meter.createObservableGauge('host.memory.used.percent', {
    description: 'Uso de RAM (%)'
  }).addCallback((obs) => {
    obs.observe(snapshotHost().memUsedPercent);
  });

  meter.createObservableGauge('host.memory.used.bytes', {
    description: 'RAM usada (bytes)'
  }).addCallback((obs) => {
    obs.observe(snapshotHost().memUsedBytes);
  });

  meter.createObservableGauge('host.network.rx.bytes', {
    description: 'Bytes recibidos acumulados'
  }).addCallback((obs) => {
    obs.observe(snapshotHost().netRxBytes);
  });

  meter.createObservableGauge('host.network.tx.bytes', {
    description: 'Bytes enviados acumulados'
  }).addCallback((obs) => {
    obs.observe(snapshotHost().netTxBytes);
  });

  meter.createObservableGauge('host.thermal.celsius', {
    description: 'Temperatura del host si el kernel la expone'
  }).addCallback((obs) => {
    const snap = snapshotHost();
    obs.observe(snap.thermalCelsius == null ? 0 : snap.thermalCelsius);
  });

  meter.createObservableGauge('host.thermal.available', {
    description: '1 si /sys/class/thermal está disponible'
  }).addCallback((obs) => {
    obs.observe(snapshotHost().thermalAvailable);
  });
}
