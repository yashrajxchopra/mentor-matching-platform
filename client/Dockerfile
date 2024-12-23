# Use an official Node.js runtime as a parent image
FROM node:20-alpine as build

# Set the working directory in the container
WORKDIR /app

COPY . .

# Copy the build output to the NGINX web root
COPY --from=build /app /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]