package com.mindmate.ner;

import android.content.Intent;
import android.provider.Settings;
import android.speech.tts.TextToSpeech;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TtsLanguage")
public class TtsLanguagePlugin extends Plugin {

    @PluginMethod
    public void installVoiceData(PluginCall call) {
        try {
            Intent intent = new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("opened", true);
            ret.put("action", "install");
            call.resolve(ret);
        } catch (Exception error) {
            call.reject("Could not open voice installer: " + error.getMessage());
        }
    }

    @PluginMethod
    public void openTtsSettings(PluginCall call) {
        try {
            Intent intent = new Intent("com.android.settings.TTS_SETTINGS");
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("opened", true);
            ret.put("action", "settings");
            call.resolve(ret);
        } catch (Exception ignored) {
            try {
                Intent fallback = new Intent(Settings.ACTION_SETTINGS);
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getActivity().startActivity(fallback);
                JSObject ret = new JSObject();
                ret.put("opened", true);
                ret.put("action", "settings-fallback");
                call.resolve(ret);
            } catch (Exception error) {
                call.reject("Could not open TTS settings: " + error.getMessage());
            }
        }
    }
}
