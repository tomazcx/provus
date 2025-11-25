import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

interface Props {
  html: string;
  textColor?: string;
}

export default function HtmlWithMath({ html, textColor = "#374151" }: Props) {
  const [height, setHeight] = useState(40); 
  const [isLoaded, setIsLoaded] = useState(false);

  const processHtml = (rawHtml: string) => {
    if (!rawHtml) return "";

    let processed = rawHtml;

    processed = processed.replace(
      /<span[^>]*data-type="math"[^>]*latex="([^"]*)"[^>]*>.*?<\/span>/g,
      "$$$1$$"
    );
    processed = processed.replace(
      /<span[^>]*latex="([^"]*)"[^>]*data-type="math"[^>]*>.*?<\/span>/g,
      "$$$1$$"
    );

    return processed;
  };

  const content = processHtml(html);

  const injectedJS = `
    window.onerror = function(message, source, lineno, colno, error) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: message }));
    };
    true;
  `;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
        
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background-color: transparent;
            overflow: hidden; 
          }
          body { 
            font-family: -apple-system, Roboto, sans-serif;
            font-size: 17px; 
            color: ${textColor}; 
            line-height: 1.5;
          }
          p { margin: 0 0 10px 0; }
          img { max-width: 100%; height: auto; }
          .katex { font-size: 1.2em; }
          
          #math-wrapper {
            display: block;
            width: 100%;
            overflow: hidden;
            padding-bottom: 2px;
          }
        </style>

        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"></script>
      </head>
      <body>
        <div id="math-wrapper">${content}</div>
        
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            try {
                if (window.renderMathInElement) {
                    renderMathInElement(document.getElementById('math-wrapper'), {
                      delimiters: [
                        {left: "$$", right: "$$", display: false},
                        {left: "$$", right: "$$", display: true},
                        {left: "$", right: "$", display: false},
                        {left: "\\\\(", right: "\\\\)", display: false},
                        {left: "\\\\[", right: "\\\\]", display: true}
                      ],
                      throwOnError: false
                    });
                }
            } catch (e) {}

            function sendHeight() {
               var wrapper = document.getElementById('math-wrapper');
               var height = wrapper.getBoundingClientRect().height;
               
               window.ReactNativeWebView.postMessage((height + 5).toString());
            }

            sendHeight();
            setTimeout(sendHeight, 100);
            setTimeout(sendHeight, 500);
            setTimeout(sendHeight, 1000);
            
            if (window.ResizeObserver) {
                new ResizeObserver(sendHeight).observe(document.getElementById('math-wrapper'));
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View
      style={{
        height,
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        injectedJavaScript={injectedJS}
        onMessage={(event) => {
          setIsLoaded(true);
          const data = event.nativeEvent.data;
          const h = Number(data);
          if (!isNaN(h)) {
            setHeight(h);
          }
        }}
        style={{ backgroundColor: "transparent" }}
        containerStyle={{ backgroundColor: "transparent" }}
        onLoadEnd={() => setTimeout(() => setIsLoaded(true), 1000)}
      />

      {!isLoaded && (
        <View className="absolute inset-0 items-center justify-center bg-gray-50/50 z-10">
          <ActivityIndicator size="small" color={textColor} />
        </View>
      )}
    </View>
  );
}
