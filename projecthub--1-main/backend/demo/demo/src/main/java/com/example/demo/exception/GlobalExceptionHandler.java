package com.example.demo.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;

import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice

public class GlobalExceptionHandler {

    // =====================================
    // VALIDATION ERRORS
    // =====================================

    @ExceptionHandler(
            MethodArgumentNotValidException.class)

    public ResponseEntity<Map<String, String>>
    handleValidationExceptions(

            MethodArgumentNotValidException ex) {

        Map<String, String> errors =
                new HashMap<>();

        ex.getBindingResult()

          .getFieldErrors()

          .forEach(error ->

              errors.put(
                      error.getField(),

                      error.getDefaultMessage()
              )
          );

        return new ResponseEntity<>(
                errors,
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>>
    handleResponseStatusException(

            ResponseStatusException ex) {

        Map<String, String> error =
                new HashMap<>();

        error.put(
                "message",

                ex.getReason() != null
                        ? ex.getReason()
                        : ex.getMessage());

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(error);
    }

    // =====================================
    // GENERAL ERRORS
    // =====================================

    @ExceptionHandler(Exception.class)

    public ResponseEntity<Map<String, String>>
    handleGeneralException(

            Exception ex) {

        Map<String, String> error =
                new HashMap<>();

        error.put(
                "message",

                ex.getMessage());

        return new ResponseEntity<>(
                error,
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
