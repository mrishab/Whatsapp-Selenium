FROM ubuntu:latest
# Adding to PATH: Node JS, NPM
ENV PATH="/opt/node-v10.15.3-linux-x64/bin:${PATH}"
COPY whatsappBot.js main.js /var/whatsapp-bot/
RUN cd ~/ &&\
    apt update -y &&\
    # Installing the temporary tools
    apt install wget xz-utils gnupg -y &&\
    # Downloading: NodeJS
    wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-x64.tar.xz &&\
    # Installing the Google Chrome broswer
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - &&\
    echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list &&\
    apt update -y &&\
    apt install google-chrome-stable -y &&\
    # Installing the NodeJS
    tar -xf node-v10.15.3-linux-x64.tar.xz &&\
    mv node-v10.15.3-linux-x64 /opt/ &&\
    # Dependencies: Chromedriver
    npm install -g chromedriver --unsafe-perm &&\
    # Cleanup
    rm node-v10.15.3-linux-x64.tar.xz &&\
    ## Don't remove wget. It is a dependency for Google chrome browser
    apt remove xz-utils gnupg -y
WORKDIR /var/whatsapp-bot/
ENTRYPOINT [ "node", "main.js" ]
CMD []