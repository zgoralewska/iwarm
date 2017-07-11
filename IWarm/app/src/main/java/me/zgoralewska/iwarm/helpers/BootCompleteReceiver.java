package me.zgoralewska.iwarm.helpers;

import android.content.Context;
import android.content.Intent;
import android.support.v4.content.WakefulBroadcastReceiver;

import com.google.android.gms.location.Geofence;

import java.util.ArrayList;
import java.util.List;

import me.zgoralewska.iwarm.GeofenceRequester;
import me.zgoralewska.iwarm.geofenceConfig.SimpleGeofence;
import me.zgoralewska.iwarm.geofenceConfig.SimpleGeofenceStore;

public class BootCompleteReceiver extends WakefulBroadcastReceiver
{ 
  
	private SimpleGeofenceStore mPrefs;
	private GeofenceRequester mGeofenceRequester;
	private List<Geofence> mCurrentGeofences;
	
    public BootCompleteReceiver(){}

    @Override
    public void onReceive(Context context, Intent intent)
    {
    	mPrefs = new SimpleGeofenceStore(context);
    	mCurrentGeofences = new ArrayList<Geofence>();
    	mGeofenceRequester = new GeofenceRequester(context);
    	
    	SimpleGeofence geofence = mPrefs.getGeofence("1");
    	
    	if(geofence != null){
    		mCurrentGeofences.add(geofence.toGeofence());
    		
    		try {
                // Try to add geofences
                mGeofenceRequester.addGeofences(mCurrentGeofences);
            } catch (UnsupportedOperationException e) {
                // Notify user that previous request hasn't finished.
                
            }
    	}
    	
    }
}
