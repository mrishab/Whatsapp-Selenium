# Test and Debugging
docker run --rm -ti \
        -v "/home/$USER/.config/google-chrome:/home/root/.config/google-chrome" \
        -v "<PATH_TO_PROJECT_DIR>:/var/whatsapp-bot" \
        whatsapp-bot bash

# Production
docker run --rm \
        -v "/home/$USER/.config/google-chrome/:/home/root/.config/google-chrome/" \
        whatsapp-bot