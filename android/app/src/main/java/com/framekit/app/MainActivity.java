package com.framekit.app;

import android.app.AlertDialog;
import android.net.Uri;
import android.os.Bundle;
import android.view.MotionEvent;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
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
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
                configureWebSettings(webView);
                setupTouchGestures(webView);
            }

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

    private void configureWebSettings(WebView webView) {
        WebSettings settings = webView.getSettings();

        // 1. Enable wide viewport and overview mode for accurate responsive CSS scaling
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        // 2. Lock text zoom to 100% to prevent Android accessibility font scaling from breaking CSS flex/grid
        settings.setTextZoom(100);

        // 3. Ensure DOM storage and databases are enabled for modern CSS frameworks and web apps
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);

        // 4. Allow mixed content (HTTP stylesheets, fonts, or assets on HTTPS sites)
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // 5. Clean User-Agent so websites serve standard responsive CSS rather than stripped WebView fallbacks
        String ua = settings.getUserAgentString();
        if (ua != null) {
            ua = ua.replace("; wv", "").replace("Version/4.0 ", "");
            settings.setUserAgentString(ua);
        }
    }

    private void setupTouchGestures(WebView webView) {
        webView.setOnTouchListener((v, event) -> {
            // 3-finger tap anywhere opens the FrameKit Menu (Settings, Reload, Exit)
            if (event.getActionMasked() == MotionEvent.ACTION_POINTER_DOWN) {
                if (event.getPointerCount() == 3) {
                    showExitDialog();
                    return true;
                }
            }
            return false;
        });
    }

    @Override
    public void onBackPressed() {
        if (this.bridge != null && this.bridge.getWebView() != null && this.bridge.getWebView().canGoBack()) {
            this.bridge.getWebView().goBack();
        } else {
            showExitDialog();
        }
    }

    private void showExitDialog() {
        runOnUiThread(() -> {
            new AlertDialog.Builder(this)
                .setTitle("FrameKit Menu")
                .setMessage("Choose an action for this terminal:")
                .setPositiveButton("Change URL / Settings", (dialog, which) -> {
                    if (this.bridge != null && this.bridge.getWebView() != null) {
                        this.bridge.getWebView().loadUrl("https://localhost/index.html?view=config");
                    }
                })
                .setNeutralButton("Reload Page", (dialog, which) -> {
                    if (this.bridge != null && this.bridge.getWebView() != null) {
                        this.bridge.getWebView().reload();
                    }
                })
                .setNegativeButton("Exit App", (dialog, which) -> {
                    finishAffinity();
                })
                .show();
        });
    }
}
