# ============================================================
#  Stage 1 – Build the React frontend
# ============================================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ============================================================
#  Stage 2 – Build the Spring Boot backend
# ============================================================
FROM maven:3.9-eclipse-temurin-17 AS backend-build

WORKDIR /app

# Copy POM first to cache dependencies
COPY pom.xml ./
RUN mvn dependency:resolve -B || true

# Copy source code
COPY src ./src

# Copy the built frontend into Spring Boot static resources
RUN mkdir -p src/main/resources/static
COPY --from=frontend-build /app/frontend/dist/ ./src/main/resources/static/

# Build the fat JAR (skip tests for faster CI)
RUN mvn clean package -DskipTests -B

# ============================================================
#  Stage 3 – Slim runtime image
# ============================================================
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=backend-build /app/target/*.jar ./
# Remove the .original jar if present, rename the real one
RUN ls -la && \
    rm -f *-original.jar *original* && \
    mv *.jar app.jar

# Render sets the PORT env var automatically
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
