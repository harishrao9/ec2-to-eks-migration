# SSL Certificate Automation State for FoodRush EC2
# Managed by SaltStack — mirrors Nu Skin SSL automation

install_ssl_packages:
  pkg.installed:
    - pkgs:
      - openssl
      - cron

create_ssl_dir:
  file.directory:
    - name: /etc/ssl/foodrush
    - user: root
    - group: root
    - mode: 755
    - makedirs: true

generate_ssl_cert:
  cmd.run:
    - name: |
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
          -keyout /etc/ssl/foodrush/server.key \
          -out /etc/ssl/foodrush/server.crt \
          -subj "/C=IN/ST=Karnataka/L=Mangalore/O=FoodRush/CN=foodrush.local"
    - unless: test -f /etc/ssl/foodrush/server.crt
    - require:
      - pkg: install_ssl_packages
      - file: create_ssl_dir

ssl_key_permissions:
  file.managed:
    - name: /etc/ssl/foodrush/server.key
    - mode: 600
    - require:
      - cmd: generate_ssl_cert

ssl_cert_permissions:
  file.managed:
    - name: /etc/ssl/foodrush/server.crt
    - mode: 644
    - require:
      - cmd: generate_ssl_cert

ssl_renewal_script:
  file.managed:
    - name: /usr/local/bin/renew-ssl.sh
    - mode: 755
    - contents: |
        #!/bin/bash
        LOG="/var/log/ssl-renewal.log"
        CERT="/etc/ssl/foodrush/server.crt"
        KEY="/etc/ssl/foodrush/server.key"
        DAYS_BEFORE_EXPIRY=30
        echo "$(date) - Checking SSL certificate expiry..." >> $LOG
        EXPIRY=$(openssl x509 -enddate -noout -in $CERT | cut -d= -f2)
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
        NOW_EPOCH=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))
        echo "$(date) - Days until expiry: $DAYS_LEFT" >> $LOG
        if [ $DAYS_LEFT -lt $DAYS_BEFORE_EXPIRY ]; then
          echo "$(date) - Renewing certificate..." >> $LOG
          openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout $KEY \
            -out $CERT \
            -subj "/C=IN/ST=Karnataka/L=Mangalore/O=FoodRush/CN=foodrush.local"
          echo "$(date) - Certificate renewed!" >> $LOG
          docker restart foodrush
        else
          echo "$(date) - Certificate valid for $DAYS_LEFT more days." >> $LOG
        fi

ssl_renewal_cron:
  cron.present:
    - name: /usr/local/bin/renew-ssl.sh
    - user: root
    - minute: 0
    - hour: 2
    - daymonth: "*/1"
    - require:
      - file: ssl_renewal_script

verify_ssl_cert:
  cmd.run:
    - name: openssl x509 -in /etc/ssl/foodrush/server.crt -noout -text | grep "Not After"
    - require:
      - cmd: generate_ssl_cert