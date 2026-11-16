import SwiftUI
import WebKit

@main
struct MasrafDarooApp: App {
    var body: some Scene {
        WindowGroup {
            WebView()
                .background(Color("LaunchBackground"))
                .ignoresSafeArea(.container, edges: .bottom)
        }
    }
}

/// Shows the bundled web app (www/index.html) so it works fully offline.
struct WebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.allowsBackForwardNavigationGestures = true
        web.isOpaque = false
        web.backgroundColor = .clear
        web.scrollView.contentInsetAdjustmentBehavior = .never

        if let dir = Bundle.main.url(forResource: "www", withExtension: nil) {
            web.loadFileURL(dir.appendingPathComponent("index.html"), allowingReadAccessTo: dir)
        }
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate {
        func webView(_ webView: WKWebView,
                     decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = action.request.url else { return decisionHandler(.allow) }
            // Pages inside the app stay here; phone numbers and outside links open in their own app.
            if url.isFileURL { return decisionHandler(.allow) }
            if action.navigationType == .linkActivated || url.scheme == "tel" || url.scheme == "mailto" {
                UIApplication.shared.open(url)
                return decisionHandler(.cancel)
            }
            decisionHandler(.allow)
        }
    }
}
