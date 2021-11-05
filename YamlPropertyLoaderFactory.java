package com.ace2three.bonusengine.factory;

import java.io.IOException;

import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.DefaultPropertySourceFactory;
import org.springframework.core.io.support.EncodedResource;

/**
 * @author Suresh Meesala
 */
public class YamlPropertyLoaderFactory extends DefaultPropertySourceFactory {

	@Override
	public PropertySource<?> createPropertySource(String name, EncodedResource resource) throws IOException {
		// @formatter:off
		return null == resource 
				? super.createPropertySource(name, resource)
				: new YamlPropertySourceLoader()
					.load(resource.getResource().getFilename(), resource.getResource())
					.stream().findAny().orElse(super.createPropertySource(name, resource));
		// @formatter:off
	}

}
