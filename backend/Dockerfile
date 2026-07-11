FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN useradd --system --create-home --uid 10001 appuser
# 可执行 JAR 已由本地 JDK 21 的 Maven 测试流程构建，服务器无需再次下载 Maven 依赖。
COPY target/website-backend-*.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
