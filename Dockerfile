FROM ubuntu:latest
COPY src/* /var/whatsapp-bot/
RUN cd /var/whatsapp-bot/ &&\
    apt update -y &&\
    # Installing the temporary tools
    apt install curl -y &&\
    # Adding Nodejs 10 Repo
    curl -sL https://deb.nodesource.com/setup_10.x | bash - &&\
    # Installing the tools
    apt install nodejs chromium-browser -y &&\
    # Installing dependencies: Chromedriver
    npm install -g chromedriver@latest --unsafe-perm &&\
    npm install
WORKDIR /var/whatsapp-bot/
ENTRYPOINT [ "node", "main.js" ]
CMD []  