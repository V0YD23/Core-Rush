# Use the official Node.js image
FROM node:21.5.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Set environment variables inside the container
ENV NEXT_PUBLIC_BACKEND_API=https://localhost:5000
ENV NEXT_PUBLIC_NFT_ADDRESS=0xb668133744B73e08EA00DC72295F7e8526279b34
ENV NEXT_PUBLIC_LIST_NFT_ADDRESS=0x7a8A1443eEC098Dcd39Ba74a589768ad53021131
ENV NEXT_PUBLIC_STAKING_ADDRESS=0xAeE90204B5E530FE6c0B2C0299436E0Be88529f4
ENV NEXT_PUBLIC_PINATA_API_KEY=30822c42812cd6ea5b8c
ENV NEXT_PUBLIC_PINATA_SECRET_KEY=efa8ce1324868fbe358863c37069edb9542087a67df7ddaf6b61ca10a232081b
ENV NEXT_PUBLIC_TOURNAMENT_NFT_ADDRESS=0xdAf27a5C2F1307f3b5703E63229A2E1346278496

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "dev"]
