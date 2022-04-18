import { RegistryParam } from "../types";
import * as core from "@actions/core";
import fs from "fs";
import ezSpawn from "@jsdevtools/ez-spawn";

/**
 * Switch npm registry will switch the npm registry to the one specified in the
 * parameter. and will write the registry to the .npmrc file.
 */
export class RegistrySwitcher {
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
      await ezSpawn.async("npm", "set", content, registry.token);
      await ezSpawn.async(
        "npm",
        "config",
        "set",
        "registry",
        registry.registry.origin
      );
    } catch (error) {
      core.setFailed(`Update npm config error: ${error}`);
      throw error;
    }
  }
}
