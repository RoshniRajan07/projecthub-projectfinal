export const buildDownloadUrl = (apiBase, fileNameOrUrl) => {
  if (!fileNameOrUrl) return "";
  const value = String(fileNameOrUrl);

  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    const parts = url.pathname.split("/");
    const rawName = decodeURIComponent(parts.pop() || "");
    if (rawName) {
      parts.push(encodeURIComponent(rawName));
      url.pathname = parts.join("/");
    }
    return url.toString();
  }

  if (value.startsWith("/")) {
    const url = new URL(value, apiBase);
    const parts = url.pathname.split("/");
    const rawName = decodeURIComponent(parts.pop() || "");
    if (rawName) {
      parts.push(encodeURIComponent(rawName));
      url.pathname = parts.join("/");
    }
    return url.toString();
  }

  return `${apiBase}/projects/download/${encodeURIComponent(value)}`;
};

export const downloadUploadedFile = async ({ apiBase, fileName, fileUrl, token, fallbackName }) => {
  const downloadUrl = buildDownloadUrl(apiBase, fileName || fileUrl);
  if (!downloadUrl) {
    throw new Error("File not found");
  }

  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(downloadUrl, { headers });
  if (!response.ok) {
    const error = new Error(
      response.status === 404
        ? "This uploaded file was deleted from the server. Please re-upload it."
        : "Download failed. Please try again."
    );
    error.status = response.status;
    throw error;
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName || fallbackName || decodeURIComponent(downloadUrl.split("/").pop() || "download");
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(objectUrl);
};
