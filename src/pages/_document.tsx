import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap" rel="stylesheet" />
          <link rel="shortcut icon" href="/favicon.svg" />
        </Head>
        <body>
          <div className="absolute w-1/2 h-1/2 top-0 right-0 oracle-gradient"></div>
          <div className="absolute w-1/2 h-1/2 top-0 left-0 oracle-gradient-2"></div>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument