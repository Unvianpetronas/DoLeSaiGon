package com.example.Doanlesg.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    /**
     * This bean's creation will trigger the database initialization logic.
     * It's named 'databaseInitializerExecutor' to be specific.
     * The DatabaseInitializer instance itself isn't necessarily used elsewhere by injection,
     * but its construction and the call to initialize() are key.
     */
    @Bean(name = "databaseInitializerExecutor")
    @Profile("!test")
    public DatabaseInitializer databaseInitializerExecutor(
            @Value("${spring.datasource.url}") String mainDatasourceUrl,
            @Value("${spring.datasource.username}") String username,
            @Value("${spring.datasource.password}") String password,
            @Value("${spring.datasource.driverClassName}") String driverClassName
    ) {
        DatabaseInitializer initializer = new DatabaseInitializer(mainDatasourceUrl, username, password, driverClassName);
        initializer.initialize(); // CRITICAL: Execute initialization logic here
        return initializer; // Return the instance, though it might not be injected elsewhere
    }

    /**
     * Defines the primary DataSource for the application.
     * This bean will only be created after 'databaseInitializerExecutor' has been fully initialized,
     * ensuring the database has been created (if it didn't exist).
     * This effectively replaces Spring Boot's default auto-configured DataSource if one would have been created.
     */
    @Bean
    @Primary
    @DependsOn("databaseInitializerExecutor") // Ensures this runs AFTER the initializer
    public DataSource dataSource(DataSourceProperties properties) {
        // DataSourceProperties is a convenient way Spring Boot provides to bind all
        // spring.datasource.* properties. The URL here will point to your target database (e.g., DOLESAIGON).
        HikariDataSource dataSource = properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
        return dataSource;
    }
}