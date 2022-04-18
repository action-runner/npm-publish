import { RegistryParam } from "../types";
import * as core from "@actions/core";
import ezSpawn from "@jsdevtools/ez-spawn";
import { Executor } from "../executor";

/**
 * Switch npm registry will switch the npm registry to the one specified in the
 * parameter. and will write the registry to the .npmrc file.
 */
export class RegistrySwitcher {
  private executor: Executor;

  constructor(private readonly dryRun: boolean) {
    this.executor = new Executor(dryRun);
  }

  /**
   * Switch npm registry to the one specified in the parameter.
   * @param registry NPM Registry login information
   */
  async switchTo(registry: RegistryParam) {
    await this.updateNPMConfigFile(registry);
  }

  private async updateNPMConfigFile(registry: RegistryParam) {
    try {
      let url = registry.registry.origin.slice(
        registry.registry.protocol.length
      );
      const content = `${url}/:_authToken`;
      core.info(`Setting up registry: ${registry.registry.origin}`);
      await this.executor.execute(
        "npm",
        "config",
        "set",
        "registry",
        registry.registry.origin
      );
      await this.executor.execute("npm", "set", content, registry.token);
    } catch (error) {
      core.setFailed(`Update npm config error: ${error}`);
      throw error;
    }
  }
}
