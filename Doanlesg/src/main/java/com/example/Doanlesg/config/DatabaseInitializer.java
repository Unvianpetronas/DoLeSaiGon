package com.example.Doanlesg.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DatabaseInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final String mainDatasourceUrl;
    private final String username;
    private final String password;
    private final String driverClassName;

    public DatabaseInitializer(String mainDatasourceUrl, String username, String password, String driverClassName) {
        this.mainDatasourceUrl = mainDatasourceUrl;
        this.username = username;
        this.password = password;
        this.driverClassName = driverClassName;
    }

    public void initialize() {
        String targetDbName;
        try {
            targetDbName = getDatabaseNameFromUrl(mainDatasourceUrl);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to initialize database: Could not determine target database name from URL '{}'. Please check your 'spring.datasource.url' configuration.", mainDatasourceUrl, e);
            // Critical failure, re-throw to stop application startup if DB name is essential
            throw new IllegalStateException("Cannot proceed without a valid target database name from URL: " + mainDatasourceUrl, e);
        }

        String masterUrl;
        try {
            masterUrl = getMasterDatasourceUrl(mainDatasourceUrl, targetDbName);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to initialize database: Could not construct master database URL from '{}' to target '{}'.", mainDatasourceUrl, targetDbName, e);
            throw new IllegalStateException("Cannot construct master database URL for target: " + targetDbName, e);
        }

        logger.info("Attempting to ensure database '{}' exists using master URL: {}", targetDbName, masterUrl);

        DriverManagerDataSource masterDataSource = new DriverManagerDataSource();
        masterDataSource.setDriverClassName(this.driverClassName);
        masterDataSource.setUrl(masterUrl);
        masterDataSource.setUsername(this.username);
        masterDataSource.setPassword(this.password);

        // Note: If encrypt=true and trustServerCertificate=true are required for the master connection,
        // and they are part of the original URL, getMasterDatasourceUrl should preserve them.
        // If not, you might need to parse them from mainDatasourceUrl and add them to masterDataSource connection properties.

        JdbcTemplate jdbcTemplate = new JdbcTemplate(masterDataSource);

        // SQL Server specific query to check if a database exists
        String checkDbExistsSql = "SELECT name FROM sys.databases WHERE name = N'" + targetDbName + "'";
        // Use brackets for safety if database name could contain special characters or keywords
        String createDbSql = "CREATE DATABASE [" + targetDbName + "]";

        try {
            String dbNameResult = jdbcTemplate.queryForObject(checkDbExistsSql, String.class);
            // queryForObject will throw EmptyResultDataAccessException if no rows are found.
            // If it returns a result, and it matches, the DB exists.
            if (dbNameResult != null && dbNameResult.equalsIgnoreCase(targetDbName)) {
                logger.info("Database '{}' already exists. No action needed.", targetDbName);
            } else {
                // This case should ideally not be hit if queryForObject works as expected,
                // as a non-match would still mean a row was returned.
                // But good for defensive coding.
                logger.warn("Database check for '{}' returned an unexpected result: '{}'. Assuming it does not exist and attempting creation.", targetDbName, dbNameResult);
                attemptDbCreation(jdbcTemplate, createDbSql, targetDbName);
            }
        } catch (EmptyResultDataAccessException e) {
            // This is the expected path if the database does not exist.
            logger.info("Database '{}' does not exist. Attempting to create it...", targetDbName);
            attemptDbCreation(jdbcTemplate, createDbSql, targetDbName);
        } catch (Exception ex) {
            logger.error("Error during database existence check or creation for '{}': {}. Please ensure SQL Server is accessible and user '{}' has necessary permissions on the master database.",
                    targetDbName, ex.getMessage(), this.username, ex);
            throw new RuntimeException("Critical error during database initialization for: " + targetDbName, ex);
        }
    }

    private void attemptDbCreation(JdbcTemplate jdbcTemplate, String createDbSql, String targetDbName) {
        try {
            jdbcTemplate.execute(createDbSql);
            logger.info("Database '{}' created successfully.", targetDbName);
        } catch (Exception createEx) {
            logger.error("Failed to create database '{}'. User: '{}'. Error: {}",
                    targetDbName, this.username, createEx.getMessage(), createEx);
            // Re-throw to halt application startup if DB creation is critical.
            throw new RuntimeException("Failed to create database: " + targetDbName, createEx);
        }
    }

    private String getDatabaseNameFromUrl(String url) {
        final String DBNAME_MARKER = "databaseName=";
        String urlLower = url.toLowerCase();
        String markerLower = DBNAME_MARKER.toLowerCase();
        int markerStartIndexInLower = urlLower.indexOf(markerLower);

        if (markerStartIndexInLower != -1) {
            int valueStartIndexInOriginalUrl = markerStartIndexInLower + DBNAME_MARKER.length();
            if (valueStartIndexInOriginalUrl < url.length()) {
                int valueEndIndexInOriginalUrl = url.indexOf(';', valueStartIndexInOriginalUrl);
                if (valueEndIndexInOriginalUrl == -1) { // It's the last parameter
                    return url.substring(valueStartIndexInOriginalUrl);
                } else {
                    return url.substring(valueStartIndexInOriginalUrl, valueEndIndexInOriginalUrl);
                }
            }
        }
        throw new IllegalArgumentException("Could not extract databaseName from URL: " + url +
                ". Ensure 'databaseName' parameter is present and correctly formatted.");
    }

    private String getMasterDatasourceUrl(String originalUrl, String targetDbName) {
        // Using regex for case-insensitive replacement of databaseName parameter
        Pattern pattern = Pattern.compile(
                Pattern.quote("databaseName=") + Pattern.quote(targetDbName),
                Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(originalUrl);
        if (matcher.find()) {
            return matcher.replaceFirst("databaseName=master");
        }
        throw new IllegalArgumentException(
                "Could not modify URL to point to master database. Pattern 'databaseName=" + targetDbName + "' not found in URL: " + originalUrl
        );
    }
}