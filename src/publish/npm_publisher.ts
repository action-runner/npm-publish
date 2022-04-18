import { PublisherParam } from "../types";
import { findWorkspacePackageJSONs } from "@action-runner/npm-utils";
import { RegistrySwitcher } from "../registry/registry";
import * as core from "@actions/core";
import ezSpawn from "@jsdevtools/ez-spawn";

/**
 * Publish multiple packages to multiple registries .
 */
export class NpmPublisher {
  private registrySwitcher = new RegistrySwitcher();

  constructor(private readonly publisherParam: PublisherParam) {}

  /**
   * Publish packages to multiple registries.
   */
  async publish() {
    let packageFiles = this.findPackageFiles();
    for (let registry of this.publisherParam.registries) {
      await this.registrySwitcher.switchTo(registry);
      let promises = packageFiles.map((packageFile) =>
        this.publishPackage(packageFile)
      );
      await Promise.allSettled(promises);
    }
  }

  private async publishPackage(packageFile: string) {
    try {
      core.info(`Running command: npm publish ${packageFile}`);
      let process = await ezSpawn.async("npm", "publish", packageFile);
      if (process.status !== 0) {
        core.setFailed(`Publish package error: ${process.stderr}`);
      }
    } catch (error) {
      core.setFailed(`Publish package error: ${error}`);
    }
  }

  /**
   * Find list of packages to publish.
   */
  private findPackageFiles() {
    let packageFiles: string[] = [];
    for (let packageFile of this.publisherParam.packageFiles) {
      let workspacePackages = findWorkspacePackageJSONs(packageFile);
      packageFiles.push(packageFile);
      packageFiles = packageFiles.concat(workspacePackages);
    }

    // return unique package files
    return [...new Set(packageFiles)];
  }
}
