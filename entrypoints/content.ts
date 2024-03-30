const GITHUB_WEBP_SUPPORT_EXTENSION_ATTRIBUTE =
  "data-github-webp-support-extension";
const GITHUB_FILE_VIEWER_ATTRIBUTE = '[data-details-container-group="file"]';
const GITHUB_FILE_VIEWER_CONTENT_ATTRIBUTE = ".js-file-content";

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
      if (detailsMenu !== null) {
        const linkElement = detailsMenu.querySelector("a[href]");
        if (linkElement !== null) {
          return linkElement.getAttribute("href");
        }
      }
      return null;
    }
    function convertToRawGitHubUrl(githubUrl: string) {
      const regex = /^\/([^/]+)\/([^/]+)\/[^/]+\/([^/]+)\/(.+)$/;
      const match = githubUrl.match(regex);
      if (match !== null) {
        const [, owner, repo, hash, filePath] = match;
        const rawGitHubUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${hash}/${filePath}`;
        return rawGitHubUrl;
      }
      return null;
    }
    function getGithubFileViewerElement() {
      return document.querySelectorAll(GITHUB_FILE_VIEWER_ATTRIBUTE);
    }
    function isElementAlreadyWebPProcessed(element: Element) {
      return (
        element.getAttribute(GITHUB_WEBP_SUPPORT_EXTENSION_ATTRIBUTE) !== "true"
      );
    }
    function setElementAsWebPProcessed(element: Element) {
      return element.setAttribute(
        GITHUB_WEBP_SUPPORT_EXTENSION_ATTRIBUTE,
        "true"
      );
    }
    function removeOriginalChildrenElements(element: Element) {
      const childElements = element.querySelectorAll(
        GITHUB_FILE_VIEWER_CONTENT_ATTRIBUTE
      );
      childElements.forEach((child) => {
        element.removeChild(child);
      });
    }
    browser.runtime
      .sendMessage({
        action: "getToggleState",
      })
      .then(async (res: Options) => {
        // Articifial delay to load page
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (res.isEnabled) {
          const fileElements = getGithubFileViewerElement();

          fileElements.forEach((element) => {
            const rawHref = getHrefFromDetailsMenu(element);
            if (rawHref === null) return;

            if (rawHref.endsWith(".webp")) {
              const url = convertToRawGitHubUrl(rawHref);
              if (url === null) return;

              if (isElementAlreadyWebPProcessed(element)) {
                const imageWrapper = createImageWrapper(url);
                removeOriginalChildrenElements(element);
                element.appendChild(imageWrapper);
                setElementAsWebPProcessed(element);
              }
            }
          });
        }
      });
  },
});
