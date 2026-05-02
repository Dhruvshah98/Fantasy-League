import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./store/store";

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ leagues: [] }))
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test("renders fantasy league control center", async () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(screen.getByText(/fantasy league control center/i)).toBeInTheDocument();
  expect(await screen.findByText(/no leagues created yet/i)).toBeInTheDocument();
});
