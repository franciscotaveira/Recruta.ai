# Domain Split Runbook — 2026-04-16

## Objetivo
Separar operação de:
- Site institucional: `recrutaria.com.br`
- App do produto: `app.recrutaria.com.br`
- API opcional dedicada: `api.recrutaria.com.br`

## Estado recomendado
1. Site no root domain (`recrutaria.com.br`) com páginas institucionais e SEO.
2. App no subdomínio `app.` com rota `/api/*` em same-origin via reverse proxy.
3. `api.` habilitado apenas quando houver DNS + certificado válidos.

## Checklist de DNS
- `A @ -> <IP VPS>`
- `A app -> <IP VPS>`
- `A api -> <IP VPS>` (opcional)
- `CNAME www -> recrutaria.com.br`

## Checklist de SSL
Execute no servidor:
```bash
sudo certbot --nginx -d recrutaria.com.br -d www.recrutaria.com.br
sudo certbot --nginx -d app.recrutaria.com.br
# opcional
sudo certbot --nginx -d api.recrutaria.com.br
```

Validação rápida:
```bash
./ops/monitoring/tls-check.sh recrutaria.com.br app.recrutaria.com.br api.recrutaria.com.br
```

## Nginx
- Use template: `ops/deploy/nginx/recrutaria.conf.example`
- Ajuste caminhos:
  - site: `/var/www/recrutaria-site`
  - app: `/var/www/recrutaria-app/dist`
  - backend: `127.0.0.1:3456`

Aplicar:
```bash
sudo cp ops/deploy/nginx/recrutaria.conf.example /etc/nginx/sites-available/recrutaria
sudo ln -sf /etc/nginx/sites-available/recrutaria /etc/nginx/sites-enabled/recrutaria
sudo nginx -t
sudo systemctl reload nginx
```

## Frontend env
- Padrão seguro:
  - `VITE_API_URL` vazio (ou `/api`)
  - `VITE_ENABLE_API_SUBDOMAIN_FALLBACK=false`
- Ativar fallback para `api.` somente após TLS válido:
  - `VITE_ENABLE_API_SUBDOMAIN_FALLBACK=true`

## Smoke pós-release
```bash
./ops/monitoring/synthetic-check.sh https://recrutaria.com.br https://app.recrutaria.com.br
# opcional se api. estiver ativo com cert válido
./ops/monitoring/synthetic-check.sh https://recrutaria.com.br https://app.recrutaria.com.br https://api.recrutaria.com.br
```
