#!/bin/bash

# Start the Node.js server with nodemon in the background
nodemon server.js &

# Wait a few seconds to ensure the server starts
sleep 3

# Start ngrok to expose the server
ngrok http https://localhost:8443
