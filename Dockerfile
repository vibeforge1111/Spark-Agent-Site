FROM nginx:1.27-alpine@sha256:65645c7bb6a0661892a8b03b89d0743208a18dd2f3f17a54ef4b76fb8e2f2a10

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY index.html   /usr/share/nginx/html/index.html
COPY styles.css   /usr/share/nginx/html/styles.css
COPY app.js       /usr/share/nginx/html/app.js
COPY avatar-3d.js /usr/share/nginx/html/avatar-3d.js
COPY head.glb     /usr/share/nginx/html/head.glb
COPY while-you-sleep.webp /usr/share/nginx/html/while-you-sleep.webp
COPY favicon.svg /usr/share/nginx/html/favicon.svg
COPY og-cover.png /usr/share/nginx/html/og-cover.png
COPY og-cover.jpg /usr/share/nginx/html/og-cover.jpg
COPY spark-logo-192.png /usr/share/nginx/html/spark-logo-192.png
COPY spark-logo-512.png /usr/share/nginx/html/spark-logo-512.png
COPY manifest.json /usr/share/nginx/html/manifest.json
COPY llms.txt      /usr/share/nginx/html/llms.txt
COPY llms-full.txt /usr/share/nginx/html/llms-full.txt
COPY robots.txt    /usr/share/nginx/html/robots.txt
COPY sitemap.xml   /usr/share/nginx/html/sitemap.xml
COPY SECURITY.md   /usr/share/nginx/html/SECURITY.md
COPY privacy.html  /usr/share/nginx/html/privacy.html
COPY terms.html    /usr/share/nginx/html/terms.html
COPY cookies.html  /usr/share/nginx/html/cookies.html
COPY legal.css     /usr/share/nginx/html/legal.css
COPY install.sh    /usr/share/nginx/html/install.sh
COPY install.ps1   /usr/share/nginx/html/install.ps1
COPY install       /usr/share/nginx/html/install
COPY docs          /usr/share/nginx/html/docs
COPY .well-known   /usr/share/nginx/html/.well-known
COPY vendor       /usr/share/nginx/html/vendor

EXPOSE 8080
