import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
        {/* Add any other meta tags or links that should be in the head on every page */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 