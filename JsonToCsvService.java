/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.ace2three.AceAdmin.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import com.fasterxml.jackson.dataformat.csv.CsvSchema.Builder;
import java.io.File;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.List;
import static org.apache.commons.lang.StringUtils.isBlank;
import org.apache.log4j.Logger;

/**
 *
 * @author pavanpulla
 */
public class JsonToCsvService  {

    private static final Logger logger = Logger.getLogger(JsonToCsvService.class);

    public CsvSchema createCSVHeaderWithColumns(String[] columns) {
        return createCSVHeaderWithColumns(Arrays.asList(columns));
    }

    public CsvSchema createCSVHeaderWithColumns(List<String> columns) {
        Builder csvSchemaBuilder = CsvSchema.builder();
        columns.stream().forEach(columnName -> csvSchemaBuilder.addColumn(columnName));
        return csvSchemaBuilder.build().withHeader();
    }

    public CsvSchema createCSVHeaderWithColumns(JsonNode jsonNode) {
        logger.info("JSONNODE : " + jsonNode);
        Builder csvSchemaBuilder = CsvSchema.builder();
        jsonNode.fieldNames().forEachRemaining(columnName -> {
            csvSchemaBuilder.addColumn(columnName);
        });
        return csvSchemaBuilder.build().withHeader();
    }

    public boolean generateCsvFileWithHeader(String filePath, JsonNode jsonNode) throws Exception {
        return generateCsvFileWithHeader(filePath, jsonNode, createCSVHeaderWithColumns(jsonNode));
    }
    
    public boolean generateCsvFileWithHeader(OutputStream stream, JsonNode jsonNode) throws Exception {
        return generateCsvFileWithHeader(stream, jsonNode, createCSVHeaderWithColumns(jsonNode));
    }

    public boolean generateCsvFileWithHeader(String filePath, JsonNode jsonNode, CsvSchema csvSchema) throws Exception {
        if (isBlank(filePath) || jsonNode == null || csvSchema == null) {
            return false;
        }
        CsvMapper csvMapper = new CsvMapper();
        csvMapper.writerFor(JsonNode.class).
                with(createCSVHeaderWithColumns(jsonNode.elements().next())).
                writeValue(new File(filePath), jsonNode);
        return true;
    }
    
    public boolean generateCsvFileWithHeader(OutputStream stream, JsonNode jsonNode, CsvSchema csvSchema) throws Exception {
        if (jsonNode == null || csvSchema == null) {
            return false;
        }
        CsvMapper csvMapper = new CsvMapper();
        csvMapper.writerFor(JsonNode.class).
                with(createCSVHeaderWithColumns(jsonNode.elements().next())).
                writeValue(stream, jsonNode);
        return true;
    }

}
