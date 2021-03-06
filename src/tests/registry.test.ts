import ezSpawn from "@jsdevtools/ez-spawn";
import { RegistrySwitcher } from "../registry/registry";

jest.mock("fs");
jest.mock("@jsdevtools/ez-spawn");
jest.mock("@actions/core", () => ({
  setFailed: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
}));

describe("Given a registry switcher", () => {
  let switcher: RegistrySwitcher;

  beforeEach(() => {
    switcher = new RegistrySwitcher(false);
  });

  test("When calling switch to", async () => {
    (ezSpawn.async as jest.Mock).mockResolvedValue({
      stdout: ".npmrc",
      stderr: "",
    });

    await switcher.switchTo({
      registry: new URL("https://registry.npmjs.org/"),
      token: "mock-token",
    });

    expect(ezSpawn.async).toHaveBeenCalledWith(
      "npm",
      "set",
      "//registry.npmjs.org/:_authToken",
      "mock-token"
    );
  });
});
