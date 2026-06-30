import { createBrowserRouter, redirect } from "react-router";
import { getRouterBasename } from "./basename";
import { AppLayout } from "./AppLayout";
import { FullPage } from "./components/FullPage";
import { MinimalPage } from "./components/MinimalPage";
import { Dashboard } from "./components/Dashboard";
import { IntelligencePage } from "./components/IntelligencePage";
import { ReadinessWrappedPage } from "./components/ReadinessWrappedPage";

export const router = createBrowserRouter(
  [
    {
      Component: AppLayout,
      children: [
        {
          path: "/",
          loader: () => redirect("/full"),
        },
        {
          path: "/full",
          Component: FullPage,
        },
        {
          path: "/minimal",
          Component: MinimalPage,
        },
        {
          path: "/dashboard",
          loader: ({ request }) => {
            const url = new URL(request.url);
            if (!url.searchParams.has("view")) {
              return redirect("/dashboard?view=leader");
            }
            return null;
          },
          Component: Dashboard,
        },
        {
          path: "/intelligence",
          Component: IntelligencePage,
        },
        {
          path: "/readiness-wrapped",
          Component: ReadinessWrappedPage,
        },
      ],
    },
  ],
  { basename: getRouterBasename() }
);
