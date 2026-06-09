package com.example.demo.security;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.authentication.
UsernamePasswordAuthenticationToken;

import org.springframework.security.core.authority.
SimpleGrantedAuthority;

import org.springframework.security.core.context.
SecurityContextHolder;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JWTFilter
extends OncePerRequestFilter {

    @Autowired
    private JWTUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request) {

        String path =
                request.getServletPath();

        String method =
                request.getMethod();

        // PUBLIC APIs
        return

            // FILE DOWNLOAD
            (method.equals("GET") && path.startsWith("/projects/download/"))

            ||

            (method.equals("GET") && path.equals("/landing/click"))

            ||

            // OPTIONS (CORS preflight)
            method.equals("OPTIONS")

            ||

            // LOGIN / REGISTER
            (method.equals("POST")

            &&

            (path.equals("/users/login")

            || path.equals("/auth/login")

            || path.equals("/auth/register")

            || path.equals("/users")))

            // SWAGGER
            ||

            path.startsWith("/swagger-ui")

            ||

            path.startsWith("/v3/api-docs")

            ||

            path.equals("/swagger-ui.html")

            ||

            path.equals("/error");
    }

    @Override
    protected void doFilterInternal(

            HttpServletRequest request,

            HttpServletResponse response,

            FilterChain filterChain)

            throws ServletException, IOException {

        String authHeader =
                request.getHeader(
                        "Authorization");

        // NO TOKEN
        if(authHeader == null ||

           !authHeader.startsWith(
                   "Bearer ")) {

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED);

            response.getWriter()
                    .write(
                            "JWT Token Required");

            return;
        }

        try {

            String token =
                    authHeader.substring(7);

            String email =
                    jwtUtil.validateToken(token);

            String role =

                    jwtUtil
                    .validateAllClaims(token)

                    .get("role",
                            String.class);

            String normalizedRole =
                    role.toUpperCase(
                            Locale.ROOT);

            if(normalizedRole
                    .startsWith(
                            "ROLE_")) {

                normalizedRole =
                        normalizedRole
                        .substring(5);
            }

            UsernamePasswordAuthenticationToken
            authentication =

                    new UsernamePasswordAuthenticationToken(

                            email,

                            null,

                            List.of(

                                    new SimpleGrantedAuthority(

                                            "ROLE_"
                                            + normalizedRole
                                    )
                            )
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication);

            filterChain.doFilter(
                    request,
                    response);
        }

        catch(Exception e) {

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED);

            response.getWriter()
                    .write(
                            "Invalid JWT Token");
        }
    }
}
