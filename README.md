# gc-info-form

cd into this directory
chmod +x launch-*.zsh
open -a Terminal.app ./launch-server.zsh
open -a Terminal.app ./launch-andrews.zsh
open -a Terminal.app ./launch-cnn.zsh


  # Kiosk 1
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk \
  --profile-directory="Profile 1" \
  "https://andrews.edu"

# Kiosk 2
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk \
  --profile-directory="Profile 2" \
  "https://youtube.com"

# Kiosk 3
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk \
  --profile-directory="Profile 3" \
  "https://cnn.com"


  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --new-window \
  --start-fullscreen \
  --app="https://andrews.edu" \
  --app="https://youtube.com" \
  --app="https://cnn.com"


npm init -y
npm install express body-parser cors exceljs