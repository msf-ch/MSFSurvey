package org.msf.survey;

import java.io.File;

import android.os.Environment;

public class Constants {
	public static File REPORT_STORAGE_DIR = new File(Environment.getExternalStorageDirectory(), "msf-reports");
	public static File ENCOUNTER_DIR = new File(Environment.getExternalStorageDirectory(), "msf-encounters");
	public static String FORMS_ASSET_DIR_NAME = "www/js/forms";
}
