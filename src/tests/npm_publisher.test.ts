import ezSpawn from "@jsdevtools/ez-spawn";
import fs from "fs";
import { NpmPublisher } from "../publish/npm_publisher";
import { findWorkspacePackageJSONs } from "@action-runner/npm-utils";

jest.mock("fs");
jest.mock("@jsdevtools/ez-spawn");
jest.mock("@actions/core", () => ({
  setFailed: jest.fn(),
  debug: jest.fn(),
}));
jest.mock("@action-runner/npm-utils");

describe("Given a registry switcher", () => {
  let publisher: NpmPublisher;

  test("When calling switch to", async () => {
    (fs.readFileSync as jest.Mock).mockReturnValue("");
    (ezSpawn.async as jest.Mock).mockResolvedValue({
      stdout: ".npmrc",
      stderr: "",
    });

    (findWorkspacePackageJSONs as jest.Mock).mockReturnValue(["package.json"]);

    publisher = new NpmPublisher({
      registries: [
        {
          registry: new URL("https://registry.npmjs.org/"),
          token: "mock-token",
        },
      ],
      packageFiles: ["package.json"],
    });

    await publisher.publish();
    expect(ezSpawn.async).toHaveBeenCalledWith(
      "npm",
      "publish",
      "package.json"
    );
  });

  test("When calling switch to", async () => {
    (fs.readFileSync as jest.Mock).mockReturnValue("");
    (ezSpawn.async as jest.Mock).mockResolvedValue({
      stdout: ".npmrc",
      stderr: "",
    });

    (findWorkspacePackageJSONs as jest.Mock).mockReturnValue([
      "package.json",
      "packages/a/package.json",
      "packages/b/package.json",
    ]);

    publisher = new NpmPublisher({
      registries: [
        {
          registry: new URL("https://registry.npmjs.org/"),
          token: "mock-token",
        },
      ],
      packageFiles: ["package.json"],
    });

    await publisher.publish();

    expect(ezSpawn.async).toHaveBeenCalledWith(
      "npm",
      "publish",
      "package.json"
    );

    expect(ezSpawn.async).toHaveBeenCalledWith(
      "npm",
      "publish",
      "packages/a/package.json"
    );

    expect(ezSpawn.async).toHaveBeenCalledWith(
      "npm",
      "publish",
      "packages/b/package.json"
    );
  });
});
