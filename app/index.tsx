import { Redirect } from "expo-router";

/**
 * Root index route that redirects to the welcome screen.
 * @returns {JSX.Element} A redirect component to the welcome route.
 */
export default function Index() {
  return <Redirect href="/welcome" />;
}
