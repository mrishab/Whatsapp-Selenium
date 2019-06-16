# Test and Debugging
docker run --rm -ti \
        -v "/home/$USER/.config/chromium/Profile 1:/home/root/.config/chromium/Default" \
        -v "/home/$USER/Programming Projects/NodeJS/Whatsapp-Bot:/var/whatsapp-bot" \
        -v "/home/$USER/Pictures/:/home/root/Pictures/" \
        whatsapp-bot bash

# Production
docker run --rm \
        -v "/home/$USER/.config/chromium/Default:/home/root/.config/chromium/Default" \
        -v "/home/$USER/Pictures/:/home/root/Pictures/" \
        whatsapp-bot --individuals "<INDIVIDUAL_1>, <INDIVIDUAL_2>" --groups "<GROUP_1>, <GROUP_2>"
