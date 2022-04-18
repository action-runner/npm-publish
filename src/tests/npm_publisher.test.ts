import ezSpawn from "@jsdevtools/ez-spawn";
import fs from "fs";
import { NpmPublisher } from "../publish/npm_publisher";
import { findWorkspacePackageJSONs } from "@action-runner/npm-utils";

jest.mock("fs");
jest.mock("@jsdevtools/ez-spawn");
jest.mock("@actions/core", () => ({
  setFailed: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  startGroup: jest.fn(),
  endGroup: jest.fn(),
}));
jest.mock("@action-runner/npm-utils");

describe("Given a registry switcher", () => {
  let publisher: NpmPublisher;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("When calling switch to", async () => {
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
      dryRun: false,
    });

    await publisher.publish();
    expect(ezSpawn.async).toHaveBeenCalledWith(
      "npm",
      "publish",
      "--access",
      "public"
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
      dryRun: false,
    });

    await publisher.publish();

    expect(ezSpawn.async).toHaveBeenCalledWith(
      "npm",
      "publish",
      "--access",
      "public"
    );

    expect(ezSpawn.async).toHaveBeenCalledWith(
      "npm",
      "publish",
      "--access",
      "public",
      "packages/a/"
    );

    expect(ezSpawn.async).toHaveBeenCalledWith(
      "npm",
      "publish",
      "--access",
      "public",
      "packages/b/"
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
      dryRun: true,
    });

    await publisher.publish();

    expect(ezSpawn.async).toHaveBeenCalledTimes(0);
  });
});
