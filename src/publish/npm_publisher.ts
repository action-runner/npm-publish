import { PublisherParam } from "../types";
import { findWorkspacePackageJSONs } from "@action-runner/npm-utils";
import { RegistrySwitcher } from "../registry/registry";
import * as core from "@actions/core";
import ezSpawn from "@jsdevtools/ez-spawn";
import { Executor } from "../executor";

/**
 * Publish multiple packages to multiple registries .
 */
export class NpmPublisher {
  private registrySwitcher: RegistrySwitcher;
  private executor: Executor;

  constructor(private readonly publisherParam: PublisherParam) {
    this.executor = new Executor(publisherParam.dryRun);
    this.registrySwitcher = new RegistrySwitcher(publisherParam.dryRun);
  }

  /**
   * Publish packages to multiple registries.
   */
  async publish() {
    let packageFiles = this.findPackageFiles();
    for (let registry of this.publisherParam.registries) {
      core.startGroup(`Publishing to registry ${registry.registry}`);
      await this.registrySwitcher.switchTo(registry);
      let promises = packageFiles.map((packageFile) =>
        this.publishPackage(packageFile)
      );
      await Promise.allSettled(promises);
      core.endGroup();
    }
  }

  private async publishPackage(packageFile: string) {
    try {
      const publishPath = packageFile.replace("package.json", "");
      core.info(`Running command: npm publish ${packageFile}`);
      let output: ezSpawn.Process<string>;
      if (publishPath.length === 0) {
        output = await this.executor.execute(
          "npm",
          "publish",
          "--access",
          "public"
        );
      } else {
        output = await this.executor.execute(
          "npm",
          "publish",
          "--access",
          "public",
          publishPath
        );
      }
      core.info(`${output.stdout}`);
    } catch (error) {
      core.error(`Publish package error: ${error}`);
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
