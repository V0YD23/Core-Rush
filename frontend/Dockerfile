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
ENV NEXT_PUBLIC_BACKEND_API=http://localhost:5000
ENV NEXT_PUBLIC_NFT_ADDRESS=0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
ENV NEXT_PUBLIC_LIST_NFT_ADDRESS=0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
ENV NEXT_PUBLIC_STAKING_ADDRESS=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
ENV NEXT_PUBLIC_PINATA_API_KEY=30822c42812cd6ea5b8c
ENV NEXT_PUBLIC_PINATA_SECRET_KEY=efa8ce1324868fbe358863c37069edb9542087a67df7ddaf6b61ca10a232081b
ENV NEXT_PUBLIC_TOURNAMENT_NFT_ADDRESS=0x610178dA211FEF7D417bC0e6FeD39F05609AD788
ENV NEXT_PUBLIC_TOURNAMENT_LOGIC_ADDRESS=0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e
# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "dev"]
