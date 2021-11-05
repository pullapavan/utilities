/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.a23.admin.config;

import com.a23.admin.ddb.models.BaseModel;
import io.kraken.client.KrakenIoClient;
import io.kraken.client.impl.DefaultKrakenIoClient;

import java.util.HashMap;
import java.util.Map;
import javax.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cloudfront.CloudFrontClient;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.s3.S3Client;

/**
 *
 * @author phanic
 */
@Configuration
@Slf4j
public class AwsConfig {

    @Value("${aws_access_key_id}")
    private String aws_access_key_id;
    @Value("${aws_secret_access_key}")
    private String aws_secret_access_key;
    
    @Value("${a23_aws_access_key_id}")
    private String a23_aws_access_key_id;
    @Value("${a23_aws_secret_access_key}")
    private String a23_aws_secret_access_key;
    
    @Value("${a23_kraken_key}")
    private String a23_kraken_key;
     
    @Value("${a23_kraken_secret}")
    private String a23_kraken_secret;
    
    private static final Map<String,DynamoDbTable<? extends BaseModel>> tableSchemas = new HashMap<>();
    private static DynamoDbEnhancedClient dynamoDbEnhancedClient;
    
    
    @PostConstruct
    public void init()
    {
        dynamoDbEnhancedClient = getEnhancedDynamoDbClient();
    }
    
	/**
	 * get the credentials based on profiles configured in spring boot properties
	 * ex(default, app-dev, app-prod)
	 *
	 * @return CloudfrontClient used for making requests to Cloudfront CDN
	 * @throws java.lang.Exception
	 */
	@Bean
	@Primary
	public CloudFrontClient getCredentialsForCloudfront() throws Exception {
		try {
			AwsBasicCredentials awsCreds = AwsBasicCredentials.create(a23_aws_access_key_id, a23_aws_secret_access_key);
			return CloudFrontClient.builder().region(Region.AWS_GLOBAL)
					.credentialsProvider(StaticCredentialsProvider.create(awsCreds)).build();
		} catch (Exception e) {
			log.error("Exception occurred while trying to get AWS Credentials", e);
		}
		return null;
	}
    
    @Bean
    @ConfigurationProperties(prefix = "aws.s3")
    public S3BannerConfig getS3BannerConfig() {
        return new S3BannerConfig();
    }
    /**
     * get the credentials based on profiles configured in spring boot
     * properties ex(default, app-dev, app-prod)
     *
     * @return S3Client used for making requests to S3 Bucket
     * @throws java.lang.Exception
     */
    @Bean
    @Primary
    public S3Client getCredentialsForS3() throws Exception {
        try {
                AwsBasicCredentials awsCreds = AwsBasicCredentials.create(a23_aws_access_key_id, a23_aws_secret_access_key);
                S3Client s3 = S3Client.builder().region(Region.AP_SOUTH_1)
    					.credentialsProvider(StaticCredentialsProvider.create(awsCreds)).build();
                return s3;
        } catch (Exception e) {
                log.error("Exception occurred while trying to get AWS Credentials", e);
                throw e;
        }
    }
    
    /**
     * get the credentials based on profiles configured in spring boot
     * properties ex(default, app-dev, app-prod)
     *
     * @return DynamoDbClient used for making requests to dynamo db
     * @throws java.lang.Exception
     */
    @Bean
    @Primary
    public DynamoDbClient getCredentialsFromApplication() throws Exception {
        try {
            AwsBasicCredentials awsCreds = AwsBasicCredentials.create(
                    aws_access_key_id,
                    aws_secret_access_key);
            return DynamoDbClient.builder()
                    .region(Region.AP_SOUTH_1)
                    .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                    .build();
        } catch (Exception e) {
            log.error("Exception occurred while trying to get AWS Credentials", e);
            throw e;
        }
    }
    
    @Bean
    @Primary
    public DynamoDbEnhancedClient getEnhancedDynamoDbClient() {
        try {
            return DynamoDbEnhancedClient.builder()
                .dynamoDbClient(getCredentialsFromApplication())
                .build();
        } catch (Exception e) {
            log.error("Exception occurred while trying to get AWS Credentials", e);
        }
        return null;
    } 
    
    /**
     * registers and returns Dynamo Table Schema.
     * 
     * @param <T>
     * @param schema
     * @param table
     * @param type
     * @return 
     */
    public static <T extends BaseModel> DynamoDbTable<T> registerTableSchema(String key, String table, Class<T> type){
        log.info(" registering table schema for "+table+" type "+type+" "+key);
        try{
            DynamoDbTable<T> tableSchema = dynamoDbEnhancedClient.table(table, TableSchema.fromBean(type));
            tableSchemas.put(key, tableSchema);
            return tableSchema;
        }catch(Exception ex){
            log.error(" Failed to register table schema ",ex);
        }
        return null;
    }
    
//    public static <T extends BaseModel> DynamoDbIndex<T> registerTableIndex(String key, String table, DynamoDbTable<T> ddbTable){
//        log.info(" registering table index for "+table+" key "+key);
//        try{
//            DynamoDbIndex<T> tableIndex = ddbTable.index(table);
//            tableSchemas.put(key, tableSchema);
//            return tableSchema;
//        }catch(Exception ex){
//            log.error(" Failed to register table schema ",ex);
//        }
//        return null;
//    }
    
    public static <T extends BaseModel> DynamoDbTable<T> getTableSchema(String schema, Class<T> type){
        try{
            if(tableSchemas.get(schema) != null){
                return (DynamoDbTable<T>) tableSchemas.get(schema);
            }
            throw new IllegalArgumentException("No such Schema " + schema);
        }catch(IllegalArgumentException ex){
            log.error(" Exception while retrieving table Schema for class "+type,ex);
        }
        return null;
    }
    
    /**
     * build kraken api
     * @return
     * @throws Exception 
     */
    @Bean
    @Primary
    public KrakenIoClient getCredentialsForKraken() throws Exception {
        try {
            KrakenIoClient krakenIoClient = new DefaultKrakenIoClient(a23_kraken_key,a23_kraken_secret);
            return krakenIoClient;
        } catch (Exception e) {
            log.error("Exception occurred while trying to connect kraken ", e);
            throw e;
        }
    }
    
}
