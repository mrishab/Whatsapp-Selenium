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
    npm install -g chromedriver@^74 --unsafe-perm &&\
    npm install &&\
    rm -rf /var/lib/apt/lists/*
WORKDIR /var/whatsapp-bot/
ENTRYPOINT [ "node", "main.js" ]
CMD []  