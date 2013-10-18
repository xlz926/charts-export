package com.sophia.charts.export.util;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

public enum MimeType {
	PNG("image/png", "png"),
	JPEG("image/jpeg", "jpeg"),
	PDF("application/pdf", "pdf"),
	SVG("image/svg+xml", "svg");

	private static final Map<String, MimeType> lookup = new HashMap<String, MimeType>();

	static {
		for (MimeType m : EnumSet.allOf(MimeType.class)) {
			lookup.put(m.getType(), m);
			lookup.put(m.getExtension(), m);
		}
	}

	private String type;
	private String extension;

	private MimeType(String type, String extension) {
		this.type = type;
		this.extension = extension;
	}

	public String getType() {
		return type;
	}

	public String getExtension() {
		return extension;
	}

	public static MimeType get(String type) {
		MimeType mime = lookup.get(type);
		if (mime != null) {
			return mime;
		}
		return MimeType.PNG;
	}
}
