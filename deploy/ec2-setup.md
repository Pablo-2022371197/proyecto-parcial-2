# Arranque de EC2 (hacer una vez)

La aplicación y OpenObserve viven en la misma instancia. El pipeline de GitHub Actions **no se conecta por SSH** si Playwright falla.

## 1. Instancia

- Ubuntu 24.04 o Amazon Linux 2023, t3.small o mayor (OpenObserve necesita RAM).
- Security group: **22** (tu IP), **80** (0.0.0.0/0), **5080** (0.0.0.0/0 o tu IP para OpenObserve).
- Par de llaves SSH. Guarda la privada: será el secreto `EC2_SSH_KEY`.

## 2. Docker en la instancia

```bash
sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-v2
sudo usermod -aG docker ubuntu
```

Cierra sesión SSH y vuelve a entrar.

## 3. Clonar el repositorio

```bash
sudo mkdir -p /opt/uteqgram
sudo chown "$USER":"$USER" /opt/uteqgram
git clone git@github.com:USUARIO/uteqgram.git /opt/uteqgram
cd /opt/uteqgram
docker compose up -d --build
```

Comprueba:

- App: `http://<EC2_PUBLIC_IP>/login`
- OpenObserve: `http://<EC2_PUBLIC_IP>:5080` — `admin@uteqgram.local` / `OpenObserve123!`

## 4. Secretos de GitHub

En el repositorio: Settings → Secrets and variables → Actions.

| Secreto | Valor |
| --- | --- |
| `EC2_HOST` | IP pública o DNS de la instancia |
| `EC2_USER` | `ubuntu` o `ec2-user` |
| `EC2_SSH_KEY` | Contenido de la llave privada (incluye `BEGIN`/`END`) |
| `OO_URL` | `http://<EC2_PUBLIC_IP>:5080` |
| `OO_USER` | `admin@uteqgram.local` |
| `OO_PASSWORD` | `OpenObserve123!` |

## 5. Dashboards en OpenObserve

1. Logs → stream `default` (app) y `cicd` / `deploy` (pipeline).
2. Traces → servicio `uteqgram`.
3. Metrics → `http.server.duration`, `http.server.requests`, `host.cpu.percent`, `host.memory.used.percent`, `host.network.*`, `node_cpu_seconds_total`, `node_memory_MemAvailable_bytes`, `node_network_receive_bytes_total`.
4. Temperatura: métrica `host.thermal.celsius` y `host.thermal.available`. En EC2 virtualizado suele ser `available=0`; el informe lo documenta.

## 6. Demostrar el criterio de fallo (RF)

1. Cambia en un commit de prueba el expect de `/api/health` o el texto visible del login.
2. Push a `main`: Playwright falla, el job `notify` registra `status=failure` en OpenObserve y **Deploy en EC2 no corre**.
3. Revierte el cambio: Playwright pasa, `docker compose up` actualiza contenedores y se registra `event=deploy`.
