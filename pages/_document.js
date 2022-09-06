import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* <link
            href="https://fonts.googleapis.com/css2?family=Inter&display=optional"
            rel="stylesheet"
          /> */}
            <link rel="shortcut icon" href="/favicon.svg" />
            <title>deOracle.xyz</title>
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