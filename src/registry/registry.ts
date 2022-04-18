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

  /**
   * Get npmrc file path.
   */
  private async getNPMConfigFilePath() {
    try {
      core.debug("Running command: npm config get userconfig");
      let process = await ezSpawn.async("npm", "config", "get", "userconfig");
      return process.stdout.trim();
    } catch (error) {
      core.setFailed(`${error}`);
      return "";
    }
  }

  /**
   * Read npmrc file.
   */
  private async readNPMConfigFile() {
    try {
      let npmrcFilePath = await this.getNPMConfigFilePath();
      core.debug(`Reading npmrc file: ${npmrcFilePath}`);
      let npmrcFile = fs.readFileSync(npmrcFilePath, "utf8");
      return { npmrcFile, npmrcFilePath };
    } catch (error) {
      core.setFailed(`Read npm config error: ${error}`);
      return { npmrcFile: "", npmrcFilePath: "" };
    }
  }

  private async updateNPMConfigFile(registry: RegistryParam) {
    try {
      let { npmrcFilePath } = await this.readNPMConfigFile();
      let url = registry.registry.origin.slice(
        registry.registry.protocol.length
      );
      const content = `${url}/:_authToken=${registry.token}`;
      core.debug(`Writing registry to npmrc file: ${npmrcFilePath}`);
      fs.writeFileSync(npmrcFilePath, content);
    } catch (error) {
      core.setFailed(`Update npm config error: ${error}`);
    }
  }
}
