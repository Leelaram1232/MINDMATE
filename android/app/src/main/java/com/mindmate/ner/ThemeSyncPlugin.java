package com.mindmate.ner;

import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;
import android.view.WindowInsetsController;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ThemeSync")
public class ThemeSyncPlugin extends Plugin {

    @PluginMethod
    public void apply(PluginCall call) {
        final String mode = call.getString("mode", "light");
        final String background = call.getString("background", "#F7F5F0");
        getActivity().runOnUiThread(() -> {
            try {
                Window window = getActivity().getWindow();
                int color = Color.parseColor(background);
                window.setStatusBarColor(color);
                window.setNavigationBarColor(color);
                boolean lightBars = !"dark".equals(mode);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    WindowInsetsController controller = window.getInsetsController();
                    if (controller != null) {
                        int flags = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                            | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                        controller.setSystemBarsAppearance(lightBars ? flags : 0, flags);
                    }
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    View decor = window.getDecorView();
                    int vis = decor.getSystemUiVisibility();
                    int lightStatus = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                    int lightNav = View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                    if (lightBars) {
                        vis |= lightStatus | lightNav;
                    } else {
                        vis &= ~(lightStatus | lightNav);
                    }
                    decor.setSystemUiVisibility(vis);
                }

                JSObject ret = new JSObject();
                ret.put("applied", true);
                ret.put("mode", mode);
                call.resolve(ret);
            } catch (Exception error) {
                call.reject("Could not apply Android theme: " + error.getMessage());
            }
        });
    }
}
