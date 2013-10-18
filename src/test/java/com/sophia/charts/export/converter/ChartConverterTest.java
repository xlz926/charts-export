package com.sophia.charts.export.converter;

import static org.junit.Assert.fail;

import javax.annotation.Resource;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractJUnit4SpringContextTests;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath:test.xml")
public class ChartConverterTest extends AbstractJUnit4SpringContextTests {

	@Autowired
	private ChartConverter chartConverter;
	
	@Test
	public void test() {
		fail("Not yet implemented");
	}

}
