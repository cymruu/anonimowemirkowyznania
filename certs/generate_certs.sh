openssl genrsa -des3 -passout pass:passw0rd -out keypair.key 2048
openssl rsa -passin pass:passw0rd -in keypair.key -out cert.key
openssl req -new -key ./cert.key -out csr.csr
openssl x509 -req -days 365 -in ./csr.csr -signkey ./cert.key -out cert.crt
mv cert.crt cert.pem