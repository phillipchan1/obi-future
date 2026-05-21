import { createBrowserRouter, redirect } from "react-router";
import { getRouterBasename } from "./basename";
import { AppLayout } from "./AppLayout";
import { FullPage } from "./components/FullPage";
import { MinimalPage } from "./components/MinimalPage";
import { Dashboard } from "./components/Dashboard";

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
          Component: Dashboard,
        },
      ],
    },
  ],
  { basename: getRouterBasename() }
);
