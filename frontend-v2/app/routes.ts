import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/main.tsx", [
    index("routes/index.tsx"),
    route("solo", "routes/solo/index.tsx"),
    route("multiplayer", "routes/multiplayer/index.tsx"),
  ]),
] satisfies RouteConfig;
