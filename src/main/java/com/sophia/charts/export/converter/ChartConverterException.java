/**
 * @license Highcharts JS v2.3.3 (2012-11-02)
 *
 * (c) 20012-2014
 * 
 * Author: Gert Vaartjes
 *
 * License: www.highcharts.com/license
 */
package com.sophia.charts.export.converter;

public class ChartConverterException extends Exception {

	private static final long serialVersionUID = -5110552374074051446L;
	private String mistake;

	public ChartConverterException() {
		super();
		mistake = "unknown to men";
	}

	public ChartConverterException(String err) {
		super(err); // call super class constructor
		mistake = err; // save message
	}

	public String getError() {
		return mistake;
	}

}
