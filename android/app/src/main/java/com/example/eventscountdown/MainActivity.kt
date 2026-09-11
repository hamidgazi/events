package com.example.eventscountdown

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private val remoteUrl = "https://hamidgazi.github.io/events/"
    private val localFallbackUrl = "file:///android_asset/index.html"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.statusBarColor = Color.parseColor("#0d1117")
        window.navigationBarColor = Color.parseColor("#0d1117")

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#0d1117"))

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                allowFileAccess = true
                useWideViewPort = true
                loadWithOverviewMode = true
                setSupportZoom(false)
            }

            // Expose Native Android Widget Bridge to Web Page
            addJavascriptInterface(AndroidWidgetBridge(this@MainActivity), "AndroidWidget")

            webViewClient = object : WebViewClient() {
                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    if (request?.isForMainFrame == true) {
                        // If offline or network unavailable, load bundled local app
                        view?.loadUrl(localFallbackUrl)
                    }
                }
            }
        }

        setContentView(webView)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        loadEventsPage(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        loadEventsPage(intent)
    }

    private fun loadEventsPage(currentIntent: Intent?) {
        val isAddAction = currentIntent?.action == "ACTION_ADD_EVENT" ||
                currentIntent?.getStringExtra("action") == "add"

        val targetUrl = if (isAddAction) {
            "$remoteUrl?action=add"
        } else {
            remoteUrl
        }
        webView.loadUrl(targetUrl)
    }
}
