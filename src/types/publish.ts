import { RegistryParam } from "./registry";

export interface PublisherParam {
  registries: RegistryParam[];
  packageFiles: string[];
  dryRun: boolean;
}
