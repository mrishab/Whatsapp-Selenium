FROM ubuntu:latest
ENV PATH="/opt/node-v10.15.3-linux-x64/bin:/var/whatsapp-bot/node_modules/chromedriver/lib/chromedriver:${PATH}"
COPY . /var/whatsapp-bot/
RUN cd ~/ &&\
    apt update -y &&\
    apt install wget xz-utils -y &&\
    wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-x64.tar.xz &&\
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb &&\
    apt install -f ./google-chrome-stable_current_amd64.deb -y || true &&\
    apt install -f ./google-chrome-stable_current_amd64.deb -y || true &&\
    tar -xf node-v10.15.3-linux-x64.tar.xz &&\
    mv node-v10.15.3-linux-x64 /opt/ &&\
    rm node-v10.15.3-linux-x64.tar.xz &&\
    apt remove wget xz-utils -y &&\
    npm install
WORKDIR /var/whatsapp-bot/
CMD [ "node", "main.js" ]