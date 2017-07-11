package me.zgoralewska.iwarm;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender.SendIntentException;
import android.os.Bundle;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.GoogleApiClient.ConnectionCallbacks;
import com.google.android.gms.common.api.GoogleApiClient.OnConnectionFailedListener;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.location.LocationServices;

import java.util.List;

import me.zgoralewska.iwarm.geofenceConfig.GeofenceUtils;

/**
 * Class for connecting to Location Services and removing geofences.
 * <p>
 * <b>
 * Note: Clients must ensure that Google Play services is available before removing geofences.
 * </b> Use GooglePlayServicesUtil.isGooglePlayServicesAvailable() to check.
 * <p>
 * To use a GeofenceRemover, instantiate it, then call either RemoveGeofencesById() or
 * RemoveGeofencesByIntent(). Everything else is done automatically.
 *
 */
public class GeofenceRemover implements ConnectionCallbacks, OnConnectionFailedListener,
        ResultCallback<Status> {

    // Storage for a context from the calling client
    private Context mContext;

    // Stores the current list of geofences
    private List<String> mCurrentGeofenceIds;

    // Stores the current instantiation of the location client
    private GoogleApiClient mGoogleApiClient;

    // The PendingIntent sent in removeGeofencesByIntent
    private PendingIntent mCurrentIntent;

    /*
     *  Record the type of removal. This allows continueRemoveGeofences to call the appropriate
     *  removal request method.
     */
    private GeofenceUtils.REMOVE_TYPE mRequestType;

    /*
     * Flag that indicates whether an add or remove request is underway. Check this
     * flag before attempting to start a new request.
     */
    private boolean mInProgress;

    /**
     * Construct a GeofenceRemover for the current Context
     *
     * @param context A valid Context
     */
    public GeofenceRemover(Context context, PendingIntent intent) {
        // Save the context
        mContext = context;
        mCurrentIntent = intent;

        // Initialize the globals to null
        mCurrentGeofenceIds = null;
        mGoogleApiClient = null;
        mInProgress = false;

    }

    /**
     * Set the "in progress" flag from a caller. This allows callers to re-set a
     * request that failed but was later fixed.
     *
     * @param flag Turn the in progress flag on or off.
     */
    public void setInProgressFlag(boolean flag) {
        // Set the "In Progress" flag.
        mInProgress = flag;
    }

    /**
     * Get the current in progress status.
     *
     * @return The current value of the in progress flag.
     */
    public boolean getInProgressFlag() {
        return mInProgress;
    }

    /**
     * Remove the geofences in a list of geofence IDs. To remove all current geofences associated
     * with a request, you can also call removeGeofencesByIntent.
     * <p>
     * <b>Note: The List must contain at least one ID, otherwise an Exception is thrown</b>
     *
     * @param geofenceIds A List of geofence IDs
     */

    /**
     * Remove the geofences associated with a PendIntent. The PendingIntent is the one used
     * in the request to add the geofences; all geofences in that request are removed. To remove
     * a subset of those geofences, call removeGeofencesById().
     *
     * @param requestIntent The PendingIntent used to request the geofences
     */

    /**
     * Once the connection is available, send a request to remove the Geofences. The method
     * signature used depends on which type of remove request was originally received.
     */
    private void continueRemoveGeofences() {
        
        	requestConnection();
        	
        	if(mGoogleApiClient.isConnected()){
        		LocationServices.GeofencingApi.removeGeofences(mGoogleApiClient, mCurrentIntent)
        		.setResultCallback(this);
        	}

    }

    /**
     * Request a connection to Location Services. This call returns immediately,
     * but the request is not complete until onConnected() or onConnectionFailure() is called.
     */
    public void requestConnection() {
        getLocationClient().connect();
    }

    /**
     * Get the current location client, or create a new one if necessary.
     *
     * @return A LocationClient object
     */
    private GoogleApiClient getLocationClient() {
        if (mGoogleApiClient == null) {

        	mGoogleApiClient = new GoogleApiClient.Builder(mContext)
            .addApi(LocationServices.API)
            .addConnectionCallbacks(this)
            .addOnConnectionFailedListener(this)
            .build();  
        }
        return mGoogleApiClient;
    }

    /**
     * When the request to remove geofences by PendingIntent returns, handle the result.
     *
     * @param statusCode the code returned by Location Services
     * @param requestIntent The Intent used to request the removal.
     */


    /**
     * Get a location client and disconnect from Location Services
     */
    private void requestDisconnection() {

        // A request is no longer in progress
        mInProgress = false;

        getLocationClient().disconnect();
        /*
         * If the request was done by PendingIntent, cancel the Intent. This prevents problems if
         * the client gets disconnected before the disconnection request finishes; the location
         * updates will still be cancelled.
         */
        if (mRequestType == GeofenceUtils.REMOVE_TYPE.INTENT) {
            mCurrentIntent.cancel();
        }

    }

    /*
     * Called by Location Services once the location client is connected.
     *
     * Continue by removing the requested geofences.
     */
    @Override
    public void onConnected(Bundle arg0) {
        // If debugging, log the connection
        Log.d(GeofenceUtils.APPTAG, mContext.getString(R.string.connected));

        // Continue the request to remove the geofences
        continueRemoveGeofences();
    }

    /*
     * Called by Location Services if the connection is lost.
     */
    
    public void onDisconnected() {

        // A request is no longer in progress
        mInProgress = false;

        // In debug mode, log the disconnection
        Log.d(GeofenceUtils.APPTAG, mContext.getString(R.string.disconnected));

        // Destroy the current location client
        mGoogleApiClient = null;
    }

    /*
     * Implementation of OnConnectionFailedListener.onConnectionFailed
     * If a connection or disconnection request fails, report the error
     * connectionResult is passed in from Location Services
     */
    @Override
    public void onConnectionFailed(ConnectionResult connectionResult) {

        // A request is no longer in progress
        mInProgress = false;

        /*
         * Google Play services can resolve some errors it detects.
         * If the error has a resolution, try sending an Intent to
         * start a Google Play services activity that can resolve
         * error.
         */
        if (connectionResult.hasResolution()) {

            try {
                // Start an Activity that tries to resolve the error
                connectionResult.startResolutionForResult((Activity) mContext,
                    GeofenceUtils.CONNECTION_FAILURE_RESOLUTION_REQUEST);

            /*
             * Thrown if Google Play services canceled the original
             * PendingIntent
             */
            } catch (SendIntentException e) {
                // Log the error
                e.printStackTrace();
            }

        /*
         * If no resolution is available, put the error code in
         * an error Intent and broadcast it back to the main Activity.
         * The Activity then displays an error dialog.
         * is out of date.
         */
        } else {

            Intent errorBroadcastIntent = new Intent(GeofenceUtils.ACTION_CONNECTION_ERROR);
            errorBroadcastIntent.addCategory(GeofenceUtils.CATEGORY_LOCATION_SERVICES)
                                .putExtra(GeofenceUtils.EXTRA_CONNECTION_ERROR_CODE,
                                        connectionResult.getErrorCode());
            LocalBroadcastManager.getInstance(mContext).sendBroadcast(errorBroadcastIntent);
        }
    }

	@Override
	public void onConnectionSuspended(int arg0) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void onResult(Status result) {
		// TODO Auto-generated method stub
		Intent broadcastIntent = new Intent();
		int statusCode = result.getStatus().getStatusCode();
		
		if (result.getStatus().isSuccess()) {
			// In debug mode, log the result
            Log.d(GeofenceUtils.APPTAG,
                    mContext.getString(R.string.remove_geofences_intent_success));

            // Set the action and add the result message
            broadcastIntent.setAction(GeofenceUtils.ACTION_GEOFENCES_REMOVED);
            broadcastIntent.putExtra(GeofenceUtils.EXTRA_GEOFENCE_STATUS,
                    mContext.getString(R.string.remove_geofences_intent_success));
        }
    	else{
    		// Always log the error
            Log.e(GeofenceUtils.APPTAG,
                    mContext.getString(R.string.remove_geofences_intent_failure, statusCode));

            // Set the action and add the result message
            broadcastIntent.setAction(GeofenceUtils.ACTION_GEOFENCE_ERROR);
            broadcastIntent.putExtra(GeofenceUtils.EXTRA_GEOFENCE_STATUS,
                    mContext.getString(R.string.remove_geofences_intent_failure, statusCode));
    	}
		
		// Broadcast the Intent to all components in this app
        LocalBroadcastManager.getInstance(mContext).sendBroadcast(broadcastIntent);

        // Disconnect the location client
        requestDisconnection();
	}
}
