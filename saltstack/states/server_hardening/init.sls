# Server Hardening State for FoodRush EC2
# Applied by SaltStack — mirrors Nu Skin production hardening

update_packages:
  pkg.uptodate:
    - refresh: true

install_security_packages:
  pkg.installed:
    - pkgs:
      - ufw
      - fail2ban
      - unattended-upgrades
      - auditd

ufw_allow_ssh:
  cmd.run:
    - name: "ufw allow 22/tcp"
    - unless: "ufw status | grep '22/tcp'"

ufw_allow_app:
  cmd.run:
    - name: "ufw allow 3000/tcp"
    - unless: "ufw status | grep '3000/tcp'"

ufw_enable:
  cmd.run:
    - name: "ufw --force enable"
    - unless: "ufw status | grep 'Status: active'"

fail2ban_service:
  service.running:
    - name: fail2ban
    - enable: true
    - require:
      - pkg: install_security_packages

auditd_service:
  service.running:
    - name: auditd
    - enable: true
    - require:
      - pkg: install_security_packages

ssh_config:
  file.managed:
    - name: /etc/ssh/sshd_config.d/hardening.conf
    - contents: |
        PermitRootLogin no
        PasswordAuthentication no
        MaxAuthTries 3
        ClientAliveInterval 300
        ClientAliveCountMax 2

restart_ssh:
  service.running:
    - name: ssh
    - enable: true
    - watch:
      - file: ssh_config

disable_avahi:
  service.dead:
    - name: avahi-daemon
    - enable: false

set_max_logins:
  file.append:
    - name: /etc/security/limits.conf
    - text: |
        * hard maxlogins 10