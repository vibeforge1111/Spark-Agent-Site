FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY index.html   /usr/share/nginx/html/index.html
COPY styles.css   /usr/share/nginx/html/styles.css
COPY app.js       /usr/share/nginx/html/app.js
COPY avatar-3d.js /usr/share/nginx/html/avatar-3d.js
COPY head.glb     /usr/share/nginx/html/head.glb

EXPOSE 8080
