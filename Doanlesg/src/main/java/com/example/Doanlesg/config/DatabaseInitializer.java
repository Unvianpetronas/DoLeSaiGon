package com.example.Doanlesg.config; // Make sure this package matches your project structure

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
@Profile("!test") // Optional: Prevents this from running during tests
public class DatabaseInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Value("${spring.datasource.url}")
    private String mainDatasourceUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.driverClassName}")
    private String driverClassName;

    // Optional: if you need to pass specific properties like encrypt/trustServerCertificate
    // to the master connection, you can define them.
    // For simplicity, this example assumes they might be part of the main URL
    // and getMasterDatasourceUrl will try to preserve them.
    // If not, you might need to parse them separately or add them explicitly.


    /**
     * Extracts the database name from a JDBC URL.
     * Example: "jdbc:sqlserver://host;databaseName=MyDb;otherParam=val" -> "MyDb"
     *
     * @param url The JDBC URL string.
     * @return The extracted database name.
     * @throws IllegalArgumentException if the databaseName parameter cannot be found or extracted.
     */
    private String getDatabaseNameFromUrl(String url) {
        final String DBNAME_MARKER = "databaseName="; // The key we are looking for

        String urlLower = url.toLowerCase();
        String markerLower = DBNAME_MARKER.toLowerCase();

        int markerStartIndexInLower = urlLower.indexOf(markerLower);

        if (markerStartIndexInLower != -1) {
            int valueStartIndexInOriginalUrl = markerStartIndexInLower + DBNAME_MARKER.length();

            if (valueStartIndexInOriginalUrl < url.length()) {
                int valueEndIndexInOriginalUrl = url.indexOf(';', valueStartIndexInOriginalUrl);
                if (valueEndIndexInOriginalUrl == -1) {
                    return url.substring(valueStartIndexInOriginalUrl);
                } else {
                    return url.substring(valueStartIndexInOriginalUrl, valueEndIndexInOriginalUrl);
                }
            }
        }
        throw new IllegalArgumentException("Could not extract databaseName from URL: " + url +
                ". Ensure 'databaseName' parameter is present and correctly formatted.");
    }

    /**
     * Modifies the original JDBC URL to point to the 'master' database,
     * attempting to preserve other parameters.
     *
     * @param originalUrl  The original JDBC URL for the target database.
     * @param targetDbName The name of the target database to be replaced.
     * @return A new JDBC URL string pointing to the 'master' database.
     * @throws IllegalArgumentException if the databaseName parameter cannot be found or replaced.
     */
    private String getMasterDatasourceUrl(String originalUrl, String targetDbName) {
        // This pattern will find "databaseName=<targetDbName>" case-insensitively
        // and replace it with "databaseName=master".
        // Pattern.quote is used for targetDbName in case it contains special regex characters.
        Pattern pattern = Pattern.compile(
                Pattern.quote("databaseName=") + Pattern.quote(targetDbName),
                Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(originalUrl);
        if (matcher.find()) {
            // It's generally safer to use a fixed case for the key in the replacement string.
            return matcher.replaceFirst("databaseName=master");
        }
        throw new IllegalArgumentException(
                "Could not modify URL to point to master database. Pattern not found for: databaseName=" + targetDbName + " in URL: " + originalUrl
        );
    }


    @Override
    public void run(ApplicationArguments args) throws Exception {
        String targetDbName;
        try {
            targetDbName = getDatabaseNameFromUrl(mainDatasourceUrl);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to initialize database: Could not determine target database name from URL '{}'. Please check your 'spring.datasource.url' configuration.", mainDatasourceUrl, e);
            // Optionally re-throw or exit if this is critical
            // throw new IllegalStateException("Cannot proceed without a valid target database name.", e);
            return; // Stop further processing
        }

        String masterUrl;
        try {
            masterUrl = getMasterDatasourceUrl(mainDatasourceUrl, targetDbName);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to initialize database: Could not construct master database URL from '{}'.", mainDatasourceUrl, e);
            return; // Stop further processing
        }

        logger.info("Attempting to ensure database '{}' exists.", targetDbName);
        logger.debug("Master Datasource URL for check: {}", masterUrl);


        DriverManagerDataSource masterDataSource = new DriverManagerDataSource();
        masterDataSource.setDriverClassName(this.driverClassName); // Use configured driver
        masterDataSource.setUrl(masterUrl);
        masterDataSource.setUsername(this.username);
        masterDataSource.setPassword(this.password);

        // For SQL Server, if encrypt=true and trustServerCertificate=true are needed for the master connection,
        // and they are part of the original URL, the getMasterDatasourceUrl should preserve them.
        // If they need to be set explicitly:
        // Properties connectionProps = new Properties();
        // if (mainDatasourceUrl.toLowerCase().contains("encrypt=true")) {
        //     connectionProps.setProperty("encrypt", "true");
        // }
        // if (mainDatasourceUrl.toLowerCase().contains("trustservercertificate=true")) {
        //     connectionProps.setProperty("trustServerCertificate", "true");
        // }
        // if (!connectionProps.isEmpty()) {
        //     masterDataSource.setConnectionProperties(connectionProps);
        // }


        JdbcTemplate jdbcTemplate = new JdbcTemplate(masterDataSource);

        // SQL Server specific query to check if a database exists
        String checkDbExistsSql = "SELECT name FROM sys.databases WHERE name = N'" + targetDbName + "'";
        String createDbSql = "CREATE DATABASE [" + targetDbName + "]"; // Use brackets for safety with special chars

        try {
            String dbNameResult = jdbcTemplate.queryForObject(checkDbExistsSql, String.class);
            if (dbNameResult != null && dbNameResult.equalsIgnoreCase(targetDbName)) {
                logger.info("Database '{}' already exists. No action needed.", targetDbName);
            }
            // If queryForObject returns a result, it means the DB exists.
            // If it throws EmptyResultDataAccessException, it means it doesn't.
        } catch (EmptyResultDataAccessException e) {
            logger.info("Database '{}' does not exist. Attempting to create it...", targetDbName);
            try {
                jdbcTemplate.execute(createDbSql);
                logger.info("Database '{}' created successfully.", targetDbName);
            } catch (Exception createEx) {
                logger.error("Failed to create database '{}'. Please check permissions for user '{}' and SQL Server logs. Error: {}",
                        targetDbName, this.username, createEx.getMessage(), createEx);
                // Depending on your application's needs, you might want to re-throw this
                // to prevent the application from starting if the DB is essential.
                throw new RuntimeException("Failed to create database: " + targetDbName, createEx);
            }
        } catch (Exception ex) {
            logger.error("Error checking for database existence for '{}': {}. Please ensure SQL Server is accessible and user '{}' has necessary permissions on the master database.",
                    targetDbName, ex.getMessage(), this.username, ex);
            throw new RuntimeException("Error checking for database existence: " + targetDbName, ex);
        }
    }
}