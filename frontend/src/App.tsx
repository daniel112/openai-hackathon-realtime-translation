import { ChakraProvider, Grid } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RecordScreen } from "./screen/RecordScreen/RecordScreen";
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { NewHomeScreen } from "./screen/NewHomeScreen/NewHomeScreen";
import { DemoAzureScreen } from "./screen/demo-azure/DemoAzureScreen";
import { DemoTextChatScreen } from "./screen/demo-textchat/DemoTextChatScreen";
import { TextChatHomeScreen } from "./screen/demo-textchat/TextChatHomeScreen";

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
  {
    path: "/demo-textchat",
    element: <TextChatHomeScreen />,
  },
  {
    path: "/demo-textchat/:threadId",
    element: <TextChatHomeScreen />,
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
