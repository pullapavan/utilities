/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.a23.admin.config;

import com.a23.admin.constants.AuthConstants;
import com.a23.admin.constants.CommonConstants;
import com.a23.admin.security.auth.AdminUserDetailsService;
import com.a23.admin.security.auth.AgentAuthenticationProvider;
import com.a23.admin.security.auth.JwtAuthenticationFilter;
import com.a23.admin.security.auth.MD5PasswordEncoder;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 *
 * @author phanic
 */
@Configuration
@EnableWebSecurity
@Slf4j
public class AdminSecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Autowired
    AgentAuthenticationProvider authenticationProvider;
    
    @Autowired
    JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Autowired
    AdminUserDetailsService userDetailsService;
    
    public static final Map<String, PasswordEncoder> passwordEncoders = new HashMap<>();
    
    static{
        passwordEncoders.put(CommonConstants.A23_CHANNEL, new MD5PasswordEncoder());
        passwordEncoders.put(CommonConstants.FF_CHANNEL, null);
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.authenticationProvider(authenticationProvider);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http = http.cors()
            .and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and().exceptionHandling()
            .accessDeniedHandler(this::accessDeniedHandler)
            .authenticationEntryPoint(this::authenticationEntryPoint)
            .and();
        
        http
                .authorizeRequests()
                .antMatchers("/agent/login").permitAll()
                .antMatchers("/ameyo/autologin").permitAll()
                .antMatchers("/ameyo/playerdetails").permitAll()
                .antMatchers("/bonus/insert").permitAll()
                .antMatchers("/bonus/update").permitAll()
                .anyRequest().authenticated();
        
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);    
    }
    
    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(Collections.singletonList("*"));
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
    
    private void authenticationEntryPoint(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        log.error("Authentication exception at security config ",authException);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        final Exception exception = (Exception) request.getAttribute(AuthConstants.JWT_EXCEPTION);
        if (exception != null) {
            response.getWriter().write(exception.getMessage());
        } else{
            response.getWriter().write(authException.getMessage());
        }
    }

    private void accessDeniedHandler(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
            throws IOException, ServletException {
        Authentication auth 
          = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            log.error("Access Denied User: " + auth.getName() 
              + " attempted to access the protected URL: "
              + request.getRequestURI()+" hsr context path "+request.getContextPath());
        }
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.getWriter().write(HttpStatus.FORBIDDEN.getReasonPhrase());
    }
        
}
