package org.msf.survey.test;

import java.io.InputStream;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.msf.survey.CSVDataExport;
import org.msf.survey.FinalActivity;
import org.msf.survey.R;
import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;


@RunWith(RobolectricTestRunner.class)
public class TestingPositive {
	
	@Test
	public void shouldWork() throws Exception {
		String appName = new FinalActivity().getResources().getString(R.string.app_name);
		assert(appName.equals("MSFSurveyFUP"));
		
		InputStream is = Robolectric.application.getAssets().open("www/js/forms/Child_FUP.json");
	}
}
