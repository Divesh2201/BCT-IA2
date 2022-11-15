import '../styles/globals.css';
import Link from 'next/link';

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-blue-700">
          FunKart
        </h1>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-6 hover:border-b border-black">
              Home
            </a>
          </Link>
          <Link href="/create">
            <a className="mr-6 hover:border-b border-black">
              Sell Products
            </a>
          </Link>
          <Link href="/warranties">
            <a className="mr-6 hover:border-b border-black">
              My Warranties
            </a>
          </Link>
          {/* <Link href="/creator">
            <a className="mr-6">
              Seller Dashboard
            </a>
          </Link> */}
          {/* <Link href="/claim">
            <a className="mr-6">
              Claim Warranty
            </a>
          </Link> */}
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
