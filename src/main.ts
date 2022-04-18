import core from "@actions/core";
import { NpmPublisher } from "./publish/npm_publisher";

(async () => {
  // get input from action
  const registries = core.getMultilineInput("registries", { required: true });
  const packageFiles = core.getMultilineInput("packageFiles", {
    required: true,
  });
  const tokens = core.getMultilineInput("tokens", { required: true });

  if (registries.length !== tokens.length) {
    core.setFailed("registries and tokens must have the same length");
  }

  const publisher = new NpmPublisher({
    registries: registries.map((registry, index) => ({
      registry: new URL(registry),
      token: tokens[index],
    })),
    packageFiles: packageFiles,
  });

  await publisher.publish();
})();
