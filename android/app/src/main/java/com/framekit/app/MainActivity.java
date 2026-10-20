package com.framekit.app;

import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView.setWebContentsDebuggingEnabled(true);
    }

    @Override
    protected void load() {
        super.load();
        if (this.bridge != null) {
            this.bridge.setWebViewClient(new BridgeWebViewClient(this.bridge) {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    Uri url = request.getUrl();
                    String scheme = url.getScheme();
                    if (scheme != null && (scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https") || scheme.equalsIgnoreCase("capacitor") || scheme.equalsIgnoreCase("data") || scheme.equalsIgnoreCase("blob"))) {
                        // Keep navigation inside the FrameKit native webview
                        return false;
                    }
                    return super.shouldOverrideUrlLoading(view, request);
                }

                @SuppressWarnings("deprecation")
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String urlString) {
                    if (urlString != null && (urlString.startsWith("http://") || urlString.startsWith("https://") || urlString.startsWith("capacitor://") || urlString.startsWith("data:") || urlString.startsWith("blob:"))) {
                        // Keep navigation inside the FrameKit native webview
                        return false;
                    }
                    return super.shouldOverrideUrlLoading(view, urlString);
                }
            });
        }
    }

    @Override
    public void onBackPressed() {
        if (this.bridge != null && this.bridge.getWebView() != null && this.bridge.getWebView().canGoBack()) {
            this.bridge.getWebView().goBack();
        } else {
            super.onBackPressed();
        }
    }
}
