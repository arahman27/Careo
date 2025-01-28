import '@/styles/bootstrap.min.css'; //Theme used is cyborg theme from bootswatch.com
import "@/styles/globals.css";
import { Provider } from "jotai";
import Header from "@/components/Header";
import UserProvider from '@/components/UserProvider';

// Config dotenv as early as possible
require('dotenv').config();

export default function App({ Component, pageProps }) {
  return (
    <Provider>
        <UserProvider>
          <Header />
          <Component {...pageProps} />
        </UserProvider>
    </Provider>
    );
}
