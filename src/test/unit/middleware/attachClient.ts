
import { LoginClient } from "../../../main/api/LoginClient";
import { TaskClient } from "../../../main/api/TaskClient";
import { attachClients } from "../../../main/middleware/attachClients";

jest.mock("../../../main/api/LoginClient");
jest.mock("../../../main/api/TaskClient");

describe("attachClients middleware", () => {
  const apiBaseUrl = "http://example.com";

  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      session: {
        authToken: "mockAuthToken",
      },
    };
    res = {};
    next = jest.fn();
  });

  test("should attach clients to the req object and call next", () => {
    // Arrange
    const mockLoginClient = {};
    const mockTaskClient = {};
    (LoginClient as jest.Mock).mockImplementation(() => mockLoginClient);
    (TaskClient as jest.Mock).mockImplementation(() => mockTaskClient);

    const middleware = attachClients(apiBaseUrl);

    // Act
    middleware(req, res, next);

    // Assert
    expect(req.clients).toBeDefined();
    expect(req.clients.login).toBe(mockLoginClient);
    expect(req.clients.tasks).toBe(mockTaskClient);
    expect(LoginClient).toHaveBeenCalledWith(apiBaseUrl, expect.any(Function));
    expect(TaskClient).toHaveBeenCalledWith(apiBaseUrl, expect.any(Function));
    expect(next).toHaveBeenCalled();
  });

  test("should use the tokenProvider to retrieve the auth token", () => {
    // Arrange
    const middleware = attachClients(apiBaseUrl);

    // Act
    middleware(req, res, next);

    // Assert
    const tokenProvider = (LoginClient as jest.Mock).mock.calls[0][1];
    expect(tokenProvider()).toBe("mockAuthToken");
  });
});