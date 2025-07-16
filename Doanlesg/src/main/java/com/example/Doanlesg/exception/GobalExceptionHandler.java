package com.example.Doanlesg.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class GobalExceptionHandler {
        @ExceptionHandler(MethodArgumentNotValidException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public Map<String, String> handleValidationErrors(MethodArgumentNotValidException exception) {
            Map<String, String> errors = new HashMap<>();

            // Iterate over all the errors
            exception.getBindingResult().getAllErrors().forEach(error -> {
                String fieldName = ((FieldError) error).getField(); // Cast to FieldError to access the field name
                String errorMessage = error.getDefaultMessage(); // Get the error message
                errors.put(fieldName, errorMessage); // Add to the map
            });

            return errors;

        }
        @ExceptionHandler(EntityNotFoundException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)

        public String handleEntityNotFoundError(EntityNotFoundException exception){
            return exception.getMessage();
        }

}
