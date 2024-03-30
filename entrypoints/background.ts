export default defineBackground(() => {
  async function getValueFromLocal(): Promise<Options["isEnabled"]> {
    return (await browser.storage.local.get("isEnabled"))
      .isEnabled as Options["isEnabled"];
  }

  browser.runtime.onMessage.addListener(
    async function (request): Promise<Options> {
      const value = await getValueFromLocal();

      if (request.action === "getToggleState") {
        return { isEnabled: value };
      } else if (request.action === "toggleState") {
        console.log(request);
        browser.storage.local.set({ isEnabled: request.isEnabled });
      }
      return { isEnabled: value };
    }
  );
  browser.runtime.onInstalled.addListener(function () {
    browser.storage.local.set({ isEnabled: true });
  });
});
