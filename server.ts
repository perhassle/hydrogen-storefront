// Virtual entry point for the app
import {storefrontRedirect} from '@shopify/hydrogen';
import {createRequestHandler} from '@shopify/remix-oxygen';
import {createAppLoadContext} from '~/lib/context';

/**
 * Dynamically import the server build with error handling
 */
async function getServerBuild() {
  try {
    // eslint-disable-next-line import/no-unresolved
    const serverBuild = await import('virtual:react-router/server-build');
    return serverBuild;
  } catch (error) {
    console.error('Failed to load server build:', error);
    throw new Error('Server build could not be loaded. Ensure the build process completed successfully.');
  }
}

/**
 * Export a fetch handler in module format.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
      const appLoadContext = await createAppLoadContext(
        request,
        env,
        executionContext,
      );

      /**
       * Create a Remix request handler and pass
       * Hydrogen's Storefront client to the loader context.
       */
      const handleRequest = createRequestHandler({
        build: await getServerBuild(),
        mode: process.env.NODE_ENV,
        getLoadContext: () => appLoadContext,
      });

      const response = await handleRequest(request);

      if (appLoadContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await appLoadContext.session.commit(),
        );
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({
          request,
          response,
          storefront: appLoadContext.storefront,
        });
      }

      return response;
    } catch (error) {
      console.error('Server error:', error);
      
      // Provide better error information in development
      if (process.env.NODE_ENV === 'development') {
        return new Response(
          `Development Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nStack: ${error instanceof Error ? error.stack : 'No stack trace available'}`,
          {
            status: 500,
            headers: {'Content-Type': 'text/plain'},
          }
        );
      }
      
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};
