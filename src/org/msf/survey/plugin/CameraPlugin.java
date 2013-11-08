package org.msf.survey.plugin;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import org.apache.cordova.CordovaArgs;
import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.msf.survey.MsfCamActivity;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class CameraPlugin extends CordovaPlugin {
	public static final String ACTION_TEST_CAM= "testCamera";
	public static final String ACTION_PROCESS_CORDOVA_IMAGE= "processImage";
	
	@Override
	public boolean execute(String action, CordovaArgs args,
			CallbackContext callbackContext) throws JSONException {
		try {
			if (action.equals(ACTION_TEST_CAM)) {
				this.testCamera(args, callbackContext);
				callbackContext.success();
			} else if (action.equals(ACTION_PROCESS_CORDOVA_IMAGE)){
				
			}
		} catch (IOException e) {
			e.printStackTrace();
			callbackContext.error(e.getMessage());
		}
		return super.execute(action, args, callbackContext);
	}

	public void testCamera(CordovaArgs args, CallbackContext callbackContext) throws IOException, JSONException {
		Log.d("MSFPlugin", "Camera started: " + args.toString());
		
		Context context=this.cordova.getActivity().getApplicationContext();
	    Intent intent=new Intent(context,MsfCamActivity.class);
	    cordova.startActivityForResult(this, intent,0);
	}
	
	public void processCordovaImage(CordovaArgs args, CallbackContext callbackContext) throws JSONException {
		try {
			String path = args.getString(0);
			File cacheFile = new File(new URI(path));
			
			String result = "";
			callbackContext.success(new JSONArray().put(result));
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
}
