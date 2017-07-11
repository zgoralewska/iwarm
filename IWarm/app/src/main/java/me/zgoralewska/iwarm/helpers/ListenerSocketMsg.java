package me.zgoralewska.iwarm.helpers;

import android.content.Context;
import android.util.Log;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONStringer;

import java.net.URISyntaxException;

import me.zgoralewska.iwarm.geofenceConfig.GeofenceUtils;

/**
 * Created by DELL on 2016-03-18.
 */
public class ListenerSocketMsg {
    private Context context;
    private Socket mSocket;
    {
        try {
            mSocket = IO.socket("http://zgoralewska.me:3000");
        } catch (URISyntaxException e) {}
    }

    public ListenerSocketMsg(Context context){
        this.context = context;
        final String orderName = "orderResponse";
        mSocket.on(orderName, onNewMessage);
    }


    private Emitter.Listener onNewMessage = new Emitter.Listener() {

        @Override
        public void call(final Object... args) {
            JSONObject data = (JSONObject) args[0];
            String tempOrder;
            String tempActual;
            String result;

            Log.i(GeofenceUtils.APPTAG, "New message received: " + data.toString());

            try {
                tempOrder = data.getString("tempOrder");
                tempActual = data.getString("tempActual");

                if(tempOrder.equals(tempActual)){
                    result = "success";
                }
                else{
                    result = "failure";
                }
                NotificationHelper.prepareNotification("Order response", result, context);

            } catch (JSONException e) {
                return;
            }

        }
    };
}
