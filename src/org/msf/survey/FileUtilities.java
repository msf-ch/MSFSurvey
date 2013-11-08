package org.msf.survey;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Date;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.text.format.DateFormat;

public class FileUtilities {
	
	public static final String FILE_NAME_DATE_FORMAT_STRING = "yyyy_MM_dd";
	
	public static String getSaveFileDatedName(String fileType, String fileDetail, String suffix) {
		return fileType + "-" + 
				fileDetail + "-"+ 
				DateFormat.format(FILE_NAME_DATE_FORMAT_STRING, new Date()) + "-" + 
				new Date().getTime() + 
				"." + suffix;
	}

	public static void ensureDirectoriesExist() {
		Constants.ENCOUNTER_DIR.mkdirs();
		Constants.REPORT_STORAGE_DIR.mkdirs();
	}

	public static String readFileToString(File file) throws IOException {
		BufferedReader reader = new BufferedReader(new FileReader(file));
		String line = null;
		StringBuilder stringBuilder = new StringBuilder((int) file.length() / 3);
		String ls = System.getProperty("line.separator");

		while ((line = reader.readLine()) != null) {
			stringBuilder.append(line);
			stringBuilder.append(ls);
		}
		reader.close();

		String result = stringBuilder.toString();
		return result;
	}

	public static void writeStringToFile(File file, String stringToWrite)
			throws IOException {
		BufferedWriter writer = new BufferedWriter(new FileWriter(file));
		writer.write(stringToWrite);

		writer.close();
	}

	public static JSONObject readJSONObjectFromFile(File jsonFile)
			throws IOException, JSONException {
		String jsonString = readFileToString(jsonFile);
		JSONObject jsonObject = new JSONObject(jsonString);

		return jsonObject;
	}

	public static JSONArray readJSONArrayFromFile(File jsonFile)
			throws IOException, JSONException {
		String jsonString = readFileToString(jsonFile);
		JSONArray jsonArray = new JSONArray(jsonString);

		return jsonArray;
	}

	public static void writeJSONObjectToFile(File file, JSONObject jsonObject)
			throws IOException, JSONException {
		String jsonString = jsonObject.toString();
		writeStringToFile(file, jsonString);
	}

	public static String readStringFromInputStream(InputStream is) throws IOException {
		BufferedReader reader = new BufferedReader(new InputStreamReader(is));

		String line = null;
		StringBuilder stringBuilder = new StringBuilder();
		String ls = System.getProperty("line.separator");

		while ((line = reader.readLine()) != null) {
			stringBuilder.append(line);
			stringBuilder.append(ls);
		}
		reader.close();
		String jsonString = stringBuilder.toString();

		return jsonString;
	}
}
