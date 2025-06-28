package com.example.Doanlesg.interal;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class PasswordEncoder {
    private static final int SALT_SIZE = 16; // 16 bytes is a standard salt size

    /**
     * Hashes a raw password with a newly generated random salt.
     * The result is a string containing the salt and the hash, ready for storage.
     * @param rawPassword The password to encode.
     * @return A string in the format "salt:hash", both Base64 encoded.
     */
    public String encode(CharSequence rawPassword) {
        // 1. Generate a new random salt for each password
        byte[] salt = new byte[SALT_SIZE];
        new SecureRandom().nextBytes(salt);

        // 2. Hash the password with the salt
        byte[] hashedPassword = hash(rawPassword.toString(), salt);

        // 3. Combine salt and hash for storage, separated by a delimiter.
        // We use Base64 for a compact, URL-safe string representation.
        String encodedSalt = Base64.getEncoder().encodeToString(salt);
        String encodedHash = Base64.getEncoder().encodeToString(hashedPassword);

        return encodedSalt + ":" + encodedHash;
    }

    /**
     * Verifies a raw password against a stored, encoded password.
     * @param rawPassword The password from the login attempt.
     * @param encodedPassword The stored password hash from the database.
     * @return true if the passwords match, false otherwise.
     */
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null || encodedPassword.isEmpty()) {
            return false;
        }

        // 1. Split the stored value into its salt and hash components
        String[] parts = encodedPassword.split(":");
        if (parts.length != 2) {
            // The stored password format is incorrect
            return false;
        }

        try {
            // 2. Decode the salt and the original hash from Base64
            byte[] salt = Base64.getDecoder().decode(parts[0]);
            byte[] originalHash = Base64.getDecoder().decode(parts[1]);

            // 3. Hash the raw (login attempt) password using the *same* salt
            byte[] comparisonHash = hash(rawPassword.toString(), salt);

            // 4. Compare the hashes. Use MessageDigest.isEqual for a constant-time
            // comparison to prevent timing attacks.
            return MessageDigest.isEqual(originalHash, comparisonHash);

        } catch (IllegalArgumentException e) {
            // This can happen if the stored string is not valid Base64
            return false;
        }
    }

    /**
     * The core hashing function. Hashes a password with a given salt using SHA-256.
     */
    private byte[] hash(String password, byte[] salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            // Add the salt first to the digest
            md.update(salt);
            // Now hash the password bytes
            return md.digest(password.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            // This should never happen if SHA-256 is a valid algorithm on the JVM
            throw new IllegalStateException("SHA-256 algorithm not found", e);
        }
    }
}
