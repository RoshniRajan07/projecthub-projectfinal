package com.example.demo.security;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;

@Component
public class JWTUtil {

    private final String SECRET =
            "mysecretkeymysecretkeymysecretkey12";

    private final Key key =
            Keys.hmacShaKeyFor(SECRET.getBytes());

    // GENERATE TOKEN
    public String generateToken(
            String email,
            String role) {

        return Jwts.builder()

                .setSubject(email)
                .claim("role", role)

                .setIssuedAt(new Date())

                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                + 1000 * 60 * 60))

                .signWith(
                        key,
                        SignatureAlgorithm.HS256)

                .compact();
    }

    // VALIDATE TOKEN
    public String validateToken(String token) {

        return Jwts.parserBuilder()

                .setSigningKey(key)

                .build()

                .parseClaimsJws(token)

                .getBody()

                .getSubject();
    }
    public Claims validateAllClaims(
            String token) {

        return Jwts.parserBuilder()

                .setSigningKey(key)

                .build()

                .parseClaimsJws(token)

                .getBody();
    }
}
