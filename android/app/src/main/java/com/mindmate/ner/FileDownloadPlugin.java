package com.mindmate.ner;

import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "FileDownload")
public class FileDownloadPlugin extends Plugin {

    @PluginMethod
    public void savePdf(PluginCall call) {
        String filename = call.getString("filename", "MINDMATE-Guide.pdf");
        String data = call.getString("data", "");
        if (data == null || data.isEmpty()) {
            call.reject("PDF data was empty.");
            return;
        }

        getActivity().runOnUiThread(() -> {
            try {
                byte[] bytes = Base64.decode(data, Base64.DEFAULT);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
                    values.put(MediaStore.Downloads.MIME_TYPE, "application/pdf");
                    values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                    values.put(MediaStore.Downloads.IS_PENDING, 1);
                    Uri uri = getContext().getContentResolver().insert(
                        MediaStore.Downloads.EXTERNAL_CONTENT_URI,
                        values
                    );
                    if (uri == null) {
                        call.reject("Could not create a Downloads file.");
                        return;
                    }
                    OutputStream out = getContext().getContentResolver().openOutputStream(uri);
                    if (out == null) {
                        call.reject("Could not write the PDF.");
                        return;
                    }
                    out.write(bytes);
                    out.close();
                    values.clear();
                    values.put(MediaStore.Downloads.IS_PENDING, 0);
                    getContext().getContentResolver().update(uri, values, null, null);
                } else {
                    File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    if (!dir.exists()) dir.mkdirs();
                    File file = new File(dir, filename);
                    FileOutputStream fos = new FileOutputStream(file);
                    fos.write(bytes);
                    fos.close();
                    android.media.MediaScannerConnection.scanFile(
                        getContext(),
                        new String[] { file.getAbsolutePath() },
                        new String[] { "application/pdf" },
                        null
                    );
                }
                JSObject ret = new JSObject();
                ret.put("saved", true);
                ret.put("filename", filename);
                ret.put("folder", "Downloads");
                call.resolve(ret);
            } catch (Exception error) {
                call.reject("Could not save PDF: " + error.getMessage());
            }
        });
    }
}
