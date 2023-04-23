import { ChakraProvider, Grid } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RecordScreen } from "./screen/RecordScreen/RecordScreen";
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { NewHomeScreen } from "./screen/NewHomeScreen/NewHomeScreen";
import { DemoAzureScreen } from "./screen/demo-azure/DemoAzureScreen";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

/**
 * route to component definition
 */
const router = createBrowserRouter([
  {
    path: "/record",
    element: <RecordScreen />,
  },
  {
    path: "/",
    element: <NewHomeScreen />,
  },
  {
    path: "/demo-azure",
    element: <DemoAzureScreen />,
  },
]);

/**
 * App Entrypoint
 */
export const App = () => (
  <ChakraProvider theme={theme}>
    <Grid minH="100vh" p={3}>
      <RouterProvider router={router} />
    </Grid>
  </ChakraProvider>
);
