const GITHUB_WEBP_SUPPORT_EXTENSION_ATTRIBUTE =
  "data-github-webp-support-extension";

export default defineContentScript({
  matches: ["*://*.github.com/*"],
  main() {
    function createImageWrapper(imageUrl: string) {
      const div = document.createElement("div");
      div.style.textAlign = "center";
      div.style.backgroundColor = "#f6f8fa";
      div.style.padding = "20px 0";
      const img = document.createElement("img");
      img.src = imageUrl;
      img.style.maxWidth = "600px";
      div.appendChild(img);
      return div;
    }
    function getHrefFromDetailsMenu(element: Element) {
      const detailsMenu = element.querySelector("details-menu");
      if (detailsMenu) {
        const linkElement = detailsMenu.querySelector("a[href]");
        if (linkElement) {
          return linkElement.getAttribute("href");
        }
      }
      return null;
    }
    function convertToRawGitHubUrl(githubUrl: string) {
      const regex = /^\/([^/]+)\/([^/]+)\/[^/]+\/([^/]+)\/(.+)$/;
      const match = githubUrl.match(regex);
      if (match) {
        const [, owner, repo, hash, filePath] = match;
        const rawGitHubUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${hash}/${filePath}`;
        return rawGitHubUrl;
      }
      return null;
    }
    const fileElements = document.querySelectorAll(
      '[data-details-container-group="file"]'
    );
    browser.runtime
      .sendMessage({
        action: "getToggleState",
      })
      .then((res) => {
        if (res.isEnabled) {
          fileElements.forEach((element) => {
            // Get href attribute from details-menu
            const rawHref = getHrefFromDetailsMenu(element);
            if (rawHref !== null && rawHref.endsWith(".webp")) {
              const url = convertToRawGitHubUrl(rawHref);
              if (
                url &&
                element.getAttribute(
                  GITHUB_WEBP_SUPPORT_EXTENSION_ATTRIBUTE
                ) !== "true"
              ) {
                element.setAttribute(
                  GITHUB_WEBP_SUPPORT_EXTENSION_ATTRIBUTE,
                  "true"
                );
                const imageWrapper = createImageWrapper(url);
                const childElements =
                  element.querySelectorAll(".js-file-content");
                childElements.forEach((child) => {
                  element.removeChild(child);
                });
                element.appendChild(imageWrapper);
              }
            }
          });
        }
      });
  },
});
