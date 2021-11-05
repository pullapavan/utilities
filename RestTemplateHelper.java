/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.ace2three.bonusengine.helpers;

import org.apache.log4j.Logger;
import static org.apache.logging.log4j.util.Strings.isBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

/**
 *
 * @author pavanpulla
 */
@Service
public class RestTemplateHelper {

    private static final Logger LOGGER = Logger.getLogger(RestTemplateHelper.class);

    @Autowired
    @Qualifier("commonRestTemplate")
    private RestTemplate restTemplate;

    /**
     *
     * @param <T>
     * @param responseType
     * @param url
     * @return
     */
    public <T> T get(Class<T> responseType, String url) {
        try {
            if (isBlank(url)) {
                throw new IllegalArgumentException("Invalid url!!!");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
            HttpEntity entity = new HttpEntity(headers);

            LOGGER.info("Requesting data from : " + url);
            ResponseEntity<T> response = restTemplate.exchange(url, HttpMethod.GET, entity, responseType);

            return getResponseForSuccessStatus(response);

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            LOGGER.error("Error in Get Request : ", e);
        }

        return null;
    }

    /**
     *
     * @param <T>
     * @param responseEntity {@link ResponseEntity}
     * @return
     */
    private <T> T getResponseForSuccessStatus(ResponseEntity<T> responseEntity) {
        if (responseEntity != null) {
            HttpStatus httpStatus = responseEntity.getStatusCode();
            LOGGER.info("HTTP STATUS CODE : " + httpStatus + " response : " + responseEntity.getBody());
            if (httpStatus == HttpStatus.ACCEPTED || httpStatus == HttpStatus.OK) {
                return responseEntity.getBody();
            }
        }
        return null;
    }

}
