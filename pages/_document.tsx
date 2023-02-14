import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head title="Let's Connect Through Music" />
            <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="/apple-touch-icon.png"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="/favicon-32x32.png"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href="/favicon-16x16.png"
            />
            <link rel="manifest" href="/site.webmanifest" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossOrigin=""
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Sora:wght@200;300;400;500;600;700;800&display=swap"
                rel="stylesheet"
            />
            <body className="min-h-screen bg-primary font-sans">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
