package me.zgoralewska.iwarm.helpers;

import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;

import me.zgoralewska.iwarm.MainActivity;
import me.zgoralewska.iwarm.geofenceConfig.GeofenceUtils;


public class Authorization extends AsyncTask<String, Void, String> {
	public String email;
    public String password;
    public String houseId;
    public Context context;
	static final String url="http://zgoralewska.me:3000/api/android/login";

	protected String doInBackground(String... info) {
		try {
	        URL u = new URL(url);
	        HttpURLConnection c = (HttpURLConnection) u.openConnection();
	        c.setRequestMethod("POST");
	        c.setUseCaches(false);
	        c.setAllowUserInteraction(false);

            OutputStream os = c.getOutputStream();
            BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(os, "UTF-8"));
            writer.write("email=" + email + "&password=" + password + "&houseId=" + houseId);
            writer.flush();
            writer.close();
            os.close();

            c.connect();
	        int statusCode = c.getResponseCode();

	        Log.i(GeofenceUtils.APPTAG, "Status code"+String.valueOf(statusCode));

	        switch (statusCode) {
	            case 200:
                case 201:
					BufferedReader br = new BufferedReader(new InputStreamReader(c.getInputStream()));
	                StringBuilder sb = new StringBuilder();
	                String line;
	                while ((line = br.readLine()) != null) sb.append(line + "\n");
	                br.close();
	                return sb.toString();
	        }

	    } catch (Exception ex) {
	        Log.i(GeofenceUtils.APPTAG, ex.toString());
	    }
	    return "";
	}

	protected void onPostExecute(String result){
		JSONObject jObj;
		Double cLat = 0.0;
		Double cLng = 0.0;
		Float radius = (float)0;

        if(!result.isEmpty()){
			try {
				jObj = new JSONObject(result);

				cLat = jObj.getDouble("cLat");
				cLng = jObj.getDouble("cLng");
				radius = (float)handleWrongDelimiter(jObj.getString("radius"));

			} catch (JSONException e) {
				e.printStackTrace();
			}

			((MainActivity)context).continueAddGeofence(cLat, cLng, radius);
		}
	}

	private double handleWrongDelimiter(String value){
		double doubleValue = 0;
		if (value != null) {
			try {
				doubleValue = Double.valueOf(value.replace(',', '.'));
			} catch (NumberFormatException e) {
				//Error
			}
		}
		return doubleValue;
	}
}
