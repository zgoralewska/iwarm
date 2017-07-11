package me.zgoralewska.iwarm.helpers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.location.LocationManager;

import com.google.android.gms.location.Geofence;

import java.util.ArrayList;
import java.util.List;

import me.zgoralewska.iwarm.GeofenceRequester;
import me.zgoralewska.iwarm.geofenceConfig.GeofenceUtils;
import me.zgoralewska.iwarm.geofenceConfig.SimpleGeofence;
import me.zgoralewska.iwarm.geofenceConfig.SimpleGeofenceStore;

/**
 * Created by DELL on 2015-07-13.
 */
public class GpsLocationReceiver extends BroadcastReceiver {

    private SimpleGeofenceStore mPrefs;
    private GeofenceRequester mGeofenceRequester;
    private List<Geofence> mCurrentGeofences;
    private boolean gpsStatus = false;
    private int gpsAppStatus = 0;

    public GpsLocationReceiver(){}


    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().matches(GeofenceUtils.ACTION_GPS_STATUS_CHANGE)) {

            gpsStatus = getActualState(context);
            mPrefs = new SimpleGeofenceStore(context);

            if(gpsStatus) {;
                gpsAppStatus = mPrefs.getAppGpsStatus();

                //Jesli aplikacja przechodzi ze stanu gps off na gps on
                if(gpsAppStatus == 0 && gpsStatus) {
                    mPrefs.setAppGpsStatus(1);
                    
                    mCurrentGeofences = new ArrayList<Geofence>();
                    mGeofenceRequester = new GeofenceRequester(context);

                    SimpleGeofence geofence = mPrefs.getGeofence("1");

                    if (geofence != null) {
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
            else{
                mPrefs.setAppGpsStatus(0);
            }
        }
    }

    private boolean getActualState(Context context){
        LocationManager lm = null;
        boolean gps_enabled = false;
        boolean network_enabled = false;

        if(lm==null)
            lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        try{
            gps_enabled = lm.isProviderEnabled(LocationManager.GPS_PROVIDER);
            network_enabled = lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
        }catch(Exception ex){}

        if(!gps_enabled && !network_enabled){
            return false;
        }
        else{
            return true;
        }
    }


}
