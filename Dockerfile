FROM ubuntu:latest
# Adding to PATH: Node JS, NPM
ENV PATH="/opt/node-v10.15.3-linux-x64/bin:${PATH}"
COPY whatsappBot.js main.js /var/whatsapp-bot/
RUN cd ~/ &&\
    apt update -y &&\
    # Installing the temporary tools
    apt install wget xz-utils -y &&\
    # Downloading: NodeJS
    wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-x64.tar.xz &&\
    # Downloading: Google Chrome Browser
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb &&\
    # Installing the Chrome Browser
    apt install -f ./google-chrome-stable_current_amd64.deb -y || true &&\
    # Due to some errors, the browser fails to install the first time but works on second attempt
    # The process itself fails but browser is still installed. Hence '|| true' is used to return 0.
    apt install -f ./google-chrome-stable_current_amd64.deb -y || true &&\
    # Installing the NodeJS
    tar -xf node-v10.15.3-linux-x64.tar.xz &&\
    mv node-v10.15.3-linux-x64 /opt/ &&\
    # Dependencies: Chromedriver
    npm install -g chromedriver --unsafe-perm &&\
    # Cleanup
    rm node-v10.15.3-linux-x64.tar.xz &&\
    rm google-chrome-stable_current_amd64.deb &&\
    apt remove wget xz-utils -y
WORKDIR /var/whatsapp-bot/
CMD [ "node", "main.js" ]