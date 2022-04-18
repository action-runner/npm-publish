import ezSpawn from "@jsdevtools/ez-spawn";
import * as core from "@actions/core";

export class Executor {
  constructor(private readonly dryRun: boolean) {}

  async execute(
    command: string,
    ...args: string[]
  ): Promise<ezSpawn.Process<string>> {
    if (this.dryRun) {
      core.info(`Dry run: ${command} ${args.join(" ")}`);
      const mockResult: ezSpawn.Process<string> = {
        command: "",
        args: [],
        pid: 0,
        stdout: "",
        stderr: "",
        output: ["", "", ""],
        status: 0,
        signal: null,
      };
      return mockResult;
    }
    return await ezSpawn.async(command, ...args);
  }
}
