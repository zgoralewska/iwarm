package me.zgoralewska.iwarm;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingEvent;

import me.zgoralewska.iwarm.geofenceConfig.GeofenceUtils;
import me.zgoralewska.iwarm.geofenceConfig.SimpleGeofenceStore;
import me.zgoralewska.iwarm.helpers.NotificationHelper;

import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;

public class GeofenceReceiver extends BroadcastReceiver {

	Context context;
	private SimpleGeofenceStore mPrefs;
	private String email;
	private String houseId;
    private Socket mSocket;
    {
        try {
            mSocket = IO.socket("http://zgoralewska.me:3000");
        } catch (URISyntaxException e) {
			Log.e(GeofenceUtils.APPTAG, "Cannot create io socket");
		}
    }


	public GeofenceReceiver() {}

	@Override
	public void onReceive(Context context, Intent intent) {
		Log.i(GeofenceUtils.APPTAG, "In GeofenceReceiver - onReceive");
		this.context = context;

		mPrefs = new SimpleGeofenceStore(context);
		email = mPrefs.getUserEmail();
        houseId = mPrefs.getUserHouseId();

		GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);

		if (geofencingEvent.hasError()) {
			String errorMessage = "Geofence error:"
					+ String.valueOf(geofencingEvent.getErrorCode());
			Log.e(GeofenceUtils.APPTAG, errorMessage);
		} else {
			Log.i(GeofenceUtils.APPTAG, "Geofence received");
		}


        try {
            handleEnterExit(intent);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }


    private void handleEnterExit(Intent intent) throws JSONException {

        // Get the type of transition (entry or exit)
    	GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);
    	int transition = geofencingEvent.getGeofenceTransition();

		String status = "";
        JSONObject msg = new JSONObject();


		switch(transition){

			case Geofence.GEOFENCE_TRANSITION_ENTER:
				Log.i(GeofenceUtils.APPTAG, "Geofence entered");
				status = "Entered";
				break;
			case Geofence.GEOFENCE_TRANSITION_EXIT:
				Log.i(GeofenceUtils.APPTAG, "Geofence exited");
				status = "Exited";
				break;
			default:
				Log.i(GeofenceUtils.APPTAG, "Geofence event unknown "+transition);
		}
		NotificationHelper.prepareNotification("Status changed", status, context);

        try{
            msg.put("type", status);
            msg.put("houseId", houseId);
            msg.put("email", email);
            mSocket.emit("message", msg);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
}


