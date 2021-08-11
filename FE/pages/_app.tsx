import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { Modal, Layout } from '@organisms';
import { Spinner } from '@molecules';
import { MODALS } from '@utils/constants';
import GlobalStyle from '@styles/globalStyles';
import store from '@store';
import theme from '@styles/theme';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {router.pathname === '/' ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
        {Object.keys(MODALS).map(
          (each, idx) =>
            each !== 'HOC_MODAL' && (
              <Modal modalName={MODALS[each]} key={idx} />
            ),
        )}
        <Spinner />
      </ThemeProvider>
    </Provider>
  );
}
