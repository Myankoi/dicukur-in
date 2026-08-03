# Build
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Copy seluruh file
COPY . .

# Convert format Windows (CRLF) ke Linux (LF) & beri izin eksekusi
RUN apt-get update && apt-get install -y dos2unix && \
    dos2unix ./mvnw && \
    chmod +x ./mvnw


# Jalankan build
RUN ./mvnw clean package -Pproduction -DskipTests

# Runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]