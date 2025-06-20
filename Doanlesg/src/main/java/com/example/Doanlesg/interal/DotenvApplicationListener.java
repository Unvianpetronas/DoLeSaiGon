package com.example.Doanlesg.interal;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.context.event.ApplicationPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.PropertiesPropertySource;
import java.util.Properties;

public class DotenvApplicationListener implements ApplicationListener<ApplicationPreparedEvent> {

    @Override
    public void onApplicationEvent(ApplicationPreparedEvent event) {
        // --- THIS IS THE FIX ---
        // Configure Dotenv to look in the directory of the JAR file,
        // ignore if it's missing, and load it.
        Dotenv dotenv = Dotenv.configure()
                .directory("./") // Looks in the current directory
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

        Properties props = new Properties();
        dotenv.entries().forEach(entry -> props.setProperty(entry.getKey(), entry.getValue()));

        ConfigurableEnvironment environment = event.getApplicationContext().getEnvironment();
        environment.getPropertySources().addFirst(new PropertiesPropertySource("dotenvProperties", props));
    }
}