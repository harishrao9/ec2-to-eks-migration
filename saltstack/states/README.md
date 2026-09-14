# SaltStack Configuration Management

This directory contains SaltStack states for automating server hardening
and SSL certificate management on the FoodRush EC2 instance.

## States

### Server Hardening (`server_hardening/`)
- Updates all system packages
- Installs security tools: UFW, Fail2ban, Auditd
- Configures UFW firewall (ports 22, 3000)
- Hardens SSH configuration
- Disables unused services
- Sets system login limits

### SSL Automation (`ssl/`)
- Generates self-signed SSL certificate (365 days)
- Sets secure file permissions (key: 600, cert: 644)
- Creates auto-renewal script
- Schedules daily cron job at 2AM for certificate renewal

## How to Apply

### Masterless mode (single server):
```bash
sudo salt-call --local state.apply
```

### With Salt Master:
```bash
sudo salt '*' state.apply
```

## Results
- ✅ 19 states applied successfully
- ✅ SSL certificate valid until Sep 14 2027
- ✅ Firewall active with ports 22 and 3000
- ✅ Fail2ban protecting against brute force
- ✅ SSH hardened — no root login, key-only auth
- ✅ Auto-renewal cron job scheduled at 2AM daily